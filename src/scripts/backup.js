const schedule = require('node-schedule');
const BackupService = require('../services/backup.service');
const logger = require('../utils/logger');

// Schedule weekly backups
schedule.scheduleJob('0 0 * * 0', async () => {
    try {
        const backupFile = await BackupService.createBackup();
        logger.info(`Backup created successfully: ${backupFile}`);
    } catch (error) {
        logger.error('Backup failed:', error);
    }
});

// Handle manual backup
if (process.argv.includes('--manual')) {
    BackupService.createBackup()
        .then(backupFile => {
            logger.info(`Manual backup created successfully: ${backupFile}`);
            process.exit(0);
        })
        .catch(error => {
            logger.error('Manual backup failed:', error);
            process.exit(1);
        });
}