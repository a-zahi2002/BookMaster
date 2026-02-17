# Backend API Documentation

## Overview

BookMaster's backend consists of Electron IPC handlers and services that provide business logic to the React frontend.

## Architecture

```
React Frontend (UI)
    ↓
React Components
    ↓
Services (src/services/*)
    ↓
Electron IPC (backend/index.js)
    ↓
Database (SQLite)
```

## IPC Communication

### Preload Bridge

The `backend/preload.js` file exposes safe IPC communication:

```javascript
// In Electron main window
window.ipcRenderer.invoke('channel-name', data)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Key IPC Channels

| Channel | Purpose | Status |
|---------|---------|--------|
| `auth:login` | User authentication | ✓ Implemented |
| `auth:logout` | User logout | ✓ Implemented |
| `inventory:get-all` | Fetch all books | ✓ Implemented |
| `inventory:add-book` | Add new book | ✓ Implemented |
| `sales:process` | Process sale transaction | ✓ Implemented |
| `backup:create` | Create database backup | ✓ Implemented |
| `backup:restore` | Restore from backup | ✓ Implemented |

## Service APIs

### Authentication Service

**Location**: `src/services/auth.service.js`

```javascript
// Login user
await authService.login(username, password);
// Returns: { id, username, role, token }

// Logout user
await authService.logout();

// Verify token
await authService.verifyToken(token);

// Change password
await authService.changePassword(userId, oldPassword, newPassword);
```

### Inventory Service

**Location**: `src/services/inventory.service.js`

```javascript
// Get all books
const books = await inventoryService.getAllBooks();
// Returns: Array of book objects

// Get single book
const book = await inventoryService.getBook(bookId);
// Returns: { id, title, author, isbn, price, stock_quantity, ... }

// Add new book
const newBook = await inventoryService.addBook({
  title: 'Book Title',
  author: 'Author Name',
  isbn: '1234567890',
  genre: 'Fiction',
  stock_quantity: 10,
  price: 19.99,
  publisher: 'Publisher Name',
  seller: 'Seller Name'
});
// Returns: New book object with id

// Update book
await inventoryService.updateBook(bookId, {
  title: 'New Title',
  price: 21.99,
  stock_quantity: 8
});

// Delete book
await inventoryService.deleteBook(bookId);

// Search books
const results = await inventoryService.searchBooks({
  query: 'search term',
  genre: 'Fiction',
  author: 'Author Name'
});

// Update stock
await inventoryService.updateStock(bookId, quantityChange);
// Positive number = add stock
// Negative number = remove stock

// Get low stock books
const lowStock = await inventoryService.getLowStockBooks(threshold);
```

### Sales Service

**Location**: `src/services/payment.service.js` / `database.service.js`

```javascript
// Process sale
const sale = await paymentService.processSale({
  userId: 1,
  items: [
    { bookId: 5, quantity: 2, price: 19.99 },
    { bookId: 10, quantity: 1, price: 25.00 }
  ],
  paymentMethod: 'cash',
  totalAmount: 64.98
});
// Returns: { id, date, total_amount, payment_method, ... }

// Get sales history
const sales = await databaseService.getSales(limit, offset);

// Get sale details
const saleDetails = await databaseService.getSaleItems(saleId);

// Get sales by date range
const sales = await databaseService.getSalesByDate(startDate, endDate);
```

### Report Service

**Location**: `src/services/report.service.js`

```javascript
// Daily sales report
const report = await reportService.getDailySalesReport(date);
// Returns: { date, totalSales, transactionCount, topBooks, ... }

// Weekly sales summary
const summary = await reportService.getWeeklySales(startDate);

// Monthly profit report
const profit = await reportService.getMonthlyProfit(month, year);

// Top selling books
const topBooks = await reportService.getTopSellingBooks(limit, period);

// Generate PDF report
const pdfData = await reportService.generatePDFReport(reportType, options);

// Export to CSV
const csvData = await reportService.exportToCSV(dataType, filters);
```

### Backup Service

**Location**: `src/services/backup.service.js`

```javascript
// Create backup
const backup = await backupService.createBackup();
// Returns: { filename, date, size, status }

// List backups
const backups = await backupService.listBackups();

// Restore backup
await backupService.restoreBackup(backupFilename);

// Delete backup
await backupService.deleteBackup(backupFilename);

// Auto backup configuration
await backupService.setAutoBackupSchedule(cronExpression);
```

### User Management Service

**Location**: `src/services/userManagement.service.js`

```javascript
// Create new user
const user = await userService.createUser({
  username: 'newuser',
  password: 'password123',
  role: 'cashier'
});

// Get all users
const users = await userService.getAllUsers();

// Get user by ID
const user = await userService.getUser(userId);

// Update user
await userService.updateUser(userId, {
  role: 'manager',
  // username and password cannot be updated
});

// Delete user
await userService.deleteUser(userId);

// Change password
await userService.changePassword(userId, newPassword);

// Reset password to default
await userService.resetPassword(userId);
```

### Printer Service

**Location**: `src/services/printer.service.js`

```javascript
// Print receipt
await printerService.printReceipt({
  saleId: 123,
  items: [],
  total: 50.00,
  paymentMethod: 'cash'
});

// Print report
await printerService.printReport({
  type: 'daily_sales',
  data: reportData
});

// Get available printers
const printers = await printerService.getAvailablePrinters();

// Set default printer
await printerService.setDefaultPrinter(printerName);
```

### Encryption Service

**Location**: `src/services/encryption.service.js`

```javascript
// Encrypt data
const encrypted = encryptionService.encrypt(plaintext, key);

// Decrypt data
const decrypted = encryptionService.decrypt(encrypted, key);

// Generate encryption key
const key = encryptionService.generateKey();
```

## Service Response Format

All services use consistent response format:

### Success Response
```javascript
{
  success: true,
  data: { /* actual data */ },
  message: 'Operation successful'
}
```

### Error Response
```javascript
{
  success: false,
  error: 'ERROR_CODE',
  message: 'Human readable error message'
}
```

## Database Service

**Location**: `src/services/database.service.js`

Direct database access (use specific services when available):

```javascript
// Execute query
databaseService.query(sql, params);

// Get all results
databaseService.all(sql, params);

// Get single result
databaseService.get(sql, params);

// Execute statement
databaseService.run(sql, params);
```

## Error Handling

All service methods throw or return errors:

```javascript
try {
  const result = await authService.login(username, password);
} catch (error) {
  if (error.code === 'INVALID_CREDENTIALS') {
    // Handle specific error
  } else {
    // Handle generic error
    console.error(error.message);
  }
}
```

**Common Error Codes**:
- `INVALID_CREDENTIALS` - Login failed
- `NOT_FOUND` - Resource doesn't exist
- `UNAUTHORIZED` - User not authorized
- `DUPLICATE_ENTRY` - Unique constraint violated
- `DATABASE_ERROR` - Database operation failed
- `VALIDATION_ERROR` - Input validation failed

## Context API (Frontend State)

Contexts manage application state without Redux:

### AuthContext
```javascript
const { user, isAuthenticated, login, logout } = useContext(AuthContext);
```

### BookContext
```javascript
const { books, addBook, updateBook, deleteBook } = useContext(BookContext);
```

### CartContext
```javascript
const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
```

### ThemeContext
```javascript
const { theme, toggleTheme } = useContext(ThemeContext);
```

## Rate Limiting

Not currently implemented in local application. Recommended for future cloud deployment:

```javascript
// Browser: Max 100 requests per minute
// Backend: Max 1000 requests per hour per API key
```

## Authentication

### Token-based
- JWT tokens issued on login
- Token stored in localStorage (frontend)
- Token sent in all authenticated requests

### Session-based
- Server maintains session after login
- Session ID in httpOnly cookie
- Automatic timeout after inactivity

Current implementation uses sessions.

## Best Practices

1. **Always await async operations**
   ```javascript
   const result = await authService.login(user, pass);
   ```

2. **Handle errors appropriately**
   ```javascript
   try {
     await operation();
   } catch (error) {
     // Log and handle
   }
   ```

3. **Use specific services**
   ```javascript
   // Good
   inventoryService.addBook(data);
   
   // Avoid
   databaseService.query('INSERT INTO books...');
   ```

4. **Validate input before service call**
   ```javascript
   if (!bookData.title) throw new Error('Title required');
   await inventoryService.addBook(bookData);
   ```

## Development

Test services locally:

```bash
# Run service tests
npm test inventory.service.test.js

# Debug service
const inventoryService = require('./src/services/inventory.service');
const books = await inventoryService.getAllBooks();
console.log(books);
```

## Future Enhancements

- [ ] REST API compatibility
- [ ] GraphQL endpoint
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Analytics events
- [ ] Webhooks support

---

**Last Updated**: February 17, 2026
