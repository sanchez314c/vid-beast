# Quick Start Guide

## Getting Started with VidBeast

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 500MB free space for application
- **FFmpeg**: Automatically included, but system FFmpeg can be used if preferred

### Installation

#### Option 1: Download Release (Recommended)
1. Visit the [Releases page](https://github.com/your-repo/vid-beast/releases)
2. Download the appropriate version for your platform:
   - **Windows**: `VidBeast-Setup-x.x.x.exe`
   - **macOS**: `VidBeast-x.x.x.dmg`
   - **Linux**: `VidBeast-x.x.x.AppImage`
3. Run the installer and follow the setup wizard

#### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/your-repo/vid-beast.git
cd vid-beast

# Install dependencies
npm install

# Build for your platform
npm run build

# Run the application
npm start
```

### First Launch

1. **Start VidBeast** using your platform's method:
   - **Windows**: Start Menu → VidBeast
   - **macOS**: Applications → VidBeast
   - **Linux**: Applications → VidBeast or `./VidBeast.AppImage`

2. **Grant Permissions** (first time only):
   - Allow file system access when prompted
   - Grant network access for FFmpeg updates

3. **Verify FFmpeg Integration**:
   - Go to Settings → FFmpeg
   - Confirm "FFmpeg Status" shows "Connected"
   - If not, click "Auto-Configure" or manually specify FFmpeg path

### Basic Usage

#### Analyze a Video File
1. Click "Add Video" or drag & drop a video file
2. Select the file in the queue
3. Click "Analyze" to detect corruption
4. Review the analysis results

#### Repair a Corrupted Video
1. Add and analyze a video file (see above)
2. If corruption is detected, click "Repair"
3. Choose repair options:
   - **Quick Repair**: Basic fixes (recommended first)
   - **Deep Repair**: Comprehensive analysis (slower)
4. Select output location
5. Click "Start Repair"

#### Batch Processing
1. Click "Add Multiple Videos" or drag multiple files
2. Select all files in the queue (Ctrl+A / Cmd+A)
3. Click "Batch Analyze" or "Batch Repair"
4. Monitor progress in the queue panel

### Common Tasks

#### Check Video Information
1. Right-click on a video file
2. Select "Video Info"
3. View codec, resolution, bitrate, and metadata

#### Export Analysis Report
1. Complete video analysis
2. Click "Export Report"
3. Choose format: JSON, CSV, or TXT
4. Save to desired location

#### Configure Repair Settings
1. Go to Settings → Repair Options
2. Adjust parameters:
   - **Repair Strategy**: Conservative, Balanced, or Aggressive
   - **Quality Preservation**: Prioritize original quality
   - **Output Format**: Same as input or convert

### Troubleshooting

#### FFmpeg Not Found
- **Windows**: Download FFmpeg binaries and add to PATH
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg` or `sudo yum install ffmpeg`

#### Repair Fails
1. Try "Quick Repair" first
2. Check available disk space
3. Verify output directory permissions
4. Try different repair strategy in settings

#### Application Won't Start
1. Check system requirements
2. Update graphics drivers
3. Clear application cache:
   - Windows: `%APPDATA%/vid-beast`
   - macOS: `~/Library/Application Support/vid-beast`
   - Linux: `~/.config/vid-beast`

### Next Steps

- 📖 Read the [User Guide](README.md) for detailed features
- 🔧 Explore [Development](DEVELOPMENT.md) options
- 🐛 Report issues on [GitHub Issues](https://github.com/your-repo/vid-beast/issues)
- 💬 Join our [Discord Community](https://discord.gg/vid-beast)

### Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Add Video | Ctrl+O | Cmd+O |
| Start Analysis | Ctrl+A | Cmd+A |
| Start Repair | Ctrl+R | Cmd+R |
| Settings | Ctrl+, | Cmd+, |
| Quit | Ctrl+Q | Cmd+Q |

### Performance Tips

1. **SSD Storage**: Use SSD for faster video processing
2. **Memory**: Close other applications when processing large files
3. **Batch Size**: Process 5-10 files at a time for optimal performance
4. **Output Location**: Use fast external storage for large repairs

---

**Need Help?** Visit our [FAQ](FAQ.md) or [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues.