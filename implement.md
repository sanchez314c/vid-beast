# VidBeast - Implementation Spec

This file captures project intent, planned features, and build direction.

## Current State (v3.5.0 / 2026-03-14)

VidBeast is a fully functional cross-platform Electron desktop app. The core feature set is shipped and working:

- Full corruption analysis pipeline using FFprobe and FFmpeg
- Four repair strategies with per-file queue management
- Frame extraction to PNG as a repair fallback
- Batch processing with recursive folder scanning
- Real-time progress charts and per-file status tracking
- Neo-Noir glass UI design system (v3.6.0 branch has the full restyle)
- Custom frameless window with native-feeling controls
- Bundled FFmpeg binaries for macOS (x64/arm64), Windows (x64), and Linux (x64)
- Cross-platform build system targeting DMG, NSIS, MSI, AppImage, DEB, RPM, Snap

## Planned Features

### v4.0.0 - Enterprise / Performance
- Multi-threading: parallel processing for large batch jobs (currently sequential per file)
- REST API server mode: expose analysis/repair as HTTP endpoints for integration
- Database integration: store corruption patterns and repair outcomes for learning
- Custom plugin system: extensible repair strategy interface
- Distributed processing: network-based job distribution

### AI Integration (v2.0.0 / future)
- Claude API integration: intelligent corruption analysis and repair guidance
- Machine learning pattern recognition for corruption classification
- Adaptive strategy selection based on file type and corruption signature
- Multi-pass iterative repair improvement

## Technical Debt / Known Issues

- Renderer uses `require('electron').ipcRenderer` directly instead of a context bridge. `nodeIntegration` is on. This was done to fix IPC breakage with `experimentalFeatures` on Linux, but should be properly resolved with a preload context bridge.
- No automated test coverage. `npm test` is a no-op. Need Jest + Spectron setup.
- Windows ARM64 binaries for FFmpeg are not bundled yet (only x64 and ia32 targets have working binaries).
- The Snap build target (`core20`) may need updating for newer Ubuntu base images.
- Log rotation is not implemented. Logs in the user data directory grow unbounded.

## Build Notes

- Run scripts handle Linux sandbox fix automatically (sysctl unprivileged_userns_clone)
- Electron is launched with `--no-sandbox` in development scripts as a fallback
- GPU compositing uses `--disable-gpu-compositing`, NOT `--disable-gpu` (the latter breaks transparent windows on Linux)
- `experimentalFeatures` must NOT be set in BrowserWindow options (breaks IPC on Linux)
- Port assignments: DEV_SERVER=56813, ELECTRON_DEBUG=60799, ELECTRON_INSPECT=61129

## Portfolio Notes

This project is part of the dev portfolio at `/media/heathen-admin/RAID/Development/Projects/portfolio/`. It demonstrates:
- Electron desktop app architecture
- FFmpeg process orchestration from Node.js
- Custom CSS design system (Neo-Noir glass)
- Cross-platform packaging (macOS/Windows/Linux, multiple formats)
- Security-conscious IPC design (path validation, extension whitelist, spawn vs exec)
