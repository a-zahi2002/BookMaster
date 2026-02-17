# Testing Guide

## Overview

BookMaster uses Jest and React Testing Library for unit and integration tests.

## Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test MyComponent.test.js

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on changes)
npm test -- --watch

# Update snapshots
npm test -- --updateSnapshot
```

## Test Structure

### File Naming
- Place test files next to component
- Name: `ComponentName.test.js` or `ComponentName.spec.js`

```
src/
├── components/
│   ├── MyComponent.js
│   ├── MyComponent.test.js        # Test file
│   └── __snapshots__/             # Snapshot files
```

## Writing Tests

### Basic Component Test

```javascript
// MyComponent.test.js
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders with title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders role attribute', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  test('calls click handler when clicked', async () => {
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('submits form on button click', async () => {
    const mockSubmit = jest.fn();
    render(
      <form onSubmit={mockSubmit}>
        <input type="text" defaultValue="test" />
        <Button type="submit">Submit</Button>
      </form>
    );
    
    await userEvent.click(screen.getByRole('button'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Testing State Changes

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

describe('Counter', () => {
  test('increments count on button click', async () => {
    render(<Counter />);
    
    const incrementBtn = screen.getByRole('button', { name: /increment/i });
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    await userEvent.click(incrementBtn);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  test('loads and displays user data', async () => {
    render(<UserProfile userId="123" />);
    
    // Wait for async data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('handles loading state', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Testing Hooks

```javascript
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter hook', () => {
  test('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Context Providers

```javascript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import Profile from './Profile';

describe('Profile with Auth', () => {
  test('displays user when authenticated', () => {
    render(
      <AuthProvider defaultUser={{ name: 'John' }}>
        <Profile />
      </AuthProvider>
    );
    
    expect(screen.getByText('Hello, John')).toBeInTheDocument();
  });
});
```

## Service Testing

### Mocking Services

```javascript
// auth.service.test.js
import authService from './auth.service';

// Mock the database
jest.mock('../database/connection', () => ({
  db: {
    get: jest.fn(),
    run: jest.fn(),
  }
}));

describe('authService', () => {
  test('login with valid credentials', async () => {
    const result = await authService.login('admin', 'password123');
    expect(result).toBeDefined();
    expect(result.username).toBe('admin');
  });

  test('login fails with invalid credentials', async () => {
    await expect(
      authService.login('admin', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### Mocking External APIs

```javascript
import axios from 'axios';
import inventoryService from './inventory.service';

jest.mock('axios');

describe('inventoryService', () => {
  test('fetches books from API', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Book 1' }]
    });

    const books = await inventoryService.getBooks();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe('Book 1');
  });
});
```

## Database Testing

### Testing Database Operations

```javascript
import { db } from '../database/connection';
import databaseService from './database.service';

describe('databaseService', () => {
  beforeEach(() => {
    // Setup test database
    db.run('DELETE FROM books');
  });

  test('adds book to database', () => {
    databaseService.addBook({
      title: 'Test Book',
      author: 'Test Author',
      price: 9.99
    });

    const book = databaseService.getBook(1);
    expect(book.title).toBe('Test Book');
  });

  afterEach(() => {
    // Cleanup
    db.run('DELETE FROM books');
  });
});
```

## Snapshot Testing

Snapshots capture component output and detect unexpected changes.

```javascript
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('matches snapshot', () => {
    const { container } = render(<MyComponent />);
    expect(container).toMatchSnapshot();
  });
});
```

**Update snapshots when intentional changes made**:
```bash
npm test -- --updateSnapshot
```

## Common Patterns

### Testing Error Cases

```javascript
test('displays error message on failure', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));
  
  render(<DataFetcher />);
  
  await waitFor(() => {
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
});
```

### Testing Navigation

```javascript
import { BrowserRouter } from 'react-router-dom';

test('navigates on link click', () => {
  render(
    <BrowserRouter>
      <MyComponent />
    </BrowserRouter>
  );
  
  const link = screen.getByRole('link', { name: /go to page/i });
  expect(link).toHaveAttribute('href', '/page');
});
```

### Testing Forms

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

test('submits form with values', async () => {
  const mockSubmit = jest.fn();
  render(<LoginForm onSubmit={mockSubmit} />);
  
  await userEvent.type(screen.getByLabelText(/username/i), 'admin');
  await userEvent.type(screen.getByLabelText(/password/i), 'pass');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({
    username: 'admin',
    password: 'pass'
  });
});
```

## Best Practices

### Do's
- ✓ Test behavior, not implementation
- ✓ Use descriptive test names
- ✓ Test user interactions
- ✓ Mock external dependencies
- ✓ Keep tests focused and isolated
- ✓ Use `screen` queries (more maintainable)

### Don'ts
- ✗ Test implementation details
- ✗ Use generic names like "test 1"
- ✗ Make tests interdependent
- ✗ Test third-party libraries heavily
- ✗ Create large, complex tests
- ✗ Use DOM queries like `querySelector`

## Query Priority

Use queries in this order:

```javascript
// 1. Best - Query by accessible name
screen.getByRole('button', { name: /submit/i });

// 2. Good - Query by label
screen.getByLabelText('Username');

// 3. Good - Query by placeholder
screen.getByPlaceholderText('Enter name');

// 4. Acceptable - Query by text
screen.getByText('Click me');

// 5. Last resort - Query by test ID
screen.getByTestId('submit-button');
```

## Coverage Goals

Run coverage report:

```bash
npm test -- --coverage
```

Target coverage:
- **Statements**: 70%+
- **Branches**: 65%+
- **Functions**: 70%+
- **Lines**: 70%+

Focus on:
- Critical business logic
- User-facing features
- Error handling
- Edge cases

## Debugging Tests

### Run Single Test
```bash
npm test MyComponent.test.js
```

### Run Tests Matching Pattern
```bash
npm test --testNamePattern="counter"
```

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

Then press F5 to debug.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: February 17, 2026
