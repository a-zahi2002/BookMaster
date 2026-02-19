# Archive — Legacy Files

This directory contains files that were part of an earlier version of the BookMaster POS system and are **no longer used** by the active React/Electron application. They are preserved here for reference only.

## Contents

### `views/`
Legacy HTML-based dashboards and stylesheets from before the React rewrite:
- `admin-dashboard.html` — Legacy admin HTML view
- `manager-dashboard.html` — Legacy manager HTML view
- `manager-dashboard.js` — Companion JS for the legacy manager HTML view
- `sales-dashboard.html` — Legacy sales HTML view
- `reports.html` — Legacy reports HTML view
- `login.html` — Legacy login HTML view
- `test-manager.html` — Legacy test/debug HTML page
- `styles.css` — CSS source for the legacy HTML views
- `styles.output.css` — Compiled Tailwind CSS for the legacy HTML views

### `pages-legacy/`
Old React page components superseded by the current role-based dashboard architecture:
- `InventoryView.js` — Replaced by `components/EnhancedInventory.js`
- `POSView.js` — Replaced by `components/dashboards/CashierDashboard.js`
- `ReportsView.js` — Replaced by `components/Analytics/ReportsView.js`
- `SettingsView.js` — Settings functionality moved into `components/dashboards/AdminDashboard.js`

### `components-legacy/`
Old component files that were removed from the active component tree:
- `Login.js` — Old login component that routed to `/admin`, `/manager`, `/sales` (non-existent routes). Replaced by `pages/Login.js` which routes to `/dashboard`
- `SalesDashboard.js` — Was never wired into the routing; had broken import paths. Superseded by `CashierDashboard.js`
- `Cart.js` — Simple legacy cart modal; only referenced by the archived `SalesDashboard.js`. The active cart UI is embedded in `CashierDashboard.js`

## Important
Do **not** import these files in the active application. If you want to repurpose any logic from here, copy the relevant portions into the appropriate active component.
