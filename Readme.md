# BookMaster POS

A modern, full-featured Point of Sale (POS) system designed specifically for bookstores. Built with React and Electron, featuring role-based access control, real-time inventory management, and crash-proof database transactions.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)

---

## 🎯 Features

### Multi-User Role System
- **Admin**: Full system control, user management, settings, analytics
- **Manager**: Inventory management, sales analytics, reporting
- **Cashier**: POS terminal, sales processing, transaction handling

### Core Functionality
- ✅ **Smart Inventory Management** - Auto-detects duplicates by ISBN, tracks all stock movements
- ✅ **Real-time Stock Tracking** - Complete audit trail of all inventory changes
- ✅ **Point of Sale Terminal** - Fast checkout with multiple payment methods
- ✅ **Sales Tracking** - Complete transaction history and analytics
- ✅ **User Management** - Role-based access control and activity logging
- ✅ **Data Backup** - Manual and automated backup with cloud sync
- ✅ **Crash Recovery** - ACID-compliant transactions with automatic rollback
- ✅ **Modern UI/UX** - Premium dark-themed interface with smooth animations


---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/a-zahi2002/BookMaster.git
   cd BookMaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**

   **Web Mode** (Browser):
   ```bash
   npm start
   ```
   Then open `http://localhost:3000`

   **Desktop Mode** (Electron):
   ```bash
   npm run dev
   ```

---

## 👥 Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Cashier | `cashier` | `cashier123` |

---

## 📚 User Guide

### Admin Dashboard
**Access**: Full system control

**Features**:
- System overview with health monitoring
- Complete inventory management (add, edit, delete books)
- User account management
- System settings and automation
- Data backup and export
- Cloud synchronization
- Analytics and reporting

**Settings**:
- Notifications & Alerts (email, low stock, sales reports)
- Automation (auto backup, restock alerts, end-of-day reports)
- Data Management (backup, export, maintenance)
- System Information (version, database, updates)

### Manager Dashboard
**Access**: Operational management

**Features**:
- Inventory management
- Stock monitoring with low-stock alerts
- Sales analytics and performance metrics
- Quick action shortcuts
- Report generation

### Cashier Dashboard (POS Terminal)
**Access**: Sales operations

**Features**:
- Product catalog with search
- Shopping cart management
- Multiple payment methods (Cash, Card, Mobile)
- Change calculation
- Receipt generation
- Today's sales statistics
- Recent transaction history

---

## 📦 Smart Inventory Management

### Intelligent Duplicate Detection
The system uses a **flexible two-strategy approach** to detect duplicate books:

**Strategy 1: ISBN Matching** (for international books)
- If ISBN is provided, system checks for exact ISBN match
- Best for books with standard ISBN codes

**Strategy 2: Title + Author Matching** (for local books)
- If no ISBN or ISBN not found, checks Title + Author combination
- Case-insensitive matching
- Perfect for local books without ISBN

**Adding a New Book:**
- System checks both strategies automatically
- If **new**: Creates new book entry with initial stock
- If **exists**: Updates stock quantity instead of creating duplicate
- Returns clear feedback about how the match was found

**Examples:**
```
International Book (with ISBN):
Adding "The Great Gatsby" (ISBN: 978-0743273565)
- First time: ✅ New book created with 50 units
- Second time: ⚠️ Book exists (matched by ISBN). Stock updated: 50 → 80 units

Local Book (without ISBN):
Adding "සිංහල කවි" by "මාර්ටින් වික්‍රමසිංහ"
- First time: ✅ New book created with 30 units
- Second time: ⚠️ Book exists (matched by Title and Author). Stock updated: 30 → 60 units
```

```

### Complete Stock Movement Tracking
Every inventory change is recorded with:
- **Movement Type**: INITIAL_STOCK, RESTOCK, SALE, ADJUSTMENT, RETURN
- **Quantity Changes**: Before and after amounts
- **User Attribution**: Who made the change
- **Timestamp**: Exact date and time
- **Reason/Notes**: Why the change was made
- **Value Tracking**: Unit price and total value

### Inventory Batches
Track different stock batches with:
- Batch numbers and quantities
- Purchase and selling prices
- Supplier information
- Received and expiry dates

### Stock Adjustments
- Manual stock corrections for damages, losses, or returns
- Requires reason for complete audit trail
- Prevents negative stock quantities
- Full user accountability

### Audit Trail Benefits
- ✅ **No Duplicates** - System prevents duplicate book entries
- ✅ **Complete History** - Track every stock movement
- ✅ **User Accountability** - Know who made each change
- ✅ **Loss Prevention** - Track damages and adjustments
- ✅ **Compliance Ready** - Full audit trail for reporting

---

## 💾 Database & Data Safety


### ACID-Compliant Transactions
The system uses SQLite with **Write-Ahead Logging (WAL)** for maximum data safety:

**Configuration**:
- `PRAGMA journal_mode = WAL` - Crash-proof logging
- `PRAGMA synchronous = FULL` - Maximum durability
- `PRAGMA foreign_keys = ON` - Referential integrity

**Transaction Safety**:
- ✅ **Completed sales are always saved**
- ✅ **Incomplete sales are never saved** (automatic rollback on crash)
- ✅ **No partial transactions** - All-or-nothing guarantee
- ✅ **No inventory mismatches** - Stock always matches sales
- ✅ **Automatic crash recovery** - No manual intervention needed

**How it works**:
```
BEGIN TRANSACTION
  → Validate all items
  → Create sales record
  → Insert sale items
  → Update inventory
  → COMMIT (if successful)
  → ROLLBACK (if error or crash)
```

### Database Tables
- **books** - Inventory catalog
- **sales** - Completed transactions
- **sales_items** - Transaction details
- **stock_movements** - Complete inventory movement history
- **inventory_batches** - Stock batch tracking
- **users** - User accounts
- **user_activity_logs** - User activity audit trail
- **price_history** - Price change tracking


---

## 🎨 UI/UX Features

### Modern Design System
- **Dark-themed sidebars** with gradient accents
- **Card-based layouts** with glassmorphism effects
- **Modern toggle switches** for settings
- **Gradient action buttons** with hover effects
- **Status badges** and indicators
- **Smooth animations** (200-300ms transitions)
- **Professional logo** branding throughout

### Interactive Elements
- Password visibility toggle on login
- Hover effects and micro-animations
- Real-time updates
- Loading states
- Error handling with user-friendly messages

### Responsive Design
- Desktop-optimized interface
- Grid-based layouts
- Flexible containers
- Custom scrollbars

---

## 🛠️ Technical Stack

### Frontend
- **React** 18.3.1
- **React Router** 6.28.0
- **Tailwind CSS** 3.4.17
- **Lucide React** (icons)

### Desktop Application
- **Electron.js** - Native desktop app
- **IPC** - Inter-process communication
- **SQLite** - Local database

### State Management
- **Context API** - Global state
- **LocalStorage** - Session persistence (web mode)

---

## 🔧 Configuration

### Electron Settings
- **Menu Bar**: Hidden for clean interface
- **Developer Tools**: Disabled by default (Ctrl+Shift+I to open manually)
- **Session Management**: Clears on every app start (always shows login)
- **Crash Recovery**: Automatic reload and session clearing

### Database Location
- **Development**: `%APPDATA%/BookMaster/database.sqlite`
- **Production**: Same as development

---

## 📦 Building for Production

### Create Production Build
```bash
npm run build
```

### Package as Desktop App
```bash
npm run dist
```

This creates installers in the `dist` folder for:
- Windows (.exe)
- macOS (.dmg)
- Linux (.AppImage)

---

## 🔐 Security Features

- **Role-based access control** - Different permissions per user role
- **Session management** - Auto-logout on app restart
- **Password protection** - Required for all accounts
- **Activity logging** - Audit trail for all actions
- **Data validation** - Input sanitization and validation

---

## 🐛 Troubleshooting

### App won't start
1. Check if port 3000 is available
2. Run `npm install` to reinstall dependencies
3. Clear cache: `npm cache clean --force`

### Database errors
1. Check database file permissions
2. Ensure SQLite is properly installed
3. Delete database file to reset (will lose data)

### Electron issues
1. Restart the app completely
2. Check console for error messages
3. Run `npm run dev` with fresh terminal

---

## 📝 Development

### Project Structure
```
BookMaster/
├── public/              # Static files, logo, favicon
├── src/
│   ├── components/      # React components
│   ├── contexts/        # Context providers (Auth, Data)
│   ├── pages/           # Page components
│   ├── services/        # Business logic services
│   └── index.css        # Global styles
├── main.js              # Electron main process
├── preload.js           # Electron preload script
└── package.json         # Dependencies and scripts
```

### Available Scripts
- `npm start` - Start React development server
- `npm run dev` - Start Electron app
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages

### Adding New Features
1. Create component in `src/components/`
2. Add route in `src/App.js` if needed
3. Update context providers for state management
4. Add IPC handlers in `main.js` for Electron features

---

## 🤝 Contributing

**Note:** This is proprietary software. Contributions and modifications require explicit permission from the owner.

If you're interested in contributing to this project:

1. **Contact the owner** for permission: a.zahi2002@gmail.com
2. Wait for written approval before proceeding
3. Once approved, follow the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md)

Unauthorized contributions, forks, or modifications are not permitted under the license terms.

---

## 📄 License

**Proprietary and Confidential**

Copyright (c) 2026 Asmed Sahee M.P. All Rights Reserved.

This software is proprietary and confidential. It is made publicly visible for **educational purposes only**.

### Usage Restrictions:
- ✗ **No Commercial Use** - Cannot be used for business or commercial purposes
- ✗ **No Modification** - Cannot be modified without permission
- ✗ **No Distribution** - Cannot be distributed or shared
- ✗ **Educational Viewing Only** - Available for learning purposes only

### Permission Required:
Any use, modification, or commercialization requires **explicit written permission** from the owner.

**For licensing inquiries, contact:**
- **Email**: a.zahi2002@gmail.com
- **GitHub**: [@a-zahi2002](https://github.com/a-zahi2002)

See the [LICENSE](LICENSE) file for complete terms and conditions.

---

## 📧 Contact

**Developer**: Abdul Zahi  
**Email**: a.zahi2002@gmail.com  
**GitHub**: [@a-zahi2002](https://github.com/a-zahi2002)

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Electron** - For desktop app capabilities
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For beautiful icons

---

## 📊 Version History

### v1.0.0 (Current)
- ✅ Complete POS system with role-based access
- ✅ ACID-compliant database transactions
- ✅ Modern UI/UX with dark theme
- ✅ Crash recovery and data safety
- ✅ Multi-user support
- ✅ Inventory management
- ✅ Sales tracking and analytics
- ✅ Backup and cloud sync capabilities

---

**Built with ❤️ for bookstores**
