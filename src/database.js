const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'pos.db'));
  }

  initialize() {
    this.db.serialize(() => {
      // Books table
      this.db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT,
        genre TEXT,
        stock_quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        publisher TEXT,
        seller TEXT
      )`);

      // Sales table
      this.db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL
      )`);

      // Sale items table
      this.db.run(`CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        book_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(sale_id) REFERENCES sales(id),
        FOREIGN KEY(book_id) REFERENCES books(id)
      )`);

      // Users table
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      )`);

      // Create default admin user
      const defaultAdmin = {
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin'
      };

      this.db.get('SELECT id FROM users WHERE username = ?', [defaultAdmin.username], (err, row) => {
        if (!row) {
          this.db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [defaultAdmin.username, defaultAdmin.password, defaultAdmin.role]);
        }
      });
    });
  }

  getAllBooks() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM books', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  addBook(book) {
    return new Promise((resolve, reject) => {
      const { title, author, isbn, genre, stock_quantity, price, publisher, seller } = book;
      this.db.run(
        `INSERT INTO books (title, author, isbn, genre, stock_quantity, price, publisher, seller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, author, isbn, genre, stock_quantity, price, publisher, seller],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...book });
        }
      );
    });
  }

  createSale(sale) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        this.db.run(
          'INSERT INTO sales (total_amount, payment_method) VALUES (?, ?)',
          [sale.totalAmount, sale.paymentMethod],
          function(err) {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            const saleId = this.lastID;
            let completed = 0;
            
            sale.items.forEach(item => {
              this.db.run(
                'INSERT INTO sale_items (sale_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [saleId, item.bookId, item.quantity, item.price],
                (err) => {
                  if (err) {
                    this.db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  this.db.run(
                    'UPDATE books SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.bookId],
                    (err) => {
                      if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                        return;
                      }

                      completed++;
                      if (completed === sale.items.length) {
                        this.db.run('COMMIT');
                        resolve({ id: saleId, ...sale });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
    });
  }

  updateBook(bookId, bookData) {
    return new Promise((resolve, reject) => {
      const { title, author, isbn, genre, stock_quantity, price, publisher, seller } = bookData;
      this.db.run(
        `UPDATE books 
         SET title = ?, author = ?, isbn = ?, genre = ?, 
             stock_quantity = ?, price = ?, publisher = ?, seller = ?
         WHERE id = ?`,
        [title, author, isbn, genre, stock_quantity, price, publisher, seller, bookId],
        function(err) {
          if (err) reject(err);
          resolve({ id: bookId, ...bookData });
        }
      );
    });
  }

  updateBookStock(bookId, quantity, type = 'add') {
    return new Promise((resolve, reject) => {
      const operator = type === 'add' ? '+' : '-';
      this.db.run(
        `UPDATE books 
         SET stock_quantity = stock_quantity ${operator} ?
         WHERE id = ?`,
        [quantity, bookId],
        function(err) {
          if (err) reject(err);
          resolve({ id: bookId, quantity });
        }
      );
    });
  }

  getLowStockBooks(threshold = 5) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM books WHERE stock_quantity <= ?',
        [threshold],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = Database;