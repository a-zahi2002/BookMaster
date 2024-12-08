const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const logger = require('../utils/logger');

class BackupService {
  constructor(db) {
    this.db = db;
    this.backupDir = path.join(__dirname, '../backups');
    this.initializeBackupDirectory();
  }

  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating backup directory:', error);
    }
  }

  async scheduleBackup(frequency = 'weekly') {
    if (frequency === 'weekly') {
      cron.schedule('0 0 * * 0', () => {
        this.createBackup();
      });
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
      
      await this.db.backup(backupPath);
      logger.info(`Backup created: ${backupPath}`);
      
      return { success: true, path: backupPath };
    } catch (error) {
      logger.error('Backup creation error:', error);
      throw error;
    }
  }

  async backupToUSB(drivePath) {
    try {
      const backup = await this.createBackup();
      const usbPath = path.join(drivePath, path.basename(backup.path));
      
      await fs.copyFile(backup.path, usbPath);
      logger.info(`Backup copied to USB: ${usbPath}`);
      
      return { success: true, path: usbPath };
    } catch (error) {
      logger.error('USB backup error:', error);
      throw error;
    }
  }

  async getBackupHistory() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
      );
      return backups;
    } catch (error) {
      logger.error('Error getting backup history:', error);
      throw error;
    }
  }
}

module.exports = BackupService;