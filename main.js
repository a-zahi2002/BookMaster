const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Import services
const UserManagementService = require('./src/services/userManagement.service');
const BackupService = require('./src/services/backup.service');
const googleDriveService = require('./src/services/googleDrive.service');

let db;
let mainWindow = null;
let userManagementService;
let backupService;

// Initialize database connection
async function initializeDatabase() {
    try {
        db = await open({
            filename: 'database.sqlite',
            driver: sqlite3.Database
        });
        console.log('Connected to SQLite database');
        
        // Initialize services
        userManagementService = new UserManagementService(db);
        backupService = new BackupService(db);
        backupService.setUserManagementService(userManagementService);
        
        // Initialize books table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT NOT NULL,
                price REAL NOT NULL,
                stock_quantity INTEGER NOT NULL,
                publisher TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Books table initialized');
        
        // Load saved Google Drive tokens
        await googleDriveService.loadSavedTokens();
        
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Always load the React app
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load from built React app
        mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Call initializeDatabase when app starts
app.whenReady().then(async () => {
    await initializeDatabase();
    createWindow();
});

// Authentication IPC handlers
ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await userManagementService.authenticateUser(credentials.username, credentials.password);
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
});

ipcMain.handle('logout', async (event, userId) => {
    try {
        if (userId) {
            await userManagementService.logActivity(userId, 'LOGOUT', 'User logged out');
        }
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
});

// User Management IPC handlers
ipcMain.handle('create-user', async (event, userData) => {
    try {
        // Get current user from session (you might want to implement session management)
        const result = await userManagementService.createUser(userData, 1); // Assuming admin user ID is 1
        return result;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
});

ipcMain.handle('get-users', async () => {
    try {
        return await userManagementService.getAllUsers();
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
});

ipcMain.handle('update-user', async (event, userId, updateData) => {
    try {
        return await userManagementService.updateUser(userId, updateData, 1); // Assuming admin user ID is 1
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
});

ipcMain.handle('reset-password', async (event, userId, newPassword) => {
    try {
        return await userManagementService.resetPassword(userId, newPassword, 1); // Assuming admin user ID is 1
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
});

ipcMain.handle('toggle-user-status', async (event, userId) => {
    try {
        return await userManagementService.toggleUserStatus(userId, 1); // Assuming admin user ID is 1
    } catch (error) {
        console.error('Error toggling user status:', error);
        throw error;
    }
});

ipcMain.handle('get-user-activity-logs', async (event, userId = null) => {
    try {
        return await userManagementService.getUserActivityLogs(userId);
    } catch (error) {
        console.error('Error getting activity logs:', error);
        throw error;
    }
});

ipcMain.handle('get-price-history', async (event, bookId) => {
    try {
        return await userManagementService.getPriceHistory(bookId);
    } catch (error) {
        console.error('Error getting price history:', error);
        throw error;
    }
});

// Book Management IPC handlers
ipcMain.handle('add-book', async (event, bookData) => {
    try {
        const result = await db.run(
            'INSERT INTO books (title, author, isbn, price, stock_quantity, publisher) VALUES (?, ?, ?, ?, ?, ?)',
            [bookData.title, bookData.author, bookData.isbn, bookData.price, bookData.stock_quantity, bookData.publisher]
        );
        
        // Log activity
        await userManagementService.logActivity(1, 'ADD_BOOK', `Added book: ${bookData.title}`);
        
        return { success: true, id: result.lastID };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-inventory', async () => {
    try {
        const books = await db.all('SELECT * FROM books ORDER BY title');
        return books;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
});

ipcMain.handle('update-book', async (event, id, bookData) => {
    try {
        // Get current book data for price change tracking
        const currentBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
        
        await db.run(
            'UPDATE books SET title = ?, author = ?, isbn = ?, price = ?, stock_quantity = ?, publisher = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [bookData.title, bookData.author, bookData.isbn, bookData.price, bookData.stock_quantity, bookData.publisher, id]
        );
        
        // Track price change if price was modified
        if (currentBook && currentBook.price !== bookData.price) {
            await userManagementService.trackPriceChange(
                id, 
                currentBook.price, 
                bookData.price, 
                1, // Assuming admin user ID is 1
                'Price updated via inventory management'
            );
        }
        
        // Log activity
        await userManagementService.logActivity(1, 'UPDATE_BOOK', `Updated book: ${bookData.title}`);
        
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-book', async (event, id) => {
    try {
        const book = await db.get('SELECT title FROM books WHERE id = ?', [id]);
        await db.run('DELETE FROM books WHERE id = ?', [id]);
        
        // Log activity
        await userManagementService.logActivity(1, 'DELETE_BOOK', `Deleted book: ${book?.title || 'Unknown'}`);
        
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
});

// Backup Management IPC handlers
ipcMain.handle('create-manual-backup', async (event) => {
    try {
        return await backupService.createManualBackup(1, 'admin'); // Assuming admin user
    } catch (error) {
        console.error('Backup error:', error);
        throw error;
    }
});

ipcMain.handle('get-backup-history', async () => {
    try {
        return await backupService.getBackupHistory();
    } catch (error) {
        console.error('Error getting backup history:', error);
        throw error;
    }
});

ipcMain.handle('delete-local-backup', async (event, filename) => {
    try {
        return await backupService.deleteLocalBackup(filename, 1, 'admin');
    } catch (error) {
        console.error('Error deleting local backup:', error);
        throw error;
    }
});

ipcMain.handle('delete-cloud-backup', async (event, fileId) => {
    try {
        return await backupService.deleteCloudBackup(fileId, 1, 'admin');
    } catch (error) {
        console.error('Error deleting cloud backup:', error);
        throw error;
    }
});

// Google Drive IPC handlers
ipcMain.handle('connect-google-drive', async () => {
    try {
        // You would need to set up Google Drive credentials
        const credentials = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
        };
        return await googleDriveService.authenticate(credentials);
    } catch (error) {
        console.error('Google Drive connection error:', error);
        throw error;
    }
});

ipcMain.handle('set-google-drive-tokens', async (event, authCode) => {
    try {
        // Exchange auth code for tokens
        const { tokens } = await googleDriveService.auth.getToken(authCode);
        return await googleDriveService.setTokens(tokens);
    } catch (error) {
        console.error('Error setting Google Drive tokens:', error);
        throw error;
    }
});

ipcMain.handle('get-google-drive-status', async () => {
    try {
        return googleDriveService.getConnectionStatus();
    } catch (error) {
        console.error('Error getting Google Drive status:', error);
        return { isConnected: false, hasAuth: false };
    }
});

ipcMain.handle('download-backup', async (event, fileId, fileName) => {
    try {
        const downloadPath = path.join(__dirname, 'downloads', fileName);
        return await googleDriveService.downloadBackup(fileName, downloadPath);
    } catch (error) {
        console.error('Error downloading backup:', error);
        throw error;
    }
});

// Window management
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Make sure to close the database connection when the app quits
app.on('will-quit', async () => {
    if (db) {
        await db.close();
        console.log('Database connection closed');
    }
});