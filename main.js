const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const AuthService = require('./src/services/auth.service');
const logger = require('./src/utils/logger');
const fs = require('fs');

let mainWindow = null;
const authService = new AuthService();

// Helper function to verify file exists
function verifyFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        console.error('Error checking file:', err);
        return false;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const loginPath = path.join(__dirname, 'src', 'views', 'login.html');
    console.log('Loading login page:', loginPath);
    
    if (verifyFileExists(loginPath)) {
        mainWindow.loadFile(loginPath).catch(err => {
            console.error('Failed to load login page:', err);
        });
    } else {
        console.error('Login file not found:', loginPath);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await authService.login(credentials.username, credentials.password);
        let dashboardFile;

        switch (user.role) {
            case 'admin':
                dashboardFile = 'admin-dashboard.html';
                break;
            case 'manager':
                dashboardFile = 'manager-dashboard.html';
                break;
            case 'user':
                dashboardFile = 'sales-dashboard.html';
                break;
            default:
                throw new Error('Invalid role');
        }

        const dashboardPath = path.join(__dirname, 'src', 'views', dashboardFile);
        console.log('Attempting to load dashboard:', dashboardPath);

        if (!verifyFileExists(dashboardPath)) {
            throw new Error(`Dashboard file not found: ${dashboardPath}`);
        }

        if (mainWindow) {
            await mainWindow.loadFile(dashboardPath);
            console.log('Successfully loaded dashboard:', dashboardPath);
        }

        return user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
});

ipcMain.handle('logout', async () => {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'login.html');
        console.log('Attempting to logout, loading:', loginPath);

        if (!verifyFileExists(loginPath)) {
            throw new Error('Login file not found');
        }

        if (mainWindow) {
            await mainWindow.loadFile(loginPath);
            console.log('Successfully logged out');
        }
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
});

// Window management
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle any uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});