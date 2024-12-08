const { ipcRenderer } = require('electron');

// Test IPC connection when page loads
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await ipcRenderer.invoke('test-ipc');
        console.log('IPC test response:', response);
    } catch (error) {
        console.error('IPC test failed:', error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Sending login request...');
        const user = await ipcRenderer.invoke('login', { username, password });
        console.log('Login successful:', user);
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials.');
    }
}); 