const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Import services
const UserManagementService = require('../src/services/userManagement.service');
const BackupService = require('../src/services/backup.service');
const InventoryService = require('../src/services/inventory.service');
const googleDriveService = require('../src/services/googleDrive.service');
const AIService = require('../src/services/ai.service');

let db;
let mainWindow = null;
let userManagementService;
let backupService;
let inventoryService;
let aiService;


// Initialize database connection
async function initializeDatabase() {
    try {
        const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
        console.log('Database path:', dbPath);
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        console.log('Connected to SQLite database');

        // Enable WAL mode for better crash recovery and concurrent access
        await db.exec('PRAGMA journal_mode = WAL;');
        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON;');
        // Set synchronous mode to FULL for maximum data safety
        await db.exec('PRAGMA synchronous = FULL;');
        console.log('Database configured with WAL mode and ACID compliance');

        // Initialize services
        userManagementService = new UserManagementService(db);
        backupService = new BackupService(db);
        backupService.setUserManagementService(userManagementService);
        inventoryService = new InventoryService(db, userManagementService);
        aiService = new AIService(db);

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

        // Initialize sales table for completed transactions
        await db.exec(`
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                cashier_id INTEGER,
                transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'COMPLETED',
                cash_received REAL,
                change_given REAL
            )
        `);
        console.log('Sales table initialized');

        // Initialize sales_items table for transaction details
        await db.exec(`
            CREATE TABLE IF NOT EXISTS sales_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                book_title TEXT NOT NULL,
                book_author TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                subtotal REAL NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
        `);
        console.log('Sales items table initialized');

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
        autoHideMenuBar: true, // Hide the menu bar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Remove the menu bar completely
    mainWindow.setMenuBarVisibility(false);

    // Always load the React app
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        // DevTools removed - no longer auto-opening
    } else {
        // In production, load from built React app
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    // Clear session and ensure login screen on every app start
    mainWindow.webContents.on('did-finish-load', () => {
        // Clear localStorage to force logout and show login screen
        mainWindow.webContents.executeJavaScript(`
            localStorage.removeItem('user');
            sessionStorage.clear();
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        `).catch(err => {
            console.error('Error clearing session:', err);
        });
    });

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
        // Use smart inventory service that handles duplicates
        const result = await inventoryService.addOrUpdateBook(bookData, bookData.userId || 1);
        return result;
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

// Inventory Tracking IPC handlers
ipcMain.handle('get-stock-movements', async (event, bookId) => {
    try {
        if (bookId) {
            return await inventoryService.getStockMovementHistory(bookId);
        } else {
            return await inventoryService.getAllStockMovements();
        }
    } catch (error) {
        console.error('Error getting stock movements:', error);
        throw error;
    }
});

ipcMain.handle('get-inventory-batches', async (event, bookId) => {
    try {
        return await inventoryService.getInventoryBatches(bookId);
    } catch (error) {
        console.error('Error getting inventory batches:', error);
        throw error;
    }
});

ipcMain.handle('adjust-stock', async (event, { bookId, quantityChange, reason, userId }) => {
    try {
        return await inventoryService.adjustStock(bookId, quantityChange, reason, userId);
    } catch (error) {
        console.error('Error adjusting stock:', error);
        throw error;
    }
});

ipcMain.handle('get-inventory-summary', async () => {
    try {
        return await inventoryService.getInventorySummary();
    } catch (error) {
        console.error('Error getting inventory summary:', error);
        throw error;
    }
});

// AI & Advanced Analytics IPC Handlers
ipcMain.handle('ai:get-forecast', async (event, days) => {
    try {
        return await aiService.generateSalesForecast(days);
    } catch (error) {
        console.error('AI Forecast Error:', error);
        return { error: error.message };
    }
});

ipcMain.handle('ai:get-recommendations', async () => {
    try {
        return await aiService.generateReorderRecommendations();
    } catch (error) {
        console.error('AI Recommendation Error:', error);
        return { error: error.message };
    }
});

ipcMain.handle('ai:get-anomalies', async () => {
    try {
        return await aiService.detectAnomalies();
    } catch (error) {
        console.error('AI Anomaly Error:', error);
        return { error: error.message };
    }
});

ipcMain.handle('ai:ask-question', async (event, query) => {
    try {
        return await aiService.processNaturalLanguageQuery(query);
    } catch (error) {
        console.error('AI NLP Error:', error);
        return { error: error.message };
    }
});

// Sales Transaction Handler with ACID compliance
ipcMain.handle('process-sale', async (event, saleData) => {
    // saleData = { items: [{bookId, title, author, quantity, price}], paymentMethod, cashReceived, cashierId }
    try {
        // BEGIN TRANSACTION - ensures atomicity
        await db.run('BEGIN TRANSACTION');

        let totalAmount = 0;
        const saleItems = [];

        // Step 1: Validate all items and calculate total
        for (const item of saleData.items) {
            const book = await db.get('SELECT * FROM books WHERE id = ?', [item.bookId]);

            if (!book) {
                await db.run('ROLLBACK');
                return { success: false, error: `Book not found: ${item.title}` };
            }

            if (book.stock_quantity < item.quantity) {
                await db.run('ROLLBACK');
                return { success: false, error: `Insufficient stock for: ${item.title}` };
            }

            const subtotal = item.price * item.quantity;
            totalAmount += subtotal;

            saleItems.push({
                bookId: item.bookId,
                title: item.title,
                author: item.author,
                quantity: item.quantity,
                unitPrice: item.price,
                subtotal: subtotal
            });
        }

        // Step 2: Create sales record
        const changeGiven = saleData.paymentMethod === 'cash'
            ? (saleData.cashReceived - totalAmount)
            : 0;

        const saleResult = await db.run(
            `INSERT INTO sales (total_amount, payment_method, cashier_id, cash_received, change_given, status) 
             VALUES (?, ?, ?, ?, ?, 'COMPLETED')`,
            [totalAmount, saleData.paymentMethod, saleData.cashierId || 1, saleData.cashReceived || totalAmount, changeGiven]
        );

        const saleId = saleResult.lastID;

        // Step 3: Insert sale items and update stock (atomic operations)
        for (const item of saleItems) {
            // Insert sale item
            await db.run(
                `INSERT INTO sales_items (sale_id, book_id, book_title, book_author, quantity, unit_price, subtotal) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [saleId, item.bookId, item.title, item.author, item.quantity, item.unitPrice, item.subtotal]
            );

            // Update book stock
            await db.run(
                'UPDATE books SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [item.quantity, item.bookId]
            );
        }

        // Step 4: Log activity
        await userManagementService.logActivity(
            saleData.cashierId || 1,
            'SALE_COMPLETED',
            `Sale completed: ${saleItems.length} items, Total: ${totalAmount}`
        );

        // COMMIT TRANSACTION - all operations successful
        await db.run('COMMIT');

        console.log(`Sale ${saleId} completed successfully`);
        return {
            success: true,
            saleId: saleId,
            total: totalAmount,
            change: changeGiven
        };

    } catch (error) {
        // ROLLBACK on any error - ensures data integrity
        console.error('Sale transaction error:', error);
        try {
            await db.run('ROLLBACK');
            console.log('Transaction rolled back due to error');
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }
        return { success: false, error: error.message };
    }
});

// Get sales history
ipcMain.handle('get-sales-history', async (event, limit = 50) => {
    try {
        const sales = await db.all(
            `SELECT s.*, COUNT(si.id) as item_count 
             FROM sales s 
             LEFT JOIN sales_items si ON s.id = si.sale_id 
             GROUP BY s.id 
             ORDER BY s.transaction_date DESC 
             LIMIT ?`,
            [limit]
        );
        return sales;
    } catch (error) {
        console.error('Error getting sales history:', error);
        throw error;
    }
});

// Get sale details
ipcMain.handle('get-sale-details', async (event, saleId) => {
    try {
        const sale = await db.get('SELECT * FROM sales WHERE id = ?', [saleId]);
        const items = await db.all('SELECT * FROM sales_items WHERE sale_id = ?', [saleId]);
        return { sale, items };
    } catch (error) {
        console.error('Error getting sale details:', error);
        throw error;
    }
});

// Delete all sales history
ipcMain.handle('delete-all-sales', async (event) => {
    try {
        // SQLite with ON DELETE CASCADE will handle sales_items
        await db.run('DELETE FROM sales');

        // Log this critical action (assuming admin/manager)
        await userManagementService.logActivity(1, 'DELETE_ALL_DATA', 'Cleared all analytics/sales data');

        return { success: true };
    } catch (error) {
        console.error('Error deleting all sales:', error);
        return { success: false, error: error.message };
    }
});

// Get detailed sales report
ipcMain.handle('get-detailed-sales-report', async (event, { startDate, endDate } = {}) => {
    try {
        let query = `
            SELECT 
                s.transaction_date as date,
                si.book_title as item,
                s.id as transaction_id,
                b.category as category,
                si.quantity as qty,
                si.subtotal as total,
                s.payment_method
            FROM sales_items si
            JOIN sales s ON s.id = si.sale_id
            LEFT JOIN books b ON b.id = si.book_id
        `;

        const params = [];
        if (startDate && endDate) {
            query += ` WHERE s.transaction_date BETWEEN ? AND ?`;
            params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
        }

        query += ` ORDER BY s.transaction_date DESC`;

        const report = await db.all(query, params);
        return report;
    } catch (error) {
        console.error('Error getting detailed sales report:', error);
        throw error;
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

ipcMain.handle('delete-all-local-backups', async (event) => {
    try {
        return await backupService.deleteAllLocalBackups(1, 'admin'); // Assuming admin user
    } catch (error) {
        console.error('Error deleting all local backups:', error);
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

ipcMain.handle('delete-all-cloud-backups', async (event) => {
    try {
        return await backupService.deleteAllCloudBackups(1, 'admin'); // Assuming admin user
    } catch (error) {
        console.error('Error deleting all cloud backups:', error);
        throw error;
    }
});

ipcMain.handle('select-backup-path', async () => {
    try {
        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'Select Backup Directory',
            properties: ['openDirectory', 'createDirectory']
        });

        if (canceled || filePaths.length === 0) {
            return { canceled: true };
        }

        const newPath = filePaths[0];
        await backupService.setBackupPath(newPath);
        return { success: true, path: newPath };
    } catch (error) {
        console.error('Error selecting backup path:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-backup-path', async () => {
    return backupService.getBackupPath();
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
        const downloadPath = path.join(app.getPath('downloads'), fileName);
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

// Handle renderer process crashes - automatically reload
app.on('renderer-process-crashed', (event, webContents, killed) => {
    console.error('Renderer process crashed. Reloading...');
    if (mainWindow && !mainWindow.isDestroyed()) {
        // Clear session and reload
        mainWindow.webContents.session.clearStorageData().then(() => {
            mainWindow.reload();
        }).catch(err => {
            console.error('Error clearing storage:', err);
            mainWindow.reload();
        });
    }
});

// Handle unresponsive window
app.on('render-process-gone', (event, webContents, details) => {
    console.error('Render process gone:', details.reason);
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
    }
});

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    // Don't crash the app, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    // Don't crash the app, just log the error
});

// System Maintenance
ipcMain.handle('optimize-db', async () => {
    try {
        await db.exec('VACUUM');
        await db.exec('ANALYZE');
        return { success: true };
    } catch (error) {
        console.error('Optimization error:', error);
        return { success: false, error: error.message };
    }
});

// Make sure to close the database connection when the app quits
app.on('will-quit', async () => {
    if (db) {
        await db.close();
        console.log('Database connection closed');
    }
});