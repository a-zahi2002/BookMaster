/**
 * create-icon.js
 * Converts the app logo (JPEG) to a proper multi-resolution icon.ico
 * for use in the Windows taskbar and Electron installer.
 *
 * Run once: node scripts/create-icon.js
 */

const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');
const toIco = require('to-ico');

const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const assetsDir = path.join(__dirname, '..', 'assets');
const outputIcoPath = path.join(assetsDir, 'icon.ico');
const outputPngPath = path.join(assetsDir, 'icon.png');

async function createIcon() {
    if (!fs.existsSync(logoPath)) {
        console.error('Logo file not found at:', logoPath);
        process.exit(1);
    }

    fs.mkdirSync(assetsDir, { recursive: true });

    console.log('Reading logo image...');
    const image = await Jimp.read(logoPath);
    console.log('Image size: ' + image.width + 'x' + image.height);

    // Generate PNG buffers at each standard ICO size
    const sizes = [256, 128, 64, 48, 32, 16];
    const pngBuffers = [];

    for (const size of sizes) {
        const buf = await image.clone().resize({ w: size, h: size }).getBuffer('image/png');
        pngBuffers.push(buf);
        console.log('  Generated ' + size + 'x' + size + ' (' + buf.length + ' bytes)');
    }

    // Save 256x256 PNG for non-Windows builds
    fs.writeFileSync(outputPngPath, pngBuffers[0]);
    console.log('Saved: assets/icon.png');

    // Convert all PNG buffers into a proper multi-resolution .ico
    console.log('Converting to .ico...');
    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(outputIcoPath, icoBuffer);

    // Verify the ICO header (should start with 0 0 1 0)
    const header = Array.from(icoBuffer.slice(0, 4)).join(' ');
    console.log('ICO header bytes: [' + header + '] (should be [0 0 1 0])');
    console.log('Saved: assets/icon.ico (' + icoBuffer.length + ' bytes)');
    console.log('');
    console.log('Success! Restart the Electron app to see the updated taskbar icon.');
}

createIcon().catch(function (err) {
    console.error('Failed:', err.message);
    process.exit(1);
});
