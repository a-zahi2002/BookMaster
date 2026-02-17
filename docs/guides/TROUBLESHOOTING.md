# Troubleshooting Guide

## Getting Started with Troubleshooting

1. **Check log files**: `./logs/app.log`
2. **Check browser console**: F12 → Console tab
3. **Check terminal output**: Where you ran `npm start`
4. **Search this guide** for error message

## Common Issues & Solutions

### Application Won't Start

#### Error: "Port 3000/3001 already in use"

**Problem**: Another application is using the port

**Solution 1**: Kill the process using the port (Windows)
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000

# Get Process ID (PID)
# Then kill it
Stop-Process -Id <PID> -Force
```

**Solution 2**: Use different ports
```bash
# Set different port in .env
REACT_APP_PORT=3002
PORT=3002

# Or via command line
cross-env PORT=3002 npm start
```

**Solution 3**: Use Command Prompt instead of PowerShell
```cmd
cmd.exe
npm start
```

---

#### Error: "npm: Scripts disabled on this system"

**Problem**: PowerShell execution policy blocks scripts

**Solution 1**: Change execution policy (recommended)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Solution 2**: Use Command Prompt
```cmd
cmd.exe
npm install
npm start
```

**Solution 3**: Bypass for single command
```powershell
powershell -ExecutionPolicy Bypass -Command "npm start"
```

---

#### Error: "Cannot find module 'react'"

**Problem**: Dependencies not installed

**Solution**:
```bash
# Remove node_modules and lock file
rm -r node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall
npm install
```

---

### Database Issues

#### Error: "Could not connect to database"

**Problem**: Database file doesn't exist or path is wrong

**Solution 1**: Initialize database
```bash
node -e "require('./src/database/migrations.js').runMigrations()"
```

**Solution 2**: Check database path
```javascript
// Verify in src/database/connection.js
const dbPath = path.join(__dirname, '../../database.sqlite');
console.log(dbPath); // Log to see actual path
```

**Solution 3**: Ensure data directory exists
```bash
# Create if missing
mkdir -p data
mkdir -p backups
```

---

#### Error: "Database is locked"

**Problem**: Multiple processes accessing database simultaneously

**Solution 1**: Close duplicate processes
- Check if app is running twice
- Close all instances and restart

**Solution 2**: Increase timeout
```javascript
// In database/connection.js
db.configure('busyTimeout', 5000); // Wait 5 seconds
```

**Solution 3**: Close all file handles
```bash
# Restart application
# Close any backup processes
# Close browser developer tools
```

---

#### Error: "Disk quota exceeded" or "No space left on device"

**Problem**: Insufficient disk space

**Solution**:
```bash
# Check disk space
df -h  # Linux/Mac
# OR use File Explorer on Windows

# Clean up old backups
rm backups/backup_*.db  # Keep recent ones

# Clear logs (keep some for debugging)
rm logs/*.log  # Or keep them and export first

# Move database to different drive if needed
```

---

### Authentication Issues

#### Can't Login with Admin Account

**Problem**: Password incorrect or user account corrupted

**Solution 1**: Reset to default credentials
1. Stop the application
2. Delete `database.sqlite`
3. Run migrations: `node -e "require('./src/database/migrations.js').runMigrations()"`
4. Login with default: `admin` / `admin123`
5. ⚠️ **Change password immediately**

**Solution 2**: Reset specific user password
```javascript
// Create script: scripts/reset-password.js
const { db } = require('./src/database/connection');
const bcrypt = require('bcrypt');

const newPassword = bcrypt.hashSync('admin123', 10);
db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, 'admin']);
```

Then run:
```bash
node scripts/reset-password.js
```

---

#### "Unauthorized" or "Access Denied" Error

**Problem**: User role doesn't have permission for action

**Solution**: 
1. Login as Admin user
2. Create new user with correct role
3. Or verify user role in database:

```bash
# Check user roles
sqlite3 database.sqlite "SELECT username, role FROM users;"
```

---

### Frontend Issues

#### Blank White Screen

**Problem**: React failed to load or render

**Diagnosis**:
1. Open browser console: F12
2. Check for errors
3. Check network tab for failed requests

**Solution 1**: Clear browser cache
```bash
# Close browser
# Delete cache folder
# Restart browser and application
```

**Solution 2**: Rebuild React
```bash
rm -r build/
npm run build
npm start
```

**Solution 3**: Check for console errors
- Press F12 in browser
- Go to Console tab
- Look for red errors
- Check Network tab for failed requests

---

#### Styles not loading (page looks unstyled)

**Problem**: CSS files not loaded

**Solution**:
```bash
# Rebuild Tailwind CSS
npm run build

# Or in development
npm start  # Auto-recompiles

# Check if postcss.config.js exists
ls postcss.config.js
ls tailwind.config.js
```

---

#### "Cannot read property 'X' of undefined"

**Problem**: Accessing property on null/undefined object

**Diagnosis**:
1. Find line number in browser console
2. Check that component/service is properly initialized
3. Verify API response contains expected data

**Solution**:
```javascript
// Add defensive checking
const value = obj?.propertyName ?? 'default';

// Or use optional chaining
const data = response?.data?.items || [];
```

---

### Electron/Desktop App Issues

#### App Crashes on Startup

**Problem**: Electron process fails

**Diagnosis**:
1. Check `logs/error.log`
2. Run with verbose logging
3. Check terminal output

**Solution**:
```bash
# Delete Electron cache
rm -r ~/.cache/BookMaster  # Linux/Mac
# Or delete AppData on Windows

# Reinstall latest Electron
npm install electron@latest

# Rebuild
npm run electron
```

---

#### App won't connect to database

**Problem**: Electron can't access database file

**Solution**:
```javascript
// In main.js - verify database path
const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
console.log('Database path:', dbPath);
```

Then check if that path exists and is writable.

---

### Print/Printer Issues

#### Printer Not Found

**Problem**: Configured printer not detected

**Diagnosis**:
```powershell
# List all printers
Get-Printer | Select-Object Name

# Verify printer is online
Get-Printer | Where-Object Name -eq "Your Printer Name"
```

**Solution**:
```bash
# Update .env with exact printer name
PRINTER_NAME=Your Exact Printer Name Like This

# Restart application
npm start
```

---

#### Print Job Fails / Gets Stuck

**Problem**: Print queue blocked or printer offline

**Solution**:
```powershell
# Clear print queue
Get-PrintJob -PrinterName "Your Printer" | Remove-PrintJob

# Restart spooler service
Restart-Service -Name spooler
```

---

### Performance Issues

#### Slow Application / Freezing

**Problem**: High CPU or memory usage

**Diagnosis**:
1. Open Task Manager (Ctrl + Shift + Esc)
2. Check CPU and Memory
3. Kill processes that are using too much
4. Check database size:

```bash
# Check database file size
ls -lh database.sqlite   # Linux/Mac
# Or check Properties in Windows Explorer
```

**Solution**:
1. Archive/delete old sales data
2. Run database optimization:
   ```bash
   sqlite3 database.sqlite "VACUUM; PRAGMA optimize;"
   ```
3. Clear browser cache
4. Reduce number of items loaded at once

---

#### Slow Database Queries

**Problem**: Reports or searches taking too long

**Solution**:
1. Add indexes to frequently searched columns
2. Implement pagination
3. Archive old data:

```sql
-- Archive sales older than 1 year
INSERT INTO sales_archive SELECT * FROM sales 
WHERE date < datetime('now', '-1 year');

DELETE FROM sales WHERE date < datetime('now', '-1 year');
```

---

### Backup & Data Issues

#### Backup Not Creating

**Problem**: Backup process fails silently

**Solution**:
```bash
# Check backup directory exists
mkdir -p backups

# Check permissions
ls -la backups/

# Manually test backup
node scripts/backup.js
```

---

#### Can't Restore from Backup

**Problem**: Restore process fails

**Solution**:
```bash
# Verify backup file exists
ls -la backups/

# Check file size is reasonable
# (not empty or huge)

# Manually restore backup
1. Stop application
2. cp backups/backup_YYYY-MM-DD_HHmmss.db database.sqlite
3. Start application
4. Verify data is present
```

---

## Advanced Troubleshooting

### Enabling Debug Mode

Detailed logging for troubleshooting:

```env
# In .env
REACT_APP_DEBUG_MODE=true
LOG_LEVEL=debug
```

Then restart and check `logs/app.log`:

```bash
tail -f logs/app.log  # Linux/Mac
type logs\app.log     # Windows
```

---

### Database Inspection

Using SQLite command line:

```bash
# Install SQLite if needed
# Windows: Download from https://www.sqlite.org/download.html

# Connect to database
sqlite3 database.sqlite

# Common commands:
.tables                              # List all tables
SELECT * FROM users;                 # View all users
SELECT COUNT(*) FROM books;          # Count books
SELECT * FROM books WHERE id = 1;    # Find specific book
```

---

### Checking Process Health

```powershell
# Check running processes
Get-Process | Where-Object Name -like "*node*"
Get-Process | Where-Object Name -like "*electron*"

# Kill process by name
Stop-Process -Name node -Force
```

---

### Network Debugging

If having API/connection issues:

```javascript
// Add to src/services/api.service.js
const axios = require('axios');

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);
```

Then check browser console (F12) for detailed errors.

---

## When All Else Fails

### Nuclear Option - Complete Reset

```bash
# Back up current data
cp -r data data.backup

# Remove all generated files
rm -r node_modules build dist
rm package-lock.json
rm database.sqlite

# Clean reinstall
npm install
npm run build
node -e "require('./src/database/migrations.js').runMigrations()"

# Restart
npm start
```

### Getting Help

1. **Check documentation**: Search this guide and ARCHITECTURE.md
2. **Review logs**: `./logs/` directory
3. **Search GitHub issues**: Similar problems may be documented
4. **Check network connectivity**: If API calls fail
5. **Verify system requirements**: Node.js, npm versions

---

## Error Reference

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| Database locked | Multiple connections | Close duplicate instances |
| Cannot find module | Dependencies missing | `npm install` |
| ENOSPC | Disk full | Delete old backups/logs |
| Port already in use | Another process | Kill process or change port |
| EACCES | Permission denied | Check file/directory permissions |
| Cannot connect to database | File not found | Run migrations |

---

**Last Updated**: February 17, 2026
