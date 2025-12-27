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
          quantity INTEGER NOT NULL,
          purchase_price REAL,
          selling_price REAL,
          supplier TEXT,
          received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiry_date DATETIME,
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
     * Smart add book - checks for duplicates by ISBN (if available) or Title+Author
     * Handles both international books (with ISBN) and local books (without ISBN)
     */
    async addOrUpdateBook(bookData, userId) {
        try {
            const { title, author, isbn, price, stock_quantity, publisher, notes } = bookData;

            let existingBook = null;
            let matchedBy = null;

            // Strategy 1: Check by ISBN if provided
            if (isbn && isbn.trim() !== '') {
                existingBook = await this.db.get(
                    'SELECT * FROM books WHERE isbn = ? AND isbn != ""',
                    [isbn.trim()]
                );
                if (existingBook) {
                    matchedBy = 'ISBN';
                }
            }

            // Strategy 2: If no ISBN match, check by Title + Author (for local books)
            if (!existingBook && title && author) {
                existingBook = await this.db.get(
                    'SELECT * FROM books WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND LOWER(TRIM(author)) = LOWER(TRIM(?))',
                    [title, author]
                );
                if (existingBook) {
                    matchedBy = 'Title and Author';
                }
            }

            if (existingBook) {
                // Book exists - update stock
                const oldQuantity = existingBook.stock_quantity;
                const newQuantity = oldQuantity + stock_quantity;

                // Update book stock
                await this.db.run(
                    'UPDATE books SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [newQuantity, existingBook.id]
                );

                // Record stock movement
                await this.recordStockMovement({
                    bookId: existingBook.id,
                    movementType: 'RESTOCK',
                    quantityChange: stock_quantity,
                    quantityBefore: oldQuantity,
                    quantityAfter: newQuantity,
                    unitPrice: price,
                    totalValue: price * stock_quantity,
                    notes: notes || `Restocked ${stock_quantity} units`,
                    createdBy: userId
                });

                // Create inventory batch
                await this.createInventoryBatch({
                    bookId: existingBook.id,
                    quantity: stock_quantity,
                    purchasePrice: price,
                    sellingPrice: price,
                    createdBy: userId
                });

                // Log activity
                await this.userManagementService.logActivity(
                    userId,
                    'RESTOCK_BOOK',
                    `Restocked "${title}" (matched by ${matchedBy}) - Added ${stock_quantity} units (${oldQuantity} → ${newQuantity})`
                );

                return {
                    success: true,
                    action: 'updated',
                    bookId: existingBook.id,
                    matchedBy,
                    message: `Book already exists (matched by ${matchedBy}). Stock updated from ${oldQuantity} to ${newQuantity} units.`,
                    oldQuantity,
                    newQuantity
                };
            } else {
                // New book - insert
                const result = await this.db.run(
                    'INSERT INTO books (title, author, isbn, price, stock_quantity, publisher) VALUES (?, ?, ?, ?, ?, ?)',
                    [title, author, isbn || '', price, stock_quantity, publisher]
                );

                const bookId = result.lastID;

                // Record initial stock movement
                await this.recordStockMovement({
                    bookId,
                    movementType: 'INITIAL_STOCK',
                    quantityChange: stock_quantity,
                    quantityBefore: 0,
                    quantityAfter: stock_quantity,
                    unitPrice: price,
                    totalValue: price * stock_quantity,
                    notes: notes || `Initial stock entry`,
                    createdBy: userId
                });

                // Create inventory batch
                await this.createInventoryBatch({
                    bookId,
                    quantity: stock_quantity,
                    purchasePrice: price,
                    sellingPrice: price,
                    createdBy: userId
                });

                // Log activity
                await this.userManagementService.logActivity(
                    userId,
                    'ADD_BOOK',
                    `Added new book: "${title}" with ${stock_quantity} units`
                );

                return {
                    success: true,
                    action: 'created',
                    bookId,
                    message: `New book added successfully with ${stock_quantity} units.`
                };
            }
        } catch (error) {
            console.error('Error in addOrUpdateBook:', error);
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
                purchasePrice,
                sellingPrice,
                supplier,
                createdBy
            } = batchData;

            await this.db.run(
                `INSERT INTO inventory_batches 
         (book_id, batch_number, quantity, purchase_price, selling_price, supplier, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    bookId,
                    batchNumber || `BATCH-${Date.now()}`,
                    quantity,
                    purchasePrice || null,
                    sellingPrice || null,
                    supplier || null,
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
}

module.exports = InventoryService;
