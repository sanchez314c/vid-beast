# VidBeast v3.5 - Project Structure Documentation

**Generated**: $(date)
**Standardization**: Unified Project Standardization Complete

## 📁 Directory Structure

### Core Application
```
/src/
├── components/         # Reusable UI components
├── services/          # Business logic and external API services
├── utils/             # Utility functions and helpers
├── lib/               # Core library code and modules
├── types/             # TypeScript type definitions
├── constants/         # Application constants and configurations
├── styles/            # CSS/SCSS styling files
├── renderer/          # Electron renderer process files
└── sources/           # VidBeast-specific source assets
    └── vdfscreenshots/ # Video Duplicate Finder screenshots
```

### Build System
```
/build/               # Build configurations and resources
/dist/                # Compiled application binaries
/scripts/             # Build, deployment, and maintenance scripts
├── build/            # Build automation
├── deploy/           # Deployment scripts
├── maintenance/      # Cleanup and maintenance
└── development/      # Dev workflow tools
```

### Development & Testing
```
/tests/               # All testing files and configurations
├── unit/             # Unit tests
├── integration/      # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test data fixtures
├── mocks/            # Mock objects and services
└── stubs/            # Test stubs and utilities

/dev/                 # Development-specific files and tools
/tools/               # Development utilities
├── generators/       # Code generators
├── validators/       # Code validators
└── analyzers/        # Code analysis tools
```

### Documentation & Support
```
/docs/                # Basic project documentation
/documentation/       # Comprehensive technical documentation
├── api/              # API documentation
├── guides/           # User and developer guides
├── tutorials/        # Step-by-step tutorials
└── deployment/       # Deployment documentation

/examples/            # Usage examples and demos
├── basic/            # Basic usage examples
├── advanced/         # Advanced implementation examples
└── integrations/     # Third-party integration examples

/templates/           # Reusable templates
├── emails/           # Email templates
├── reports/          # Report templates  
└── configs/          # Configuration templates
```

### Resources & Assets
```
/assets/              # Static assets (images, icons, fonts)
/resources/           # Application resources
└── binaries/         # Platform-specific binaries (FFmpeg)
    ├── darwin-arm64/ # macOS ARM64 binaries
    ├── darwin-x64/   # macOS Intel binaries  
    ├── linux-x64/    # Linux x64 binaries
    └── win32-x64/    # Windows x64 binaries

/config/              # Configuration files
```

### Temporary & Output
```
/temp/                # Temporary files during development
/output/              # Various script outputs (different from dist/)
/logs/                # Application and build logs
/backup/              # Project backups and archives
```

### Utilities & Support
```
/utils/               # General utility functions
/lib/                 # Core library modules  
/components/          # Reusable components
/services/            # Business logic services
/fixtures/            # Test data and fixtures
/mocks/               # Mock implementations for testing
/stubs/               # Test stubs and placeholders
```

## 🚀 Platform Run Scripts

### Source (Development Mode)
- `run-macos-source.sh` - macOS development launcher
- `run-windows-source.bat` - Windows development launcher  
- `run-linux-source.sh` - Linux development launcher

### Binary (Production Mode)
- `run-macos-binary.sh` - macOS production launcher with ARM64/Intel detection
- `run-windows-binary.bat` - Windows production launcher with installer support
- `run-linux-binary.sh` - Linux production launcher with AppImage priority

## ⚙️ Build System

### Main Build Script
- `scripts/compile-build-dist.sh` - Complete multi-platform build system
  - 18-core parallel building optimization
  - All platform support (macOS Intel/ARM, Windows x64/x86, Linux x64/ARM)
  - All installer types (.dmg, .pkg, .exe, .msi, .appx, .AppImage, .deb, .rpm, .snap)
  - System temp cleanup integration
  - Bloat checking and prevention
  - Automatic symlink creation for macOS

### Analysis & Maintenance
- `scripts/bloat-check.sh` - VidBeast-specific bloat analysis
- `scripts/temp-cleanup.sh` - System temp cleanup utilities

## 📊 Standards & Conventions

### File Organization
- **Purpose-based organization**: Organize by function, not file type
- **Clear naming**: Descriptive names that indicate purpose
- **Consistent structure**: Follow established patterns across directories
- **Documentation**: README files in key directories explaining purpose

### Code Standards  
- **Modular architecture**: Separate concerns into appropriate directories
- **Reusable components**: Place shareable code in `/components/` and `/lib/`
- **Service layer**: Business logic in `/services/` directory
- **Type safety**: TypeScript definitions in `/src/types/`
- **Testing**: Comprehensive test coverage in `/tests/` with proper organization

### Build Standards
- **Cross-platform**: All builds support major platforms
- **Optimization**: Parallel building and bloat prevention
- **Quality gates**: Automated testing and validation
- **Documentation**: Clear build instructions and troubleshooting

## 🎯 VidBeast Specific Features

### Video Processing
- FFmpeg binary management in `/resources/binaries/`
- Platform-specific optimization for video corruption analysis
- Dedicated screenshot management in `/src/sources/vdfscreenshots/`

### Performance Optimization
- Multi-core build system utilization
- Binary size optimization and bloat monitoring  
- Platform-specific performance tuning

### User Experience
- Color-coded terminal output across all scripts
- Intelligent platform detection and optimization
- Comprehensive error handling and user guidance

---

**This structure provides a professional, scalable foundation for VidBeast development with comprehensive standardization across all aspects of the project lifecycle.**