# VidBeast - Product Requirements Document

## Executive Summary

VidBeast is a comprehensive video corruption detection, analysis, and repair engine built on cutting-edge binary-level analysis techniques. Unlike commercial "video repair" software that relies on simple container fixes, VidBeast performs deep bitstream analysis and reconstruction at the codec level.

**Mission:** Rescue corrupted video files that other tools abandon as "unrecoverable."

**Version:** 3.5+  
**Date:** October 31, 2025  
**Product:** VidBeast  
**Team:** Video Processing & Repair Division  

---

## Problem Statement

### Current State
- **Existing tools are shallow**: Most "video repair" software only fixes container issues
- **False positives plague detection**: Current corruption detection misses real corruption while flagging good files
- **Partial corruption goes undetected**: Videos that play partially but fail mid-stream
- **No granular analysis**: Users can't understand WHY their video is corrupted
- **No repair capabilities**: Detection without repair is useless
- **Duplicate content waste**: Users have multiple versions of similar videos consuming storage

### Pain Points
1. **150MB video flagged as corrupt but plays perfectly** ❌
2. **254MB video plays for 60 seconds then freezes** ❌  
3. **Tiny 4KB files masquerading as videos** ❌
4. **No way to salvage partially corrupted content** ❌
5. **No insights into corruption patterns** ❌
6. **Multiple duplicate videos wasting storage space** ❌

---

## Product Vision

**"The ultimate video forensics and repair toolkit that recovers the unrecoverable while optimizing storage efficiency."**

VidBeast will be the **definitive solution** for:
- **Forensic-level corruption analysis**
- **Deep bitstream repair capabilities** 
- **Intelligent corruption detection**
- **Professional-grade video recovery**
- **Advanced duplicate detection and management**

---

## Target Audience

### Primary Users
1. **Media Professionals** - Editors, archivists, content creators
2. **IT Professionals** - System administrators dealing with corrupted media libraries
3. **Digital Forensics** - Investigators recovering damaged evidence
4. **Power Users** - Tech enthusiasts with large media collections

### Secondary Users
1. **Content Studios** - Post-production houses with damaged footage
2. **Broadcasters** - TV/streaming companies with archive corruption
3. **Government Agencies** - Military/intelligence video recovery needs

---

## Core Features & Requirements

### 🔍 Tier 1: Detection & Analysis Engine

#### Smart Corruption Detection
- **File Size Analysis**: Detect suspiciously small files (< 100KB auto-flag)
- **Container Validation**: MP4/MOV atom structure verification
- **Stream Integrity**: Deep FFprobe analysis with timeout handling
- **Bitstream Analysis**: NAL unit validation for H.264/HEVC
- **Frame Continuity**: Detect mid-stream corruption via frame analysis
- **False Positive Elimination**: Advanced heuristics to avoid flagging good files

#### Comprehensive Analysis Dashboard
- **Corruption Heatmap**: Visual representation of where corruption occurs
- **Bitstream Viewer**: Hex dump with codec-aware highlighting
- **Stream Statistics**: Detailed codec parameters and integrity metrics
- **Frame Analysis**: Individual frame inspection and validation
- **Repair Feasibility Score**: AI-driven assessment of repairability

### 🛠️ Tier 2: Repair Engine

#### Container Repair
- **MP4 Atom Reconstruction**: Rebuild broken moov/mdat structures
- **Index Table Repair**: Fix stco, stsc, stsz corruption
- **Header Recovery**: Reconstruct missing ftyp headers
- **Timestamp Correction**: Fix broken PTS/DTS sequences

#### Stream Repair
- **NAL Unit Recovery**: Extract valid H.264/HEVC units from corruption
- **Parameter Set Reconstruction**: Rebuild SPS/PPS headers
- **Frame Extraction**: Salvage decodable I-frames from damaged streams
- **Audio Cleanup**: AAC frame repair and channel reconstruction

#### Advanced Recovery
- **Partial File Salvage**: Extract playable content from corrupted videos
- **Cross-Reference Repair**: Use multiple corrupted copies to reconstruct complete file
- **Intelligent Interpolation**: Fill gaps using adjacent frame data
- **Quality Assessment**: Post-repair validation and quality metrics

### 🔄 Tier 3: Duplicate Detection & Management (v3.5+)

#### Perceptual Hashing Engine
- **Video Fingerprinting**: Advanced perceptual hashing for visual similarity
- **Frame Sampling**: Strategic frame extraction (10%, 25%, 50%, 75%, 90%)
- **Similarity Scoring**: Calculate similarity percentage between video pairs
- **Resolution Independence**: Detect duplicates across different resolutions/bitrates
- **Watermark Resilience**: Identify duplicates even with watermarks or minor edits

#### Duplicate Management Interface
- **Visual Comparison**: Side-by-side thumbnail comparison
- **Batch Operations**: Bulk delete, move, or archive duplicates
- **Smart Grouping**: Automatic grouping of similar content
- **User Control**: Configurable similarity thresholds (70-100%)
- **Scan Performance**: Parallel processing with configurable thread count

### 🖥️ Tier 4: User Interface

#### Electron-Based GUI
- **Modern Dark Theme**: Professional video editing aesthetic
- **Drag & Drop Interface**: Intuitive file input
- **Real-Time Progress**: Live analysis and repair progress
- **Tabbed Workspace**: Multiple files, analysis views, repair queues, duplicate finder
- **Export Options**: Multiple output formats and quality settings

#### Analysis Views
- **File Tree**: Hierarchical view of media collections
- **Corruption Dashboard**: Summary statistics and health scores
- **Repair Queue**: Batch processing with priority management
- **Duplicate Finder**: Dedicated duplicate detection and management interface
- **Log Viewer**: Detailed technical logs and error reports
- **Settings Panel**: Advanced configuration options

---

## Technical Architecture

### Core Engine (Node.js Backend)
```
VidBeast Core/
├── Detection Engine/
│   ├── ContainerAnalyzer.js
│   ├── StreamValidator.js
│   ├── BitstreamAnalyzer.js
│   └── CorruptionClassifier.js
├── Repair Engine/
│   ├── ContainerRepair.js
│   ├── StreamReconstruction.js
│   ├── FrameExtractor.js
│   └── QualityValidator.js
├── Duplicate Detection/
│   ├── PerceptualHasher.js
│   ├── FrameSampler.js
│   ├── SimilarityCalculator.js
│   └── DuplicateGroupManager.js
├── Media Processing/
│   ├── FFprobeWrapper.js
│   ├── HexAnalyzer.js
│   ├── CodecParser.js
│   └── TimeoutManager.js
└── Utils/
    ├── BinaryUtils.js
    ├── LoggingSystem.js
    └── ProgressTracker.js
```

### Frontend (Electron + React)
```
VidBeast UI/
├── Components/
│   ├── FileDropzone.jsx
│   ├── AnalysisDashboard.jsx
│   ├── RepairQueue.jsx
│   ├── BitstreamViewer.jsx
│   ├── DuplicateFinder.jsx
│   └── ProgressIndicator.jsx
├── Pages/
│   ├── MainWindow.jsx
│   ├── AnalysisView.jsx
│   ├── RepairView.jsx
│   ├── DuplicateView.jsx
│   └── SettingsView.jsx
└── Services/
    ├── IpcBridge.js
    ├── FileManager.js
    └── StateManager.js
```

---

## User Experience Flow

### Primary Workflows

#### Corruption Analysis & Repair
1. **File Input** → Drag corrupted video(s) into VidBeast
2. **Auto-Analysis** → Real-time corruption detection and classification
3. **Detailed Report** → Comprehensive corruption analysis with repair recommendations
4. **Repair Selection** → Choose repair strategies (conservative vs aggressive)
5. **Batch Process** → Execute repairs with live progress tracking
6. **Quality Validation** → Post-repair verification and quality assessment
7. **Export Results** → Save repaired files with detailed repair logs

#### Duplicate Detection & Management
1. **Directory Selection** → Choose folders to scan for duplicates
2. **Configuration** → Set similarity threshold and scan options
3. **Scan Execution** → Parallel processing with real-time progress
4. **Results Review** → Visual comparison of detected duplicates
5. **Action Selection** → Choose keep/delete/move actions for each group
6. **Batch Operations** → Execute selected actions with confirmation
7. **Storage Recovery** → View space savings and cleanup results

### Advanced Workflows
- **Forensic Mode**: Deep analysis for legal/evidence purposes
- **Batch Mode**: Process entire directories with intelligent prioritization
- **Comparison Mode**: Analyze multiple versions of same corrupted file
- **Archive Mode**: Systematic analysis of large media libraries
- **Duplicate Resolution**: Smart rules for automatic duplicate handling

---

## Success Metrics

### Technical KPIs
- **Detection Accuracy**: > 99% (minimal false positives/negatives)
- **Repair Success Rate**: > 75% for partially corrupted files
- **Duplicate Detection Accuracy**: > 95% with < 5% false positives
- **Processing Speed**: 10x faster than existing solutions
- **File Format Support**: MP4, MOV, AVI, MKV, FLV coverage

### User Experience KPIs
- **Time to First Analysis**: < 5 seconds for typical files
- **Repair Queue Throughput**: Process 100+ files/hour
- **Duplicate Scan Performance**: 1000 videos in under 10 minutes
- **User Satisfaction**: Professional-grade interface feedback
- **Feature Adoption**: 80% of users utilize advanced analysis features

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4) ✅
- ✅ Core detection engine with FFprobe integration
- ✅ Basic container analysis (MP4/MOV focus)
- ✅ Electron GUI framework setup
- ✅ File input and basic analysis display

### Phase 2: Deep Analysis (Weeks 5-8) ✅
- ✅ Advanced bitstream analysis engine
- ✅ NAL unit parsing and validation
- ✅ Corruption heatmap visualization
- ✅ Frame-level analysis tools

### Phase 3: Repair Engine (Weeks 9-12) ✅
- ✅ Container repair algorithms
- ✅ Stream reconstruction logic
- ✅ Frame extraction and salvage
- ✅ Quality validation system

### Phase 4: Duplicate Detection (Weeks 13-16) 🔄
- 🔄 Perceptual hashing implementation
- 🔄 Frame sampling and comparison engine
- 🔄 Duplicate finder UI components
- 🔄 Batch duplicate management features

### Phase 5: Polish & Power Features (Weeks 17-20) 📋
- 📋 Batch processing optimization
- 📋 Advanced repair strategies
- 📋 Professional reporting features
- 📋 Performance optimization

---

## Technical Requirements

### Dependencies
- **Node.js** >= 24.x
- **Electron** >= 38.x
- **FFmpeg/FFprobe** (bundled)
- **ExifTool** (for metadata)
- **React** >= 18.x (UI framework)
- **jimp/sharp** (image processing for duplicate detection)

### System Requirements
- **Memory**: 8GB+ RAM (16GB+ recommended for large files)
- **Storage**: 2GB application + temp space for repairs
- **CPU**: Multi-core x64 processor (optimization for 12+ cores)
- **OS**: Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)

### External Integrations
- **HBBatchBeast Inspiration**: UI/UX patterns and workflow concepts
- **MediaInfo Library**: Deep media analysis capabilities
- **Binary Analysis Libraries**: Custom hex parsing and manipulation
- **Video Duplicate Finder**: Perceptual hashing algorithms

---

## Competitive Analysis

### Current Solutions & Limitations
| Tool | Strengths | Weaknesses |
|------|-----------|------------|
| **Commercial "Video Repair"** | Easy to use | Shallow analysis, container-only fixes |
| **FFmpeg CLI** | Powerful, flexible | Command-line only, no repair features |
| **MediaInfo** | Excellent analysis | Read-only, no repair capabilities |
| **Hex Editors** | Raw access | Manual process, requires expertise |
| **Duplicate Finders** | File-based duplicates | No visual similarity detection |

### VidBeast Advantages
- ✅ **Deep bitstream analysis** vs surface-level container fixes
- ✅ **Intelligent repair algorithms** vs simple file concatenation  
- ✅ **Professional GUI** vs command-line complexity
- ✅ **Batch processing** vs single-file limitations
- ✅ **Forensic-grade analysis** vs basic file validation
- ✅ **Visual duplicate detection** vs exact file matching only

---

## Business Considerations

### Monetization Strategy
- **Freemium Model**: Basic analysis free, advanced repair features paid
- **Professional License**: Full feature set for media professionals
- **Enterprise License**: Batch processing, API access, custom integrations
- **Forensic License**: Specialized features for legal/investigative use

### Pricing Tiers
- **Free**: Basic corruption detection, simple repairs, basic duplicate finder
- **Pro ($99)**: Advanced analysis, all repair features, batch processing, advanced duplicate detection
- **Enterprise ($499)**: API access, custom integrations, priority support
- **Forensic ($999)**: Chain of custody, detailed reporting, expert consultation

---

## Security & Privacy

### Data Protection
- **Local Processing**: All analysis performed locally, no cloud uploads
- **Secure Temp Files**: Encrypted temporary files during processing
- **Chain of Custody**: Forensic-grade audit trails for legal use
- **Privacy First**: No telemetry, no usage tracking without explicit consent

### File Integrity
- **Original Preservation**: Never modify source files
- **Checksum Validation**: Cryptographic hashes for integrity verification
- **Backup Creation**: Automatic backup before any repair attempts
- **Version Control**: Track repair iterations and rollback capabilities

---

## Launch Strategy

### Beta Program
- **Target Audience**: Video professionals, digital forensics experts
- **Feature Focus**: Core detection, repair, and duplicate detection capabilities
- **Feedback Channels**: Discord community, GitHub issues, direct contact
- **Timeline**: 4-week beta, 2-week feedback incorporation

### Go-to-Market
- **Content Marketing**: Technical blog posts, YouTube tutorials
- **Community Engagement**: Reddit, video editing forums, professional networks
- **Partnership Strategy**: Collaborate with video editing software vendors
- **Conference Presence**: NAB Show, IBC, digital forensics conferences

---

## Contact & Resources

**Project Lead**: Claude & Heathen-Admin  
**Repository**: `/Volumes/apfsRAID/Development/Github/vid-beast/`  
**Inspiration**: HBBatchBeast, FFmpeg, Video Duplicate Finder, Professional video tools  
**Target Launch**: Q2 2025  

---

*"VidBeast: Because every corrupted video deserves a second chance, and every duplicate deserves proper management."* 🎬🔧🔄