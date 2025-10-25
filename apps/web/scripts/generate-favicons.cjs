const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths
const publicDir = path.join(__dirname, '../public');
const sourceLogoSvg = path.join(publicDir, 'logo.svg');
const sourceLogo256 = path.join(publicDir, 'logo-256.png');

// Favicon sizes to generate
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  // Check if source logo exists
  if (!fs.existsSync(sourceLogoSvg)) {
    console.error('Error: logo.svg not found in public/');
    process.exit(1);
  }

  try {
    // Convert SVG to 256x256 PNG base
    await sharp(sourceLogoSvg)
      .png()
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(sourceLogo256);

    // Generate all favicon sizes
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(sourceLogo256)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${name}`);
    }

    // Generate fallback favicon.png
    await sharp(sourceLogo256)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    
    console.log('Favicons generated successfully');

  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateFavicons().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});