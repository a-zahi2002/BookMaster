const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Critical fix: Ensure Electron runs as Electron, not Node
if (process.env.ELECTRON_RUN_AS_NODE) {
    console.log('Clearing ELECTRON_RUN_AS_NODE environment variable...');
    delete process.env.ELECTRON_RUN_AS_NODE;
}

const child = spawn(electron, ['.'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: {
        ...process.env,
        NODE_ENV: 'development'
    }
});

child.on('close', (code) => {
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to start electron:', err);
    process.exit(1);
});
