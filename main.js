const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const AuthService = require('./src/services/auth.service');
const logger = require('./src/utils/logger');
const DatabaseService = require('./src/services/database.service');
const dbService = new DatabaseService();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
let db; // Declare db variable in global scope

let mainWindow = null;
const authService = new AuthService();

// Initialize database connection
async function initializeDatabase() {
    try {
        db = await open({
            filename: 'database.sqlite',
            driver: sqlite3.Database
        });
        console.log('Connected to SQLite database');
        
        // Initialize books table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT NOT NULL,
                price REAL NOT NULL,
                stock_quantity INTEGER NOT NULL,
                publisher TEXT NOT NULL
            )
        `);
        console.log('Books table initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Add this debug IPC handler to test IPC communication
ipcMain.handle('test-ipc', async () => {
    console.log('IPC test successful');
    return 'IPC working';
});

// Helper function to verify file exists
function verifyFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        console.error('Error checking file:', err);
        return false;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const loginPath = path.join(__dirname, 'src', 'views', 'login.html');
    console.log('Loading login page:', loginPath);
    
    if (verifyFileExists(loginPath)) {
        mainWindow.loadFile(loginPath).catch(err => {
            console.error('Failed to load login page:', err);
        });
    } else {
        console.error('Login file not found:', loginPath);
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

ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await authService.login(credentials.username, credentials.password);
        let dashboardPath;

        // Map roles to dashboard files with correct paths
        switch (user.role) {
            case 'admin':
                dashboardPath = path.join(__dirname, 'src', 'views', 'admin-dashboard.html');
                break;
            case 'manager':
                dashboardPath = path.join(__dirname, 'src', 'views', 'manager-dashboard.html');
                break;
            case 'user':
                dashboardPath = path.join(__dirname, 'src', 'views', 'sales-dashboard.html');
                break;
            default:
                throw new Error('Invalid role');
        }

        // Debug log
        console.log('Attempting to load dashboard:', dashboardPath);
        console.log('User role:', user.role);

        // Verify file exists
        if (!fs.existsSync(dashboardPath)) {
            console.error('Dashboard file not found:', dashboardPath);
            throw new Error(`Dashboard file not found: ${dashboardPath}`);
        }

        if (mainWindow) {
            await mainWindow.loadFile(dashboardPath);
            console.log('Successfully loaded dashboard');
        }
        
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
});

ipcMain.handle('logout', async () => {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'login.html');
        console.log('Attempting to logout, loading:', loginPath);

        if (!verifyFileExists(loginPath)) {
            throw new Error('Login file not found');
        }

        if (mainWindow) {
            await mainWindow.loadFile(loginPath);
            console.log('Successfully logged out');
        }
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
});

const registeredHandlers = new Set();

function registerIpcHandler(channel, handler) {
    if (!registeredHandlers.has(channel)) {
        ipcMain.handle(channel, handler);
        registeredHandlers.add(channel);
    }
}

// Now register your handlers using this function
registerIpcHandler('add-book', async (event, bookData) => {
    try {
        const result = await db.run(
            'INSERT INTO books (title, author, isbn, price, stock_quantity, publisher) VALUES (?, ?, ?, ?, ?, ?)',
            [bookData.title, bookData.author, bookData.isbn, bookData.price, bookData.stock_quantity, bookData.publisher]
        );
        return { success: true, id: result.lastID };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
});

// Register other handlers similarly
registerIpcHandler('get-inventory', async () => {
    try {
        const books = await db.all('SELECT * FROM books ORDER BY title');
        return books;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
});

function createAddBookWindow() {
    const addBookWindow = new BrowserWindow({
        width: 600,
        height: 800,
        parent: mainWindow, // Makes it modal
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    addBookWindow.loadFile(path.join(__dirname, 'src', 'views', 'add-book.html'));
    addBookWindow.setMenu(null);
}

// Add these IPC handlers
ipcMain.handle('open-add-book-window', () => {
    createAddBookWindow();
});

ipcMain.on('refresh-inventory', () => {
    mainWindow.webContents.send('refresh-inventory');
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

// Handle any uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Make sure to close the database connection when the app quits
app.on('will-quit', async () => {
    if (db) {
        await db.close();
        console.log('Database connection closed');
    }
});

// Add these IPC handlers

ipcMain.handle('get-dashboard-stats', async () => {
    try {
        const [totalBooks] = await db.get('SELECT COUNT(*) as count FROM books');
        const [lowStockCount] = await db.get('SELECT COUNT(*) as count FROM books WHERE stock_quantity < 10');
        const [todaySales] = await db.get(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM sales 
            WHERE DATE(timestamp) = DATE('now')
        `);

        return {
            totalBooks: totalBooks.count,
            lowStockCount: lowStockCount.count,
            todaySales: todaySales.total || 0
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw error;
    }
});

ipcMain.handle('get-recent-activities', async () => {
    try {
        const activities = await db.all(`
            SELECT * FROM activities 
            ORDER BY timestamp DESC 
            LIMIT 5
        `);
        return activities;
    } catch (error) {
        console.error('Error getting recent activities:', error);
        throw error;
    }
});

ipcMain.handle('backup-database', async () => {
    try {
        const backupPath = path.join(app.getPath('userData'), `backup-${Date.now()}.sqlite`);
        await fs.copyFile(dbPath, backupPath);
        return { success: true, path: backupPath };
    } catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('restore-database', async (event, backupPath) => {
    try {
        await db.close(); // Close current connection
        await fs.copyFile(backupPath, dbPath);
        // Reinitialize database connection
        await initializeDatabase();
        return { success: true };
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('restart-app', () => {
    app.relaunch();
    app.exit();
});