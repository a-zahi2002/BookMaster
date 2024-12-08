const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
    constructor() {
        const dbPath = path.join(__dirname, '../../database.sqlite');
        console.log('Database path:', dbPath); // Debug log
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    initializeTables() {
        const bookTableQuery = `
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT UNIQUE NOT NULL,
                price REAL NOT NULL,
                stock_quantity INTEGER NOT NULL,
                publisher TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(bookTableQuery, (err) => {
            if (err) {
                console.error('Error creating books table:', err);
            } else {
                console.log('Books table initialized');
            }
        });
    }

    async addBook(bookData) {
        return new Promise((resolve, reject) => {
            console.log('Adding book to database:', bookData); // Debug log
            
            const query = `
                INSERT INTO books (title, author, isbn, price, stock_quantity, publisher)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, 
                [
                    bookData.title,
                    bookData.author,
                    bookData.isbn,
                    bookData.price,
                    bookData.stock_quantity,
                    bookData.publisher
                ],
                function(err) {
                    if (err) {
                        console.error('Database error adding book:', err);
                        reject(err);
                    } else {
                        console.log('Book added successfully, ID:', this.lastID);
                        resolve({
                            id: this.lastID,
                            ...bookData
                        });
                    }
                }
            );
        });
    }

    async getInventory() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM books ORDER BY title ASC';
            
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching inventory:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async updateBook(id, bookData) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE books 
                SET title = ?, 
                    author = ?, 
                    isbn = ?, 
                    price = ?, 
                    stock_quantity = ?, 
                    publisher = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            this.db.run(query,
                [
                    bookData.title,
                    bookData.author,
                    bookData.isbn,
                    bookData.price,
                    bookData.stock_quantity,
                    bookData.publisher,
                    id
                ],
                (err) => {
                    if (err) {
                        console.error('Error updating book:', err);
                        reject(err);
                    } else {
                        resolve({ id, ...bookData });
                    }
                }
            );
        });
    }

    async deleteBook(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM books WHERE id = ?';
            
            this.db.run(query, [id], (err) => {
                if (err) {
                    console.error('Error deleting book:', err);
                    reject(err);
                } else {
                    resolve({ success: true });
                }
            });
        });
    }

    async getBookById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM books WHERE id = ?';
            
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching book:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}

module.exports = DatabaseService; 