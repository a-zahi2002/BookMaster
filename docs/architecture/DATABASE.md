# Database Schema Documentation

## Overview

BookMaster uses SQLite as its local database. The database file is created automatically on first run and contains all operational data.

**Database File**: `database.sqlite` (or `pos.db` in config)

## Database Initialization

Database tables are created automatically via migrations in `src/database/migrations.js`.

To manually initialize:
```bash
node -e "require('./src/database/migrations.js').runMigrations()"
```

## Database Tables

### 1. **books** - Inventory/Catalog

Stores all book inventory.

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  genre TEXT,
  stock_quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  publisher TEXT,
  seller TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Columns**:
- `id`: Unique book identifier
- `title`: Book title
- `author`: Author name
- `isbn`: ISBN code (optional)
- `genre`: Book category/genre
- `stock_quantity`: Current inventory count
- `price`: Retail price per unit
- `publisher`: Publishing company
- `seller`: Supplier/seller name
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**Indices**: Recommended on `isbn`, `title`, `author`

---

### 2. **sales** - Transaction Records

Records all sales/transactions.

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
```

**Columns**:
- `id`: Unique sale ID
- `user_id`: Cashier/user who processed sale (FK to users)
- `date`: Transaction timestamp
- `total_amount`: Total sale amount
- `payment_method`: Payment type (cash, card, check, etc.)

**Indices**: Recommended on `user_id`, `date`

---

### 3. **sale_items** - Sale Line Items

Individual items in each sale.

```sql
CREATE TABLE sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER,
  book_id INTEGER,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY(sale_id) REFERENCES sales(id),
  FOREIGN KEY(book_id) REFERENCES books(id)
)
```

**Columns**:
- `id`: Unique line item ID
- `sale_id`: Associated sale (FK to sales)
- `book_id`: Sold book (FK to books)
- `quantity`: Number of units sold
- `price`: Unit price at time of sale

**Indices**: Recommended on `sale_id`, `book_id`

---

### 4. **users** - User Accounts

System users with different roles.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
)
```

**Columns**:
- `id`: Unique user ID
- `username`: Login username (must be unique)
- `password`: Hashed password
- `role`: User role (admin, manager, cashier)
- `created_at`: Account creation date
- `last_login`: Last login timestamp

**Supported Roles**:
- `admin` - Full system access
- `manager` - Inventory and reports management
- `cashier` - POS and sales only

**Indices**: On `username` (already unique)

---

### 5. **backups** - Backup Records

Metadata for automatic backups.

```sql
CREATE TABLE backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_filename TEXT NOT NULL,
  backup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  size_bytes INTEGER,
  status TEXT
)
```

**Columns**:
- `id`: Backup record ID
- `backup_filename`: Backup file name
- `backup_date`: When backup was created
- `size_bytes`: Backup file size
- `status`: Backup status (success, failed, pending)

---

## Entity Relationships

### ER Diagram

```
users (1) ──┐
            │
            ├─→ sales
            │
            │    ┌──→ sale_items ──→ books (many)
            │    │
            └────┘

Relationships:
- One user creates many sales (1:N)
- One sale contains many line items (1:N)
- One book appears in many sales (1:N)
```

### Foreign Key Constraints

- `sales.user_id` → `users.id`
- `sale_items.sale_id` → `sales.id`
- `sale_items.book_id` → `books.id`

## Database Queries

### Common Query Examples

#### Get all books in stock
```sql
SELECT * FROM books WHERE stock_quantity > 0 ORDER BY title;
```

#### Get sales for a specific date
```sql
SELECT s.*, u.username
FROM sales s
LEFT JOIN users u ON s.user_id = u.id
WHERE DATE(s.date) = '2026-02-17';
```

#### Get top selling books
```sql
SELECT b.title, b.author, SUM(si.quantity) as total_sold, SUM(si.price * si.quantity) as revenue
FROM sale_items si
JOIN books b ON si.book_id = b.id
GROUP BY b.id
ORDER BY total_sold DESC
LIMIT 10;
```

#### Get inventory value
```sql
SELECT SUM(stock_quantity * price) as total_inventory_value
FROM books;
```

#### Get sales by cashier
```sql
SELECT u.username, COUNT(s.id) as transaction_count, SUM(s.total_amount) as total_sales
FROM sales s
JOIN users u ON s.user_id = u.id
GROUP BY u.id
ORDER BY total_sales DESC;
```

## Database Location & Configuration

### Configuration File
`src/config/database.config.js`:

```javascript
module.exports = {
  dbPath: 'pos.db',              // Database file location
  backupPath: './backups/',      // Backup directory
  backupFrequency: '0 0 * * 0'   // Cron format (weekly)
};
```

### Default Locations
- **Development**: `./pos.db` (project root)
- **Production**: `./data/pos.db`

## Backup & Recovery

### Automatic Backups
- Scheduled weekly (Sunday midnight)
- Stored in `./backups/` directory
- Filename format: `backup_YYYY-MM-DD_HHmmss.db`

### Manual Backup
```javascript
// Use backup.service.js
const BackupService = require('./services/backup.service');
await BackupService.createBackup();
```

### Restore from Backup
1. Stop the application
2. Replace `database.sqlite` with backup file
3. Restart application

## Data Types

SQLite supports these data types:

| Type | Description |
|------|-------------|
| `INTEGER` | Whole numbers |
| `REAL` | Floating point numbers |
| `TEXT` | Text strings |
| `BLOB` | Binary data |
| `DATETIME` | Timestamps |

## Performance Optimization

### Indexes to Add

For frequently queried columns:

```sql
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sale_items_book ON sale_items(book_id);
```

### Query Optimization Tips
1. Use WHERE clauses to filter early
2. Avoid SELECT * in large queries
3. Use JOINs instead of multiple queries
4. Limit result sets with pagination

## Database Integrity

### Constraints in Place
- ✓ PRIMARY KEYs on all tables
- ✓ FOREIGN KEY relationships
- ✓ UNIQUE constraint on username
- ✓ NOT NULL constraints on required fields

### Data Validation
- Performed at service layer before database operations
- Username format validation
- Price/quantity validation
- Stock quantity bounds checking

## Troubleshooting

### Database Locked Error
Solution: Close other connections, restart application

### Corrupt Database
Solution: Restore from backup or reinitialize

### Out of Disk Space
Solution: Archive old data or increase storage

### Slow Queries
Solution: Add appropriate indexes, optimize query structure

---

**Last Updated**: February 17, 2026
