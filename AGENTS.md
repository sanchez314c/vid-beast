# Claude Instructions for VidBeast v3.5

## Project Overview
VidBeast is an advanced Electron-based desktop application for video corruption analysis and repair. It integrates FFmpeg for professional-grade video processing across macOS, Windows, and Linux platforms.

## Technology Stack
**Reference**: [dev/tech-stack.md](dev/tech-stack.md) for complete technology details.

**Core Technologies:**
- **Framework**: Electron v38.1.0 (Multi-process architecture)
- **Language**: JavaScript with TypeScript configuration
- **Video Processing**: FFmpeg integration with platform-specific binaries
- **Build System**: electron-builder with comprehensive multi-platform support
- **Package Manager**: npm >=8.0.0 with Node.js >=16.0.0

## Key Conventions

### File Naming
- **JavaScript files**: camelCase (e.g., `videoProcessor.js`)
- **Directories**: kebab-case (e.g., `video-analysis`, `file-handlers`)
- **Documentation**: UPPERCASE.md for root docs, kebab-case.md for others
- **Configuration**: kebab-case with extension (e.g., `electron-builder.json`)

### Code Style
- **Main Process**: `src/main.js` - Electron main process entry point
- **Renderer Process**: `src/renderer/` - UI and user interaction code
- **Components**: `src/components/` - Reusable UI components
- **Services**: `src/services/` - Business logic and video processing
- **Utilities**: `src/utils/` - Helper functions and shared utilities

### Project Organization
- **Source Code**: `src/` - All application source code
- **Build Scripts**: `scripts/` - Build, run, and maintenance scripts
- **Assets**: `assets/` - Icons, images, and static resources
- **Resources**: `resources/` - FFmpeg binaries and external tools
- **Documentation**: `docs/` (user) and `dev/` (development)
- **Tests**: `tests/` - All test files and suites

## Important Paths

### Core Application
- **Main Process**: `src/main.js`
- **Renderer**: `src/renderer/index.html`, `src/renderer/renderer.js`
- **Preload Script**: `src/renderer/preload.js`
- **Styles**: `src/renderer/styles.css`

### Configuration
- **Electron Builder**: `package.json` (build section) + `electron-builder.json`
- **TypeScript**: `tsconfig.json`
- **Environment**: `.env.example` (template), `.env` (local)
- **Git**: `.gitignore` (includes Electron-specific exclusions)

### Build System
- **Main Build Script**: `scripts/compile-build-dist.sh`
- **Platform Scripts**: `scripts/run-{platform}-{type}.{ext}`
- **Maintenance**: `scripts/bloat-check.sh`, `scripts/temp-cleanup.sh`

### External Resources
- **FFmpeg Binaries**: `resources/binaries/{platform}/`
- **Icons**: `assets/icons/` (platform-specific formats)
- **Build Resources**: Build-time assets for packaging

## Common Tasks

### Development
- **Start Development**: `npm run dev` or `./scripts/run-{platform}-source.{ext}`
- **Run from Source**: Platform-specific scripts in `scripts/`
- **Install Dependencies**: `npm install`
- **Clean Build Artifacts**: `npm run clean`

### Building
- **Build All Platforms**: `./scripts/compile-build-dist.sh`
- **Platform-Specific**: `./scripts/compile-build-dist.sh --platform {mac|win|linux}`
- **Quick Build**: `./scripts/compile-build-dist.sh --quick`
- **Individual Commands**: `npm run build:{platform}`

### Testing
- **Run Tests**: `npm test` (currently no tests configured)
- **Manual Testing**: Use platform-specific run scripts
- **Build Validation**: Automatic validation in build scripts

### Deployment
- **Distribution Files**: Located in `dist/` after building
- **Package Types**: DMG, MSI, DEB, RPM, AppImage, Snap, ZIP, Portable
- **Code Signing**: Configured for macOS, Windows certificates needed

## Project-Specific Considerations

### Electron Security
- **Process Isolation**: Main and renderer processes are properly separated
- **Context Isolation**: Renderer process runs with limited Node.js access
- **Preload Scripts**: Used for secure IPC communication
- **No Remote Content**: Application runs locally without remote dependencies

### FFmpeg Integration
- **Binary Management**: Platform-specific binaries included in build
- **Process Spawning**: FFmpeg runs as child processes for video processing
- **Error Handling**: Robust error handling for FFmpeg operations
- **Memory Management**: Streaming processing for large video files

### Cross-Platform Considerations
- **File Paths**: Use `path.join()` for cross-platform compatibility
- **Binary Execution**: Platform-specific FFmpeg binary selection
- **Packaging**: Different installer types for each platform
- **Testing**: Ensure functionality across all supported platforms

### Performance Considerations
- **Large Files**: Streaming processing for memory efficiency
- **Background Processing**: Long-running operations in main process
- **UI Responsiveness**: Non-blocking operations with progress updates
- **Resource Cleanup**: Proper cleanup of temporary files and processes

## Development Workflow

### Getting Started
1. **Environment Setup**: Ensure Node.js >=16.0.0 and npm >=8.0.0
2. **Dependencies**: Run `npm install`
3. **Configuration**: Copy `.env.example` to `.env` if needed
4. **Development**: Use `npm run dev` or platform scripts

### Making Changes
1. **Code Changes**: Edit files in `src/` directory
2. **Testing**: Test using development scripts
3. **Documentation**: Update relevant documentation
4. **Build Testing**: Test builds on target platforms

### Quality Assurance
1. **Code Style**: Follow existing conventions
2. **Security**: Consider Electron security implications
3. **Performance**: Test with large video files
4. **Cross-Platform**: Verify functionality on all platforms

## Troubleshooting

### Common Issues
- **Build Failures**: Check Node.js/npm versions and dependencies
- **FFmpeg Errors**: Verify binary paths and permissions
- **Platform Issues**: Check platform-specific requirements
- **Memory Issues**: Monitor memory usage with large files

### Debug Resources
- **Electron DevTools**: Available in development mode
- **Logging**: Check application logs in `logs/` directory
- **Build Logs**: Detailed logging in build scripts
- **Process Monitoring**: Monitor child processes for FFmpeg

### Getting Help
- **Documentation**: Comprehensive docs in `docs/` and `dev/`
- **Issues**: Check existing issues and create new ones
- **Code**: Well-commented code with explanations
- **Scripts**: Build scripts include detailed output and error handling

## Recent Changes
- **Project Standardized**: September 2025 - Complete project structure reorganization
- **Documentation**: Added comprehensive documentation suite
- **Build System**: Enhanced with robust error handling and validation
- **Structure**: Organized according to professional standards

## Working with Claude
When working on VidBeast:

1. **Understand Context**: This is a professional video processing application
2. **Consider Security**: Electron applications require security considerations
3. **Think Cross-Platform**: Changes must work on macOS, Windows, and Linux
4. **Performance Matters**: Video processing is resource-intensive
5. **Quality Standards**: This is a production application with professional requirements

## Future Development
- **Testing Framework**: No tests currently configured - needs comprehensive test suite
- **TypeScript Migration**: TypeScript config present but not fully implemented
- **Performance Optimization**: GPU acceleration and multi-threading opportunities
- **Plugin System**: Architecture could support plugin development
- **Cloud Integration**: Potential for cloud processing features

---

**Last Updated**: September 2025  
**Project Standardization**: Complete professional structure applied  
**Status**: Production-ready Electron application with comprehensive build system