# VidBeast Setup Guide

## Prerequisites

| Requirement | Minimum | Recommended |
|---|---|---|
| Node.js | 16.x | 18.x LTS or later |
| npm | 8.x | 10.x |
| RAM | 8GB | 16GB+ |
| Disk | 2GB free | 10GB+ (SSD) |
| Display | 1024x768 | 1920x1080 |

**OS requirements:**
- Windows 10+ (x64, x86, ARM64)
- macOS 10.15+ (Intel x64, Apple Silicon)
- Linux Ubuntu 20.04+ or equivalent (x64, ARM64, ARMv7l)

FFmpeg is bundled with the app. You don't need to install it separately unless the bundled binaries fail on your platform.

## Running from Source

This is the fastest way to get running.

**Clone and install:**
```bash
git clone https://github.com/sanchez314c/vid-beast.git
cd vid-beast
npm install
```

**Launch:**
```bash
# Linux
./run-source-linux.sh

# macOS
./run-source-macos.sh

# Windows
run-source-windows.bat

# Or directly via npm (any platform)
npm run dev
```

The `run-source-*.sh` scripts handle platform-specific setup automatically (Linux sandbox fix, zombie process cleanup, port configuration).

## Platform-Specific Notes

### Linux

Electron on Linux requires unprivileged user namespaces for its sandbox. If the app crashes immediately with a permissions error, run:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

The `run-source-linux.sh` script does this automatically with the sudo password. You can also add it to sysctl.conf to make it permanent:

```bash
echo 'kernel.unprivileged_userns_clone=1' | sudo tee -a /etc/sysctl.conf
```

If you can't set the sysctl, launch with `--no-sandbox` (already in the npm scripts):

```bash
npx electron . --no-sandbox
```

**Linux system dependencies** (for building deb packages):
```bash
sudo apt-get install -y libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libuuid1 libsecret-1-0
```

### macOS

On first launch, Gatekeeper may block the app. To bypass:

```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine /Applications/VidBeast.app

# Or right-click the app -> Open -> Open in the dialog
```

For building on macOS you need Xcode Command Line Tools:
```bash
xcode-select --install
```

The build config has code signing disabled (`sign: false`, `identity: null`). If you want to sign, add your certificate identity to `electron-builder.json`.

### Windows

Windows Defender may flag the app. Click "More info" -> "Run anyway" or add an exclusion.

For building on Windows you need Visual Studio Build Tools. Download from Microsoft and install the "C++ build tools" workload.

## Building a Distributable

```bash
# Clean previous build outputs
npm run clean

# Build for current platform (auto-detected)
npm run build

# Platform-specific
npm run build:mac       # macOS only
npm run build:win       # Windows only
npm run build:linux     # Linux only
npm run build:all       # All platforms (requires cross-compilation support)
```

Output lands in `dist/`. Packaged formats by platform:

**macOS:** DMG (drag-to-install), PKG (installer), ZIP, universal binary (Intel + Apple Silicon)

**Windows:** NSIS installer (`.exe`), MSI, portable executable, APPX (Store), ZIP

**Linux:** AppImage (portable), DEB (Debian/Ubuntu), RPM (RHEL/Fedora), Snap, TAR

### Using the build scripts

```bash
# Universal build script (auto-detects platform)
./scripts/build-compile-dist.sh

# Build only, don't launch
./scripts/build-compile-dist.sh --build-only

# Development mode with hot-ish reload
./scripts/build-compile-dist.sh --dev

# Clean before building
./scripts/build-compile-dist.sh --clean

# Target a specific platform
./scripts/build-compile-dist.sh --platform mac
./scripts/build-compile-dist.sh --platform win
./scripts/build-compile-dist.sh --platform linux
./scripts/build-compile-dist.sh --platform all
```

## Environment Variables

These are optional. The app works without any of them set.

```bash
VIDBEAST_TEMP_DIR=/path/to/temp    # Override where temp files go
VIDBEAST_LOG_LEVEL=debug           # Set log verbosity (error/warn/info/debug)
VIDBEAST_NO_HW_ACCEL=1             # Disable hardware acceleration
```

For development, Electron also respects:

```bash
DEV_SERVER_PORT=56813              # Dev server port (set by launch scripts)
ELECTRON_DEBUG_PORT=60799          # Debug port
ELECTRON_INSPECT_PORT=61129        # Inspector port
```

## Config File

Settings are saved in the app's user data directory:

- **Linux:** `~/.config/VidBeast/config.json`
- **macOS:** `~/Library/Application Support/VidBeast/config.json`
- **Windows:** `%APPDATA%\VidBeast\config.json`

Default config structure:

```json
{
  "application": {
    "theme": "dark",
    "autoUpdate": true,
    "telemetry": false
  },
  "processing": {
    "maxConcurrentJobs": 2,
    "tempDirectory": "",
    "autoCleanup": true
  },
  "repair": {
    "defaultStrategy": "conservative",
    "createBackups": true,
    "verifyOutput": true
  },
  "ui": {
    "showAdvancedOptions": false,
    "compactMode": false,
    "animationSpeed": "normal"
  }
}
```

## FFmpeg Binaries

Bundled binaries live in `resources/binaries/`. The app picks the right one based on `process.platform` and `process.arch`:

| Platform | Directory |
|---|---|
| Windows x64 | `resources/binaries/win32-x64/` |
| macOS Intel | `resources/binaries/darwin-x64/` |
| macOS Apple Silicon | `resources/binaries/darwin-arm64/` |
| Linux x64 | `resources/binaries/linux-x64/` |

If bundled binaries are missing or fail the version check, the app falls back to your system FFmpeg. Install it if needed:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Fedora/RHEL
sudo dnf install ffmpeg

# Windows: download from https://ffmpeg.org/download.html
```

## Troubleshooting

**App won't start on Linux**
Check the sandbox issue first (see Platform-Specific Notes above). If that's not it, check that node and npm are installed and your Node.js version is 16+:
```bash
node --version
npm --version
```

**FFmpeg not found**
The app prints whether it found bundled or system FFmpeg in the console. Run with `npm run dev` to see the logs. If bundled binaries are missing, verify `resources/binaries/` has files for your platform. If they exist but fail, check execute permissions:
```bash
chmod +x resources/binaries/linux-x64/ffmpeg
chmod +x resources/binaries/linux-x64/ffprobe
```

**Build fails**
```bash
# Clean everything and retry
npm run clean
rm -rf node_modules
npm install
npm run build
```

On macOS, also try:
```bash
xcode-select --install
```

**Analysis hangs or times out**
IPC calls have a 30-second timeout. Very large files may take longer for the initial probe. If analysis consistently hangs on specific files, check logs at:
- Linux: `~/.config/VidBeast/logs/`
- macOS: `~/Library/Logs/VidBeast/`
- Windows: `%APPDATA%\VidBeast\logs\`

**Out of disk space errors**
Repair operations create temp files that can be 2x the size of the source file. Make sure you have enough free space before running batch repairs.

**White/blank window on Linux**
This is a GPU compositing issue. The `run-source-linux.sh` script sets the right flags (`--disable-gpu-compositing` instead of `--disable-gpu`). If running manually, add those flags:
```bash
npx electron . --no-sandbox --disable-gpu-compositing --enable-transparent-visuals
```

## Verifying It Works

After launch:
1. Click "Select Videos" and pick a video file
2. Click "Start Analysis"
3. You should see progress in the chart and per-file status in the table
4. When done, results appear in the Results and Reports tab

If the analysis completes and you see a result row, everything is working.
