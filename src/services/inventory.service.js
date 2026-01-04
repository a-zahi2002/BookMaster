class InventoryService {
    constructor(db, userManagementService) {
        this.db = db;
        this.userManagementService = userManagementService;
        this.initializeInventoryTables();
    }

    async initializeInventoryTables() {
        try {
            // Stock movements table for tracking all inventory changes
            await this.db.exec(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          movement_type TEXT NOT NULL CHECK (movement_type IN ('INITIAL_STOCK', 'RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN')),
          quantity_change INTEGER NOT NULL,
          quantity_before INTEGER NOT NULL,
          quantity_after INTEGER NOT NULL,
          unit_price REAL,
          total_value REAL,
          reference_id INTEGER,
          notes TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(book_id) REFERENCES books(id),
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
      `);

            // Inventory batches table for tracking different stock batches
            await this.db.exec(`
        CREATE TABLE IF NOT EXISTS inventory_batches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          batch_number TEXT,
          received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiry_date DATETIME,
          cost_price REAL,
          selling_price REAL NOT NULL,
          initial_quantity INTEGER NOT NULL,
          current_quantity INTEGER NOT NULL,
          supplier TEXT,
          status TEXT DEFAULT 'ACTIVE',
          created_by INTEGER NOT NULL,
          FOREIGN KEY(book_id) REFERENCES books(id),
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
      `);

            console.log('Inventory tracking tables initialized');
        } catch (error) {
            console.error('Error initializing inventory tables:', error);
        }
    }

    /**
     * Register a new book (Catalogue + Initial Stock)
     */
    async registerBook(bookData, userId) {
        try {
            const { title, author, isbn, price, costPrice, stock_quantity, publisher, category, notes } = bookData;

            // Check if book exists
            let existingBook = null;
            if (isbn && isbn.trim() !== '') {
                existingBook = await this.db.get('SELECT id FROM books WHERE isbn = ?', [isbn.trim()]);
            }
            if (!existingBook && title && author) {
                existingBook = await this.db.get(
                    'SELECT id FROM books WHERE LOWER(title) = LOWER(?) AND LOWER(author) = LOWER(?)',
                    [title, author]
                );
            }

            if (existingBook) {
                throw new Error('Book already exists. Please use "Restock" to add inventory.');
            }

            await this.db.run('BEGIN TRANSACTION');

            // 1. Create Book
            const result = await this.db.run(
                'INSERT INTO books (title, author, isbn, price, stock_quantity, publisher, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, author, isbn || '', price, stock_quantity, publisher, category || 'General']
            );
            const bookId = result.lastID;

            // 2. Create Initial Batch
            await this.createInventoryBatch({
                bookId,
                quantity: stock_quantity,
                costPrice: costPrice || 0,
                sellingPrice: price,
                createdBy: userId
            });

            // 3. Record Movement
            await this.recordStockMovement({
                bookId,
                movementType: 'INITIAL_STOCK',
                quantityChange: stock_quantity,
                quantityBefore: 0,
                quantityAfter: stock_quantity,
                unitPrice: costPrice || 0,
                notes: notes || 'Initial registration',
                createdBy: userId
            });

            await this.userManagementService.logActivity(userId, 'REGISTER_BOOK', `Registered "${title}"`);
            await this.db.run('COMMIT');

            return { success: true, bookId };

        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Restock existing book (New Batch)
     */
    async restockBook(bookId, stockData, userId) {
        try {
            const { quantity, costPrice, sellingPrice, supplier, expiryDate, notes } = stockData;
            const book = await this.db.get('SELECT * FROM books WHERE id = ?', [bookId]);
            if (!book) throw new Error('Book not found');

            await this.db.run('BEGIN TRANSACTION');

            // 1. Create Batch
            await this.createInventoryBatch({
                bookId,
                quantity,
                costPrice,
                sellingPrice,
                supplier,
                expiryDate,
                createdBy: userId
            });

            // 2. Update Book Totals
            const newTotal = book.stock_quantity + quantity;
            // Optionally update the main price to the new selling price?
            // User requirement: "old transactions with old prices... same book with different prices"
            // We KEEP the book price as is, OR update it to the LATEST price.
            // Usually the 'books' table price is the 'current list price'.
            // Let's update it so new labels get new price, but old batches retain their specific price.
            await this.db.run(
                'UPDATE books SET stock_quantity = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newTotal, sellingPrice, bookId]
            );

            // 3. Record Movement
            await this.recordStockMovement({
                bookId,
                movementType: 'RESTOCK',
                quantityChange: quantity,
                quantityBefore: book.stock_quantity,
                quantityAfter: newTotal,
                unitPrice: costPrice,
                notes,
                createdBy: userId
            });

            await this.userManagementService.logActivity(userId, 'RESTOCK_BOOK', `Restocked "${book.title}" (+${quantity})`);
            await this.db.run('COMMIT');

            return { success: true, newTotal };
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Update Book Details (Metadata only)
     */
    async updateBookDetails(bookId, updateData, userId) {
        try {
            const { title, author, isbn, publisher, category } = updateData;

            await this.db.run(
                'UPDATE books SET title = ?, author = ?, isbn = ?, publisher = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [title, author, isbn, publisher, category, bookId]
            );

            await this.userManagementService.logActivity(userId, 'UPDATE_BOOK_DETAILS', `Updated details for book ID ${bookId}`);
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Record stock movement for audit trail
     */
    async recordStockMovement(movementData) {
        try {
            const {
                bookId,
                movementType,
                quantityChange,
                quantityBefore,
                quantityAfter,
                unitPrice,
                totalValue,
                referenceId,
                notes,
                createdBy
            } = movementData;

            await this.db.run(
                `INSERT INTO stock_movements 
         (book_id, movement_type, quantity_change, quantity_before, quantity_after, 
          unit_price, total_value, reference_id, notes, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookId,
                    movementType,
                    quantityChange,
                    quantityBefore,
                    quantityAfter,
                    unitPrice || null,
                    totalValue || null,
                    referenceId || null,
                    notes,
                    createdBy
                ]
            );
        } catch (error) {
            console.error('Error recording stock movement:', error);
            throw error;
        }
    }

    /**
     * Create inventory batch record
     */
    async createInventoryBatch(batchData) {
        try {
            const {
                bookId,
                batchNumber,
                quantity,
                costPrice, // unified name
                purchasePrice,
                sellingPrice,
                supplier,
                expiryDate,
                createdBy
            } = batchData;

            await this.db.run(
                `INSERT INTO inventory_batches 
          (book_id, batch_number, initial_quantity, current_quantity, cost_price, selling_price, supplier, expiry_date, created_by) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookId,
                    batchNumber || `BATCH-${Date.now()}`,
                    quantity,
                    quantity, // current starts equal to initial
                    purchasePrice || costPrice || 0, // Handle different param names
                    sellingPrice || 0,
                    supplier || null,
                    expiryDate || null,
                    createdBy
                ]
            );
        } catch (error) {
            console.error('Error creating inventory batch:', error);
            throw error;
        }
    }

    /**
     * Get stock movement history for a book
     */
    async getStockMovementHistory(bookId, limit = 50) {
        try {
            const movements = await this.db.all(
                `SELECT 
          sm.*,
          u.name as created_by_name,
          u.username as created_by_username,
          b.title as book_title,
          b.isbn as book_isbn
         FROM stock_movements sm
         JOIN users u ON sm.created_by = u.id
         JOIN books b ON sm.book_id = b.id
         WHERE sm.book_id = ?
         ORDER BY sm.created_at DESC
         LIMIT ?`,
                [bookId, limit]
            );

            return movements;
        } catch (error) {
            console.error('Error getting stock movement history:', error);
            throw error;
        }
    }

    /**
     * Get all stock movements (for admin/manager)
     */
    async getAllStockMovements(limit = 100) {
        try {
            const movements = await this.db.all(
                `SELECT 
          sm.*,
          u.name as created_by_name,
          u.username as created_by_username,
          b.title as book_title,
          b.isbn as book_isbn,
          b.author as book_author
         FROM stock_movements sm
         JOIN users u ON sm.created_by = u.id
         JOIN books b ON sm.book_id = b.id
         ORDER BY sm.created_at DESC
         LIMIT ?`,
                [limit]
            );

            return movements;
        } catch (error) {
            console.error('Error getting all stock movements:', error);
            throw error;
        }
    }

    /**
     * Get inventory batches for a book
     */
    async getInventoryBatches(bookId) {
        try {
            const batches = await this.db.all(
                `SELECT 
          ib.*,
          u.name as created_by_name
         FROM inventory_batches ib
         JOIN users u ON ib.created_by = u.id
         WHERE ib.book_id = ?
         ORDER BY ib.received_date DESC`,
                [bookId]
            );

            return batches;
        } catch (error) {
            console.error('Error getting inventory batches:', error);
            throw error;
        }
    }

    /**
     * Adjust stock (for corrections, damages, etc.)
     */
    async adjustStock(bookId, quantityChange, reason, userId) {
        try {
            const book = await this.db.get('SELECT * FROM books WHERE id = ?', [bookId]);

            if (!book) {
                throw new Error('Book not found');
            }

            const oldQuantity = book.stock_quantity;
            const newQuantity = oldQuantity + quantityChange;

            if (newQuantity < 0) {
                throw new Error('Adjustment would result in negative stock');
            }

            // Update stock
            await this.db.run(
                'UPDATE books SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newQuantity, bookId]
            );

            // Record movement
            await this.recordStockMovement({
                bookId,
                movementType: 'ADJUSTMENT',
                quantityChange,
                quantityBefore: oldQuantity,
                quantityAfter: newQuantity,
                notes: reason,
                createdBy: userId
            });

            // Log activity
            await this.userManagementService.logActivity(
                userId,
                'STOCK_ADJUSTMENT',
                `Adjusted stock for "${book.title}": ${quantityChange > 0 ? '+' : ''}${quantityChange} units (${oldQuantity} → ${newQuantity}). Reason: ${reason}`
            );

            return {
                success: true,
                oldQuantity,
                newQuantity,
                quantityChange
            };
        } catch (error) {
            console.error('Error adjusting stock:', error);
            throw error;
        }
    }

    /**
     * Get inventory summary statistics
     */
    async getInventorySummary() {
        try {
            const summary = await this.db.get(`
        SELECT 
          COUNT(*) as total_books,
          SUM(stock_quantity) as total_units,
          SUM(stock_quantity * price) as total_value,
          COUNT(CASE WHEN stock_quantity < 10 THEN 1 END) as low_stock_count,
          COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count
        FROM books
      `);

            return summary;
        } catch (error) {
            console.error('Error getting inventory summary:', error);
            throw error;
        }
    }
    /**
     * Get inventory for POS (grouped by price variants)
     */
    async getPosInventory() {
        try {
            // Group by book and SELLING PRICE to show different price options
            const inventory = await this.db.all(`
                SELECT 
                  b.id as book_id,
                  b.title,
                  b.author,
                  b.isbn,
                  b.category,
                  ib.selling_price,
                  SUM(ib.current_quantity) as stock_quantity
                FROM inventory_batches ib
                JOIN books b ON ib.book_id = b.id
                WHERE ib.current_quantity > 0
                GROUP BY b.id, ib.selling_price
                ORDER BY b.title ASC
            `);

            // Format for frontend
            return inventory.map(item => ({
                id: `${item.book_id}-${item.selling_price}`, // Unique ID for React key
                bookId: item.book_id,
                title: item.title,
                author: item.author,
                isbn: item.isbn,
                price: item.selling_price,
                stock_quantity: item.stock_quantity,
                category: item.category
            }));
        } catch (error) {
            console.error('Error getting POS inventory:', error);
            throw error;
        }
    }
}

module.exports = InventoryService;
