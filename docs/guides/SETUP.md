# Setup & Installation Guide

## Prerequisites

Before setting up BookMaster, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (usually comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **A modern code editor** (VS Code recommended)

### Verify Installation

```bash
node --version      # Should show v14.0.0 or higher
npm --version       # Should show 6.0.0 or higher
git --version       # Should show 2.x.x or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/a-zahi2002/BookMaster.git
cd BookMaster
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages defined in `package.json`.

### 3. Initialize Database

The database is automatically created on first run, but you can manually initialize it:

```bash
node -e "require('./src/database/migrations.js').runMigrations()"
```

This creates all necessary tables (books, sales, users, etc.).

### 4. Start Development Server

#### Option A: React Dev Server Only
```bash
npm start
```
This starts the React development server at `http://localhost:3000`

#### Option B: With Electron Desktop App
```bash
npm run dev
```
This runs both React dev server and Electron, allowing you to develop with the desktop interface.

#### Option C: Just Electron
```bash
npm run electron
```
Runs only the Electron app (requires React build to exist).

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
NODE_ENV=development
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for complete list of variables.

### Database Configuration

Database settings are in `src/config/database.config.js`:

```javascript
module.exports = {
  dbPath: 'pos.db',              // Database file location
  backupPath: './backups/',      // Backup directory
  backupFrequency: '0 0 * * 0'   // Weekly backups
};
```

### Printer Configuration

If using printer functionality, configure in `src/config/printer.config.js`:

```javascript
module.exports = {
  printerName: 'YOUR_PRINTER_NAME',
  paperWidth: 80,  // mm
  copies: 1
};
```

Get your printer name from Windows print settings.

## First Time Setup

### 1. Create Default Admin User

When you first access the application, log in with:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately in production!

### 2. Seed Sample Data (Optional)

To populate with sample books and data:

```bash
node scripts/seed_data.js
```

This adds:
- 50 sample books
- Various genres and authors
- Different price points for testing

### 3. Test Core Features

- ✓ Login with admin credentials
- ✓ Add a new book to inventory
- ✓ Process a sample sale
- ✓ View reports and analytics
- ✓ Create backup

## Project Structure

```
BookMaster/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # Business logic services
│   ├── database/         # Database connection & migrations
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── backend/              # Node.js backend
├── public/               # Static assets
├── build/                # Production build (generated)
├── docs/                 # This documentation
├── package.json          # Dependencies
└── main.js               # Electron main process
```

## Troubleshooting Setup Issues

### npm: Scripts Disabled Error
If you get "running scripts is disabled on this system":

**Option 1** (Recommended): Change execution policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Option 2**: Use Command Prompt instead of PowerShell
```cmd
cmd.exe
npm install
```

### Database Connection Error
```
Error: Could not connect to database
```

**Solution**:
1. Ensure `data/` folder exists and is writable
2. Delete existing `database.sqlite` file
3. Run migrations again: `node -e "require('./src/database/migrations.js').runMigrations()"`

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or use different ports in `.env`:
```
REACT_APP_PORT=3002
PORT=3002
```

### Module Not Found Errors

Clear cache and reinstall:

```bash
rm -r node_modules package-lock.json
npm install
```

## Next Steps

1. **Read** [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow
2. **Explore** [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) to understand system design
3. **Check** [DATABASE.md](../architecture/DATABASE.md) for data model
4. **Contribute** following [CONTRIBUTING.md](./CONTRIBUTING.md)

## Common Commands

```bash
npm start              # Start React dev server
npm run dev            # Start with Electron
npm run build          # Build for production
npm run dist           # Create installer
npm test               # Run tests
npm run electron       # Run Electron only
```

---

**Last Updated**: February 17, 2026
