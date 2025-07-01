# VidBeast Changelog

All notable changes to VidBeast - Video Corruption Analysis & Repair Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v3.0.0] - 2025-01-29 - "Electron GUI Release"

### Added
- **Full Electron GUI Application** - Modern dark theme interface inspired by HBBatchBeast
- **AI Integration Support** - Multi-provider AI analysis (OpenAI, Gemini, Anthropic)
- **Frame Extraction to PNG** - Export video frames at configurable rates (0.1fps to 30fps)
- **Tabbed Interface** - Analysis, Repair Queue, Results, Settings, and Help tabs
- **Real-time Progress Tracking** - Live charts and status updates during processing
- **Batch Processing Dashboard** - Queue management for multiple file operations
- **Settings Persistence** - Saves user preferences and AI configurations
- **System Integration** - Native file/folder dialogs and drag-drop support

### Enhanced
- **Folder Scanning** - Recursive directory scanning with progress indicators
- **Multi-format Support** - Extended video format support (.mp4, .mov, .avi, .mkv, .m4v, .flv, .webm, .wmv, .mpg, .mpeg)
- **Repair Strategies** - Multiple concurrent repair approaches per file
- **Output Management** - Configurable output directories and file naming

### Technical
- **Node.js/Electron Architecture** - Cross-platform desktop application
- **Chart.js Integration** - Visual progress and statistics displays
- **IPC Communication** - Secure renderer-main process communication
- **Async Processing** - Non-blocking UI during long operations

---

## [v1.0.0] - 2025-01-29 - "Script Engine Release"

### Added
- **Complete Repair Functionality** - Actually fixes corrupted videos (not just analysis)
- **Multi-Strategy Repair Engine** - 4 different repair approaches per file
- **Frame Extraction** - Export video frames to PNG for forensic analysis
- **Command Line Interface** - Full CLI with extensive options

### Repair Strategies Implemented
1. **Playable Portion Extraction** - Saves working parts of corrupted videos
2. **Container Repair** - Fixes MP4/MOV structure issues using FFmpeg
3. **Stream Remuxing** - Rebuilds video/audio streams with error recovery
4. **Audio Repair/Removal** - Handles corrupted audio tracks

### Analysis Engine
- **6-Phase Analysis Pipeline** - Comprehensive corruption detection
- **Container Analysis** - FFprobe-based structure validation
- **Bitstream Analysis** - Frame-level corruption detection
- **Playability Testing** - Determines how much content is recoverable
- **Repair Feasibility Assessment** - AI-driven repairability scoring

### Command Line Features
- `--repair` - Enable actual repair mode
- `--extract-frames` - Export frames to PNG directory
- `--frame-rate` - Configurable frame extraction rate
- `-r, --recursive` - Recursive directory processing
- `-v, --verbose` - Detailed logging output
- `-d, --detailed` - Extended technical analysis
- `-o, --output` - Custom output directory

### Example Usage
```bash
# Analyze and repair single file
python vidbeast.py --repair video.mp4

# Extract frames for forensic analysis
python vidbeast.py --extract-frames /output/frames/ --frame-rate 1 video.mp4

# Batch repair entire directory
python vidbeast.py --repair -o /repaired/ -r -v /corrupt/videos/
```

---

## [v0.1.0] - 2025-01-29 - "Analysis Engine Foundation"

### Initial Release Features
- **Core Corruption Detection** - Basic analysis engine
- **FFmpeg Integration** - Video analysis backend
- **Corruption Classification** - 5-level severity system (None, Minor, Moderate, Severe, Catastrophic)
- **Technical Reporting** - JSON-formatted analysis results
- **Multi-format Support** - Support for major video containers

### Analysis Capabilities
- File size validation
- Container structure analysis
- Stream integrity checking
- Basic bitstream error detection
- Playability assessment

### Limitations (v0.1.0)
- Analysis-only (no repair functionality)
- Command-line interface only
- Single-threaded processing
- Limited error recovery

---

## Roadmap

### [v2.0.0] - "AI Agent Integration" (Planned)
- **Claude API Integration** - Intelligent corruption analysis
- **Machine Learning Patterns** - Advanced corruption recognition
- **Adaptive Repair Strategies** - AI-selected optimal repair methods
- **Forensic-Grade Analysis** - Expert-level corruption investigation
- **Multi-pass Analysis** - Iterative improvement of repair success

### [v4.0.0] - "Enterprise Features" (Future)
- **Multi-threading** - Parallel processing for large datasets
- **API Server Mode** - REST API for integration
- **Database Integration** - Corruption pattern storage and learning
- **Custom Plugins** - Extensible repair strategy system
- **Distributed Processing** - Network-based processing clusters

---

## Dependencies

### Core Dependencies
- **Python 3.7+** - Runtime environment
- **FFmpeg/FFprobe** - Media analysis and processing
- **Node.js 18+** - Electron GUI runtime (v3.0.0+)
- **Electron 28+** - Desktop application framework (v3.0.0+)

### Optional Dependencies
- **OpenAI API** - GPT-4 integration for AI analysis
- **Google Gemini API** - Advanced AI analysis capabilities
- **Anthropic Claude API** - Expert-level AI analysis

---

## Installation

### VidBeast v3 (Electron GUI)
```bash
cd /Users/heathen-admin/.claude/local/VidBeast/v3-electron/
npm install
npm start
```

### VidBeast v1 (Command Line)
```bash
cd /Users/heathen-admin/.claude/local/VidBeast/v1-script/
python vidbeast.py --help
```

---

## License

MIT License - See LICENSE file for details

## Contributors

- **Claude (Anthropic)** - Core development and architecture
- **Heathen-Admin** - Project vision, testing, and requirements

---

## Acknowledgments

- **HBBatchBeast** - UI/UX inspiration for Electron interface
- **FFmpeg Project** - Core media processing capabilities
- **Electron Framework** - Cross-platform desktop application support