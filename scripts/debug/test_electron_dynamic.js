(async () => {
    try {
        console.log("Dynamic import('electron')...");
        const electron = await import('electron');
        console.log("Got electron module keys:", Object.keys(electron));
        console.log("Default export:", electron.default);
        if (electron.default && typeof electron.default === 'string') {
            console.log("It is the string!");
        }
        if (electron.app) {
            console.log("Got app directly!");
        }
    } catch (e) {
        console.error("Dynamic import failed:", e);
    }
})();
