const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration for icon generation
const ICON_SIZES = [16, 32, 48, 128];
const BACKGROUND_COLOR = '#4A90E2'; // Blue background
const TEXT_COLOR = '#FFFFFF'; // White text
const LETTER = 'G';

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('Created icons directory');
}

// Generate icon for each size
ICON_SIZES.forEach(size => {
  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, size, size);

  // Configure text
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Set font size proportional to icon size
  const fontSize = Math.floor(size * 0.6);
  ctx.font = `bold ${fontSize}px Arial`;

  // Draw letter 'G' in the center
  ctx.fillText(LETTER, size / 2, size / 2);

  // Save to file
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`Generated ${filename} (${size}x${size})`);
});

console.log('\nAll icon files generated successfully!');
