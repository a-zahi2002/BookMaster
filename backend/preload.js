const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  logout: (userId) => ipcRenderer.invoke('logout', userId),

  // User Management
  createUser: (userData) => ipcRenderer.invoke('create-user', userData),
  getUsers: () => ipcRenderer.invoke('get-users'),
  updateUser: (userId, updateData) => ipcRenderer.invoke('update-user', userId, updateData),
  resetPassword: (userId, newPassword) => ipcRenderer.invoke('reset-password', userId, newPassword),
  toggleUserStatus: (userId) => ipcRenderer.invoke('toggle-user-status', userId),
  getUserActivityLogs: (userId) => ipcRenderer.invoke('get-user-activity-logs', userId),
  logActivity: (userId, action, details) => ipcRenderer.invoke('log-activity', userId, action, details),

  // Book Management
  registerBook: (bookData) => ipcRenderer.invoke('register-book', bookData),
  restockBook: (stockData) => ipcRenderer.invoke('restock-book', stockData),
  updateBookDetails: (updateData) => ipcRenderer.invoke('update-book-details', updateData),
  getInventory: () => ipcRenderer.invoke('get-inventory'),
  deleteBook: (id) => ipcRenderer.invoke('delete-book', id),
  getPriceHistory: (bookId) => ipcRenderer.invoke('get-price-history', bookId),
  getPosInventory: () => ipcRenderer.invoke('get-pos-inventory'),

  // Backup Management
  createManualBackup: () => ipcRenderer.invoke('create-manual-backup'),
  getBackupHistory: () => ipcRenderer.invoke('get-backup-history'),
  deleteLocalBackup: (filename) => ipcRenderer.invoke('delete-local-backup', filename),
  deleteAllLocalBackups: () => ipcRenderer.invoke('delete-all-local-backups'),
  deleteCloudBackup: (fileId) => ipcRenderer.invoke('delete-cloud-backup', fileId),
  deleteAllCloudBackups: () => ipcRenderer.invoke('delete-all-cloud-backups'),
  downloadBackup: (fileId, fileName) => ipcRenderer.invoke('download-backup', fileId, fileName),
  selectBackupPath: () => ipcRenderer.invoke('select-backup-path'),
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),

  // Google Drive
  connectGoogleDrive: () => ipcRenderer.invoke('connect-google-drive'),
  setGoogleDriveTokens: (authCode) => ipcRenderer.invoke('set-google-drive-tokens', authCode),
  getGoogleDriveStatus: () => ipcRenderer.invoke('get-google-drive-status'),

  // Advanced AI & Analytics
  getSalesForecast: (days) => ipcRenderer.invoke('ai:get-forecast', days),
  getReorderRecommendations: () => ipcRenderer.invoke('ai:get-recommendations'),
  getAnomalies: () => ipcRenderer.invoke('ai:get-anomalies'),
  askAI: (query) => ipcRenderer.invoke('ai:ask-question', query),

  // Inventory Tracking
  getStockMovements: (bookId) => ipcRenderer.invoke('get-stock-movements', bookId),
  getInventoryBatches: (bookId) => ipcRenderer.invoke('get-inventory-batches', bookId),
  adjustStock: (data) => ipcRenderer.invoke('adjust-stock', data),
  getInventorySummary: () => ipcRenderer.invoke('get-inventory-summary'),

  // Sales & Analytics
  deleteAllSales: () => ipcRenderer.invoke('delete-all-sales'),
  getSalesHistory: (limit) => ipcRenderer.invoke('get-sales-history', limit),
  getSalesHistory: (limit) => ipcRenderer.invoke('get-sales-history', limit),
  getDetailedSalesReport: (dateRange) => ipcRenderer.invoke('get-detailed-sales-report', dateRange),

  // System Maintenance
  optimizeDb: () => ipcRenderer.invoke('optimize-db'),

  // Transaction
  processSale: (saleData) => ipcRenderer.invoke('process-sale', saleData),

  // Auto Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (event, data) => callback(data)),
  removeUpdateListeners: () => ipcRenderer.removeAllListeners('update-message')
});