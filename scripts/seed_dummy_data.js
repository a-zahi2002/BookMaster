const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function seedData() {
    console.log('Starting seed...');

    // Windows APPDATA for 'bookmaster-pos'
    const appDataObjPath = path.join(process.env.APPDATA, 'bookmaster-pos', 'database.sqlite');

    const db = await open({
        filename: appDataObjPath,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');

    // Clear out
    // Wait, the user wants dummy data to test insights. Maybe we KEEP what's there and ADD to it.
    // Let's add 50 books
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Biography', 'Fantasy'];

    // Users
    let cashier1 = await db.get('SELECT id FROM users WHERE username = "cashier"');
    if (!cashier1) cashier1 = { id: 1 }; // Backup

    // Books
    console.log('Inserting Books...');
    const books = [];
    for (let i = 1; i <= 50; i++) {
        const title = `Seed Book ${i} - ${Math.random().toString(36).substring(7)}`;
        const basePrice = Math.floor(Math.random() * 30) + 10;
        const initialStock = Math.floor(Math.random() * 100) + 20;

        const result = await db.run(
            'INSERT INTO books (title, author, isbn, price, stock_quantity, publisher, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, `Author ${i}`, `978-${Math.floor(Math.random() * 1000000000)}`, basePrice, initialStock, `Publisher ${i % 5}`, categories[i % categories.length]]
        );
        books.push({ id: result.lastID, price: basePrice, title });

        // Add Batch
        await db.run(
            'INSERT INTO inventory_batches (book_id, batch_number, initial_quantity, current_quantity, cost_price, selling_price, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [result.lastID, `BATCH-${Date.now()}-${i}`, initialStock, initialStock, basePrice - 5, basePrice, 'ACTIVE', cashier1.id]
        );

        // Add movement
        await db.run(
            'INSERT INTO stock_movements (book_id, movement_type, quantity_change, quantity_before, quantity_after, unit_price, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [result.lastID, 'INITIAL_STOCK', initialStock, 0, initialStock, basePrice - 5, cashier1.id]
        );
    }

    console.log('Inserting Sales...');

    // Generate 500 sales spread over the last 180 days
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < 500; i++) {
        // Random date in the last 180 days
        const dateMs = now - Math.floor(Math.random() * 180 * oneDayMs);
        const transDate = new Date(dateMs).toISOString(); // Simple format like 2023-01-01T12:00:00.000Z
        // Note: SQLite DATETIME usually expects 'YYYY-MM-DD HH:MM:SS'. toISOString gives '...T...Z'
        const sqliteDate = new Date(dateMs).toISOString().replace('T', ' ').substring(0, 19);

        const bookCount = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;
        const saleItems = [];

        for (let j = 0; j < bookCount; j++) {
            const bookInfo = books[Math.floor(Math.random() * books.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            const subtotal = qty * bookInfo.price;
            totalAmount += subtotal;
            saleItems.push({
                book_id: bookInfo.id,
                book_title: bookInfo.title,
                qty,
                price: bookInfo.price,
                subtotal
            });
        }

        const methods = ['cash', 'card', 'mobile'];
        const method = methods[i % methods.length];

        // Insert Sale
        const saleResult = await db.run(
            `INSERT INTO sales (total_amount, payment_method, cashier_id, transaction_date) VALUES (?, ?, ?, ?)`,
            [totalAmount, method, cashier1.id, sqliteDate]
        );

        for (const item of saleItems) {
            await db.run(
                'INSERT INTO sales_items (sale_id, book_id, book_title, book_author, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [saleResult.lastID, item.book_id, item.book_title, 'Seed Author', item.qty, item.price, item.subtotal]
            );

            // Adjust stock movements to simulate it really happened?
            // SQLite schema handles sales_items. Books stock quantity won't match exactly if we fake past sales,
            // but for insights/graphs usually it queries `sales` or `stock_movements`.
            // Let's add a SALE stock movement for correctness in the movements chart.
            await db.run(
                `INSERT INTO stock_movements (book_id, movement_type, quantity_change, quantity_before, quantity_after, unit_price, total_value, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.book_id, 'SALE', -item.qty, 100, 100 - item.qty, item.price, item.subtotal, cashier1.id, sqliteDate]
            );

            // Also update the book's stock quantity silently
            await db.run('UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.qty, item.book_id]);
        }
    }

    console.log('Seed completed successfully!');
    await db.close();
}

seedData().catch(e => console.error(e));
