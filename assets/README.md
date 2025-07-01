# VidBeast Assets

This folder contains application icons and resources.

## Required Icons

To properly build VidBeast for all platforms, add these icon files:

### macOS
- `icon.icns` - macOS icon bundle (512x512 recommended)

### Windows  
- `icon.ico` - Windows icon file (256x256 recommended)

### Linux
- `icon.png` - PNG icon file (512x512 recommended)

## Icon Creation

You can create these icons from a single high-resolution PNG (1024x1024) using tools like:

- **macOS**: `iconutil` command-line tool
- **Windows**: Online converters or tools like ImageMagick
- **Cross-platform**: electron-icon-builder, app-icon, or similar npm packages

## Temporary Solution

If you don't have custom icons yet, the build will use Electron's default icon. Add your custom icons here when ready.

## File Structure

```
assets/
├── icon.icns     # macOS
├── icon.ico      # Windows  
├── icon.png      # Linux
└── README.md     # This file
```