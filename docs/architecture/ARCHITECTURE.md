# System Architecture

## Overview

BookMaster is a desktop POS (Point of Sale) system built with Electron, React, and Node.js, featuring SQLite database for local storage.

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron Desktop App                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Frontend (UI Layer)               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ Dashboards│ │InventoryView│ POSView│ ...         │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Context & State Management                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │AuthContext│ │BookContext│ CartContext│ ...       │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Services Layer (Business Logic)           │   │
│  │  ├─ auth.service.js                                  │   │
│  │  ├─ inventory.service.js                             │   │
│  │  ├─ database.service.js                              │   │
│  │  ├─ report.service.js                                │   │
│  │  └─ ... other services                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Node.js Backend (IPC/API)                │   │
│  │  ├─ Electron IPC Handlers                            │   │
│  │  ├─ Database Queries                                 │   │
│  │  └─ File Operations                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          SQLite Database (Local Storage)             │   │
│  │  ├─ books                                             │   │
│  │  ├─ sales                                             │   │
│  │  ├─ users                                             │   │
│  │  └─ ... other tables                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Layers

### 1. **Presentation Layer (React Components)**

**Location**: `src/components/` and `src/pages/`

Responsible for UI rendering and user interaction.

**Key Components**:
- **Dashboards**: Admin, Manager, Cashier, Sales dashboards
- **Views**: Inventory, POS, Reports, Settings
- **Common**: Sidebar, Cart, UpdateNotification
- **Modals**: Dialogs and popups
- **Analytics**: Charts and visualizations
- **AI**: Insights and forecasting widgets

**Technology**: React, Tailwind CSS, Context API

### 2. **State Management Layer (Context)**

**Location**: `src/contexts/`

Manages application state using React Context:

- **AuthContext**: User authentication and authorization
- **BookContext**: Inventory and book management state
- **CartContext**: Shopping cart state
- **ThemeContext**: UI theme preferences

### 3. **Services Layer (Business Logic)**

**Location**: `src/services/`

Encapsulates business logic and external integrations:

| Service | Purpose |
|---------|---------|
| `auth.service.js` | User authentication |
| `inventory.service.js` | Book/inventory operations |
| `database.service.js` | Database queries |
| `report.service.js` | Report generation |
| `payment.service.js` | Payment processing |
| `printer.service.js` | Print operations |
| `backup.service.js` | Database backup/restore |
| `ai.service.js` | AI analytics |
| `googleDrive.service.js` | Cloud integration |
| `encryption.service.js` | Data encryption |

### 4. **Database Layer**

**Location**: `src/database/`

- **connection.js**: SQLite connection management
- **migrations.js**: Database schema initialization

**Database Tables**:
- `books` - Product inventory
- `sales` - Transaction records
- `sale_items` - Line items per sale
- `users` - User accounts
- `backups` - Backup metadata

### 5. **Electron Backend**

**Location**: `backend/` and `main.js`

- **main.js**: Electron main process, window management
- **preload.js**: IPC bridge between frontend and backend
- **index.js**: Backend/IPC handlers

## Data Flow

### User Interaction Flow

```
User Action (Click)
    ↓
React Component Handler
    ↓
Service Method Call
    ↓
Context State Update
    ↓
Component Re-render
```

### Database Operation Flow

```
UI Action
    ↓
Service Layer
    ↓
Database Service
    ↓
SQLite Query
    ↓
Result Processing
    ↓
State Update
    ↓
UI Update
```

## Design Patterns Used

### 1. **Context API for State Management**
- Global state without Redux complexity
- Used for auth, books, cart, theme

### 2. **Service Layer Pattern**
- Business logic separation
- Reusable across components
- Easier testing and maintenance

### 3. **Component Composition**
- Break UI into small, reusable components
- Container and presentation components
- Props drilling minimization via Context

### 4. **Electron IPC Pattern**
- Frontend communicates with backend via IPC
- Secure message passing
- Event-based architecture

## Key Interactions

### Authentication Flow

```
Login Component
    ↓
auth.service.login()
    ↓
Verify credentials in database
    ↓
Generate session/JWT
    ↓
Store in AuthContext
    ↓
Redirect to dashboard
```

### Sales Processing Flow

```
POS Component
    ↓
Add items to CartContext
    ↓
Checkout action
    ↓
inventory.service.processSale()
    ↓
Insert into sales table
    ↓
Update book quantities
    ↓
Generate receipt (print)
    ↓
Update UI
```

### Report Generation Flow

```
Reports Component
    ↓
report.service.generateReport()
    ↓
Query sales data
    ↓
Process analytics
    ↓
Compile into charts/tables
    ↓
Display in UI or export
```

## Performance Considerations

### 1. **Database Queries**
- Indexed important columns for fast lookups
- Parameterized queries to prevent SQL injection
- Connection pooling not needed (single app instance)

### 2. **UI Performance**
- Lazy loading of components
- Memoization of expensive calculations
- Pagination for large datasets

### 3. **Memory Management**
- Proper cleanup in useEffect hooks
- Event listener removal
- State optimization

## Security Architecture

### 1. **Authentication**
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control (RBAC)

### 2. **Data Protection**
- Encryption service for sensitive data
- Database encryption at rest (optional)
- HTTPS for cloud integrations

### 3. **IPC Security**
- Message validation in preload.js
- Type checking for IPC messages
- Restricted backend capabilities

## Scalability Considerations

### Current Limitations
- SQLite single-file database (suitable for ~10,000+ records)
- Single-user desktop app
- Local storage only

### Future Scaling Options
- Migrate to PostgreSQL/MySQL for multi-user
- Implement backend API with Express
- Add cloud sync capabilities
- Multi-store support

## Module Dependencies

Key dependencies and their purposes:

| Package | Purpose |
|---------|---------|
| `react` | UI framework |
| `electron` | Desktop app framework |
| `sqlite3` | Database driver |
| `express` | Backend framework |
| `tailwindcss` | Styling |
| `chart.js` | Analytics charts |
| `axios` | HTTP requests |

See `package.json` for complete list and versions.

---

**Last Updated**: February 17, 2026
