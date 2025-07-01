# VidBeast Architecture

## Overview

VidBeast is an Electron desktop app. The main process runs in Node.js and owns all file system access, FFmpeg process management, and security logic. The renderer process runs in a sandboxed Chromium context and handles the UI. They talk through Electron's IPC layer.

All video processing happens in the main process by spawning FFmpeg/FFprobe child processes. The renderer never touches files directly.

## High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                 VidBeast App                     │
│                                                  │
│  ┌─────────────────┐    IPC     ┌─────────────┐  │
│  │  Main Process   │ ◄────────► │  Renderer   │  │
│  │  (Node.js)      │            │  (Chromium) │  │
│  └────────┬────────┘            └─────────────┘  │
│           │                                      │
│  ┌────────▼────────┐                             │
│  │ FFmpeg/FFprobe  │                             │
│  │ Child Processes │                             │
│  └─────────────────┘                             │
└──────────────────────────────────────────────────┘
```

## Main Process (`src/main.js`)

Handles the heavy lifting. Key responsibilities:

**Window management**
- Creates `BrowserWindow` with frameless, transparent window settings
- Window dimensions: 1440x920 default, 900x600 minimum
- Wires up custom minimize/maximize/close IPC handlers

**FFmpeg binary resolution**
- Checks for bundled platform-specific binaries first (`resources/binaries/{platform}-{arch}/`)
- Falls back to system FFmpeg if bundled ones are missing or broken
- Platform detection covers `win32`, `darwin` (x64 and arm64), and `linux`

**Analysis pipeline**
- Spawns `ffprobe` to extract stream metadata and container info
- Runs `ffmpeg` with error-detection flags to find bitstream corruption
- Tests playability by decoding a portion of the video
- Scores repairability based on what analysis found
- Reports progress back to renderer via IPC events

**Repair engine**
- Four strategies tried in sequence (or all at once if "try all" is enabled):
  1. Playable portion extraction (save the working section)
  2. Container rebuild (fix MP4/MOV structure)
  3. Stream remuxing (rebuild streams with error recovery)
  4. Audio repair or removal (handle broken audio tracks)
- Frame extraction as a last resort (configurable fps)

**Security**
- Path validation rejects relative paths, `..` traversal, null bytes, paths over 4096 chars
- Video extension whitelist: `.mp4`, `.mov`, `.avi`, `.mkv`, `.m4v`, `.flv`, `.webm`, `.wmv`, `.mpg`, `.mpeg`
- Running FFmpeg process tracking (stored in a `Set`) so they can all be killed on stop
- User-friendly error mapping for common OS errors

**IPC handlers (main process exposes)**
- `ping` - connectivity test
- `select-videos` / `select-folder` / `select-output` - native file/folder dialogs
- `analyze-videos` - kicks off analysis pipeline, returns per-file results
- `repair-video` - runs repair strategies on a single file
- `stop-analysis` - signals running FFmpeg processes to terminate
- `minimize-window`, `maximize-window`, `close-window` - window controls

## Renderer Process (`src/renderer/`)

Pure UI layer. Communicates exclusively through `ipcRenderer.invoke()` and `ipcRenderer.on()`.

**Files:**
- `index.html` - App shell, tab structure, all DOM elements
- `renderer.js` - All UI logic, event handlers, IPC calls, chart rendering
- `preload.js` - Context bridge (currently using direct ipcRenderer for compatibility)
- `styles.css` - Full Neo-Noir glass design system

**UI structure:**
- Frameless window with custom drag handle (48px, full width, z-index 50)
- Custom window controls (min/max/close, z-index 200)
- Five tabs: Corruption Analysis, Repair Queue, Results and Reports, Settings, Help
- Real-time progress chart (Chart.js) throttled to 100ms update intervals
- Stats manager with atomic updates to prevent race conditions on concurrent file processing

**State management:**
- Module-level globals: `currentFiles[]`, `analysisResults[]`, `repairQueue[]`
- `statsManager` object handles shared counters (healthy, repairable, corrupted, repaired)
- Promise timeout wrapper (30s default) prevents hanging IPC calls
- `isAnalyzing` / `isRepairing` flags gate UI controls

## Data Flow

**Analysis:**
```
User selects files/folder
        │
Renderer calls analyze-videos (IPC)
        │
Main process validates paths, builds file list
        │
For each file: ffprobe → ffmpeg decode test → score
        │
Progress events stream back to renderer (ipc: analysis-progress)
        │
Final results returned, renderer updates results table
```

**Repair:**
```
User queues files for repair
        │
Renderer calls repair-video per file (IPC)
        │
Main process tries strategies in order
        │
On each attempt: spawn ffmpeg, pipe stderr for progress
        │
Progress events → renderer updates repair queue status
        │
Success/failure result returned, next file starts
```

## Design Decisions

**Single main.js for core logic**
The main process logic lives in one file rather than split across modules. This keeps the IPC handler registration and FFmpeg process management co-located, which makes process cleanup (on stop or app quit) straightforward. The `runningProcesses` Set and `shouldStopAnalysis` flag are shared across all handlers without needing inter-module state.

**Bundled FFmpeg binaries**
Each platform gets its own FFmpeg/FFprobe binaries in `resources/binaries/`. This avoids requiring users to install FFmpeg separately and ensures a known-good version. The fallback to system FFmpeg handles edge cases (missing binaries, wrong arch).

**No preload context bridge (current state)**
The renderer currently uses `require('electron').ipcRenderer` directly instead of a context bridge. This works but means `nodeIntegration` is on in the renderer. This is a known trade-off documented in the CHANGELOG; context isolation was causing IPC breakage on some configurations.

**Stats manager pattern**
Concurrent file analysis was causing race conditions on shared DOM counters. A simple `statsManager` object with an `_updating` lock flag solves this without adding a state management library.

**Neo-Noir glass design**
The UI uses a custom CSS design system with 80+ CSS custom properties. All colors, shadows, and layout tokens are centralized in `:root`. Canvas chart colors, HTML report exports, and component styles all reference the same variables. No `backdrop-filter` dependency (documented as unreliable on Linux Electron).

**Linux-specific flags**
`--disable-gpu-compositing` is set instead of `--disable-gpu` because the latter breaks transparent window compositing. `--enable-transparent-visuals` is required for the frameless transparent window on Linux. `experimentalFeatures` is explicitly left unset because it was breaking IPC communication.

## Directory Structure

```
vid-beast/
├── src/
│   ├── main.js             # Main process: window, IPC, FFmpeg, file ops
│   ├── renderer/           # Renderer process bundle
│   │   ├── index.html      # App shell and all DOM
│   │   ├── renderer.js     # UI logic and IPC client
│   │   ├── preload.js      # Electron preload script
│   │   └── styles.css      # Full design system CSS
│   ├── components/         # Reusable UI components
│   ├── services/           # Business logic (analyzers, repair workers)
│   ├── lib/                # Core utility libraries
│   ├── utils/              # Helpers (formatting, validation)
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Shared constants
│   └── sources/            # Legacy Python script, reference material
├── resources/
│   └── binaries/           # Platform FFmpeg binaries (bundled)
│       ├── darwin-arm64/
│       ├── darwin-x64/
│       ├── linux-x64/
│       └── win32-x64/
├── build_resources/
│   ├── icons/              # Platform app icons
│   └── screenshots/        # App screenshots for docs
├── config/                 # Runtime config files
├── scripts/                # Build and launch scripts
├── docs/                   # Extended documentation
├── legacy/                 # Archived v1 Python scripts
├── tests/                  # Test suite
├── archive/                # Old backups and archived files
├── package.json            # Dependencies and npm scripts
├── electron-builder.json   # Build config (when not in package.json)
└── tsconfig.json           # TypeScript config
```

## Security Architecture

**Input validation (main process)**
- All paths from the renderer go through `validatePath()` before any fs or exec call
- Extension whitelist checked via `validateVideoExtension()`
- FFmpeg command arguments are passed as arrays to `spawn()`, not interpolated into shell strings, preventing command injection

**Process isolation**
- Renderer runs in Chromium sandbox with limited privileges
- FFmpeg runs as separate child processes with no elevated permissions
- All child process references tracked; killed cleanly on stop/quit

**Error handling**
- `getUserFriendlyError()` maps OS error codes to readable messages without leaking internal paths or system info
- All async IPC handlers are wrapped in try/catch; errors returned as structured objects, not thrown across the IPC boundary
