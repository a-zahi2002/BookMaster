import re
import os

main_js_path = os.path.join(os.path.dirname(__file__), '../main.js')

with open(main_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the specific string replacements
content = content.replace(", 1); // Assuming admin user ID is 1", ", getCurrentUserId(event));")
content = content.replace(".userId || 1", ".userId || getCurrentUserId(event)")
content = content.replace("cashierId || 1", "cashierId || getCurrentUserId(event)")
content = content.replace("userManagementService.logActivity(1,", "userManagementService.logActivity(getCurrentUserId(event),")
content = content.replace("createManualBackup(1, 'admin')", "createManualBackup(getCurrentUserId(event), 'admin')")
content = content.replace("deleteLocalBackup(filename, 1, 'admin')", "deleteLocalBackup(filename, getCurrentUserId(event), 'admin')")
content = content.replace("deleteAllLocalBackups(1, 'admin')", "deleteAllLocalBackups(getCurrentUserId(event), 'admin')")
content = content.replace("deleteCloudBackup(fileId, 1, 'admin')", "deleteCloudBackup(fileId, getCurrentUserId(event), 'admin')")
content = content.replace("deleteAllCloudBackups(1, 'admin')", "deleteAllCloudBackups(getCurrentUserId(event), 'admin')")

# Fix login handler
login_regex = re.compile(
    r"ipcMain\.handle\('login',\s*async\s*\(event,\s*credentials\)\s*=>\s*\{.*?(?=catch)", 
    re.DOTALL
)
login_replacement = r"""ipcMain.handle('login', async (event, credentials) => {
    try {
        const user = await userManagementService.authenticateUser(credentials.username, credentials.password);
        activeSessions.set(event.sender.id, user); // Track session
        return user;
    } """
content = login_regex.sub(login_replacement, content)

# Fix logout handler
logout_regex = re.compile(
    r"ipcMain\.handle\('logout',\s*async\s*\(event,\s*userId\)\s*=>\s*\{.*?(?=catch)", 
    re.DOTALL
)
logout_replacement = r"""ipcMain.handle('logout', async (event, userId) => {
    try {
        activeSessions.delete(event.sender.id); // Clear session
        if (userId) {
            await userManagementService.logActivity(userId, 'LOGOUT', 'User logged out');
        }
        return { success: true };
    } """
content = logout_regex.sub(logout_replacement, content)

with open(main_js_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("main.js updated successfully via python")
