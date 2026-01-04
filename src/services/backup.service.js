const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const { app } = require('electron');
const googleDriveService = require('./googleDrive.service');

class BackupService {
  constructor(db) {
    this.db = db;
    this.configPath = path.join(app.getPath('userData'), 'backup-config.json');
    this.backupDir = path.join(app.getPath('userData'), 'backups'); // Default

    // Load config and then initialize
    this.loadConfig().then(() => {
      this.initializeBackupDirectory();
    });

    this.isOnline = false;
    this.pendingBackups = [];
    this.setupNetworkMonitoring();
    this.scheduleAutoBackup();
    this.checkAndRunMissedCleanup();
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(data);
      if (config.backupDir) {
        this.backupDir = config.backupDir;
      }
    } catch (e) {
      // Config file might not exist yet, use default
    }
  }

  async setBackupPath(newPath) {
    try {
      this.backupDir = newPath;
      await this.initializeBackupDirectory();
      await fs.writeFile(this.configPath, JSON.stringify({ backupDir: newPath }));
      return true;
    } catch (error) {
      console.error('Error setting backup path:', error);
      throw error;
    }
  }

  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Error creating backup directory:', error);
    }
  }

  setupNetworkMonitoring() {
    // Monitor network connectivity
    setInterval(async () => {
      const wasOnline = this.isOnline;
      this.isOnline = await this.checkInternetConnection();

      if (!wasOnline && this.isOnline) {
        console.log('Internet connection restored, processing pending backups...');
        await this.processPendingBackups();
      }
    }, 30000); // Check every 30 seconds
  }

  async checkInternetConnection() {
    try {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('ping -c 1 8.8.8.8', (error) => {
          resolve(!error);
        });
      });
    } catch (error) {
      return false;
    }
  }

  scheduleAutoBackup() {
    // Schedule backup every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running scheduled backup...');
      await this.createAutoBackup();
    });

    // Schedule cleanup of old backups (cloud and local) daily at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Running scheduled cleanup...');
      await this.runCleanupTasks();
    });
  }

  async runCleanupTasks() {
    console.log('Executing backup cleanup tasks...');
    await this.cleanupOldCloudBackups();
    await this.cleanupOldLocalBackups();
    await this.saveLastCleanupTime();
  }

  async saveLastCleanupTime() {
    try {
      const configPath = path.join(app.getPath('userData'), 'last-cleanup.json');
      await fs.writeFile(configPath, JSON.stringify({ timestamp: Date.now() }));
    } catch (error) {
      console.error('Error saving last cleanup time:', error);
    }
  }

  async getLastCleanupTime() {
    try {
      const configPath = path.join(app.getPath('userData'), 'last-cleanup.json');
      const data = await fs.readFile(configPath, 'utf8');
      return JSON.parse(data).timestamp;
    } catch (e) {
      return 0; // Never run or file doesn't exist
    }
  }

  getBackupPath() {
    return this.backupDir;
  }

  async checkAndRunMissedCleanup() {
    try {
      const lastRun = await this.getLastCleanupTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - lastRun > twentyFourHours) {
        console.log('Missed scheduled cleanup, running now...');
        await this.runCleanupTasks();
      }
    } catch (error) {
      console.error('Error checking missed cleanup:', error);
    }
  }

  async createLocalBackup(type = 'manual') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${type}-${timestamp}.db`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Create database backup
      // Use VACUUM INTO for thread-safe live backup (requires SQLite 3.27+)
      // Escape backslashes for Windows paths in SQL string
      const sanitizedPath = backupPath.replace(/\\/g, '\\\\');
      try {
        // Ensure file doesn't exist (VACUUM INTO requires target not to exist)
        await fs.unlink(backupPath).catch(() => { });
        await this.db.run(`VACUUM INTO '${sanitizedPath}'`);
      } catch (bkError) {
        console.error('VACUUM INTO failed, falling back to file copy:', bkError);
        // Fallback: Flush WAL and copy file
        await this.db.run('PRAGMA wal_checkpoint(TRUNCATE)');
        const sourcePath = path.join(app.getPath('userData'), 'database.sqlite');
        await fs.copyFile(sourcePath, backupPath);
      }

      // Create logs backup
      const logsBackupPath = path.join(this.backupDir, `logs-${type}-${timestamp}.json`);
      await this.createLogsBackup(logsBackupPath);

      return {
        success: true,
        backupPath,
        logsBackupPath,
        fileName: backupFileName,
        timestamp
      };
    } catch (error) {
      console.error('Local backup creation error:', error);
      throw error;
    }
  }

  async createLogsBackup(filePath) {
    try {
      // Export user activity logs
      const logs = await this.db.all(`
        SELECT 
          ual.*, 
          u.username, 
          u.name as user_name
        FROM user_activity_logs ual
        JOIN users u ON ual.user_id = u.id
        ORDER BY ual.timestamp DESC
      `);

      // Export inventory data
      const inventory = await this.db.all('SELECT * FROM books ORDER BY title');

      // Export price history
      const priceHistory = await this.db.all(`
        SELECT 
          ph.*, 
          u.username as changed_by_username,
          b.title as book_title
        FROM price_history ph
        JOIN users u ON ph.changed_by = u.id
        JOIN books b ON ph.book_id = b.id
        ORDER BY ph.timestamp DESC
      `);

      const backupData = {
        timestamp: new Date().toISOString(),
        user_logs: logs,
        inventory: inventory,
        price_history: priceHistory
      };

      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
    } catch (error) {
      console.error('Error creating logs backup:', error);
      throw error;
    }
  }

  async createAutoBackup() {
    try {
      const backup = await this.createLocalBackup('auto');

      if (this.isOnline && googleDriveService.getConnectionStatus().isConnected) {
        await this.uploadToGoogleDrive(backup);
      } else {
        this.pendingBackups.push(backup);
        console.log('Backup created locally, will upload when online');
      }

      return backup;
    } catch (error) {
      console.error('Auto backup error:', error);
      throw error;
    }
  }

  async createManualBackup(userId, userRole) {
    try {
      const backup = await this.createLocalBackup('manual');

      // Log the backup creation
      if (this.userManagementService) {
        await this.userManagementService.logActivity(
          userId,
          'CREATE_BACKUP',
          `Manual backup created: ${backup.fileName}`
        );
      }

      if (this.isOnline && googleDriveService.getConnectionStatus().isConnected) {
        await this.uploadToGoogleDrive(backup);
      } else {
        this.pendingBackups.push(backup);
      }

      return backup;
    } catch (error) {
      console.error('Manual backup error:', error);
      throw error;
    }
  }

  async uploadToGoogleDrive(backup) {
    try {
      // Upload database backup
      const dbResult = await googleDriveService.uploadBackup(
        backup.backupPath,
        backup.fileName
      );

      // Upload logs backup
      const logsResult = await googleDriveService.uploadBackup(
        backup.logsBackupPath,
        `logs-${backup.fileName.replace('.db', '.json')}`
      );

      console.log('Backup uploaded to Google Drive:', {
        database: dbResult,
        logs: logsResult
      });

      return {
        success: true,
        database: dbResult,
        logs: logsResult
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }
  }

  async processPendingBackups() {
    if (!googleDriveService.getConnectionStatus().isConnected) {
      console.log('Google Drive not connected, skipping pending backups');
      return;
    }

    const backupsToProcess = [...this.pendingBackups];
    this.pendingBackups = [];

    for (const backup of backupsToProcess) {
      try {
        await this.uploadToGoogleDrive(backup);
        console.log(`Uploaded pending backup: ${backup.fileName}`);
      } catch (error) {
        console.error(`Failed to upload pending backup ${backup.fileName}:`, error);
        this.pendingBackups.push(backup); // Re-add to pending if failed
      }
    }
  }

  async getBackupHistory() {
    try {
      const localBackups = await this.getLocalBackups();
      let cloudBackups = [];

      if (googleDriveService.getConnectionStatus().isConnected) {
        try {
          cloudBackups = await googleDriveService.listBackups();
        } catch (error) {
          console.error('Error getting cloud backups:', error);
        }
      }

      return {
        local: localBackups,
        cloud: cloudBackups,
        pending: this.pendingBackups.length
      };
    } catch (error) {
      console.error('Error getting backup history:', error);
      throw error;
    }
  }

  async getLocalBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = await Promise.all(
        files
          .filter(file => file.endsWith('.db'))
          .map(async (file) => {
            const filePath = path.join(this.backupDir, file);
            const stats = await fs.stat(filePath);
            return {
              filename: file,
              path: filePath,
              size: stats.size,
              created: stats.birthtime,
              type: file.includes('auto') ? 'automatic' : 'manual'
            };
          })
      );
      return backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    } catch (error) {
      console.error('Error getting local backups:', error);
      return [];
    }
  }

  async deleteLocalBackup(filename, userId, userRole) {
    try {
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error('Only administrators and managers can delete backups');
      }

      const filePath = path.join(this.backupDir, filename);
      await fs.unlink(filePath);

      // Also try to delete corresponding logs file
      const logsFile = filename.replace('.db', '.json').replace('backup-', 'logs-');
      const logsPath = path.join(this.backupDir, logsFile);
      try {
        await fs.unlink(logsPath);
      } catch (error) {
        // Logs file might not exist, ignore error
      }

      if (this.userManagementService) {
        await this.userManagementService.logActivity(
          userId,
          'DELETE_BACKUP',
          `Deleted local backup: ${filename}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting local backup:', error);
      throw error;
    }
  }

  async deleteAllLocalBackups(userId, userRole) {
    try {
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error('Only administrators and managers can delete backups');
      }

      const files = await fs.readdir(this.backupDir);
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.db') || (file.endsWith('.json') && file.startsWith('logs-'))) {
          const filePath = path.join(this.backupDir, file);
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      if (this.userManagementService) {
        await this.userManagementService.logActivity(
          userId,
          'DELETE_ALL_BACKUPS',
          `Deleted all local backups (${deletedCount} files)`
        );
      }

      return { success: true, count: deletedCount };
    } catch (error) {
      console.error('Error deleting all local backups:', error);
      throw error;
    }
  }

  async deleteCloudBackup(fileId, userId, userRole) {
    try {
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error('Only administrators and managers can delete backups');
      }

      await googleDriveService.deleteBackup(fileId);

      if (this.userManagementService) {
        await this.userManagementService.logActivity(
          userId,
          'DELETE_CLOUD_BACKUP',
          `Deleted cloud backup: ${fileId}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting cloud backup:', error);
      throw error;
    }
  }

  async deleteAllCloudBackups(userId, userRole) {
    try {
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new Error('Only administrators and managers can delete backups');
      }

      const files = await googleDriveService.listBackups();
      let deletedCount = 0;

      for (const file of files) {
        try {
          await googleDriveService.deleteBackup(file.id);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete cloud backup ${file.id}:`, err);
        }
      }

      if (this.userManagementService) {
        await this.userManagementService.logActivity(
          userId,
          'DELETE_ALL_CLOUD_BACKUPS',
          `Deleted all cloud backups (${deletedCount} files)`
        );
      }

      return { success: true, count: deletedCount };
    } catch (error) {
      console.error('Error deleting all cloud backups:', error);
      throw error;
    }
  }

  async cleanupOldLocalBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        if (!file.endsWith('.db')) continue;

        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.birthtime.getTime() < sevenDaysAgo) {
          await fs.unlink(filePath);

          // Try to delete corresponding logs file
          const logsFile = file.replace('.db', '.json').replace('backup-', 'logs-');
          const logsPath = path.join(this.backupDir, logsFile);
          try {
            await fs.unlink(logsPath);
          } catch (e) {
            // Logs file might not exist
          }

          console.log(`Auto-deleted old local backup: ${file}`);
          deletedCount++;
        }
      }

      if (deletedCount > 0 && this.userManagementService) {
        await this.userManagementService.logActivity(
          1,
          'AUTO_CLEANUP_LOCAL',
          `Auto-deleted ${deletedCount} old local backups`
        );
      }
    } catch (error) {
      console.error('Error cleaning up old local backups:', error);
    }
  }

  async cleanupOldCloudBackups() {
    if (!this.isOnline || !googleDriveService.getConnectionStatus().isConnected) {
      return;
    }

    try {
      const files = await googleDriveService.listBackups();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const fileDate = new Date(file.createdTime).getTime();
        if (fileDate < sevenDaysAgo) {
          try {
            await googleDriveService.deleteBackup(file.id);
            console.log(`Auto-deleted old cloud backup: ${file.name}`);
            deletedCount++;
          } catch (err) {
            console.error(`Failed to delete old backup ${file.id}:`, err);
          }
        }
      }

      if (deletedCount > 0 && this.userManagementService) {
        // Log system activity if possible, using admin/system ID usually 0 or 1
        await this.userManagementService.logActivity(
          1, // Assuming admin ID 1 for system actions
          'AUTO_CLEANUP',
          `Auto-deleted ${deletedCount} old cloud backups`
        );
      }
    } catch (error) {
      console.error('Error cleaning up old cloud backups:', error);
    }
  }

  setUserManagementService(userManagementService) {
    this.userManagementService = userManagementService;
  }
}

module.exports = BackupService;