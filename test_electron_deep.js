try {
    console.log("Attempting require('electron/main')...");
    const electronMain = require('electron/main');
    console.log("Type:", typeof electronMain);
    if (electronMain && electronMain.app) {
        console.log("Got app!");
    }
} catch (e) {
    console.error("Failed:", e.message);
}

try {
    console.log("Attempting require('electron/common')...");
    const electronCommon = require('electron/common');
    console.log("Type:", typeof electronCommon);
} catch (e) {
    console.error("Failed:", e.message);
}
