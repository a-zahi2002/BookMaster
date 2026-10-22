# BookMaster POS — End-to-End Complete System Documentation

---

## 1. Executive Summary & Overview

**BookMaster POS** is an enterprise-grade, high-reliability Point of Sale (POS) desktop application engineered specifically for modern bookstores and retail book hubs. Built with **React 19**, **Electron 39**, and **SQLite3**, BookMaster combines the fluid interactivity of a web app with the security, hardware integration, and offline resilience of a desktop application.

### Key Highlights
- **Multi-Role RBAC**: Admin, Manager, and Cashier security scopes.
- **ACID-Compliant POS Engine**: Crash-proof SQLite transactions using Write-Ahead Logging (WAL).
- **Smart Duplicate Detection**: Two-strategy deduplication using ISBN & Title/Author normalization.
- **Inventory Audit & FIFO Batch Tracking**: Full stock movement trail with batch cost tracking.
- **Predictive AI Engine**: Demand forecasting, automated reorder recommendations, sales anomaly detection, and natural language analytics querying.
- **Automated Hybrid Backups**: Local cron-scheduled backups combined with Google Drive cloud sync.
- **Premium Dark UI/UX**: Built with Tailwind CSS, Lucide icons, and Recharts interactive visualizations.

---

## 2. High-Level Architecture & Technical Stack

BookMaster is structured into a multi-tiered desktop architecture featuring clean separation between presentation, state, business logic, IPC bridge, and database storage.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BOOKMASTER ELECTRON DESKTOP APP                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. PRESENTATION LAYER (React 19 + Tailwind CSS + Lucide Icons)              │
│     ├── Views: Login, Admin Dashboard, Manager Dashboard, Cashier POS       │
│     ├── Analytics: Sales Charts, Revenue Trends, Stock Level Visuals        │
│     └── Modals & AI: Book Management, Restock, InsightBot, Forecasts        │
│                                      │                                      │
│  2. STATE MANAGEMENT LAYER (React Context API)                              │
│     ├── AuthContext  │ BookContext  │ CartContext  │ ThemeContext          │
│                                      │                                      │
│  3. CLIENT SERVICES & API BRIDGE (Context Bridge / Preload)                 │
│     ├── window.electronAPI  <═══ IPC Channels ═══> backend/preload.js       │
│                                      │                                      │
│  4. MAIN PROCESS & SERVICES LAYER (Node.js 20+ Runtime)                     │
│     ├── main.js (Window lifecycle, Auto-Updater, System Telemetry)           │
│     ├── inventory.service.js (Deduplication, FIFO Batch allocation)         │
│     ├── userManagement.service.js (Bcrypt security, RBAC audit logs)        │
│     ├── backup.service.js & googleDrive.service.js (Hybrid Backups)         │
│     └── ai.service.js (Predictive forecasting & Natural Language NLP)       │
│                                      │                                      │
│  5. DATABASE STORAGE LAYER (SQLite3 + WAL Mode)                              │
│     └── database.sqlite (ACID transactions, Foreign Keys, Indexing)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Matrix

| Layer | Component / Tool | Version | Responsibility |
| :--- | :--- | :--- | :--- |
| **Desktop Container** | Electron | ^39.2.7 | Window lifecycle, native hardware access, security isolation |
| **UI Framework** | React | ^19.2.3 | Component composition, reactive state, virtual DOM |
| **Routing** | React Router DOM | ^6.28.0 | Client-side page navigation & protected routes |
| **Styling & Icons** | Tailwind CSS & Lucide React | ^3.4.17 / ^0.562 | Modern dark design system, micro-animations, icons |
| **Charts & Analytics**| Recharts | ^3.6.0 | Interactive revenue, sales, and inventory charts |
| **Local Database** | SQLite3 / SQLite | ^5.1.7 / ^5.1.1 | Embedded ACID database with WAL journal mode |
| **Security & Auth** | bcryptjs & dotenv | ^3.0.3 / ^17.3.1 | Password hashing, session isolation, env configuration |
| **Cloud & Tasks** | googleapis & node-cron | ^169.0 / ^4.2 | Google Drive OAuth2 backups & scheduled cron tasks |
| **Build & Packaging** | electron-builder / electron-updater | ^26.0 / ^6.6 | NSIS installers, multi-arch targets, auto-updating |

---

## 3. Database Architecture & Schema Design

BookMaster uses an embedded SQLite database configured for high throughput and fault tolerance.

### WAL Mode & Transaction Safety
When initialized, `main.js` configures the connection with:
```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = FULL;
```
- **WAL Mode (Write-Ahead Logging)** allows concurrent reads while writes occur.
- **Synchronous = FULL** guarantees that completed transactions are flushed to disk, preventing data loss on ungraceful system crashes or power outages.

### Schema Entities & Entity-Relationship Model

```
                    ┌─────────────────────────┐
                    │          users          │
                    └────────────┬────────────┘
                                 │ 1
                                 │
                                 │ N
                    ┌────────────┴────────────┐
                    │          sales          │
                    └────────────┬────────────┘
                                 │ 1
                                 │
                                 │ N
┌──────────────────┐1          N┌┴────────────────────────┐
│      books       ├────────────┤       sales_items       │
└────────┬─────────┘            └─────────────────────────┘
         │ 1
         │
         ├──────────────────────────────┐
         │ N                            │ N
┌────────┴─────────────────┐  ┌─────────┴─────────────────┐
│     stock_movements      │  │    inventory_batches    │
└──────────────────────────┘  └───────────────────────────┘
```

#### Table Definitions

1. **`books`** — Primary product catalog
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `title` (TEXT NOT NULL)
   - `author` (TEXT NOT NULL)
   - `isbn` (TEXT NOT NULL)
   - `price` (REAL NOT NULL)
   - `stock_quantity` (INTEGER NOT NULL)
   - `publisher` (TEXT NOT NULL)
   - `category` (TEXT DEFAULT 'General')
   - `created_at`, `updated_at` (DATETIME)

2. **`sales`** — Header record for completed transactions
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `total_amount` (REAL NOT NULL)
   - `payment_method` (TEXT NOT NULL) — `cash`, `card`, `mobile`
   - `cashier_id` (INTEGER FK -> users.id)
   - `transaction_date` (DATETIME DEFAULT CURRENT_TIMESTAMP)
   - `status` (TEXT DEFAULT 'COMPLETED')
   - `cash_received` (REAL)
   - `change_given` (REAL)

3. **`sales_items`** — Line items attached to sales
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `sale_id` (INTEGER FK -> sales.id ON DELETE CASCADE)
   - `book_id` (INTEGER FK -> books.id)
   - `batch_id` (INTEGER)
   - `book_title` (TEXT NOT NULL)
   - `book_author` (TEXT NOT NULL)
   - `quantity` (INTEGER NOT NULL)
   - `unit_price` (REAL NOT NULL)
   - `subtotal` (REAL NOT NULL)

4. **`users`** — User account registry
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `username` (TEXT UNIQUE NOT NULL)
   - `password` (TEXT NOT NULL) — Bcrypt hash
   - `role` (TEXT NOT NULL) — `admin`, `manager`, `cashier`
   - `status` (TEXT DEFAULT 'active') — `active`, `inactive`
   - `created_at` (DATETIME), `last_login` (DATETIME)

5. **`inventory_batches`** — Batch-level inventory management
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `book_id` (INTEGER FK -> books.id)
   - `batch_number` (TEXT NOT NULL)
   - `initial_quantity` (INTEGER NOT NULL)
   - `current_quantity` (INTEGER NOT NULL)
   - `purchase_price` (REAL NOT NULL)
   - `selling_price` (REAL NOT NULL)
   - `supplier` (TEXT)
   - `received_date` (DATETIME)

6. **`stock_movements`** — Granular audit logging for inventory
   - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
   - `book_id` (INTEGER FK -> books.id)
   - `movement_type` (TEXT NOT NULL) — `INITIAL_STOCK`, `RESTOCK`, `SALE`, `ADJUSTMENT`, `RETURN`
   - `quantity_change` (INTEGER NOT NULL)
   - `previous_stock` (INTEGER NOT NULL)
   - `new_stock` (INTEGER NOT NULL)
   - `user_id` (INTEGER FK -> users.id)
   - `notes` (TEXT)
   - `created_at` (DATETIME)

7. **`user_activity_logs`** & **`backups`** — System governance & backup logs.

---

## 4. Security, Multi-User & Role-Based Access Control (RBAC)

BookMaster strictly enforces role boundaries to ensure operational isolation:

```
                  ┌──────────────────────────────┐
                  │          USER LOGIN          │
                  └──────────────┬───────────────┘
                                 │
                       Verify Bcrypt Password
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
     ┌───────────┐         ┌───────────┐         ┌───────────┐
     │   ADMIN   │         │  MANAGER  │         │  CASHIER  │
     └─────┬─────┘         └─────┬─────┘         └─────┬─────┘
           │                     │                     │
   Full Control           Ops & Analytics          POS Terminal
   - User Management      - Inventory Control      - Cashier Terminal
   - Database Backups     - Restock Operations     - Product Catalog
   - Cloud Sync           - Performance Reports    - Fast Checkout
   - Automation Rules     - Low Stock Tracking     - Today's Sales
   - Telemetry            - Custom Reports         - Print Receipts
```

### Security Measures
1. **Password Hashing**: Uses `bcryptjs` with standard salt rounds for storage.
2. **Session Isolation & Boot Logout**: By default, session data (`localStorage` and `sessionStorage`) is purged on app startup to guarantee kiosk security.
3. **IPC Channel Authorization**: IPC requests carry sender session context (`activeSessions` map in `main.js`), mapping `event.sender.id` to active user credentials.
4. **Audit Logging**: Every sensitive action (`CREATE_USER`, `DELETE_BOOK`, `SALE_COMPLETED`, `MANUAL_BACKUP`) writes an immutable record to `user_activity_logs`.

---

## 5. Core Business Logic & Algorithmic Workflows

### 5.1 Intelligent Duplicate Book Detection
When registering a new book, BookMaster prevents catalog fragmentation using a **2-strategy algorithm** in `inventory.service.js`:

```
                    ┌────────────────────────────┐
                    │    Register Book Request   │
                    └──────────────┬─────────────┘
                                   │
                         Is ISBN provided?
                       ┌───────────┴───────────┐
                    YES│                       │NO
                       ▼                       ▼
            Search DB by exact ISBN      Search DB by normalized
                       │                 (Title + Author) string
                       │                       │
               ┌───────┴───────┐       ┌───────┴───────┐
             FOUND           NOT     FOUND           NOT
               │            FOUND      │            FOUND
               ▼               │       ▼               │
         Match Strategy 1      └──────► Match Strategy 2│
         (ISBN Match)                  (Title+Author)  │
               │                                       │
               ├───────────────────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
 Book Exists      Book Is New
      │                 │
 Update Stock     Insert New Book
 quantity & log   record & create
 RESTOCK movement initial batch
```

### 5.2 POS Checkout Transaction Processing (ACID Atomic Pipeline)
When a sale is processed via IPC channel `process-sale`:

```javascript
BEGIN TRANSACTION
 ├── 1. Validate line items & check stock bounds (book.stock_quantity >= item.quantity)
 ├── 2. FIFO Allocation across batches (SELECT FROM inventory_batches WHERE current_quantity > 0 ORDER BY received_date ASC)
 ├── 3. Calculate subtotal, grand total, and cash change
 ├── 4. INSERT INTO sales (total_amount, payment_method, cashier_id, cash_received, change_given)
 ├── 5. INSERT INTO sales_items (sale_id, book_id, quantity, unit_price, subtotal)
 ├── 6. UPDATE books SET stock_quantity = stock_quantity - quantity WHERE id = book_id
 ├── 7. INSERT INTO stock_movements (movement_type = 'SALE', quantity_change = -quantity)
 └── COMMIT TRANSACTION
     (If ANY step fails or crashes -> ROLLBACK TRANSACTION)
```

### 5.3 Predictive AI & Advanced Analytics Engine (`ai.service.js`)
- **Demand Forecasting**: Runs moving-average & linear trend calculations on historical `sales` to predict product demand over 7, 14, or 30 days.
- **Smart Reorder Recommendations**: Evaluates current stock against daily burn rate and lead times:
  $$\text{Reorder Point} = (\text{Avg Daily Sales} \times \text{Lead Time Days}) + \text{Safety Stock}$$
- **Sales Anomaly Detection**: Highlights unexpected sales surges or drops by computing standard deviation ($\sigma$) over historical daily averages.
- **Natural Language Querying (InsightBot)**: Parses queries like *"What were top selling books last week?"* into analytical SQL summaries.

### 5.4 Hybrid Automated Backup & Cloud Recovery (`backup.service.js`)
- **Local Backups**: `node-cron` triggers scheduled database snapshots in `%APPDATA%/BookMaster/backups/`.
- **Cloud Sync**: `googleDrive.service.js` uses OAuth2 token exchange with Google APIs (`googleapis`) to upload encrypted database snapshots to a dedicated `BookMaster_Backups` Drive folder.
- **Single & Bulk Purging**: Admin interface provides one-click bulk or individual purge controls for both local and cloud snapshots.

---

## 6. Frontend Architecture & React Context State Layer

The React application uses a nested Provider pattern to supply state down the component tree:

```jsx
<AuthProvider>          {/* Manages active user, login status, role checks */}
  <ThemeProvider>       {/* Toggles light / dark themes */}
    <BookProvider>      {/* Fetches and caches inventory, catalog updates */}
      <CartProvider>    {/* Manages POS cart items, quantities, totals */}
        <Router>        {/* React Router SPA navigation */}
          <UpdateNotification />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </CartProvider>
    </BookProvider>
  </ThemeProvider>
</AuthProvider>
```

---

## 7. UI / UX Component Overview & Page Layouts

### 7.1 Login Screen (`Login.js`)
- Dark glassmorphism card design with branded bookstore logo.
- Password input with interactive visibility toggle eye icon.
- Demo account auto-fill buttons (`Admin`, `Manager`, `Cashier`) for testing.
- Error alerts for invalid credentials or inactive user status.

```
┌─────────────────────────────────────────────────────────────┐
│                      BookMaster POS                         │
│             [ Bookstore Management System ]                 │
├─────────────────────────────────────────────────────────────┤
│  Username: [ admin                   ]                      │
│  Password: [ ••••••••••••         👁  ]                      │
│                                                             │
│                [  SIGN IN TO TERMINAL  ]                    │
│                                                             │
│  Quick Demo Logins:                                         │
│  [ Admin Demo ]     [ Manager Demo ]     [ Cashier Demo ]   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Main Dashboard Orchestration (`Dashboard.js`)
Dynamic top navigation and sidebar layout that adapts dynamically to the authenticated user's role:
- **Admin**: Views system overview, user management, backup management, telemetry, settings, reports, POS terminal.
- **Manager**: Views inventory view, stock adjustments, restock requests, reports, sales analytics.
- **Cashier**: Directly focused on POS checkout terminal and daily transactions.

---

### 7.3 Admin Dashboard (`AdminDashboard.js`)
A feature-rich workspace containing multiple sub-tabs:

1. **Overview Tab**:
   - High-level metric cards: Total Revenue, Total Transactions, Total Inventory Value, Active Users.
   - Quick action grid: Register New Book, Restock Inventory, Add System User, Trigger Manual Backup.
   - System Health Telemetry widget: Memory usage, database status, cloud sync status.

2. **Inventory Management Tab**:
   - Full catalog table with search filtering (Title, Author, ISBN, Category).
   - Real-time stock status pill badges (`In Stock`, `Low Stock`, `Out of Stock`).
   - Action buttons for Edit Details, Restock Batch, and Delete Book.

3. **User Management Sub-View (`UserManagement.js`)**:
   - Create new user accounts with role selection (`Admin`, `Manager`, `Cashier`).
   - Reset password modals.
   - Active/Inactive toggle switches.
   - User Activity Audit Log table with timestamp and action category filters.

4. **Backup & Cloud Sync Sub-View (`BackupManagement.js`)**:
   - Backup Path configuration picker.
   - **Local Backups Card**: Manual snapshot trigger, list of backup files with timestamps & sizes, individual download/delete, and **"Delete All Local Backups"** button.
   - **Google Drive Cloud Sync Card**: OAuth2 authentication button, connection status, cloud backup list, restore/download, and **"Delete All Cloud Backups"** button.

5. **System Settings & Automation Tab**:
   - Toggle switches for Low Stock Email Alerts, Auto Backup Cron Schedule, End-of-Day Sales Reports.
   - Theme customization toggles.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BookMaster POS ── Admin View                                👤 Admin (Logout)│
├──────────────┬──────────────────────────────────────────────────────────────┤
│ 📊 Overview   │ Total Revenue   Total Sales   Inventory Value   System Health│
│ 📚 Inventory  │  $45,280.00        1,240         $18,450.00       🟢 Operational│
│ 👥 Users      ├──────────────────────────────────────────────────────────────┤
│ 💾 Backups    │  [ Search Catalog... ]  [ Filter Genre ]   [ + Add New Book ]│
│ 🤖 AI Insights│ ┌──────────────────────────────────────────────────────────┐ │
│ ⚙️ Settings   │ │ Title           Author        ISBN        Stock   Price  │ │
│              │ │ Great Gatsby    F. Scott      97807432    45      $14.99 │ │
│              │ │ Learn React     Dan Abramov   97814919    12 ⚠️   $29.99 │ │
│              │ └──────────────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

### 7.4 Cashier POS Terminal (`CashierDashboard.js`)
Optimized for high-speed counter transactions:

- **Left Section (Product Catalog & Search)**:
  - Search bar supporting Instant Title/Author text search or Barcode/ISBN scanning.
  - Category quick-filter tabs (`All`, `Fiction`, `Science`, `History`, `Children`).
  - Product card grid displaying book cover thumbnail, title, author, price, and current stock badge. Click to add to cart.
- **Right Section (Interactive Shopping Cart)**:
  - Line-item list with quantity increment/decrement controls, unit price, and item subtotal.
  - Cart summary: Subtotal, Tax/Discount (if applicable), and Grand Total.
  - **Payment Modal**: Payment method selector (`Cash`, `Card`, `Mobile Pay`). For Cash, includes fast quick-amount buttons (`$20`, `$50`, `$100`) and calculates real-time **Change Given**.
  - **Receipt Generation**: Formats printable receipt view containing store details, transaction ID, line items, timestamp, and cashier name.

```
┌──────────────────────────────────────────────────┬──────────────────────────┐
│  Search Books by Title, Author, or ISBN...       │ Shopping Cart (#S-1042)  │
├──────────────────────────────────────────────────┼──────────────────────────┤
│ Categories: [All] [Fiction] [Tech] [History]     │ Great Gatsby  x2  $29.98 │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │ Learn React   x1  $29.99 │
│ │ Great Gatsby │ │ Learn React  │ │ Dune       │ ├──────────────────────────┤
│ │ $14.99       │ │ $29.99       │ │ $18.50     │ │ Subtotal:         $59.97 │
│ │ Stock: 45    │ │ Stock: 12 ⚠️ │ │ Stock: 8   │ │ Total:            $59.97 │
│ └──────────────┘ └──────────────┘ └────────────┘ │ ┌──────────────────────┐ │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │ │ [  PROCESS SALE  ]   │ │
│ │ Sapiens      │ │ Clean Code   │ │ Atomic...  │ │ └──────────────────────┘ │
│ └──────────────┘ └──────────────┘ └────────────┘ │ [ Clear Cart ]           │
└──────────────────────────────────────────────────┴──────────────────────────┘
```

---

### 7.5 Analytics, Reports & AI Widgets (`AnalyticsDashboard.js`, `AI/`)
- **Visual Analytics (`Recharts`)**:
  - `RevenueChart`: Area chart showing daily/weekly revenue trends.
  - `SalesChart`: Bar chart showing total transactions over time.
  - `TopProductsChart`: Horizontal bar chart ranking top-selling titles.
  - `InventoryChart`: Pie chart breakdown of stock distribution by category.
- **AI Insights Panel (`AIInsightsPanel.js` & `ForecastWidget.js`)**:
  - Demand forecast graphs predicting future stock depletion dates.
  - **Smart Restock List**: Lists books reaching critical safety levels with suggested order quantities based on daily velocity.
  - **InsightBot (`InsightBot.js`)**: Conversational natural language interface for querying store metrics.

---

## 8. Complete IPC Bridge API Reference

The Electron `preload.js` exposes secure methods under `window.electronAPI`:

### Authentication & Users
- `electronAPI.login(credentials)` ➔ Authenticates user & registers active session.
- `electronAPI.logout(userId)` ➔ Destroys active session & logs action.
- `electronAPI.createUser(userData)` ➔ Creates new system account with hashed password.
- `electronAPI.getUsers()` ➔ Fetches all active & inactive user accounts.
- `electronAPI.updateUser(userId, data)` ➔ Modifies user role or profile details.
- `electronAPI.resetPassword(userId, newPassword)` ➔ Resets user account password.
- `electronAPI.toggleUserStatus(userId)` ➔ Toggles account status between active/inactive.
- `electronAPI.getUserActivityLogs(userId)` ➔ Retrieves audit log records.

### Inventory & Books
- `electronAPI.registerBook(bookData)` ➔ Triggers 2-strategy duplicate check and inserts/updates book.
- `electronAPI.restockBook(stockData)` ➔ Adds stock and creates new inventory batch.
- `electronAPI.updateBookDetails(updateData)` ➔ Updates price, publisher, title, or category.
- `electronAPI.getInventory()` ➔ Returns full product list.
- `electronAPI.getPosInventory()` ➔ Returns lightweight inventory optimized for checkout terminal.
- `electronAPI.deleteBook(id)` ➔ Deletes product entry and logs activity.
- `electronAPI.getStockMovements(bookId)` ➔ Fetches stock audit history.
- `electronAPI.adjustStock(params)` ➔ Manual inventory correction with mandatory reason log.

### Sales & Checkout
- `electronAPI.processSale(saleData)` ➔ Executes ACID transaction (validates stock, deducts batch quantities, inserts sale & items).
- `electronAPI.getSalesHistory(limit)` ➔ Returns recent transactions with item counts.
- `electronAPI.getSaleDetails(saleId)` ➔ Returns transaction header and full line items.
- `electronAPI.deleteAllSales()` ➔ Clears sales analytics history (Admin permission).
- `electronAPI.getDetailedSalesReport(dateRange)` ➔ Generates filtered sales reports.

### AI Analytics
- `electronAPI.ai.getForecast(days)` ➔ Computes sales forecasting predictions.
- `electronAPI.ai.getRecommendations()` ➔ Computes smart reorder recommendations.
- `electronAPI.ai.getAnomalies()` ➔ Identifies unusual sales velocity spikes or drops.
- `electronAPI.ai.askQuestion(query)` ➔ Evaluates natural language analytical queries.

### Backups & Cloud Sync
- `electronAPI.createManualBackup()` ➔ Creates timestamped local SQLite snapshot.
- `electronAPI.getBackupHistory()` ➔ Retrieves local & cloud backup metadata lists.
- `electronAPI.deleteLocalBackup(filename)` ➔ Deletes specified local snapshot.
- `electronAPI.deleteAllLocalBackups()` ➔ Purges all local backup snapshots.
- `electronAPI.connectGoogleDrive()` ➔ Triggers Google Drive OAuth2 flow.
- `electronAPI.deleteCloudBackup(fileId)` ➔ Removes remote Google Drive snapshot.
- `electronAPI.deleteAllCloudBackups()` ➔ Purges all remote Google Drive snapshots.

---

## 9. Development, Building & Distribution Guide

### Development Scripts
```bash
# Web Mode Development (React Dev Server on localhost:3000)
npm start

# Full Desktop Development Mode (React + Electron Concurrent runner)
npm run dev

# Regenerate Windows Icon (.ico) from source logo
npm run create-icon
```

### Production Build & Packaging
```bash
# Step 1: Compile React production bundle
npm run build

# Step 2: Package desktop application via electron-builder
npm run dist
```

#### Build Outputs (`dist/` Directory)
- **Windows**: `BookMaster POS Setup 1.0.0.exe` (NSIS customizable installer with desktop & start menu shortcut creation).
- **Auto-Updater Manifests**: `latest.yml` for automated GitHub releases updates.

---

## 1. Document Summary

This documentation provides an end-to-end blueprint of the BookMaster POS application — ranging from high-level architecture down to the underlying database schemas, IPC bridge, business logic algorithms, and user interface components.

