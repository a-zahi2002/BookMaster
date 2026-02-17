# Deployment & Production Build Guide

## Overview

This guide covers creating a production build of BookMaster and deploying it for end users.

## Production Build Steps

### 1. Prepare the Application

**Clean up development files**:
```bash
# Remove development dependencies (optional)
npm prune --production

# Clear any cached builds
rm -r build/
rm -r dist/
```

**Verify production environment**:
```bash
# Set production environment
$env:NODE_ENV = "production"  # PowerShell
# OR
set NODE_ENV=production       # Command Prompt
```

### 2. Build React Application

```bash
npm run build
```

This creates an optimized production build in the `build/` directory:
- Minified JavaScript and CSS
- Optimized images and assets
- Source maps (for debugging)

**Build output includes**:
- `build/index.html` - Main HTML file
- `build/static/css/` - Stylesheet bundles
- `build/static/js/` - JavaScript bundles
- `build/asset-manifest.json` - Asset mapping

### 3. Initialize Production Database

Before packaging, ensure the database is initialized:

```bash
# Run migrations to create tables
node -e "require('./src/database/migrations.js').runMigrations()"
```

This ensures the database schema exists for first-time users.

### 4. Create Installable Package

#### For Windows NSIS Installer:
```bash
npm run dist
```

This creates:
- `dist/BookMaster Setup 1.0.0.exe` - Windows installer
- `dist/BookMaster 1.0.0.exe` - Portable executable

#### For macOS (on macOS machine):
```bash
npm run dist -- -m
```

Creates `.dmg` and `.app` files.

#### For Linux:
```bash
npm run dist -- -l
```

Creates `.deb` and `.AppImage` files.

## Production Configuration

### 1. Environment Variables

Create `.env.production` (not committed to repo):

```env
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=http://localhost:3001
DB_PATH=./data/pos.db
BACKUP_FREQUENCY=0 0 * * *
LOG_LEVEL=info
```

### 2. Database Configuration

In production, ensure:

```javascript
// src/config/database.config.js
module.exports = {
  dbPath: process.env.DB_PATH || './data/pos.db',
  backupPath: './backups/',
  backupFrequency: '0 0 * * 0'  // Weekly backups
};
```

**Critical checks**:
- ✓ Database path is writable
- ✓ Backup directory exists
- ✓ Sufficient disk space available

### 3. Application Configuration

Update `package.json` build config if needed:

```json
{
  "build": {
    "appId": "com.bookmaster.pos",
    "productName": "BookMaster POS",
    "files": [
      "build/**/*",
      "backend/**/*",
      "data/**/*",
      "src/services/**/*",
      "package.json",
      "main.js"
    ],
    "win": {
      "target": ["nsis"],
      "certificateFile": null,
      "certificatePassword": null
    }
  }
}
```

## Pre-Deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] No console errors or warnings
- [ ] Database migrations execute successfully
- [ ] Environment variables configured
- [ ] Version number updated in `package.json`
- [ ] Changelog updated
- [ ] User credentials reset (admin/admin123 changed)
- [ ] Backup system tested
- [ ] Print functionality tested
- [ ] Sample data seeded (if applicable)

## Deployment Methods

### Method 1: Direct Installation

1. Build the installer: `npm run dist`
2. Distribute `.exe` file to users
3. Users run installer to install application
4. Application creates database on first run

### Method 2: GitHub Releases

1. Build packages: `npm run dist`
2. Create GitHub release
3. Upload `.exe` and `.dmg` files
4. Share release link with users
5. Enable auto-updater via GitHub

**Enable auto-update in `package.json`**:
```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "a-zahi2002",
        "repo": "BookMaster"
      }
    ]
  }
}
```

### Method 3: Network Deployment

For multiple machines:

1. Create shared network folder: `\\server\BookMaster\`
2. Copy build artifacts there
3. Users run installer from network path
4. Application stores data locally by default

## Database Migration for Existing Users

If deploying an update with database changes:

1. Create migration script in `src/database/`
2. Include in installer
3. Run migrations automatically on update:

```javascript
// In main.js or app startup
const migrations = require('./src/database/migrations');
await migrations.runMigrations();
```

## User Data Preservation

### Backup Before Update

Inform users to backup before updating:

```bash
# Create manual backup
node scripts/backup.js
```

Backup file created in `./backups/` with date timestamp.

### Automatic Data Migration

Existing data is preserved when updating because:
- Database file (`pos.db`) is not overwritten
- Migrations only add new tables/columns
- No data deletion in standard upgrades

## Performance Tuning for Production

### 1. Database Performance

```javascript
// In database.service.js
db.configure('busyTimeout', 5000);  // Wait 5 seconds on lock
db.run('VACUUM');                    // Optimize database size
db.run('PRAGMA optimize');           // Optimize query performance
```

### 2. Application Performance

- Disable React DevTools:
  ```javascript
  if (process.env.NODE_ENV === 'production') {
    delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  }
  ```

- Enable code splitting:
  ```javascript
  React.lazy(() => import('./HeavyComponent'));
  ```

### 3. Memory Management

- Limit in-memory caching
- Implement data pagination
- Clear old backup files periodically

## Logging & Monitoring

### Logging Setup

Logger configuration in `src/utils/logger.js`:

```javascript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE = process.env.LOG_FILE || './logs/app.log';
```

**Log levels**:
- `error` - Error messages (always logged)
- `warn` - Warnings
- `info` - General information
- `debug` - Detailed debugging

### Log Files

Located in `./logs/`:
- `app.log` - Application log
- `error.log` - Error messages only
- `database.log` - Database operations

## Troubleshooting Deployment

### Installer Issues

**Problem**: "App is damaged" (macOS)
```bash
xattr -d com.apple.quarantine BookMaster.app
```

**Problem**: Installer won't run (Windows)
- Check Windows Defender Security
- Run as Administrator
- Disable antivirus temporarily

### Application Won't Start

1. Check log files: `./logs/`
2. Verify database exists: `./data/pos.db`
3. Run with verbose logging: Check console output
4. Reinstall application fresh

### Database Issues in Production

**Backup current database**:
```bash
cp database.sqlite database.sqlite.backup
```

**Reset to fresh database**:
```bash
rm database.sqlite
node -e "require('./src/database/migrations.js').runMigrations()"
```

## Post-Deployment

### 1. Verify Installation

- [ ] Application launches successfully
- [ ] Can login with admin credentials
- [ ] Inventory operations work
- [ ] Sales can be processed
- [ ] Reports generate correctly
- [ ] Backup scheduling works

### 2. User Training

Prepare documentation:
- Installation steps
- First-time setup
- Common operations
- Troubleshooting

### 3. Support Plan

- Monitor application logs for errors
- Maintain backup schedule
- Plan regular updates
- Security patches as needed

## Version Management

Update version consistently:

1. **In `package.json`**:
   ```json
   "version": "1.0.1"
   ```

2. **In Windows build**:
   ```json
   "win": {
     "artifactName": "${productName} Setup ${version}.${ext}"
   }
   ```

3. **In Electron auto-update**:
   Version must match to trigger updates

## Security Considerations

- [ ] Change default admin password
- [ ] Remove debug credentials from code
- [ ] Enable database encryption (optional)
- [ ] Set proper file permissions
- [ ] Restrict network access if needed
- [ ] Regular security audits

---

**Last Updated**: February 17, 2026
