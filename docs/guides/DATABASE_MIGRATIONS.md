# Database Migrations Guide

## Overview

Database migrations manage database schema changes over time. This document explains how to create and run migrations in BookMaster.

## What Are Migrations?

Migrations are version-controlled SQL changes that:
- Create/modify database tables
- Add/remove columns
- Change data types
- Add indexes
- Evolve schema as features change

## Current Migration System

BookMaster uses a simple file-based migration system in `src/database/migrations.js`.

### runMigrations Function

```javascript
// src/database/migrations.js
async function runMigrations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // All CREATE TABLE statements
      db.run(`CREATE TABLE IF NOT EXISTS books (...)`);
      db.run(`CREATE TABLE IF NOT EXISTS sales (...)`);
      // ... more tables
    });
  });
}
```

**When it runs**:
- On application startup
- First time database accessed
- After fresh installation

## Existing Migrations

### Table 1: books
```javascript
db.run(`CREATE TABLE IF NOT EXISTS books (
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
)`);
```

### Table 2: sales
```javascript
db.run(`CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);
```

### Table 3: sale_items
```javascript
db.run(`CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER,
  book_id INTEGER,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY(sale_id) REFERENCES sales(id),
  FOREIGN KEY(book_id) REFERENCES books(id)
)`);
```

### Table 4: users
```javascript
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
)`);
```

### Table 5: backups
```javascript
db.run(`CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_filename TEXT NOT NULL,
  backup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  size_bytes INTEGER,
  status TEXT
)`);
```

## Creating New Migrations

### Step 1: Add Migration Code

Edit `src/database/migrations.js` and add your SQL:

```javascript
async function runMigrations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Existing migrations...
      
      // NEW MIGRATION - Add customer loyalty points
      db.run(`CREATE TABLE IF NOT EXISTS loyalty_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
      
      // NEW MIGRATION - Add description column to books
      db.run(`ALTER TABLE books ADD COLUMN description TEXT`, (err) => {
        if (err && err.message.includes('duplicate column')) {
          // Column already exists, skip
        } else if (err) {
          console.error('Migration error:', err);
        }
      });
    });
  });
}
```

### Step 2: Test Migration

```bash
# Delete database to force fresh migration
rm database.sqlite

# Run migrations
npm start
# Or manually:
node -e "require('./src/database/migrations.js').runMigrations()"
```

### Step 3: Verify with SQLite

```bash
sqlite3 database.sqlite

# Check table exists
.tables

# Check table structure
.schema loyalty_points

# Insert test data
INSERT INTO loyalty_points (user_id, points) VALUES (1, 100);

# Query data
SELECT * FROM loyalty_points;
```

## Migration Best Practices

### Safe Column Additions

```javascript
// Use ALTER TABLE to add columns to existing tables
db.run(`ALTER TABLE books ADD COLUMN rating REAL DEFAULT 0`, (err) => {
  if (err && err.message.includes('duplicate column')) {
    // Safe to continue - column already exists
    console.log('Column already exists');
  } else if (err) {
    console.error('Migration failed:', err);
  }
});
```

### Creating Indexes

```javascript
db.run(`CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
```

### Version Your Migrations

For complex migrations, document them:

```javascript
// VERSION 1.1.0 - Add loyalty system
// Date: 2026-02-17
// Description: Creates loyalty_points table for customer rewards

db.run(`CREATE TABLE IF NOT EXISTS loyalty_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);
```

### Handle Existing Data

When modifying existing tables:

```javascript
// Migration: Add category to books
db.run(`ALTER TABLE books ADD COLUMN category TEXT DEFAULT 'General'`);

// If needed, update existing records
db.run(`UPDATE books SET category = genre WHERE category IS NULL`);
```

## Advanced Migrations

### Rename Column (SQLite)

SQLite doesn't support RENAME COLUMN directly. Use this pattern:

```javascript
db.run(`
  ALTER TABLE books RENAME TO books_old;
  
  CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    writer TEXT NOT NULL,  -- Renamed from author
    publisher TEXT
  );
  
  INSERT INTO books SELECT id, title, author, publisher FROM books_old;
  
  DROP TABLE books_old;
`);
```

### Add Constraints

```javascript
// Create constraint through new table
db.run(`
  CREATE TABLE sales_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL CHECK(total_amount > 0),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  
  INSERT INTO sales_new SELECT * FROM sales;
  DROP TABLE sales;
  ALTER TABLE sales_new RENAME TO sales;
`);
```

### Data Migration

```javascript
// Migrate data during schema change
db.run(`
  UPDATE books SET price = price * 1.1  -- Increase prices by 10%
  WHERE created_at < datetime('2026-01-01');
`);
```

## Testing Migrations with Data

### Seed Test Data

```bash
# Seed sample data
npm run seed-data

# Verify migration works with data
npm test
```

### Manual Testing

```javascript
// test_migration.js
const { db } = require('./src/database/connection');
const migrations = require('./src/database/migrations');

// Run migrations
migrations.runMigrations().then(() => {
  // Test new table
  db.get('SELECT * FROM loyalty_points LIMIT 1', (err, row) => {
    console.log('New table works:', row);
  });
});
```

## Rollback Strategy

### If Migration Fails

```bash
# Restore from backup
cp backups/backup_2026-02-17_000000.db database.sqlite

# Fix migration code
# Edit src/database/migrations.js

# Retry
npm start
```

### Backup Before Major Migration

```bash
# Create backup
npm run backup

# Then run migration
npm start
```

## Migration Checklist

When creating a migration:

- [ ] SQL syntax is correct
- [ ] Use `IF NOT EXISTS` for idempotency
- [ ] Handle error cases (duplicate column, table exists)
- [ ] Add indexes for performance
- [ ] Test with existing data
- [ ] Document the change
- [ ] Create database backup
- [ ] Test rollback plan
- [ ] Update DATABASE.md documentation

## Future Enhancement

Consider upgrading to numbered migrations:

```
src/database/migrations/
├── 001_create_initial_tables.js
├── 002_add_loyalty_system.js
├── 003_add_inventory_tracking.js
└── index.js  // Runs all in order
```

This allows tracking migration history and safer deployments.

## Common Issues

### "Duplicate column" Error

```javascript
// Problem: Column already exists

// Solution: Check before adding
db.run(`ALTER TABLE books ADD COLUMN description TEXT`, (err) => {
  if (err?.message?.includes('duplicate column')) {
    console.log('Column already exists');
  }
});
```

### "Database is Locked" Error

```
Solution: Wait for previous operation to complete
- Close all database connections
- Wait a few seconds
- Try again
```

### "Syntax Error in SQL"

Verify SQL syntax:
- Test in SQLite browser first
- Check string quotes (single vs double)
- Verify column names and types

## Resources

- [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
- [SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Project DATABASE.md](../architecture/DATABASE.md)

---

**Last Updated**: February 17, 2026
