const assert = require('assert');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Mock Electron for backend smoke tests
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function () {
    if (arguments[0] === 'electron') {
        return { app: { getPath: () => path.join(__dirname, 'test_env') } };
    }
    return originalRequire.apply(this, arguments);
};

const UserManagementService = require('../src/services/userManagement.service');
const InventoryService = require('../src/services/inventory.service');
const BackupService = require('../src/services/backup.service');

async function runSmokeTests() {
    console.log('Starting Backend Smoke Tests...');

    // 1. Startup & DB Init
    const testDir = path.join(__dirname, 'test_env');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    const dbPath = path.join(testDir, 'test.sqlite');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA journal_mode = WAL;');
    await db.exec('PRAGMA foreign_keys = ON;');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL, isbn TEXT NOT NULL, price REAL NOT NULL, stock_quantity INTEGER NOT NULL, publisher TEXT NOT NULL, category TEXT DEFAULT 'General', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, total_amount REAL NOT NULL, payment_method TEXT NOT NULL, cashier_id INTEGER, transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'COMPLETED', cash_received REAL, change_given REAL);
        CREATE TABLE IF NOT EXISTS sales_items (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER NOT NULL, book_id INTEGER NOT NULL, batch_id INTEGER, book_title TEXT NOT NULL, book_author TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, subtotal REAL NOT NULL, FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE, FOREIGN KEY(book_id) REFERENCES books(id));
        CREATE TABLE IF NOT EXISTS backups (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, file_path TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, type TEXT NOT NULL, status TEXT NOT NULL, size INTEGER, created_by INTEGER, FOREIGN KEY(created_by) REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS inventory_batches (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL, batch_number TEXT, received_date DATETIME DEFAULT CURRENT_TIMESTAMP, expiry_date DATETIME, cost_price REAL, selling_price REAL NOT NULL, initial_quantity INTEGER NOT NULL, current_quantity INTEGER NOT NULL, supplier TEXT, status TEXT DEFAULT 'ACTIVE', created_by INTEGER NOT NULL, FOREIGN KEY(book_id) REFERENCES books(id), FOREIGN KEY(created_by) REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS stock_movements (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL, movement_type TEXT NOT NULL CHECK (movement_type IN ('INITIAL_STOCK', 'RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN')), quantity_change INTEGER NOT NULL, quantity_before INTEGER NOT NULL, quantity_after INTEGER NOT NULL, unit_price REAL, total_value REAL, reference_id INTEGER, notes TEXT, created_by INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(book_id) REFERENCES books(id), FOREIGN KEY(created_by) REFERENCES users(id));
    `);

    // Wait for async init in user management service constructor
    await new Promise(r => setTimeout(r, 500));

    console.log('✅ Startup & DB Init OK');

    // 2. Login Flow
    const userSvc = new UserManagementService(db);
    // Wait for async init in user management service constructor
    await new Promise(r => setTimeout(r, 1000));
    await userSvc.createUser({ username: 'testadmin', password: 'testpassword', role: 'admin', name: 'Test Admin', email: 'test@example.com' }, 1);
    const user = await userSvc.authenticateUser('testadmin', 'testpassword');
    assert.strictEqual(user.username, 'testadmin');
    console.log('✅ Login Flow OK');

    // 3. Inventory & Sale Transaction
    const invSvc = new InventoryService(db, userSvc);
    await invSvc.registerBook({
        title: 'Smoke Test Book', author: 'Test Author', isbn: '99999', price: 15.00, stock_quantity: 10, publisher: 'Test Pub'
    }, user.id);

    const books = await db.all('SELECT * FROM books');
    assert.strictEqual(books.length, 1);
    assert.strictEqual(books[0].stock_quantity, 10);

    // Simulate complex sale via direct DB queries mirroring main.js logic (simplified)
    await db.run('BEGIN TRANSACTION');
    try {
        await db.run('INSERT INTO sales(total_amount, payment_method, cashier_id, cash_received, change_given) VALUES(?, ?, ?, ?, ?)', [15.00, 'cash', user.id, 20.00, 5.00]);
        const saleRow = await db.get('SELECT id FROM sales ORDER BY id DESC LIMIT 1');
        await db.run('INSERT INTO sales_items(sale_id, book_id, book_title, book_author, quantity, unit_price, subtotal) VALUES(?, ?, ?, ?, ?, ?, ?)', [saleRow.id, books[0].id, 'Smoke Test Book', 'Test Author', 1, 15.00, 15.00]);
        await db.run('UPDATE books SET stock_quantity = stock_quantity - 1 WHERE id = ?', [books[0].id]);
        await db.run('COMMIT');
    } catch (e) {
        await db.run('ROLLBACK');
        throw e;
    }

    const updatedBooks = await db.all('SELECT * FROM books');
    assert.strictEqual(updatedBooks[0].stock_quantity, 9);
    console.log('✅ Sale Transaction OK');

    // 4. Backup
    const backupSvc = new BackupService(db);
    backupSvc.setUserManagementService(userSvc);
    const backupDir = path.join(testDir, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    backupSvc.setBackupPath(backupDir);

    await backupSvc.createManualBackup(user.id, 'testadmin');
    const files = fs.readdirSync(backupDir);
    assert.ok(files.length > 0, "Backup file should be created");
    console.log('✅ Backup Flow OK');

    // Cleanup
    await db.close();
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log('🎉 All Smoke Tests Passed.');
}

runSmokeTests().catch(err => {
    console.error('Smoke test failed', err);
    process.exit(1);
});
