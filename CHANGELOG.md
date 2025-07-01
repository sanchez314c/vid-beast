# VidBeast Changelog

All notable changes to VidBeast - Video Corruption Analysis & Repair Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2026-03-14 20:21] — Neo-Noir Glass Monitor Restyle

### Visual Changes
- Applied Neo-Noir Glass Monitor design system to full UI
- Frameless floating window: `frame: false`, `transparent: true`, `hasShadow: false`, body padding 16px
- Added Linux-specific Chromium flags: `enable-transparent-visuals`, `disable-gpu-compositing`
- Canonical title bar: app icon, VidBeast name in teal, tagline, flat About/Settings icons (gap:2px, margin-right:10px), circular 28px window controls (gap:6px)
- About modal fully styled and wired: opens on ⓘ, closes on X / overlay click / Escape
- Status bar footer: status dot + text + pipe + file count (left), version only in teal (right)
- Glass card system with layered shadows, `::before` inner highlight on all cards
- Status section hero card: 3-layer ambient radial gradient mesh + dot particle grid overlay
- Summary card hero: ambient radial gradient mesh applied
- Result items: upgraded from `--border-subtle` to `--glass-border` + `--shadow-card`
- Scrollbars: invisible at rest, visible on hover (6px, transparent track)
- Complete design token system: 50+ tokens for colors, shadows, radius, spacing, typography

### Bug Fixes
- Wired About modal open/close/overlay-click/Escape handlers in renderer.js (previously unconnected)
- Added `switchToSettings()` global function exposed to `window` (title bar settings gear onclick was undefined)
- Added `open-external` IPC handler in main.js with protocol validation (http/https/mailto only)
- Updated `updateStatus()` to also update canonical `#statusBarText` in footer status bar
- Added `updateStatusBarItems()` function; wired to all file selection paths
- Added `shell` import to main.js (was missing for `open-external` handler)
- Status offline indicator now uses `var(--status-offline)` instead of hardcoded `#52525b`

---

## [AUDIT] - 2026-03-14 - "Forensic Code Quality Audit & Remediation"

### Security Fixes
- **CRITICAL** `src/main.js` — Fixed `save-report` IPC handler missing `event` parameter. `content` was receiving the Electron event object, making all report exports silently produce corrupt files.
- **HIGH** `src/main.js` — Replaced all `exec()` + template literal calls for ffmpeg path verification with safe `spawn()`-based calls. Eliminates potential shell injection if path contains special shell characters.
- **HIGH** `src/main.js` — Added `spawnPromise()` helper; migrated `get-ffmpeg-info` and `check-hw-acceleration` IPC handlers off `execPromise()` with template literals.
- **HIGH** `src/renderer/renderer.js` — Added `escapeHTML()` utility and applied it to all `innerHTML` construction using data from ffprobe stderr output (`result.issues`, `result.recommendations`, `result.corruptionLevel`, file names). Fixes XSS vector in `updateResultsTab` and `generateHTMLReport`.
- **MEDIUM** `src/renderer/renderer.js` — Fixed CSV injection: internal double-quotes in CSV fields are now escaped by doubling per RFC 4180 standard.
- **LOW** `run-source-linux.sh` — Removed hardcoded sudo password (`echo "1234" | sudo -S ...`). Now calls `sudo` directly without piped credentials.

### Bug Fixes
- **CRITICAL** `src/renderer/renderer.js` — Fixed double-counting bug in `ipcRenderer.on('batch-progress')`. Stats (healthy/repairable/corrupted) were being incremented twice per completed file — once in the `status === 'completed'` branch and again in a duplicate block below it. Every file was being counted twice, corrupting all statistics.
- **HIGH** `src/main.js` — Fixed path traversal check in `validatePath()`. Previous check rejected any path containing the string `..` (including filenames with `..` in them). Now correctly checks only for `..` as a discrete path component.
- **HIGH** `src/renderer/renderer.js` — Fixed `startRepairs()` null-crash: `row.querySelector()` called without null check. If a queued file's row is missing from DOM, now skips with a warning instead of throwing.
- **MEDIUM** `src/renderer/renderer.js` — Fixed `clearRepairQueue()` null crash: `document.getElementById('queueBody')` called without null check.
- **MEDIUM** `src/renderer/renderer.js` — Fixed `repairSingleFile()` null crash: `document.getElementById('outputFolder')` called without null check.
- **MEDIUM** `src/renderer/renderer.js` — Fixed `updateResultsTab()` null crash: `resultsDetails` used without null check before `.innerHTML = ''`.
- **MEDIUM** `src/renderer/renderer.js` — Fixed `initializeEventListeners()` null crashes on `enableAdvancedRepair` and `extractFramesOnFailure` elements — both now have null guards.

### Improvements
- **MEDIUM** `src/main.js` — `DEBUG` flag now derived from `process.env.NODE_ENV` instead of hardcoded `true`. Debug logging is suppressed in production builds.
- **npm** — Ran `npm audit fix` (non-breaking). Reduced vulnerability count from 20 to 14. Remaining 14 are all in `electron-builder` build toolchain only (not runtime).

### Audit Report
- Full forensic audit report written to `AUDIT_REPORT.md`

---

## [REPO-PREP] - 2026-02-13 - "Repository Structure Audit & Compliance"

### Added
- **`.gitignore`** - Comprehensive Electron/Node.js ignore patterns with platform-specific exclusions
- **`.env.example`** - Environment configuration template with AI integration, FFmpeg, and performance options

### Status
- Repository compliance audit completed by Master Control
- All essential structural files present and validated
- Tech stack: Electron v38.1.0 + Node.js v22.22.0 + npm v10.9.4
- Dependencies up-to-date, no outdated packages detected
- Health Status: GREEN

---

## [v3.6.0] - 2026-02-08 14:46 - "Dark Neo Glass Restyle"

### Visual Overhaul
- **Dark Neo Glass Theme** - Complete UI restyle to Neo-Noir Glass Monitor design system
- **Frameless Transparent Window** - `frame: false`, `transparent: true`, `hasShadow: false`
- **Floating Glass Panel** - 16px body padding creates desktop wallpaper-visible float effect
- **Custom Window Controls** - Minimize/Maximize/Close buttons with IPC wiring (z-index: 200)
- **Drag Handle** - Full-width 48px drag region (z-index: 50) for window movement
- **Glass Card System** - All panels use gradient backgrounds, layered shadows, and `::before` inner highlights
- **Ambient Gradient Mesh** - Status section and summary cards feature teal/purple/cyan radial gradients
- **Teal Accent System** - Primary accent `#14b8a6` with cyan `#06b6d4` and purple `#8b5cf6` accents

### Design Token System
- Complete `:root` CSS custom property system with 80+ tokens
- Layered shadow system (sm/md/lg/xl/card/card-hover/glow variants)
- Glass effect tokens (bg, border, highlight) that avoid `backdrop-filter` dependency
- Typography scale, spacing scale, transition presets, border-radius tokens

### Technical Changes
- Replaced all hardcoded hex/rgb colors with theme variables across CSS and JS
- Canvas chart colors updated to theme palette (success green, error red, accent teal)
- HTML report exports restyled to match dark theme palette
- Window dimensions adjusted: 1440x920 default, 900x600 minimum
- Linux flags: `disable-gpu-compositing` (NOT `disable-gpu`), `enable-transparent-visuals`
- `experimentalFeatures` explicitly NOT set (documented as IPC-breaking on Linux)
- Scrollbars themed (6px, dark thumb, transparent track)
- Input focus states use teal border + glow shadow

---

## [v3.5.1] - 2026-02-08 - "Port Configuration & Launch Script Optimization"

### Fixed
- **Linux Sandbox Issues** - Added Chromium flags for Linux compatibility
- **Port Conflicts** - Implemented randomized port assignment system
- **Zombie Process Management** - Enhanced process cleanup in launch scripts

### Enhanced
- **Launch Scripts** - Completely rewritten run-source scripts for all platforms
  - `run-source-linux.sh` - Linux-specific with sandbox fix function
  - `run-source-macos.sh` - macOS-optimized process management
  - `run-source-windows.bat` - Windows batch script with port cleanup
- **Port Configuration** - Centralized port management
  - DEV_SERVER_PORT: 56813
  - ELECTRON_DEBUG_PORT: 60799
  - ELECTRON_INSPECT_PORT: 61129
- **Process Cleanup** - Automatic zombie electron/vite process termination
- **Dependency Validation** - Enhanced Node.js/npm version checking

### Technical
- Added `--no-sandbox` flags to Electron commands in package.json
- Injected platform-specific Chromium flags in src/main.js
- Implemented port availability checking and process killing
- Added Linux sandbox fix using sysctl (password: 1234)

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