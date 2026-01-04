const electronPkg = require('electron');
console.log('require("electron") type:', typeof electronPkg);
if (typeof electronPkg === 'string') {
    console.log('Value:', electronPkg);
} else {
    console.log('Keys:', Object.keys(electronPkg));
    const { app } = electronPkg;
    console.log('Has app?', !!app);
}
console.log('Resolution:', require.resolve('electron'));
