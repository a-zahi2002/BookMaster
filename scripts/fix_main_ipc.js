const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../main.js');
let content = fs.readFileSync(mainJsPath, 'utf8');

const sessionMapInjection = `
// Active User Sessions
const activeSessions = new Map();

// Helper to get current user ID
function getCurrentUserId(event) {
    const user = activeSessions.get(event.sender.id);
    if (!user && process.env.NODE_ENV !== 'development') {
        console.warn('Unauthorized IPC access attempt');
    }
    return user ? user.id : 1;
}
`;

if (!content.includes('const activeSessions = new Map();')) {
    content = content.replace('let aiService;', 'let aiService;\\n' + sessionMapInjection);
}

// Update login
content = content.replace(
    /ipcMain\\.handle\\('login',[\\s\\S]*?return\\s*user;\\s*\\}\\s*catch/g,
    \`ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await userManagementService.authenticateUser(credentials.username, credentials.password);
        activeSessions.set(event.sender.id, user); // STORE SESSION
        return user;
    } catch\`
);

// Update logout
content = content.replace(
    /ipcMain\\.handle\\('logout',[\\s\\S]*?return\\s*\\{\\s*success:\\s*true\\s*\\};\\s*\\}\\s*catch/g,
    \`ipcMain.handle('logout', async (event, userId) => {
    try {
        activeSessions.delete(event.sender.id); // CLEAR SESSION
        if (userId) {
            await userManagementService.logActivity(userId, 'LOGOUT', 'User logged out');
        }
        return { success: true };
    } catch\`
);

// Update , 1); // Assuming admin user ID is 1
content = content.replace(/, 1\\); \\/\\/ Assuming admin user ID is 1/g, ', getCurrentUserId(event));');

// Update userId || 1 for handlers
content = content.replace(/\\.userId \\|\\| 1/g, '.userId || getCurrentUserId(event)');
content = content.replace(/cashierId \\|\\| 1/g, 'cashierId || getCurrentUserId(event)');
content = content.replace(/userManagementService\\.logActivity\\(1,/g, 'userManagementService.logActivity(getCurrentUserId(event),');
content = content.replace(/createManualBackup\\(1,/g, 'createManualBackup(getCurrentUserId(event),');
content = content.replace(/deleteLocalBackup\\(filename, 1,'admin'\\)/g, "deleteLocalBackup(filename, getCurrentUserId(event), 'admin')");
content = content.replace(/deleteAllLocalBackups\\(1, 'admin'\\)/g, "deleteAllLocalBackups(getCurrentUserId(event), 'admin')");
content = content.replace(/deleteCloudBackup\\(fileId, 1, 'admin'\\)/g, "deleteCloudBackup(fileId, getCurrentUserId(event), 'admin')");
content = content.replace(/deleteAllCloudBackups\\(1, 'admin'\\)/g, "deleteAllCloudBackups(getCurrentUserId(event), 'admin')");


fs.writeFileSync(mainJsPath, content);
console.log('main.js IPC handlers patched');
