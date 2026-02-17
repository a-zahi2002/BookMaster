# React Components Reference

## Overview

This document provides a reference for major React components in BookMaster.

## Core Components

### App Component

**Location**: `src/App.js`

Main application component. Sets up routes and context providers.

```javascript
<App>
  └─ AuthContext Provider
     └─ BookContext Provider
        └─ CartContext Provider
           └─ ThemeContext Provider
              └─ Routes
```

**Features**:
- Route management
- Context initialization
- Protected routes
- Global error handling

---

## Dashboard Components

### AdminDashboard

**Location**: `src/components/dashboards/AdminDashboard.js`

Admin-only dashboard with system-wide controls.

**Props**:
- None (uses Context)

**Features**:
- User management
- System settings
- Database maintenance
- Backup management
- Analytics overview

**Used in**: Admin role redirect

```javascript
import AdminDashboard from './dashboards/AdminDashboard';

<AdminDashboard />
```

---

### ManagerDashboard

**Location**: `src/components/dashboards/ManagerDashboard.js`

Manager view with inventory and reports access.

**Props**:
- None (uses Context)

**Features**:
- Inventory overview
- Sales reports
- Stock management
- User performance metrics

---

### CashierDashboard

**Location**: `src/components/dashboards/CashierDashboard.js`

Cashier/Salesperson focused POS terminal.

**Props**:
- None (uses Context)

**Features**:
- Quick checkout
- Recent sales
- Customer management
- Daily summary

---

### SalesDashboard

**Location**: `src/components/dashboards/SalesDashboard.js`

Sales analytics and performance metrics.

**Props**:
- None (uses Context)

**Features**:
- Sales trends
- Top products
- Revenue charts
- Performance KPIs

---

## Page Components

### Dashboard Page Router

**Location**: `src/pages/Dashboard.js`

Routes to appropriate dashboard based on user role.

```javascript
useEffect(() => {
  if (user.role === 'admin') {
    navigate('/dashboard', { replace: true });
  }
}, [user.role]);
```

---

### InventoryView

**Location**: `src/pages/InventoryView.js`

Main inventory/stock management page.

**Props**:
- None (uses Context)

**Features**:
- Book listing
- Add/edit/delete books
- Search and filter
- Bulk operations
- Stock updates

```javascript
import InventoryView from './pages/InventoryView';

<InventoryView />
```

---

### POSView

**Location**: `src/pages/POSView.js`

Point of Sale terminal for transactions.

**Features**:
- Product search
- Shopping cart
- Checkout
- Payment processing
- Receipt printing

---

### ReportsView

**Location**: `src/pages/ReportsView.js`

Sales and business reports.

**Features**:
- Daily/weekly/monthly reports
- Revenue analytics
- Top products
- Export to PDF/CSV

---

## Common Components

### Sidebar

**Location**: `src/components/common/Sidebar.js`

Main navigation component.

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: function
}
```

**Features**:
- Role-based navigation
- User profile
- Logout
- Settings access

```javascript
import Sidebar from './common/Sidebar';

<Sidebar isOpen={true} onClose={() => {}} />
```

---

### Cart Component

**Location**: `src/components/common/Cart.js`

Shopping cart display and editor.

**Props**:
```javascript
{
  items: Array<{bookId, quantity, price}>,
  onRemove: (bookId) => void,
  onQuantityChange: (bookId, quantity) => void,
  onCheckout: () => void
}
```

**Features**:
- Item management
- Total calculation
- Promotion codes
- Checkout trigger

```javascript
import Cart from './common/Cart';

<Cart 
  items={cartItems}
  onRemove={handleRemove}
  onQuantityChange={handleQtyChange}
  onCheckout={handleCheckout}
/>
```

---

### Login Component

**Location**: `src/components/Login.js`

User authentication form.

**Props**:
```javascript
{
  onLoginSuccess: () => void,
  loading: boolean
}
```

**Features**:
- Username/password entry
- Remember me option
- Error messages
- Loading state

```javascript
import Login from './Login';

<Login onLoginSuccess={handleSuccess} />
```

---

### UserManagement

**Location**: `src/components/UserManagement.js`

Admin interface for managing users.

**Props**:
- None (uses Context)

**Features**:
- User list
- Add/edit/delete users
- Role assignment
- Password reset

```javascript
import UserManagement from './UserManagement';

<UserManagement />
```

---

## Analytics Components

### AnalyticsDashboard

**Location**: `src/components/Analytics/AnalyticsDashboard.js`

Comprehensive analytics overview.

**Props**:
```javascript
{
  dateRange: { start, end },
  metrics: Array<string>
}
```

**Features**:
- Multiple chart types
- Date filtering
- Metric selection
- Export functionality

---

### SalesChart

**Location**: `src/components/Analytics/SalesChart.js`

Sales trends visualization.

**Props**:
```javascript
{
  data: Array<{date, amount}>,
  period: 'daily'|'weekly'|'monthly'
}
```

**Features**:
- Line/bar chart
- Period selection
- Trend analysis
- Comparison mode

---

### RevenueChart

**Location**: `src/components/Analytics/RevenueChart.js`

Revenue breakdown visualization.

**Props**:
```javascript
{
  data: Array<{category, revenue}>,
  currency: string
}
```

**Features**:
- Pie/donut chart
- Category filter
- Drill-down capability

---

### InventoryChart

**Location**: `src/components/Analytics/InventoryChart.js`

Stock level visualization.

**Props**:
```javascript
{
  data: Array<{bookId, quantity}>,
  threshold: number
}
```

**Features**:
- Low stock alerts
- Restock suggestions

---

## AI Components

### AIInsightsPanel

**Location**: `src/components/AI/AIInsightsPanel.js`

AI-generated business insights.

**Props**:
```javascript
{
  period: 'daily'|'weekly'|'monthly'
}
```

**Features**:
- Predictive analytics
- Recommendations
- Anomaly detection

---

### ForecastWidget

**Location**: `src/components/AI/ForecastWidget.js`

Sales forecasting widget.

**Props**:
```javascript
{
  daysAhead: number,
  confidence: number
}
```

**Features**:
- Demand forecast
- Confidence intervals

---

### SmartRestockList

**Location**: `src/components/AI/SmartRestockList.js`

AI-recommended restock items.

**Props**:
- None (uses Context)

**Features**:
- Smart recommendations
- Bulk order generation

---

## Modal & Dialog Components

### Modals Directory

**Location**: `src/components/modals/`

Generic modal wrapper available.

```javascript
import Modal from './modals/Modal';

<Modal 
  title="Modal Title"
  isOpen={isOpen}
  onClose={handleClose}
>
  Modal content
</Modal>
```

---

## Common Props Patterns

### Loading States
```javascript
{
  loading: boolean,
  error: string | null
}
```

### Form Input Props
```javascript
{
  value: string,
  onChange: (e) => void,
  onBlur: (e) => void,
  error: string | null
}
```

### List Component Props
```javascript
{
  items: Array<T>,
  isLoading: boolean,
  onSelect: (item: T) => void,
  onDelete: (id: any) => void
}
```

## Component Patterns

### Container Component Pattern

```javascript
// InventoryContainer.js - handles logic
export default function InventoryContainer() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <InventoryView 
      books={books}
      loading={loading}
      onAddBook={handleAdd}
    />
  );
}
```

```javascript
// InventoryView.js - presentation only
export function InventoryView({ books, loading, onAddBook }) {
  return (
    <div>
      {loading && <Spinner />}
      {books.map(book => (
        <BookItem key={book.id} book={book} />
      ))}
    </div>
  );
}
```

### Custom Hooks

```javascript
// hooks/useInventory.js
export function useInventory() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    const data = await inventoryService.getAllBooks();
    setBooks(data);
    setLoading(false);
  };

  return { books, loading, loadBooks };
}

// Usage in component
const { books, loading } = useInventory();
```

## Best Practices

1. **Use Context for global state**
   ```javascript
   const { user, login, logout } = useContext(AuthContext);
   ```

2. **Keep components focused**
   - One responsibility per component
   - Max 300 lines

3. **Use consistent prop patterns**
   - Always include loading and error states
   - Use TypeScript interfaces (when available)

4. **Extract logic to hooks**
   - For reusable logic
   - For complex state management

5. **Memoize expensive components**
   ```javascript
   export default React.memo(MyComponent);
   ```

## Component Hierarchy Map

```
App
├── Login
└── Layout
    ├── Sidebar
    ├── TopNav
    └── Content
        ├── Dashboard (router)
        │   ├── AdminDashboard
        │   ├── ManagerDashboard
        │   ├── CashierDashboard
        │   └── SalesDashboard
        ├── InventoryView
        ├── POSView
        ├── ReportsView
        │   ├── AnalyticsDashboard
        │   ├── SalesChart
        │   ├── RevenueChart
        │   └── TopProductsChart
        ├── SettingsView
        └── UserManagement
```

---

**Last Updated**: February 17, 2026
