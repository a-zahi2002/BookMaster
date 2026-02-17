# Project Structure & File Organization

## Directory Tree

```
BookMaster/
├── docs/                              # 📚 Full documentation (you are here)
│   ├── README.md                      # Documentation index
│   ├── guides/                        # Development & operations guides
│   │   ├── SETUP.md                   # Installation & setup
│   │   ├── DEVELOPMENT.md             # Development workflow
│   │   ├── DEPLOYMENT.md              # Production build guide
│   │   ├── ENVIRONMENT.md             # Configuration variables
│   │   ├── TROUBLESHOOTING.md         # Common issues & solutions
│   │   ├── CONTRIBUTING.md            # Contributing guidelines
│   │   ├── TESTING.md                 # Testing guide
│   │   └── DATABASE_MIGRATIONS.md     # Database migrations
│   ├── architecture/                  # System design documentation
│   │   ├── ARCHITECTURE.md            # System architecture
│   │   ├── DATABASE.md                # Database schema ref
│   │   ├── PROJECT_STRUCTURE.md       # This file
│   └── api/                           # API & component reference
│       ├── BACKEND_API.md             # Backend endpoints
│       └── COMPONENTS.md              # React components
│
├── src/                               # 🔧 Source code
│   ├── components/                    # React components
│   │   ├── AI/                        # AI/ML features
│   │   │   ├── AIInsightsPanel.js
│   │   │   ├── ForecastWidget.js
│   │   │   ├── InsightBot.js
│   │   │   └── SmartRestockList.js
│   │   ├── Analytics/                 # Reports & charts
│   │   │   ├── AnalyticsDashboard.js
│   │   │   ├── InventoryChart.js
│   │   │   ├── MetricsCard.js
│   │   │   ├── ReportsView.js
│   │   │   ├── RevenueChart.js
│   │   │   ├── SalesChart.js
│   │   │   └── TopProductsChart.js
│   │   ├── common/                    # Reusable components
│   │   │   ├── BookMasterLogo.js
│   │   │   ├── Cart.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Sidebar.js
│   │   │   └── UpdateNotification.js
│   │   ├── dashboards/                # Role-specific dashboards
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminDashboard.test.js
│   │   │   ├── CashierDashboard.js
│   │   │   ├── ManagerDashboard.js
│   │   │   └── SalesDashboard.js
│   │   ├── modals/                    # Dialog components
│   │   ├── BackupManagement.js        # Backup component
│   │   ├── EnhancedInventory.js       # Main inventory view
│   │   ├── EnhancedInventory.test.js  # Inventory tests
│   │   ├── Login.js                   # Login component
│   │   └── UserManagement.js          # User management view
│   │
│   ├── pages/                         # Full page components
│   │   ├── Dashboard.js               # Dashboard router
│   │   ├── InventoryView.js           # Inventory page
│   │   ├── Login.js                   # Login page
│   │   ├── POSView.js                 # POS terminal page
│   │   ├── ReportsView.js             # Reports page
│   │   └── SettingsView.js            # Settings page
│   │
│   ├── contexts/                      # Global state management
│   │   ├── AuthContext.js             # Authentication state
│   │   ├── BookContext.js             # Books/inventory state
│   │   ├── CartContext.js             # Shopping cart state
│   │   └── ThemeContext.js            # Theme preferences
│   │
│   ├── services/                      # Business logic services
│   │   ├── ai.service.js              # AI features
│   │   ├── auth.service.js            # Authentication
│   │   ├── backup.service.js          # Backup operations
│   │   ├── database.service.js        # Database queries
│   │   ├── encryption.service.js      # Data encryption
│   │   ├── googleDrive.service.js     # Cloud integration
│   │   ├── inventory.service.js       # Inventory operations
│   │   ├── payment.service.js         # Payment processing
│   │   ├── printer.service.js         # Printer integration
│   │   ├── report.service.js          # Report generation
│   │   ├── user.service.js            # User operations
│   │   └── userManagement.service.js  # Admin user functions
│   │
│   ├── database/                      # Database layer
│   │   ├── connection.js              # SQLite connection
│   │   └── migrations.js              # Schema initialization
│   │
│   ├── config/                        # Configuration files
│   │   ├── database.config.js         # Database settings
│   │   ├── printer.config.js          # Printer settings
│   │   ├── google-credentials.example.json
│   │   └── google-credentials.json    # (not committed)
│   │
│   ├── utils/                         # Utility functions
│   │   ├── logger.js                  # Logging utilities
│   │   └── validators.js              # Input validation
│   │
│   ├── views/                         # Legacy HTML views
│   │   ├── admin-dashboard.html
│   │   ├── login.html
│   │   ├── manager-dashboard.html
│   │   ├── manager-dashboard.js
│   │   ├── reports.html
│   │   ├── sales-dashboard.html
│   │   ├── styles.css
│   │   └── styles.output.css
│   │
│   ├── App.js                         # Main React component
│   ├── index.js                       # React entry point
│   └── index.css                      # Global styles
│
├── backend/                           # 🖥️ Electron/Node backend
│   ├── index.js                       # IPC handlers
│   └── preload.js                     # IPC preload script
│
├── build/                             # 📦 Production build (generated)
│   ├── index.html                     # Built HTML
│   ├── static/
│   │   ├── css/                       # Bundled styles
│   │   ├── js/                        # Bundled scripts
│   │   └── media/                     # images/fonts
│   └── asset-manifest.json
│
├── dist/                              # 📦 Electron dist (generated)
│   ├── BookMaster Setup 1.0.0.exe     # Windows installer
│   └── BookMaster 1.0.0.exe           # Portable app
│
├── data/                              # 💾 Local data storage
│   ├── database.sqlite                # Database file (generated)
│   └── pos.db                         # Backup DB reference
│
├── logs/                              # 📋 Application logs
│   ├── app.log                        # Main log file
│   ├── error.log                      # Error log
│   └── database.log                   # Database log
│
├── backups/                           # 💾 Database backups
│   └── backup_YYYY-MM-DD_HHMMSS.db   # Auto-created backups
│
├── public/                            # 🎨 Static assets
│   ├── index.html                     # React root HTML
│   └── favicon.ico
│
├── scripts/                           # 🔨 Utility scripts
│   ├── qa_simulation.js               # QA/testing simulation
│   ├── seed_data.js                   # Sample data generation
│   └── debug/                         # Debugging utilities
│       ├── check_process.js
│       ├── electron_probe.js
│       ├── test_electron.js
│       ├── test_electron_deep.js
│       ├── test_electron_dynamic.js
│       ├── test_electron.mjs
│       └── test_internal.js
│
├── main.js                            # 🪟 Electron main process
├── start_electron.js                  # Electron launcher
│
├── package.json                       # Dependencies & scripts
├── package-lock.json                  # Locked versions (generated)
├── postcss.config.js                  # PostCSS config
├── tailwind.config.js                 # Tailwind CSS config
│
├── .env                               # 🔐 Environment variables (local)
├── .env.production                    # 🔐 Production env vars
├── .gitignore                         # Git ignore rules
│
├── README.md                          # Project overview
├── CONTRIBUTING.md                    # Contributing guidelines
├── LICENSE                            # MIT license
└── QA_REPORT.md                       # QA test report

```

## File Purpose Reference

### Core Application
| File | Purpose |
|------|---------|
| `main.js` | Electron main process, window management |
| `start_electron.js` | Electron app launcher |
| `src/App.js` | Main React application component |
| `src/index.js` | React DOM mount point |
| `backend/index.js` | IPC message handlers |

### Configuration
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, build config |
| `postcss.config.js` | PostCSS transformation settings |
| `tailwind.config.js` | Tailwind CSS customization |
| `.env` | Local environment variables |
| `src/config/` | App-specific configurations |

### Source Code Organization

#### Components Layer
- **`common/`** - Reusable components (Sidebar, Cart, Logo)
- **`dashboards/`** - Role-specific views (Admin, Manager, Cashier)
- **`Analytics/`** - Charts and reporting components
- **`AI/`** - Machine learning features
- **`modals/`** - Dialogs and popups

#### Business Logic Layer
- **`services/`** - Encapsulated domain logic
- **`contexts/`** - Global state management
- **`database/`** - Data access layer

#### Utilities
- **`utils/`** - Helper functions (logging, validation)
- **`config/`** - Configuration files

### Data & Storage
| Directory | Purpose |
|-----------|---------|
| `data/` | Local database and data files |
| `backups/` | Automatic database backups |
| `logs/` | Application log files |

### Generated Directories
| Directory | Purpose |
|-----------|---------|
| `build/` | React production build (generated by `npm run build`) |
| `dist/` | Electron installer packages (generated by `npm run dist`) |
| `node_modules/` | npm dependencies (generated by `npm install`) |

## Code Architecture Patterns

### Service Pattern
Services encapsulate business logic:

```
User Action (UI)
    ↓
Service Method Call
    ↓
Database Query
    ↓
Return Result
    ↓
Update UI State
```

**Example**: `src/services/inventory.service.js`

### Context Pattern
Global state management via React Context:

```
Provider (wraps app)
    ↓
Context Value
    ↓
useContext Hook (in components)
    ↓
Trigger Actions
    ↓
Update Context State
    ↓
Component Rerender
```

**Example**: `src/contexts/AuthContext.js`

### Component Hierarchy

```
App
├── ProtectedRoute
│   └── Layout
│       ├── Sidebar (Navigation)
│       └── Main Content
│           ├── Dashboard (Role-based)
│           │   ├── AdminDashboard
│           │   ├── ManagerDashboard
│           │   └── CashierDashboard
│           ├── InventoryView
│           ├── POSView
│           ├── ReportsView
│           └── SettingsView
```

## Asset Organization

### Styles
- **`index.css`** - Global styles
- **`tailwind.config.js`** - Tailwind customization
- **`postcss.config.js`** - CSS processing

### Data Files
- **`public/`** - Static assets served as-is
- **`data/`** - Generated data files
- **`backups/`** - Database backups

### Scripts
- **`scripts/seed_data.js`** - Generate sample data
- **`scripts/qa_simulation.js`** - QA test scenarios
- **`scripts/debug/`** - Debugging tools

## Dependency Organization

### Frontend Dependencies
Located in `src/` - React components and pages

### Backend Dependencies
Located in `backend/` - Node.js Electron handlers

### Database Layer
Located in `src/database/` - SQLite operations

## Naming Conventions

### Files
- Components: PascalCase (e.g., `UserManagement.js`)
- Services: camelCase with `.service.js` (e.g., `auth.service.js`)
- Contexts: camelCase with `Context.js` (e.g., `AuthContext.js`)
- Utils: camelCase (e.g., `logger.js`)
- Styles: kebab-case (e.g., `form-input.css`)

### Directories
- All lowercase with optional hyphens (e.g., `common/`, `user-management/`)

### React Components
- Use PascalCase for component names
- Export as both named and default export
- Co-locate related files when possible

## Adding New Features

### Step 1: Create Data Model
- Add database table in `src/database/migrations.js`
- Document schema in `docs/architecture/DATABASE.md`

### Step 2: Create Service Layer
- Add service in `src/services/feature.service.js`
- Implement CRUD operations
- Handle errors appropriately

### Step 3: Create Context (if needed)
- Add context in `src/contexts/FeatureContext.js`
- If global state required

### Step 4: Create Components
- Create in `src/components/FeatureName.js`
- Or in `src/components/feature/` subfolder for multiple components

### Step 5: Create Page (if needed)
- Add page in `src/pages/FeatureView.js`
- Add route in `src/App.js`
- Link from `Sidebar.js`

### Step 6: Test & Document
- Add tests in `.test.js` file
- Document in `docs/`

---

**Last Updated**: February 17, 2026
