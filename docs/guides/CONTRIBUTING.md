# Contributing Guidelines

## Welcome to BookMaster!

We're excited to have you contribute! This document explains how to contribute to the BookMaster POS system.

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- No harassment or discrimination
- Report issues to maintainers

## Getting Started

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BookMaster.git
   cd BookMaster
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Follow the setup guide**
   ```bash
   See docs/guides/SETUP.md
   ```

## Development Workflow

### 1. Make Changes

```bash
# Create feature branch
git checkout -b feature/add-new-feature

# Make your changes
# Test thoroughly
npm test

# Check for linting issues
npm run lint

# Build to verify
npm run build
```

### 2. Commit with Clear Messages

```bash
git add .
git commit -m "feat: Add new inventory feature"
```

**Commit message format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring (no feature change)
- `test:` Adding or updating tests
- `chore:` Build, dependency, or config changes
- `style:` Code formatting (no logic change)

**Examples**:
```
feat(inventory): Add bulk import for books
fix(auth): Resolve session timeout issue
docs: Update installation guide
refactor(services): Simplify database queries
test(auth): Add login validation tests
```

### 3. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit

### 5. Code Review

- Maintainers will review your code
- They may request changes
- Make updates and push again
- Once approved, PR will be merged

## Pull Request Standards

### Required
- ✓ Descriptive title and description
- ✓ Related issue linked (if applicable)
- ✓ Tests included for new features
- ✓ No failing tests
- ✓ Code follows project style
- ✓ Documentation updated
- ✓ No conflicts with main branch

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested this

## Screenshots (if applicable)
 - [ ] Feature screenshot
 - [ ] Before/after if UI change

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Tests pass locally
```

## Code Style Guide

### JavaScript/React

**Naming**:
```javascript
// Components: PascalCase
function MyComponent() {}

// Functions/methods: camelCase
function myFunction() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// React hooks: use prefix
const [state, setState] = useState();
```

**Formatting**:
```javascript
// Use semicolons
const x = 1;

// Use single quotes for strings
const name = 'BookMaster';

// Use arrow functions
const handler = (e) => { /* ... */ };

// Use const by default, let when needed
const immutable = 'value';
let mutable = 'value';
```

**Comments**:
```javascript
// Single line comments for brief notes

/*
 * Multi-line comments for
 * complex logic explanations
 */

// TODO: Implementation needed
// FIXME: Known issue to fix
// HACK: Temporary solution
```

**Components**:
```javascript
// Keep under 300 lines
// One component per file
// Export as named + default

export function MyComponent() {
  return <div>Content</div>;
}

export default MyComponent;
```

**Services**:
```javascript
// Encapsulate business logic
// Use try-catch for error handling
// Return promises for async
// Use singleton pattern

class MyService {
  async performAction(data) {
    try {
      // Logic here
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

module.exports = new MyService();
```

### SQL Queries

```sql
-- Use clear, formatted queries
SELECT 
  id, 
  title, 
  author,
  COUNT(*) as count
FROM books
WHERE genre = 'Fiction'
GROUP BY genre
ORDER BY title;
```

## Testing Requirements

### What to Test

Minimum coverage:
- ✓ New features
- ✓ Bug fixes
- ✓ API changes
- ✓ Database operations
- ✓ User interactions

### Running Tests

```bash
# Run all tests
npm test

# Run specific file
npm test MyComponent.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Writing Tests

```javascript
describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    const mockFn = jest.fn();
    render(<MyComponent onClick={mockFn} />);
    
    screen.getByRole('button').click();
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Coverage Goals
- Aim for 70%+ coverage on new code
- 100% coverage not required, but appreciated
- Test critical paths and error cases

## Documentation

### What Needs Documentation

1. **New Features** - Add to appropriate docs file
2. **API Changes** - Update endpoint docs
3. **Database Changes** - Update schema docs
4. **Configuration** - Add to ENVIRONMENT.md
5. **Breaking Changes** - Document migration path

### Documentation Format

Use Markdown with:
- Clear headings
- Code examples
- Step-by-step instructions
- Links to related docs

**Example**:
```markdown
## New Feature: Bulk Import

### Overview
Description of what the feature does

### How to Use
1. Step one
2. Step two

### API
```javascript
// Code example
```

### Related
- [Other doc](./OTHER.md)
```

## Issue Reporting

### Found a Bug?

Report on GitHub Issues with:

```markdown
## Description
Brief description of bug

## Steps to Reproduce
1. Do this
2. Do that
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- OS: Windows/Mac/Linux
- Node version: 
- npm version:

## Screenshots
If applicable
```

### Suggesting Features?

```markdown
## Feature Request: [Title]

### Problem
What problem does this solve?

### Solution
How should it work?

### Alternatives
Other ways to solve this?

### Additional Context
Any other info?
```

## Project Structure

Before contributing, familiarize yourself with:
- [Project Structure](../architecture/PROJECT_STRUCTURE.md)
- [Architecture](../architecture/ARCHITECTURE.md)
- [Database Schema](../architecture/DATABASE.md)

## Areas to Contribute

### Good First Issues
Look for issues labeled `good-first-issue` or `help-wanted`:
- Small scope
- Well documented
- Good for learning the codebase

### Areas Needing Help
1. **Testing** - Write tests for uncovered code
2. **Documentation** - Improve or expand docs
3. **Bugs** - Fix reported issues
4. **Features** - Implement requested features
5. **Performance** - Optimize slow operations
6. **UI/UX** - Design improvements

## Committing Guidelines

### Frequency
Commit frequently with clear messages:

```bash
# Good - multiple small commits
git commit -m "feat: Add book import modal"
git commit -m "test: Add tests for import"
git commit -m "docs: Update feature guide"

# Avoid - one large commit
git commit -m "Add book import with tests and docs and ui updates"
```

### Before Pushing
```bash
# Run tests
npm test

# Check linting
npm run lint

# Verify build
npm run build

# Review changes
git log --oneline -n 5
git diff origin/main..HEAD
```

## Release Process

(For maintainers)

1. Create release branch
2. Update version in package.json
3. Update CHANGELOG
4. Merge to main
5. Tag release
6. Build installers
7. Create GitHub release

---

## Questions?

- Check [Documentation](../README.md)
- Open a Discussion on GitHub
- Ask in Issues with `question` label
- Review existing code for patterns

## Thank You!

Your contributions make BookMaster better for everyone. We appreciate your time and effort!

---

**Last Updated**: February 17, 2026
