# VidBeast v1.0 - Script Version
## Video Corruption Analysis & Repair Engine

**The first version of VidBeast - a pure Python script for deep video corruption analysis.**

---

## 🎯 **What VidBeast v1 Does**

### **Deep Corruption Detection**
- **File Size Analysis**: Detects suspiciously small files (< 100KB)
- **Container Validation**: MP4/MOV structure analysis via FFprobe
- **Stream Integrity**: Video/audio stream validation
- **Bitstream Analysis**: Frame-level error detection using FFmpeg
- **Playability Testing**: Determines how much of video is actually playable

### **Intelligent Analysis**
- **Multi-Phase Detection**: 6-phase comprehensive analysis
- **Error Classification**: Container, stream, bitstream, audio, metadata corruption types
- **Severity Levels**: None, Minor, Moderate, Severe, Catastrophic
- **Repair Recommendations**: Actionable suggestions for each corruption type

---

## 🚀 **Installation & Usage**

### **Prerequisites**
```bash
# Install FFmpeg (required)
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu
```

### **Basic Usage**
```bash
# Analyze single file
python vidbeast.py video.mp4

# Analyze and REPAIR single file
python vidbeast.py --repair video.mp4

# Analyze directory
python vidbeast.py /path/to/videos/

# Repair entire directory with output folder
python vidbeast.py --repair -o /repaired/videos/ -r -v /path/to/videos/
```

### **Command Line Options**
- `-v, --verbose`: Verbose logging output
- `-d, --detailed`: Show detailed technical analysis
- `-r, --recursive`: Process directories recursively  
- `-o, --output`: Output directory for repaired files
- `--repair`: Enable repair mode - actually fix corrupted files

---

## 🔍 **Analysis Phases**

### **Phase 1: Basic File Validation**
- File size checks
- Format validation
- Zero-byte detection

### **Phase 2: Container Analysis**  
- FFprobe structure validation
- Stream count verification
- Metadata extraction

### **Phase 3: Stream Analysis**
- Video codec validation
- Audio stream integrity
- Dimension/bitrate checks

### **Phase 4: Bitstream Analysis**
- Frame-level error detection
- NAL unit validation (H.264/HEVC)
- AAC audio corruption detection

### **Phase 5: Playability Testing**
- Full decode attempt
- Partial playability detection
- Duration calculation

### **Phase 6: Repair Recommendations**
- Corruption-specific suggestions
- Repair feasibility assessment
- Recovery strategy guidance

---

## 📊 **Sample Output**

```
██╗   ██╗██╗██████╗ ██████╗ ███████╗ █████╗ ███████╗████████╗
VidBeast v1.0.0 - Video Corruption Analysis & Repair Engine

📁 File: corrupted_video.mp4
📏 Size: 254,564,822 bytes (242.8 MB)
🎯 Corruption Level: MODERATE
🔍 Corruption Types: bitstream, audio
▶️  Playable: Yes
⏱️  Playable Duration: 45.2s
📊 Playable Percentage: 43.8%
🔧 Repair Feasible: Yes

💡 Repair Recommendations:
   1. NAL unit errors detected - attempt frame extraction
   2. AAC audio corruption - try audio stream replacement
   3. Partial recovery possible - extract first 45.2 seconds
```

---

## 🧪 **Testing with Your Corrupted Files**

### **Test Cases Ready**
```bash
# Analyze and repair the files that were incorrectly flagged
python vidbeast.py --repair "/Volumes/mpRAID/media/Movies/LIFE/Output/corrupt/Videos/2020/2020-05-13_01-58-54.mp4"

# Repair the partially playable file
python vidbeast.py --repair "/Volumes/mpRAID/media/Movies/LIFE/Output/corrupt/Videos/2020/2020-11-08_00-10-11.mp4"

# Batch repair HBBatchBeast corruption examples
python vidbeast.py --repair -r -v "/Users/heathen-admin/HBBatchBeast-master/HBBatchBeast/TestInputFolder/"

# Repair entire corrupt collection to specific output folder
python vidbeast.py --repair -o ~/Desktop/VidBeast_Repaired/ -r -v "/Volumes/mpRAID/media/Movies/LIFE/Output/corrupt/Videos/"
```

---

## 🔧 **Features Implemented**

### ✅ **Detection Engine**
- [x] File size validation
- [x] FFprobe container analysis
- [x] Stream integrity checking
- [x] Bitstream error detection
- [x] Playability testing
- [x] Multi-level corruption classification

### ✅ **Analysis & Reporting**
- [x] Detailed corruption reports
- [x] JSON-formatted technical data
- [x] Human-readable summaries
- [x] Repair feasibility assessment
- [x] Actionable recommendations

### ✅ **Repair Engine**
- [x] Extract playable portions from corrupted videos
- [x] Container structure repair (MP4/MOV)
- [x] Stream remuxing and reconstruction
- [x] Audio repair/removal for corrupted audio
- [x] Multiple repair strategies per file
- [x] Automatic output file management

### 🔄 **Coming in v2 (AI Agent)**
- [ ] Intelligent repair strategy selection
- [ ] Machine learning corruption pattern recognition
- [ ] Adaptive analysis based on file type
- [ ] Claude API integration for complex decisions

### 📋 **Coming in v3 (Electron GUI)**
- [ ] Visual corruption heatmaps
- [ ] Drag & drop interface
- [ ] Batch processing queue
- [ ] Real-time progress tracking
- [ ] Repair execution engine

---

## 💻 **Technical Architecture**

### **Core Classes**
- `VidBeast`: Main analysis engine
- `CorruptionReport`: Analysis results dataclass
- `CorruptionLevel`: Severity enumeration
- `CorruptionType`: Classification enumeration

### **Analysis Pipeline**
```
Input File → Basic Validation → Container Analysis → 
Stream Analysis → Bitstream Analysis → Playability Test → 
Repair Recommendations → Report Generation
```

### **Dependencies**
- **Python 3.7+**: Core runtime
- **FFmpeg/FFprobe**: Media analysis backend
- **Standard Library**: JSON, subprocess, argparse, pathlib

---

## 🐛 **Known Issues & Limitations**

### **Current Limitations**
- **Limited codec support**: Focused on H.264/HEVC and AAC
- **Single-threaded**: No multiprocessing (yet)
- **Basic bitstream analysis**: Uses FFmpeg error output as proxy
- **Repair success varies**: Some files may be too corrupted to repair

### **False Positive Fixes**
- Improved file size thresholds
- Better playability detection
- Enhanced stream validation
- Timeout handling for hanging processes

---

## 🛣️ **Roadmap to v2 & v3**

### **v1 → v2 Migration**
- Add Claude API integration for intelligent analysis
- Implement machine learning pattern recognition
- Enhanced repair strategy selection
- Adaptive analysis workflows

### **v2 → v3 Migration**  
- Electron GUI framework
- Visual analysis dashboard
- Real-time processing interface
- Batch repair execution

---

## 🎮 **Quick Start**

```bash
# Clone and test immediately
cd /Users/heathen-admin/.claude/local/VidBeast/v1-script/
python vidbeast.py --help

# Test with your corrupt files
python vidbeast.py -v -d "/path/to/corrupted/video.mp4"

# Batch analyze entire directory
python vidbeast.py -r -v "/Volumes/mpRAID/media/Movies/LIFE/Output/corrupt/"
```

**VidBeast v1 is ready to analyze your corrupted videos with surgical precision!** 🔬🎬