# Installation Guide

## System Requirements

### Minimum Requirements
- **Operating System**: 
  - Windows 10 or later
  - macOS 10.15 (Catalina) or later
  - Ubuntu 20.04 or equivalent
- **Processor**: 64-bit dual-core CPU
- **Memory**: 8GB RAM
- **Storage**: 2GB free space + space for video files
- **Display**: 1024x768 resolution

### Recommended Requirements
- **Operating System**: 
  - Windows 11
  - macOS 12 (Monterey) or later
  - Ubuntu 22.04 or equivalent
- **Processor**: 64-bit quad-core CPU
- **Memory**: 16GB+ RAM
- **Storage**: 10GB+ free space (SSD recommended)
- **Display**: 1920x1080 resolution or higher

### Supported Architectures
- **Windows**: x64, x86, ARM64
- **macOS**: Intel x64, Apple Silicon (ARM64), Universal
- **Linux**: x64, ARM64, ARMv7l

## Installation Methods

### Method 1: Download Pre-built Binary (Recommended)

#### Windows
1. **Download** the latest release from [GitHub Releases](https://github.com/vidbeast/vidbeast/releases)
2. **Choose** the appropriate installer:
   - `VidBeast-Setup-x.x.x.exe` - Standard installer
   - `VidBeast-x.x.x-win.zip` - Portable version
3. **Run** the installer as Administrator
4. **Follow** the installation wizard
5. **Launch** VidBeast from Start Menu or desktop

#### macOS
1. **Download** the latest release for macOS
2. **Choose** the appropriate file:
   - `VidBeast-x.x.x.dmg` - Intel Macs
   - `VidBeast-x.x.x-arm64.dmg` - Apple Silicon
   - `VidBeast-x.x.x-universal.dmg` - Universal binary
3. **Open** the DMG file
4. **Drag** VidBeast to Applications folder
5. **Launch** from Launchpad or Applications folder
6. **Accept** any security prompts (first launch only)

#### Linux
1. **Download** the latest release for Linux
2. **Choose** the appropriate package:
   - `VidBeast-x.x.x.AppImage` - Universal portable
   - `VidBeast-x.x.x.deb` - Debian/Ubuntu
   - `VidBeast-x.x.x.rpm` - RedHat/Fedora
3. **Make executable** (AppImage):
   ```bash
   chmod +x VidBeast-x.x.x.AppImage
   ```
4. **Install** package:
   ```bash
   # Debian/Ubuntu
   sudo dpkg -i VidBeast-x.x.x.deb
   
   # RedHat/Fedora
   sudo rpm -i VidBeast-x.x.x.rpm
   ```
5. **Launch** from applications menu or terminal

### Method 2: Package Manager Installation

#### Windows (Chocolatey)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install VidBeast
choco install vidbeast

# Update VidBeast
choco upgrade vidbeast
```

#### macOS (Homebrew)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install VidBeast
brew install vidbeast

# Update VidBeast
brew upgrade vidbeast
```

#### Linux (Snap)
```bash
# Install Snap if not already installed
sudo apt update
sudo apt install snapd

# Install VidBeast
sudo snap install vidbeast

# Update VidBeast
sudo snap refresh vidbeast
```

### Method 3: Build from Source

#### Prerequisites
```bash
# Node.js (version 16 or later)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# npm
sudo apt-get install -y npm

# Git
sudo apt-get install -y git

# Build tools (Linux)
sudo apt-get install -y build-essential

# Xcode Command Line Tools (macOS)
xcode-select --install

# Visual Studio Build Tools (Windows)
# Download and install from Microsoft
```

#### Build Steps
```bash
# Clone repository
git clone https://github.com/vidbeast/vidbeast.git
cd vidbeast

# Install dependencies
npm install

# Build for current platform
npm run build

# Or build for all platforms
npm run build:all

# Run from source
npm run dev
```

## Post-Installation Setup

### First Launch

1. **Launch** VidBeast
2. **Accept** the license agreement
3. **Choose** default settings
4. **Select** temporary directory
5. **Configure** FFmpeg path (if using system FFmpeg)

### Security Configuration

#### Windows
1. **Windows Defender** may show a warning
2. **Click** "More info" → "Run anyway"
3. **Add** VidBeast to exclusions if desired
4. **Create** firewall rules if needed

#### macOS
1. **Gatekeeper** may prevent launch
2. **Right-click** → "Open" → "Open"
3. **Go** to System Preferences → Security & Privacy
4. **Click** "Allow Anyway" if prompted
5. **Grant** necessary permissions in System Preferences

#### Linux
1. **Permissions** may be needed for file access
2. **Grant** execute permissions: `chmod +x VidBeast`
3. **Configure** desktop integration if desired
4. **Set** up file associations

### Configuration

#### Default Settings
```json
{
  "application": {
    "theme": "dark",
    "autoUpdate": true,
    "telemetry": false
  },
  "processing": {
    "maxConcurrentJobs": 2,
    "tempDirectory": "/tmp/vidbeast",
    "autoCleanup": true
  },
  "ui": {
    "showAdvancedOptions": false,
    "compactMode": false
  }
}
```

#### Custom Settings
1. **Open** Settings panel
2. **Configure** as desired:
   - Theme (dark/light)
   - Processing limits
   - Temporary directory
   - Update preferences
3. **Save** changes

## Verification

### Verify Installation

#### Windows
```cmd
# Check version
VidBeast.exe --version

# Check help
VidBeast.exe --help

# Test with sample file
VidBeast.exe --test
```

#### macOS
```bash
# Check version
./VidBeast.app/Contents/MacOS/VidBeast --version

# Check help
./VidBeast.app/Contents/MacOS/VidBeast --help

# Test with sample file
./VidBeast.app/Contents/MacOS/VidBeast --test
```

#### Linux
```bash
# Check version
./VidBeast --version

# Check help
./VidBeast --help

# Test with sample file
./VidBeast --test
```

### Test Functionality
1. **Launch** VidBeast
2. **Drag** a test video file
3. **Click** "Analyze"
4. **Verify** analysis completes
5. **Check** results display correctly

## Troubleshooting

### Common Installation Issues

#### Windows
**Issue**: "Windows Defender prevented this app from running"
**Solution**: 
1. Click "More info" → "Run anyway"
2. Add to Windows Defender exclusions
3. Report false positive to Microsoft

**Issue**: "Missing MSVCP140.dll"
**Solution**: 
1. Install Visual C++ Redistributable
2. Download from Microsoft website
3. Restart computer

#### macOS
**Issue**: "VidBeast can't be opened because Apple cannot check it for malicious software"
**Solution**: 
1. Right-click app → "Open"
2. Go to System Preferences → Security & Privacy
3. Click "Allow Anyway"
4. Try launching again

**Issue**: "App is damaged and can't be opened"
**Solution**: 
1. Remove quarantine attribute:
   ```bash
   xattr -d com.apple.quarantine VidBeast.app
   ```
2. Re-download if issue persists

#### Linux
**Issue**: "Permission denied"
**Solution**: 
1. Make executable: `chmod +x VidBeast`
2. Check file permissions: `ls -la VidBeast`
3. Use sudo if necessary

**Issue**: "No such file or directory"
**Solution**: 
1. Verify download completed
2. Check file integrity with checksum
3. Download again if corrupted

### Runtime Issues

#### Application Won't Start
1. **Check** system requirements
2. **Verify** all files are present
3. **Run** as administrator
4. **Check** antivirus software
5. **Reinstall** if necessary

#### FFmpeg Errors
1. **Check** FFmpeg binary permissions
2. **Verify** binary exists in resources
3. **Update** to latest version
4. **Use** system FFmpeg if bundled fails

#### Performance Issues
1. **Close** other applications
2. **Check** available memory
3. **Use** SSD storage
4. **Process** smaller files first
5. **Update** graphics drivers

## Updates

### Automatic Updates
VidBeast includes automatic update checking:
- **Checks** for updates on launch
- **Downloads** updates in background
- **Prompts** before installation
- **Rolls back** on failure

### Manual Updates
1. **Download** latest release
2. **Close** running VidBeast
3. **Install** new version
4. **Migrate** settings if prompted

### Update Channels
- **Stable**: Recommended for most users
- **Beta**: New features, some instability possible
- **Dev**: Latest features, not recommended for production

## Uninstallation

### Windows
1. **Open** Control Panel → Programs and Features
2. **Find** VidBeast in the list
3. **Click** "Uninstall"
4. **Follow** uninstall wizard
5. **Delete** remaining files if desired

### macOS
1. **Drag** VidBeast to Trash
2. **Empty** Trash
3. **Delete** preferences if desired:
   ```bash
   rm -rf ~/Library/Preferences/com.vidbeast.app.plist
   rm -rf ~/Library/Application\ Support/VidBeast
   ```

### Linux
```bash
# Remove package
sudo dpkg -r vidbeast          # Debian/Ubuntu
sudo rpm -e vidbeast            # RedHat/Fedora
sudo snap remove vidbeast         # Snap

# Delete configuration
rm -rf ~/.config/vidbeast
rm -rf ~/.local/share/vidbeast
```

## Next Steps

After successful installation:

1. **Read** the [Quick Start Guide](QUICK_START.md)
2. **Check** the [FAQ](FAQ.md) for common questions
3. **Explore** the [User Documentation](../README.md)
4. **Join** the community for support

---

**Need Help?**

- [Documentation Index](DOCUMENTATION_INDEX.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Community Support](https://discord.gg/vidbeast)
- [Report Issues](https://github.com/vidbeast/vidbeast/issues)

**Last Updated**: October 2025