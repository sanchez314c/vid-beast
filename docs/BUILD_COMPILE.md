# Build & Compilation Guide

## Prerequisites

### System Requirements
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** for version control
- **Platform-specific build tools**:
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
  - Linux: build-essential

### Development Dependencies
```bash
# Install Node.js dependencies
npm install

# Install global build tools
npm install -g electron-builder
npm install -g @electron/rebuild
```

## Development Build

### Quick Start
```bash
# Development mode with hot reload
npm run dev

# Standard application start
npm start

# Clean build artifacts and logs
npm run clean
```

### Development Scripts
```bash
# Run from source (development)
./scripts/run-macos-source.sh      # macOS development
scripts\run-windows-source.bat      # Windows development
./scripts/run-linux-source.sh       # Linux development
```

## Production Build

### Single Platform Build
```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:mac              # macOS build
npm run build:mac:universal    # Universal macOS build (Intel + ARM)
npm run build:win              # Windows build
npm run build:linux            # Linux build
```

### Multi-Platform Build
```bash
# Build for all platforms
npm run build:all

# Distribution packages (same as build:all)
npm run dist

# Platform-specific distributions
npm run dist:mac               # macOS distribution
npm run dist:win               # Windows distribution
npm run dist:linux             # Linux distribution
```

### Release Build
```bash
# Build all platforms for release
npm run release
```

## Build System Configuration

### electron-builder Configuration
```json
{
  "build": {
    "appId": "com.vidbeast.app",
    "productName": "VidBeast",
    "copyright": "Copyright © 2025 VidBeast Team",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "assets/**/*",
      "resources/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "resources/binaries/",
        "to": "binaries/"
      }
    ],
    "mac": {
      "category": "public.app-category.video",
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "pkg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ],
      "icon": "build_resources/icons/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] },
        { "target": "msi", "arch": ["x64"] }
      ],
      "icon": "build_resources/icons/icon.ico",
      "publisherName": "VidBeast Team"
    },
    "linux": {
      "target": [
        { "target": "AppImage", "arch": ["x64"] },
        { "target": "deb", "arch": ["x64"] },
        { "target": "rpm", "arch": ["x64"] },
        { "target": "snap", "arch": ["x64"] }
      ],
      "icon": "build_resources/icons/",
      "category": "AudioVideo"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## Platform-Specific Builds

### macOS Build Process

#### Intel Build
```bash
# Build for Intel Macs
npm run build:mac -- --mac --x64

# Create DMG installer
electron-builder --mac --x64 --publish=never
```

#### ARM64 Build
```bash
# Build for Apple Silicon
npm run build:mac -- --mac --arm64

# Create universal binary
npm run build:mac:universal
```

#### Code Signing
```bash
# Set environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"

# Build with signing
npm run build:mac
```

#### Notarization
```bash
# Notarize with Apple
electron-builder --mac --publish=always
```

### Windows Build Process

#### x64 Build
```bash
# Build for Windows x64
npm run build:win -- --win --x64

# Create MSI installer
electron-builder --win --x64 --msi
```

#### Code Signing
```bash
# Set environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"

# Build with signing
npm run build:win
```

#### Windows Defender
```bash
# Submit to Windows Defender
# Use Microsoft Security Intelligence portal
# Upload installer for scanning
```

### Linux Build Process

#### AppImage Build
```bash
# Build AppImage
npm run build:linux -- --linux AppImage

# Create portable AppImage
electron-builder --linux AppImage
```

#### DEB Package
```bash
# Build Debian package
npm run build:linux -- --linux deb

# Set package metadata
electron-builder --linux deb --deb.compression=gzip
```

#### RPM Package
```bash
# Build RPM package
npm run build:linux -- --linux rpm

# Set package dependencies
electron-builder --linux rpm --rpm.depends=["ffmpeg"]
```

## Advanced Build Options

### Parallel Building
```bash
# Use all CPU cores for faster builds
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:all -- --x64 --arm64 --publish=never
```

### Build Optimization
```bash
# Minimize bundle size
npm run build -- --config.npmRebuild=false

# Skip dependency rebuild
npm run build -- --config.npmSkipRebuild=true
```

### Custom Build Configuration
```bash
# Custom build with specific options
electron-builder \
  --mac \
  --x64 \
  --arm64 \
  --config.extraMetadata.version=3.5.0 \
  --config.mac.identity=null
```

## FFmpeg Binary Integration

### Binary Structure
```
resources/binaries/
├── darwin-x64/
│   ├── ffmpeg
│   └── ffprobe
├── darwin-arm64/
│   ├── ffmpeg
│   └── ffprobe
├── linux-x64/
│   ├── ffmpeg
│   └── ffprobe
└── win32-x64/
    ├── ffmpeg.exe
    └── ffprobe.exe
```

### Binary Management
```javascript
// Platform-specific binary selection
function getFFmpegPath() {
  const platform = process.platform;
  const arch = process.arch;

  const binaryMap = {
    'darwin': {
      'x64': 'resources/binaries/darwin-x64/ffmpeg',
      'arm64': 'resources/binaries/darwin-arm64/ffmpeg'
    },
    'win32': {
      'x64': 'resources/binaries/win32-x64/ffmpeg.exe'
    },
    'linux': {
      'x64': 'resources/binaries/linux-x64/ffmpeg'
    }
  };

  return binaryMap[platform]?.[arch];
}
```

## Build Troubleshooting

### Common Issues

#### macOS
```bash
# Xcode command line tools missing
xcode-select --install

# Certificate issues
security find-identity -v -p codesigning

# Notarization failures
xcrun altool --notarization-info "RequestUUID" -u "email@example.com"
```

#### Windows
```bash
# Visual Studio build tools missing
# Install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Certificate issues
certutil -store MY -dump

# Path issues
echo %PATH%
```

#### Linux
```bash
# Missing dependencies
sudo apt-get install build-essential
sudo apt-get install libnss3-dev
sudo apt-get install libatk-bridge2.0-dev
```

### Debug Builds
```bash
# Enable debug logging
DEBUG=* npm run dev

# Build with source maps
npm run build -- --config.npmRebuild=false

# Inspect build process
electron-builder --dir --verbose
```

## Continuous Integration

### GitHub Actions
```yaml
name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      
    - name: Release
      uses: softprops/action-gh-release@v1
      with:
        files: dist/*
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Automated Testing
```bash
# Run tests before build
npm test

# Lint code
npm run lint

# Type checking
npm run typecheck

# Build only if tests pass
npm run build:all
```

## Release Process

### Pre-Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Code signing certificates valid
- [ ] Build on clean environment

### Release Steps
```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Build all platforms
npm run release

# 3. Test installers
# Test on each target platform

# 4. Create GitHub release
git push --tags

# 5. Upload to distribution channels
# GitHub Releases, website, etc.
```

### Post-Release
- [ ] Update website
- [ ] Send release announcements
- [ ] Monitor for issues
- [ ] Update documentation

---

This build system provides comprehensive support for developing, building, and distributing VidBeast across all major platforms.