const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const AuthService = require('./src/services/auth.service');
const logger = require('./src/utils/logger');
const DatabaseService = require('./src/services/database.service');
const dbService = new DatabaseService();
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
let db;

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
                publisher TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Books table initialized');
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
            enableRemoteModule: true
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

// IPC handlers for Electron-specific functionality
ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await authService.login(credentials.username, credentials.password);
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
});

ipcMain.handle('logout', async () => {
    try {
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
});

ipcMain.handle('add-book', async (event, bookData) => {
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
        await db.run(
            'UPDATE books SET title = ?, author = ?, isbn = ?, price = ?, stock_quantity = ?, publisher = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [bookData.title, bookData.author, bookData.isbn, bookData.price, bookData.stock_quantity, bookData.publisher, id]
        );
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('delete-book', async (event, id) => {
    try {
        await db.run('DELETE FROM books WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
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