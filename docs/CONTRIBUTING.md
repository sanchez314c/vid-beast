# Contributing to VidBeast

## Development Workflow

### Getting Started
1. Clone the repository
2. Run `npm install` to install dependencies
3. Use `./build-release-run.sh --dev` for development

### Build System
The project uses a unified build script `build-release-run.sh` for all operations:

```bash
# Development mode
./build-release-run.sh --dev

# Build only (no launch)  
./build-release-run.sh --build-only

# Clean build
./build-release-run.sh --clean

# Build for specific platform
./build-release-run.sh --platform mac
./build-release-run.sh --platform win  
./build-release-run.sh --platform linux
./build-release-run.sh --platform all
```

### Code Style
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### Testing
- Test builds on target platforms before submitting
- Verify the application launches correctly
- Check all UI components function properly

### File Organization
- Source code: `/` (root)
- Development docs: `/dev/`
- Build output: `/dist/`
- Legacy/backup: `/_archive/` (if needed)

### Commit Guidelines
- Use clear, descriptive commit messages
- Include relevant file changes
- Test builds before committing

## Architecture

### Main Process
- `main.js` - Electron main process
- Handles window creation and app lifecycle

### Renderer Process  
- `renderer/` - Frontend UI components
- `renderer.js` - Main renderer logic
- `styles.css` - Application styling

### Build Configuration
- `package.json` - Dependencies and build config
- `build-release-run.sh` - Unified build script