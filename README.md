# VidBeast v3.5

## 📸 Application Interface

![VidBeast Screenshot](build_resources/screenshots/VidBeast-Interface.jpg)

## Overview
VidBeast is an advanced video corruption analysis and repair engine with FFmpeg integration. Built as a cross-platform Electron desktop application, VidBeast provides professional-grade tools for video processing, corruption detection, and automated repair workflows.

## Tech Stack
See [tech-stack.md](dev/tech-stack.md) for detailed technology information.

**Core Technologies:**
- **Framework**: Electron v38.1.0
- **Language**: JavaScript with TypeScript configuration
- **Video Processing**: FFmpeg integration with platform-specific binaries
- **Build System**: electron-builder with comprehensive multi-platform support

## Quick Start

### Prerequisites
- Node.js >=16.0.0
- npm >=8.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/vidbeast/vidbeast.git
cd vidbeast

# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build:all
```

### Running the Application

#### From Source (Development)
```bash
# macOS
./scripts/run-macos-source.sh

# Windows
scripts\run-windows-source.bat

# Linux
./scripts/run-linux-source.sh
```

#### Compiled Binary (Production)
```bash
# macOS
./scripts/run-macos.sh

# Windows
scripts\run-windows.bat

# Linux
./scripts/run-linux.sh
```

## Project Structure

```
vidbeast/
├── src/                    # Source code
│   ├── main.js            # Electron main process
│   ├── renderer/          # Renderer process (UI)
│   ├── components/        # UI components
│   └── services/          # Business logic
├── assets/                # Application assets
│   └── icons/            # Platform-specific icons
├── resources/             # External resources
│   └── binaries/         # FFmpeg binaries (per platform)
├── scripts/               # Build and run scripts
├── docs/                  # User documentation
├── dev/                   # Development documentation
├── tests/                 # Test suites
└── dist/                  # Build outputs
```

## Features

### Core Video Processing
- **Corruption Detection**: Advanced algorithms for identifying video file corruption
- **Automated Repair**: Intelligent repair workflows using FFmpeg
- **Batch Processing**: Handle multiple files simultaneously
- **Format Support**: Comprehensive video format compatibility

### Platform Support
- **macOS**: Intel, Apple Silicon, Universal builds
- **Windows**: x64, x86, ARM64 architectures  
- **Linux**: x64, ARM64, ARMv7l with multiple package formats

### Advanced Features
- **Real-time Analysis**: Live video corruption monitoring
- **Metadata Extraction**: Comprehensive video file information
- **Progress Tracking**: Visual feedback for long-running operations
- **Report Generation**: Detailed analysis and repair reports

## Build System

VidBeast includes a comprehensive build system supporting all major platforms and installer formats:

```bash
# Build for all platforms
./scripts/compile-build-dist.sh

# Platform-specific builds
./scripts/compile-build-dist.sh --platform mac
./scripts/compile-build-dist.sh --platform win  
./scripts/compile-build-dist.sh --platform linux

# Quick development build
./scripts/compile-build-dist.sh --quick
```

### Supported Package Formats
- **macOS**: DMG, PKG, ZIP, Universal builds
- **Windows**: NSIS, MSI, Portable, APPX, ZIP
- **Linux**: AppImage, DEB, RPM, Snap, TAR archives

## Documentation

- [Technical Architecture](dev/tech-stack.md)
- [Development Guide](dev/CONTRIBUTING.md)
- [Product Requirements](dev/master-PRD.md)
- [Project Structure](dev/PROJECT_STRUCTURE.md)
- [Change History](dev/CHANGELOG.md)

## Contributing

See [CONTRIBUTING.md](dev/CONTRIBUTING.md) for development guidelines and contribution process.

## Security

For security concerns and vulnerability reports, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and feature requests via GitHub issues
- **Documentation**: Comprehensive guides in the `/docs` directory
- **Development**: Join development discussions and contribute code

---

**VidBeast v3.5** - Professional video corruption analysis and repair engine  
Built with ❤️ using Electron and FFmpeg