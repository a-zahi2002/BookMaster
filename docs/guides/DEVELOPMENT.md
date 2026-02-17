# Development Guide

## Development Environment Setup

Follow the [Setup & Installation Guide](./SETUP.md) first to install dependencies.

## Development Workflow

### Starting the Development Server

```bash
# Start React dev server only
npm start

# Start with Electron desktop app
npm run dev

# Start Electron only (requires existing build)
npm run electron
```

**Which command to use**:
- `npm start` - For web-only development
- `npm run dev` - For full desktop app development (recommended)
- `npm run electron` - After building React

### File Watching

- React dev server auto-recompiles on file changes
- Electron auto-reloads on changes to backend/main.js
- Tailwind CSS auto-rebuilds styles

Just save and the app refreshes automatically.

## Project Structure

```
src/
├── components/          # React components
│   ├── AI/             # AI features
│   ├── Analytics/      # Charts and reports
│   ├── common/         # Reusable components
│   ├── dashboards/     # Role-specific dashboards
│   └── modals/         # Dialogs and modals
├── pages/              # Full page components
├── contexts/           # Global state (React Context)
├── services/           # Business logic
├── database/           # Database connection & migrations
├── config/             # Configuration files
├── utils/              # Utility functions
└── views/              # HTML templates (legacy)

backend/                # Electron backend code
scripts/                # Utility scripts
```

## Code Organization

### Components

Keep components focused and reusable:

```javascript
// src/components/MyComponent.js
import React, { useState } from 'react';

export function MyComponent({ title, onAction }) {
  const [state, setState] = useState('');
  
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
}

export default MyComponent;
```

**Best practices**:
- One component per file
- Export as named export AND default
- Keep components under 300 lines
- Extract logic to services/hooks

### Services

Encapsulate business logic:

```javascript
// src/services/myFeature.service.js
class MyFeatureService {
  async performAction(data) {
    // Business logic here
    return result;
  }
}

module.exports = new MyFeatureService();
```

**Best practices**:
- One service per domain
- Singleton pattern (export instance)
- Async/Promise based
- Error handling included

### Context for Global State

```javascript
// src/contexts/MyContext.js
import React, { createContext, useState } from 'react';

export const MyContext = createContext();

export function MyProvider({ children }) {
  const [state, setState] = useState({});
  
  const value = {
    state,
    setState,
    // Actions
  };
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
```

**Use when**:
- Data needed by multiple unrelated components
- Global settings (theme, user auth, etc.)
- Shared state across routes

## Development Tools

### Browser DevTools

Press **F12** in the application:

- **Console**: Log messages and errors
- **Network**: API calls and resources
- **Application**: Local storage, cookies
- **Performance**: Runtime performance

### React DevTools

[Install React DevTools browser extension](https://react.devtools.org/)

Provides:
- Component tree inspection
- Props and state viewing
- Performance profiling

### SQLite Browser

[Download DB Browser for SQLite](https://sqlitebrowser.org/)

Useful for:
- Viewing database tables
- Running SQL queries
- Checking data integrity

### Terminal Commands

```bash
# Development
npm start                   # React only
npm run dev               # Electron + React
npm run electron          # Electron only

# Building
npm run build             # Production React build
npm run dist              # Create installer

# Testing
npm test                  # Run tests
npm test -- --coverage    # With coverage report

# Database
npm run seed-data         # Populate sample data

# Utilities
npm run backup            # Manual database backup
npm run logs              # View application logs
```

## Git Workflow

### Branch Naming

```
feature/add-user-management
bugfix/fix-price-calculation
docs/update-readme
chore/upgrade-react
```

### Commit Messages

```
feat: Add user management feature
fix: Resolve database query timeout
docs: Update installation guide
refactor: Simplify inventory service
style: Format code with Prettier
test: Add unit tests for auth
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
# ... edit files ...
npm test

# Stage and commit
git add .
git commit -m "feat: Describe what you added"

# Push to remote
git push origin feature/my-feature

# Create Pull Request on GitHub
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test MyComponent.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on changes)
npm test -- --watch
```

### Writing Tests

```javascript
// src/components/MyComponent.test.js
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders with title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('calls onAction when clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent onAction={mockAction} />);
    
    screen.getByRole('button').click();
    expect(mockAction).toHaveBeenCalled();
  });
});
```

**Testing libraries**:
- `@testing-library/react` - Component testing
- `jest` - Test runner
- `@testing-library/jest-dom` - Matchers

## Debugging

### Console Logging

```javascript
// Simple logging
console.log('Value:', myVar);

// Structured logging
console.table([{ id: 1, name: 'Book' }]);

// Conditional logging
if (process.env.REACT_APP_DEBUG_MODE === 'true') {
  console.debug('Debug info:', data);
}
```

### Breakpoints

In browser DevTools (F12):
1. Go to Sources tab
2. Find your file
3. Click line number to add breakpoint
4. Trigger the code
5. Inspect variables when paused

### React Devtools (if installed)

1. Install React DevTools extension
2. Open DevTools (F12)
3. Go to React tab
4. Browse component tree
5. Inspect props and state

### Database Debugging

```javascript
// In services/database.service.js
db.on('trace', (sql) => {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('SQL:', sql);
  }
});
```

Then set `LOG_LEVEL=debug` in `.env`

## Code Quality

### Linting

Check code style (if ESLint configured):

```bash
npm run lint           # Check for issues
npm run lint -- --fix  # Auto-fix issues
```

### Formatting

Use Prettier for consistent formatting:

```bash
npx prettier --write src/   # Format all files
npx prettier --check src/   # Check formatting
```

### Pre-commit Hooks

[Configure Husky/lint-staged](https://typicode.github.io/husky/) to:
- Run linter on commit
- Run tests before push
- Prevent broken code commits

## Common Development Tasks

### Adding a New Page

1. Create page component: `src/pages/NewPage.js`
2. Create service if needed: `src/services/newPage.service.js`
3. Add route in `src/App.js`
4. Add to navigation in `src/components/common/Sidebar.js`
5. Test the new page

### Adding a Database Table

1. Create migration in `src/database/migrations.js`:
   ```javascript
   db.run(`CREATE TABLE IF NOT EXISTS new_table (...)`);
   ```
2. Add service methods for CRUD operations
3. Create context if global state needed
4. Add UI components to manage data

### Adding a New Feature

1. Design data model
2. Create database schema
3. Implement service layer
4. Create React components
5. Add routing if page-level
6. Write tests
7. Update documentation

### Connecting to External API

1. Create service: `src/services/externalAPI.service.js`
2. Use axios or fetch
3. Handle errors and timeouts
4. Store credentials in environment variables
5. Cache responses if appropriate

Example:
```javascript
// src/services/externalAPI.service.js
const axios = require('axios');

class ExternalAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
    });
  }

  async fetchData(params) {
    try {
      const response = await this.client.get('/endpoint', { params });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

module.exports = new ExternalAPIService();
```

## Performance Optimization

### Code Splitting

```javascript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => 
  import('./HeavyComponent')
);

export function App() {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </React.Suspense>
  );
}
```

### Memoization

```javascript
// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});
```

### Database Query Optimization

```javascript
// Use LIMIT for large datasets
SELECT * FROM books LIMIT 20 OFFSET 0;

// Use indexes
SELECT * FROM books WHERE genre = 'Fiction';
// Add index: CREATE INDEX idx_books_genre ON books(genre);
```

### Bundle Size

```bash
# Analyze bundle size
npm run build -- --stats
# Creates bundle analysis in build/

# Use native modules instead of entire lodash
import capitalize from 'lodash/capitalize';  // Good
import { capitalize } from 'lodash';          // Bad - imports all
```

## Debugging Common Issues

### Component Not Re-rendering

```javascript
// Problem: State not triggering re-render
setState(existingObject);  // Wrong - same reference

// Solution: Create new object
setState({ ...state, field: newValue });  // Correct
```

### Memory Leaks

```javascript
// Problem: Event listener not cleaned up
useEffect(() => {
  window.addEventListener('click', handler);
  // Missing cleanup
}, []);

// Solution: Return cleanup function
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, []);
```

## Resources

- [React Documentation](https://react.dev)
- [Electron Documentation](https://www.electronjs.org/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Project Architecture](../architecture/ARCHITECTURE.md)
- [Database Schema](../architecture/DATABASE.md)

---

**Last Updated**: February 17, 2026
