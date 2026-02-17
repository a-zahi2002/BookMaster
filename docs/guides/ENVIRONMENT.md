# Environment Configuration Guide

## Overview

BookMaster uses environment variables to configure different aspects of the application for various environments (development, staging, production).

## Environment Files

Create environment files in the project root:

- `.env` - Development (default, not committed)
- `.env.local` - Local overrides (not committed)
- `.env.production` - Production settings (not committed)

## Environment Variables

### React Application Variables

Prefix with `REACT_APP_` to be available in frontend code.

#### Core Settings

```env
# Application Mode
REACT_APP_ENVIRONMENT=development      # development|staging|production
REACT_APP_DEBUG_MODE=false             # Enable debug logging

# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000            # ms

# UI Configuration
REACT_APP_PORT=3000
REACT_APP_THEME=light                  # light|dark
```

**Usage in React**:
```javascript
const environment = process.env.REACT_APP_ENVIRONMENT;
const apiUrl = process.env.REACT_APP_API_URL;
```

### Node.js / Backend Variables

#### Server Configuration

```env
# Node Environment
NODE_ENV=development                   # development|production

# Server Port
PORT=3001

# Logging  
LOG_LEVEL=info                         # debug|info|warn|error
LOG_FILE=./logs/app.log
```

#### Database Configuration

```env
# Database Path
DB_PATH=./data/pos.db

# Backup Configuration
BACKUP_PATH=./backups/
BACKUP_FREQUENCY=0 0 * * *             # Cron format (daily)
MAX_BACKUPS=30                         # Keep last N backups
```

#### Printer Configuration

```env
# Printer
PRINTER_NAME=                          # Your printer name
PRINTER_PAPER_WIDTH=80                 # mm (80mm thermal)
PRINTER_COPIES=1

# Get printer name from Windows:
# PowerShell: Get-Printer | Select-Object Name
```

#### Security

```env
# Encryption
ENCRYPTION_ENABLED=false               # Enable data encryption
ENCRYPTION_KEY=                        # 32-character key (auto-generated if empty)

# Session
SESSION_TIMEOUT=3600000                # ms (1 hour)
SESSION_SECRET=your-secret-key-here
```

#### Google Drive Integration

```env
# Google Drive
GOOGLE_DRIVE_ENABLED=false
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_APPLICATION_CREDENTIALS=./src/config/google-credentials.json
```

#### Email / Notifications

```env
# Email
EMAIL_SERVICE=gmail                    # mailgun|sendgrid|gmail
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@bookmaster.com

# Alerts
ALERT_ON_LOW_STOCK=true
LOW_STOCK_THRESHOLD=5
```

## Example Environment Files

### Development (.env)

```env
# React
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PORT=3000

# Node
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DB_PATH=./data/pos.db
BACKUP_FREQUENCY=0 * * * *

# Features
ENCRYPTION_ENABLED=false
GOOGLE_DRIVE_ENABLED=false
```

### Production (.env.production)

```env
# React
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_MODE=false
REACT_APP_API_URL=http://bookmaster-api.example.com
REACT_APP_PORT=3000

# Node
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DB_PATH=/var/data/bookmaster/pos.db
BACKUP_FREQUENCY=0 0 * * 0

# Security
ENCRYPTION_ENABLED=true
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_TIMEOUT=7200000

# Features
PRINTER_NAME=Receipt Printer
GOOGLE_DRIVE_ENABLED=true
```

## How to Load Environment Variables

### Using dotenv Package

```javascript
require('dotenv').config();

const apiUrl = process.env.REACT_APP_API_URL;
const logLevel = process.env.LOG_LEVEL;
```

### For Production Builds

```bash
# Load from .env.production
npm run build

# Or explicitly set
NODE_ENV=production npm run build
```

## Accessing Environment Variables

### In React Components

```javascript
// Must start with REACT_APP_
const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
const apiUrl = process.env.REACT_APP_API_URL;

// Available during build time only
export function App() {
  return <div>{isDevelopment && <DevTools />}</div>;
}
```

### In Backend Services

```javascript
// Available at runtime
const logLevel = process.env.LOG_LEVEL || 'info';
const dbPath = process.env.DB_PATH || './data/pos.db';

const logger = new Logger(logLevel);
const db = new Database(dbPath);
```

### In Configuration Files

```javascript
// src/config/database.config.js
module.exports = {
  dbPath: process.env.DB_PATH || './data/pos.db',
  backupPath: process.env.BACKUP_PATH || './backups/',
  backupFrequency: process.env.BACKUP_FREQUENCY || '0 0 * * 0'
};
```

## Printer Configuration

### Finding Your Printer

**Windows PowerShell**:
```powershell
Get-Printer | Select-Object Name
# Output example:
# Canon Pixma TR4550
# HP LaserJet Pro M404
```

**Windows Command Prompt**:
```cmd
wmic printerdrivers list brief
```

### Setting Printer in .env

```env
PRINTER_NAME=Canon Pixma TR4550
PRINTER_PAPER_WIDTH=80
PRINTER_COPIES=1
```

## Database Configuration by Environment

### Development
- Path: `./data/pos.db` (local project)
- Backups: `./backups/` (local)
- Frequency: Every hour (for testing)

### Production
- Path: `/var/data/bookmaster/pos.db` (system-wide)
- Backups: `/var/backups/bookmaster/` (dedicated)
- Frequency: Daily at midnight

### Staging
- Path: `/opt/bookmaster-staging/pos.db`
- Backups: `/opt/bookmaster-staging/backups/`
- Frequency: Every 12 hours

## Validation & Defaults

### Required Variables

These must be set or have defaults:

```javascript
const config = {
  DB_PATH: process.env.DB_PATH || './data/pos.db',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: process.env.PORT || 3001,
};
```

### Optional Variables

These are optional with sensible defaults:

```javascript
const config = {
  ENCRYPTION_ENABLED: process.env.ENCRYPTION_ENABLED === 'true',
  GOOGLE_DRIVE_ENABLED: process.env.GOOGLE_DRIVE_ENABLED === 'true',
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
};
```

## Security Best Practices

1. **Never commit sensitive values**:
   ```bash
   # In .gitignore
   .env
   .env.local
   .env.production
   *.key
   ```

2. **Use different keys per environment**:
   - Development: Simple keys for testing
   - Production: Strong encryption keys
   - Staging: Production-like keys

3. **Rotate secrets regularly**:
   - Change `ENCRYPTION_KEY` quarterly
   - Update `SESSION_SECRET` on security updates
   - Audit `GOOGLE_APPLICATION_CREDENTIALS`

4. **Document sensitive values**:
   ```bash
   # .env.example (committed to repo - no actual values)
   ENCRYPTION_KEY=your-32-character-key-here
   SESSION_SECRET=your-secret-here
   PRINTER_NAME=Your-Printer-Name
   ```

## Troubleshooting

### Variables Not Loading

**Problem**: Environment variables not recognized
```bash
# Solution 1: Ensure .env file exists at project root
ls -la | grep .env

# Solution 2: Check file format (no BOM, LF line endings)
# Solution 3: Restart dev server
npm start
```

### Wrong Environment in Production

**Problem**: Development settings in production build
```bash
# Verify NODE_ENV before build
echo $env:NODE_ENV  # PowerShell
echo %NODE_ENV%     # Command Prompt

# Rebuild with correct environment
rm -r build/
NODE_ENV=production npm run build
```

### Printer Not Found

**Problem**: Printer name not recognized
```bash
# Get exact printer name
Get-Printer | Format-List Name

# Use exact name in .env
PRINTER_NAME=Canon Pixma TR4550
```

## Quick Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | development | Runtime environment |
| `PORT` | 3001 | Backend server port |
| `DB_PATH` | ./data/pos.db | Database location |
| `LOG_LEVEL` | info | Logging verbosity |
| `REACT_APP_ENVIRONMENT` | development | Frontend environment |
| `REACT_APP_API_URL` | http://localhost:3001 | API endpoint |
| `PRINTER_NAME` | (none) | Receipt printer |
| `ENCRYPTION_ENABLED` | false | Data encryption |

---

**Last Updated**: February 17, 2026
