# Contributing to BookMaster POS

> **⚠️ IMPORTANT NOTICE - PROPRIETARY SOFTWARE**
> 
> BookMaster POS is **proprietary software** owned by Asmed Sahee M.P. This repository is publicly visible for **educational purposes only**.
> 
> **Before contributing, you MUST:**
> 1. Contact the owner at **a.zahi2002@gmail.com**
> 2. Request and receive **explicit written permission** to contribute
> 3. Agree to the terms and conditions set by the owner
> 
> **Unauthorized contributions, forks, or modifications are prohibited** under the license terms.
> 
> See the [LICENSE](LICENSE) file for complete details.

---

First off, thank you for your interest in BookMaster POS! If you have received permission to contribute, please follow these guidelines.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [a.zahi2002@gmail.com](mailto:a.zahi2002@gmail.com).

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BookMaster.git
   cd BookMaster
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/a-zahi2002/BookMaster.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - App Version: [e.g. 1.0.0]
 - Mode: [Web/Desktop]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Specific use case** for the enhancement
- **Mockups** or examples if applicable
- **Impact assessment** (who would benefit from this?)

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:
- **Good First Issue** - Issues suitable for newcomers
- **Help Wanted** - Issues that need assistance

## 💻 Development Process

### Branch Naming Convention

- **Feature**: `feature/description-of-feature`
- **Bug Fix**: `fix/description-of-bug`
- **Hotfix**: `hotfix/description-of-critical-fix`
- **Documentation**: `docs/description-of-doc-change`

Example:
```bash
git checkout -b feature/add-barcode-scanner
```

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, following our coding standards

3. **Test your changes** thoroughly:
   ```bash
   npm test
   npm run dev  # Test in Electron
   npm start    # Test in browser
   ```

4. **Commit your changes** following our commit guidelines

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📏 Coding Standards

### JavaScript/React

- Use **functional components** with hooks
- Follow **React best practices**
- Use **PropTypes** for type checking
- Keep components **small and focused**
- Use **meaningful variable names**

### Code Style

```javascript
// ✅ Good
const handleSubmit = async (formData) => {
  try {
    const result = await api.submitData(formData);
    setStatus('success');
  } catch (error) {
    console.error('Submission failed:', error);
    setStatus('error');
  }
};

// ❌ Bad
const f = async (d) => {
  const r = await api.submitData(d);
  setStatus('success');
};
```

### File Organization

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── contexts/        # React contexts
├── services/        # Business logic and API calls
├── utils/           # Utility functions
└── tests/           # Test files
```

### Styling

- Use **Tailwind CSS** utility classes
- Follow the existing **design system**
- Maintain **responsive design**
- Use **semantic class names**

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```bash
feat(inventory): add barcode scanner support

Implemented barcode scanning functionality for faster book entry.
Supports both USB and Bluetooth scanners.

Closes #123

---

fix(sales): correct tax calculation for multi-item purchases

Previously, tax was calculated incorrectly when cart had multiple items.
Now properly calculates based on cumulative subtotal.

Fixes #456

---

docs(readme): update installation instructions

Added troubleshooting section and updated Node.js version requirement.
```

## 🔄 Pull Request Process

### Before Submitting

1. ✅ **Test your changes** thoroughly
2. ✅ **Update documentation** if needed
3. ✅ **Follow coding standards**
4. ✅ **Write meaningful commit messages**
5. ✅ **Ensure no merge conflicts** with main branch

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe how you tested your changes:
- [ ] Tested in browser mode
- [ ] Tested in Electron desktop mode
- [ ] Tested with all user roles (Admin, Manager, Cashier)
- [ ] Tested edge cases

## Screenshots (if applicable)
Add screenshots of your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Related Issues
Closes #(issue number)
```

### Review Process

1. At least **one maintainer approval** required
2. All **automated checks must pass**
3. **No merge conflicts** with main branch
4. **Documentation updated** if necessary

### After Your PR is Merged

1. **Delete your feature branch** (both locally and on GitHub)
2. **Update your local main branch**:
   ```bash
   git checkout main
   git pull upstream main
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for **all new features**
- Maintain **test coverage** above 80%
- Use **descriptive test names**
- Test **edge cases** and error scenarios

Example:
```javascript
describe('Sales Service', () => {
  it('should calculate total correctly for multiple items', () => {
    const items = [
      { price: 10.50, quantity: 2 },
      { price: 5.99, quantity: 1 }
    ];
    const total = calculateTotal(items);
    expect(total).toBe(26.99);
  });

  it('should handle empty cart', () => {
    const total = calculateTotal([]);
    expect(total).toBe(0);
  });
});
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 💬 Questions?

Feel free to:
- **Open an issue** for questions
- **Join discussions** in existing issues
- **Contact maintainers** via email

## 🙏 Recognition

Contributors will be recognized in:
- The project's README
- Release notes
- Contributors page (coming soon)

Thank you for contributing to BookMaster POS! 🎉
