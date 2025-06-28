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
  addBook: (bookData) => ipcRenderer.invoke('add-book', bookData),
  getInventory: () => ipcRenderer.invoke('get-inventory'),
  updateBook: (id, bookData) => ipcRenderer.invoke('update-book', id, bookData),
  deleteBook: (id) => ipcRenderer.invoke('delete-book', id),
  getPriceHistory: (bookId) => ipcRenderer.invoke('get-price-history', bookId),

  // Backup Management
  createManualBackup: () => ipcRenderer.invoke('create-manual-backup'),
  getBackupHistory: () => ipcRenderer.invoke('get-backup-history'),
  deleteLocalBackup: (filename) => ipcRenderer.invoke('delete-local-backup', filename),
  deleteCloudBackup: (fileId) => ipcRenderer.invoke('delete-cloud-backup', fileId),

  // Google Drive
  connectGoogleDrive: () => ipcRenderer.invoke('connect-google-drive'),
  setGoogleDriveTokens: (authCode) => ipcRenderer.invoke('set-google-drive-tokens', authCode),
  getGoogleDriveStatus: () => ipcRenderer.invoke('get-google-drive-status'),
  downloadBackup: (fileId, fileName) => ipcRenderer.invoke('download-backup', fileId, fileName)
});