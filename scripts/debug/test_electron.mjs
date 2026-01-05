import electronPkg from 'electron';
console.log('import electron type:', typeof electronPkg);
if (typeof electronPkg === 'string') {
    console.log('Value:', electronPkg);
} else {
    console.log('Keys:', Object.keys(electronPkg));
}

import { app } from 'electron';
console.log('import { app } type:', typeof app);
if (app) {
    console.log('app.isReady():', app.isReady());
    app.quit();
}
