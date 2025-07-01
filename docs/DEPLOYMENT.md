# Deployment Guide

## Overview

This guide covers deploying VidBeast to various environments including development, staging, and production. VidBeast supports multiple deployment methods tailored to different use cases.

## Deployment Types

### Development Deployment
Local development environment for testing and debugging.

### Staging Deployment
Pre-production environment for final testing before release.

### Production Deployment
Public release environment for end users.

## Environment Setup

### System Requirements

#### Minimum Requirements
- **OS**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **Memory**: 8GB RAM
- **Storage**: 2GB free space
- **CPU**: Dual-core 64-bit processor

#### Recommended Requirements
- **OS**: Windows 11, macOS 13+, Ubuntu 22.04+
- **Memory**: 16GB+ RAM
- **Storage**: 10GB+ free space
- **CPU**: Quad-core 64-bit processor

### Prerequisites

#### Common Requirements
```bash
# Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install git

# Build tools (Linux)
sudo apt-get install build-essential
```

#### macOS Requirements
```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew (optional)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# FFmpeg (for development)
brew install ffmpeg
```

#### Windows Requirements
```powershell
# Chocolatey (optional)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Visual Studio Build Tools
choco install visualstudio2019buildtools

# FFmpeg (for development)
choco install ffmpeg
```

## Development Deployment

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/vidbeast/vidbeast.git
cd vidbeast

# Install dependencies
npm install

# Development mode
npm run dev

# Or start with debugging
npm run dev:debug
```

### Development Configuration

```javascript
// config/development.json
{
  "env": "development",
  "debug": true,
  "logLevel": "debug",
  "autoReload": true,
  "devTools": true,
  "sourceMaps": true,
  "hotReload": true
}
```

### Development Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Staging Deployment

### Staging Environment Setup

```bash
# Create staging branch
git checkout -b staging

# Update version for staging
npm version prerelease --preid=staging

# Build for staging
npm run build:staging

# Deploy to staging server
npm run deploy:staging
```

### Staging Configuration

```javascript
// config/staging.json
{
  "env": "staging",
  "debug": false,
  "logLevel": "info",
  "autoUpdate": true,
  "telemetry": true,
  "apiEndpoint": "https://api-staging.vidbeast.com"
}
```

### Staging Testing

```bash
# Automated testing
npm run test:staging

# Manual testing checklist
npm run test:manual:staging

# Performance testing
npm run test:performance:staging
```

## Production Deployment

### Release Process

#### 1. Preparation
```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Run full test suite
npm run test:all

# Update version
npm version patch  # or minor/major

# Update CHANGELOG
npm run changelog
```

#### 2. Build Process
```bash
# Clean previous builds
npm run clean

# Build for all platforms
npm run build:all

# Sign builds (if certificates available)
npm run sign:all

# Notarize macOS builds
npm run notarize:mac
```

#### 3. Distribution
```bash
# Create GitHub release
npm run release:github

# Upload to website
npm run upload:website

# Update package managers
npm run publish:homebrew
npm run publish:chocolatey
npm run publish:snap
```

### Platform-Specific Deployment

#### macOS Deployment

```bash
# Build for macOS
npm run build:mac

# Create DMG installer
electron-builder --mac --publish=never

# Code signing
electron-builder --mac --publish=never --config.mac.identity="Developer ID Application: Your Name"

# Notarization
xcrun altool --notarize-app \
  --primary-bundle-id "com.vidbeast.app" \
  --username "your@email.com" \
  --password "@keychain:AC_PASSWORD" \
  --file "VidBeast.dmg"
```

#### Windows Deployment

```bash
# Build for Windows
npm run build:win

# Create NSIS installer
electron-builder --win --publish=never

# Code signing
electron-builder --win --publish=never --config.win.certificateFile="path/to/cert.p12"

# Windows Defender submission
# Upload to Microsoft Security Intelligence portal
```

#### Linux Deployment

```bash
# Build for Linux
npm run build:linux

# Create AppImage
electron-builder --linux AppImage --publish=never

# Create DEB package
electron-builder --linux deb --publish=never

# Create RPM package
electron-builder --linux rpm --publish=never

# Upload to package repositories
# Launchpad PPA, AUR, etc.
```

## Cloud Deployment

### AWS Deployment

#### S3 Storage
```bash
# Upload to S3
aws s3 sync dist/ s3://vidbeast-releases/ --delete

# Set public access
aws s3api put-bucket-acl --bucket vidbeast-releases --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### EC2 Build Server
```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.large \
  --key-name vidbeast-build \
  --user-data file://build-server-setup.sh

# Connect and build
ssh -i vidbeast-build.pem ec2-user@ec2-instance-ip
git clone https://github.com/vidbeast/vidbeast.git
cd vidbeast
npm install
npm run build:all
```

### GitHub Actions Deployment

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
        
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Release
      uses: softprops/action-gh-release@v1
      with:
        files: dist/*
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Package Manager Deployment

### Homebrew (macOS)

#### Formula Creation
```ruby
# Formula/vidbeast.rb
class Vidbeast < Formula
  desc "Video corruption analysis and repair engine"
  homepage "https://vidbeast.com"
  url "https://github.com/vidbeast/vidbeast/releases/download/v3.5.0/VidBeast-3.5.0-mac.zip"
  sha256 "sha256_hash_here"
  license "MIT"
  
  depends_on "ffmpeg"
  
  app "VidBeast.app"
  
  def caveats
    <<~EOS
      VidBeast requires FFmpeg to be installed.
      FFmpeg is bundled with the application.
    EOS
  end
end
```

#### Tap Management
```bash
# Create tap
brew tap vidbeast/vidbeast

# Add formula
cp Formula/vidbeast.rb $(brew --repository vidbeast/vidbeast)/Formula/

# Commit and push
git add Formula/vidbeast.rb
git commit -m "Add vidbeast formula"
git push origin main

# Test installation
brew install vidbeast/vidbeast/vidbeast
```

### Chocolatey (Windows)

#### Package Creation
```xml
<!-- vidbeast.nuspec -->
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2015/06/nuspec.xsd">
  <metadata>
    <id>vidbeast</id>
    <version>3.5.0</version>
    <packageSourceUrl>https://github.com/vidbeast/vidbeast</packageSourceUrl>
    <owners>VidBeast Team</owners>
    <title>VidBeast</title>
    <authors>VidBeast Team</authors>
    <projectUrl>https://vidbeast.com</projectUrl>
    <iconUrl>https://vidbeast.com/icon.png</iconUrl>
    <copyright>2025 VidBeast Team</copyright>
    <licenseUrl>https://github.com/vidbeast/vidbeast/blob/main/LICENSE</licenseUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <projectSourceUrl>https://github.com/vidbeast/vidbeast</projectSourceUrl>
    <docsUrl>https://docs.vidbeast.com</docsUrl>
    <bugTrackerUrl>https://github.com/vidbeast/vidbeast/issues</bugTrackerUrl>
    <tags>video repair corruption analysis ffmpeg</tags>
    <summary>Video corruption analysis and repair engine</summary>
    <description>
VidBeast is an advanced video corruption analysis and repair engine with FFmpeg integration.
    </description>
  </metadata>
  <files>
    <file src="tools\**" target="tools" />
  </files>
</package>
```

#### Publishing
```powershell
# Create package
choco pack vidbeast.nuspec

# Test package
choco install vidbeast -s .

# Push to chocolatey
choco push vidbeast.3.5.0.nupkg --source https://push.chocolatey.org/
```

### Snap (Linux)

#### Snap Creation
```yaml
# snap/snapcraft.yaml
name: vidbeast
version: '3.5.0'
summary: Video corruption analysis and repair engine
description: |
  VidBeast is an advanced video corruption analysis and repair engine 
  with FFmpeg integration for professional video processing.

grade: stable
confinement: strict
base: core20

apps:
  vidbeast:
    command: bin/vidbeast
    plugs:
      - home
      - network
      - audio-playback
      - opengl

parts:
  vidbeast:
    plugin: nodejs
    node-engine: '18'
    source: .
    build-snaps: [ffmpeg/4.4/stable]

    stage-packages:
      - libnss3
      - libatk-bridge2.0-0
      - libdrm2
      - libxcomposite1
      - libxdamage1
      - libxrandr2
      - libgbm1
      - libxss1
      - libasound2
```

#### Building and Publishing
```bash
# Build snap
snapcraft

# Test snap
snap install --dangerous vidbeast_3.5.0_amd64.snap

# Push to store
snapcraft push vidbeast_3.5.0_amd64.snap --release stable
```

## Monitoring and Maintenance

### Deployment Monitoring

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: app.getVersion(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform
  });
});
```

#### Error Tracking
```javascript
// Error reporting
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    version: app.getVersion(),
    platform: process.platform
  };
  
  // Send to error tracking service
  sendErrorReport(errorData);
});
```

### Update Management

#### Auto-Update Configuration
```javascript
// updater.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available.`,
    buttons: ['Update', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});
```

## Security Considerations

### Code Signing

#### macOS
```bash
# Developer ID certificate
security find-identity -v -p codesigning

# Sign application
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" VidBeast.app

# Verify signature
codesign --verify --verbose VidBeast.app
```

#### Windows
```bash
# Authenticode certificate
signtool sign /f certificate.p12 /p password /t http://timestamp.digicert.com /fd sha256 VidBeast.exe

# Verify signature
signtool verify /pa VidBeast.exe
```

### Security Scanning

```bash
# Virus scanning
clamscan --recursive dist/

# Dependency vulnerability scan
npm audit

# Static analysis
npm run security:scan
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Code Signing Issues
```bash
# Check certificate validity
security find-identity -v -p codesigning

# Reset keychain
security unlock-keychain ~/Library/Keychains/login.keychain
```

#### Platform-Specific Issues
```bash
# macOS: Notarization failures
xcrun altool --notarization-info "RequestUUID" -u "email@example.com"

# Windows: Defender false positives
# Submit to Microsoft for review

# Linux: Permission issues
chmod +x VidBeast.AppImage
```

---

This deployment guide provides comprehensive instructions for deploying VidBeast across various environments and platforms.