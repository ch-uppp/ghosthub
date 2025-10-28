# Icon Generation Script

This script generates placeholder icons for the GhostHub Chrome extension.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

```bash
npm install
```

## Usage

To generate the icon files, run:

```bash
npm run generate-icons
```

This will create the following PNG files in the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Each icon features a white letter "G" on a blue (#4A90E2) background.

## Customization

You can customize the icons by editing `generate-icons.js`:
- `ICON_SIZES`: Array of icon sizes to generate
- `BACKGROUND_COLOR`: Background color (hex format)
- `TEXT_COLOR`: Text color (hex format)
- `LETTER`: The letter to display on the icon
- `FONT_SIZE_RATIO`: Font size as a ratio of icon size (default: 0.6)

## Dependencies

- `canvas`: ^2.11.2 - For generating PNG images with Node.js
