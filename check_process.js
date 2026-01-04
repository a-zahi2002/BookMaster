console.log('process.electronBinding:', !!process.electronBinding);
try {
    const binding = process.electronBinding('app');
    console.log('Got app binding:', !!binding);
} catch (e) { console.log('electronBinding failed:', e.message); }

console.log('process.binding:', !!process.binding);
try {
    const binding = process.binding('electron_common_app'); // internal name
    console.log('Got common app binding:', !!binding);
} catch (e) { console.log('binding failed:', e.message); }

console.log('global.electron:', !!global.electron);
