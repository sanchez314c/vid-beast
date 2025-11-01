# VidBeast v3.0.0

**Advanced Video Corruption Analysis & Repair Engine**

A powerful Electron-based application with FFmpeg integration for deep video analysis, corruption detection, and intelligent repair capabilities.

## 🌟 What's New in v3.0.0

- **🔧 Full FFmpeg Integration** - Automatic FFmpeg download and management
- **🎯 Advanced Repair Engine** - Multiple repair strategies with intelligent detection
- **🔬 Deep Analysis** - Bitstream-level corruption detection and NAL unit analysis
- **⚡ Multi-Strategy Repair** - Container repair, stream remux, keyframe rebuilding, and more
- **🎪 Real-Time Progress** - Live repair progress tracking with visual feedback
- **📊 Enhanced Reporting** - Detailed HTML/CSV export with corruption analysis
- **🔄 Batch Processing** - Queue-based repair system for multiple files
- **🖼️ Frame Extraction** - PNG frame extraction for forensic analysis

## 🚀 One-Command Build & Run

```bash
./build-release-run.sh
```

That's it! This single command will:
- Install dependencies (if needed)
- Download FFmpeg automatically (first run)
- Build the application for your platform
- Launch VidBeast automatically

## 🎯 Key Features

### Advanced Video Analysis
- **Deep Corruption Detection**: Bitstream-level analysis with H.264/H.265 NAL unit inspection
- **Container Structure Analysis**: MP4/MOV atom structure validation and repair
- **Stream Integrity Validation**: Audio/video stream health assessment
- **Playability Testing**: Determines how much of a video is recoverable

### Intelligent Repair Engine
- **Extract Playable**: Salvage recoverable portions from corrupted files
- **Container Repair**: Rebuild MP4/MOV header structure and metadata
- **Stream Remux**: Re-mux streams to fix synchronization issues
- **Deep Repair**: Full re-encoding with corruption handling
- **Keyframe Rebuild**: Reconstruct GOP structure and keyframes
- **Audio Repair**: Fix or remove corrupted audio tracks

### Professional Tools
- **Frame Extraction**: Export video frames as PNG files for analysis
- **Batch Processing**: Queue multiple files for automated repair
- **Progress Tracking**: Real-time progress with estimated completion
- **Detailed Reports**: Export analysis results in HTML or CSV format
- **Strategy Selection**: Choose specific repair approaches per file

## 📋 System Requirements

### Automatic Dependencies (Handled by VidBeast)
- **FFmpeg**: Downloaded and managed automatically on first run
- **FFprobe**: Included with FFmpeg for video analysis

### Manual Requirements
- **Node.js 18+** (LTS recommended)
- **npm 9+**
- **Python 3.8+** (for advanced analysis engine)

## 🏗 Quick Start

### 1. Clone and Build
```bash
git clone <repository>
cd VidBeast
./build-release-run.sh
```

### 2. First Run Setup
VidBeast will automatically:
- Download FFmpeg (50-100MB) on first launch
- Set up the analysis engine
- Initialize the repair system

### 3. Analyze Videos
1. **Select Input**: Choose files or folders (with recursive scanning)
2. **Configure Analysis**: Enable detailed mode, repair options, frame extraction
3. **Start Analysis**: View real-time progress and corruption detection
4. **Review Results**: Examine detailed corruption reports and recommendations

### 4. Repair Corrupted Files
1. **Review Repair Queue**: Files detected as repairable are automatically queued
2. **Select Strategies**: Choose specific repair approaches or use auto-detect
3. **Set Output Directory**: Specify base directory for organized output
4. **Start Repairs**: Monitor progress and success rates in real-time

### 5. Organized Output Structure
VidBeast automatically organizes your files:
- **Original files**: Left untouched in their original locations
- **Healthy files**: Copied to `output/healthy/` for easy access
- **Repaired files**: Saved to `output/repaired/` with strategy names
- **Analysis reports**: Exported to your chosen output directory

## 🛠 Build Options

### Development Mode
```bash
# Development with logging
./build-release-run.sh --dev

# Development with debugging
npm run dev
```

### Platform-Specific Builds
```bash
# Build for macOS (Intel + Apple Silicon)
./build-release-run.sh --platform mac

# Build for Windows (x64)
./build-release-run.sh --platform win

# Build for Linux (x64)
./build-release-run.sh --platform linux

# Build for all platforms
./build-release-run.sh --platform all
```

### Advanced Options
```bash
# Clean build (removes previous builds)
./build-release-run.sh --clean

# Build without launching
./build-release-run.sh --build-only

# Get help
./build-release-run.sh --help
```

## 📁 Project Architecture 

```
VidBeast/
├── build-release-run.sh      # 🎯 Main build script
├── main.js                   # Electron main process with FFmpeg integration
├── package.json              # Dependencies & build configuration
├── renderer/                 # Frontend UI with repair queue
│   ├── index.html           # Main application interface
│   ├── renderer.js          # UI logic and IPC communication
│   └── styles.css           # Dark theme styling
├── v1-script/               # Python analysis engine
│   └── vidbeast.py          # Advanced corruption analysis (v3.0.0)
├── assets/                  # Application icons and resources
└── dist/                    # Build output (auto-generated)
    ├── mac/                 # macOS builds (.app, .dmg)
    ├── win-unpacked/        # Windows builds (.exe, installer)
    └── linux-unpacked/      # Linux builds (AppImage)
```

## 🔧 Repair Strategies Explained

### 1. Extract Playable (`extract-playable`)
- **Use Case**: Partial corruption, file plays partially
- **Method**: Extracts recoverable portion using stream copying
- **Best For**: Files that play for some duration then fail

### 2. Container Repair (`container-repair`)
- **Use Case**: MP4/MOV header corruption, metadata issues
- **Method**: Rebuilds container structure with FastStart optimization
- **Best For**: Files that won't open but have valid streams

### 3. Stream Remux (`stream-remux`)
- **Use Case**: Synchronization issues, timestamp problems
- **Method**: Re-multiplexes streams with error handling and PTS generation
- **Best For**: Audio/video sync issues, timestamp corruption

### 4. Deep Repair (`deep-repair`)
- **Use Case**: Severe bitstream corruption
- **Method**: Full re-encoding with H.264/AAC and corruption tolerance
- **Best For**: Heavily corrupted files requiring complete reconstruction

### 5. Keyframe Rebuild (`keyframe-repair`)
- **Use Case**: GOP structure damage, keyframe corruption
- **Method**: Reconstructs keyframe intervals and I-frame placement
- **Best For**: Videos with seek/scrubbing issues

### 6. Audio Repair (`remove-audio`)
- **Use Case**: Corrupted audio tracks preventing playback
- **Method**: Removes or re-encodes audio while preserving video
- **Best For**: Video corruption caused by audio stream issues

## 📊 Analysis Engine Details

### Python Analysis Engine (vidbeast.py v3.0.0)
- **Deep Bitstream Analysis**: NAL unit corruption detection
- **Container Structure**: Atom/box analysis for MP4/MOV files
- **Frame-Level Inspection**: Individual frame corruption assessment
- **Repair Feasibility**: Intelligent recommendations based on corruption type
- **Multi-Format Support**: MP4, MOV, AVI, MKV, M4V, FLV, WebM

### FFmpeg Integration
- **Automatic Management**: Downloads and updates FFmpeg as needed
- **Multi-Platform**: macOS (Intel/Apple Silicon), Windows, Linux
- **Version Control**: Tracks FFmpeg version and suggests updates
- **Error Analysis**: Detailed error parsing for corruption insights

## 📈 Export & Reporting

### HTML Reports
- **Visual Dashboard**: Corruption statistics with color coding
- **Detailed File Analysis**: Per-file corruption breakdown
- **Repair Recommendations**: Specific strategies for each file
- **Summary Statistics**: Overall health metrics

### CSV Export
- **Data Analysis**: Import into Excel/Google Sheets
- **Bulk Processing**: Process export data programmatically
- **Audit Trail**: Track repair attempts and success rates

## 🎮 Advanced Usage

### Batch Processing Workflow
1. **Folder Scanning**: Recursive directory scanning with real-time progress
2. **Automatic Queuing**: Repairable files added to repair queue automatically
3. **Strategy Assignment**: Intelligent strategy selection based on corruption type
4. **Batch Execution**: Process entire queue with progress monitoring
5. **Result Tracking**: Success/failure rates with detailed logs

### Frame Extraction for Forensics
```javascript
// Extract frames at 1 fps to PNG files
Analysis Options -> Enable Frame Extraction
Frame Rate: 1 (or custom rate)
Output Directory: /path/to/frame/output
```

### Custom Repair Workflows
- **Manual Strategy Selection**: Override auto-detection per file
- **Output Directory Control**: Organize repaired files by strategy
- **Progress Monitoring**: Real-time status updates and ETA
- **Error Handling**: Detailed failure analysis and retry options

## 🚀 Performance Optimization

### System Requirements by Usage
- **Light Analysis**: 4GB RAM, 2 CPU cores
- **Heavy Repair**: 8GB+ RAM, 4+ CPU cores  
- **Batch Processing**: 16GB+ RAM, 8+ CPU cores
- **Storage**: 2x source file size for repair operations

### Optimization Tips
- **SSD Storage**: Significantly improves repair performance
- **RAM**: More RAM allows larger files and faster processing
- **CPU**: Multi-core CPUs benefit batch operations
- **Network**: Not required - fully offline operation

## 📄 License & Credits

**License**: MIT License

**Authors**: Claude & Heathen-Admin

**FFmpeg**: Licensed under LGPL v2.1+ (auto-downloaded)

**Chart.js**: MIT License (included)

## 🆘 Troubleshooting

### Common Issues
1. **FFmpeg Download Fails**: Check internet connection, try manual download
2. **Repair Takes Long**: Large files require time, check system resources
3. **Python Not Found**: Install Python 3.8+ for advanced analysis
4. **Insufficient Disk Space**: Ensure 2x source file size available

### Debug Mode
```bash
# Enable verbose logging
npm run dev

# Check FFmpeg status
# App will show FFmpeg download progress on first run
```

### Getting Help
- Check console output for detailed error messages
- Verify system requirements are met  
- Ensure sufficient disk space for repair operations
- Try different repair strategies for stubborn files

---

**VidBeast v3.0.0** - Professional video corruption analysis and repair for macOS, Windows, and Linux.