const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, 'public/icons/yeet-icon.png');
const outDir = path.join(__dirname, 'public/icons');

const icons = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'screenshot-1.png', size: null, width: 540, height: 720 },
  { file: 'screenshot-2.png', size: null, width: 1280, height: 720 },
];

(async () => {
  for (const icon of icons) {
    const outPath = path.join(outDir, icon.file);
    try {
      if (icon.size) {
        await sharp(src).resize(icon.size, icon.size).png().toFile(outPath);
      } else {
        await sharp(src)
          .resize(icon.width, icon.height, { fit: 'contain', background: { r: 44, g: 57, b: 104 } })
          .png()
          .toFile(outPath);
      }
      console.log(`✓ ${icon.file}`);
    } catch (e) {
      console.error(`✗ ${icon.file}: ${e.message}`);
    }
  }
})();
