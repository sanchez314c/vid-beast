# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VidBeast is an advanced video corruption analysis and repair engine with FFmpeg integration. Built as a cross-platform Electron desktop application, VidBeast provides professional-grade tools for video processing, corruption detection, and automated repair workflows. The application serves video professionals, content creators, and technical users who need to analyze and repair corrupted video files.

## Development Commands

### Core Development Workflow
```bash
# Start development server with logging
npm run dev

# Standard application start
npm start

# Install dependencies
npm install

# Clean build artifacts and logs
npm run clean
```

### Build & Distribution
```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:mac              # macOS build
npm run build:mac:universal    # Universal macOS build (Intel + ARM)
npm run build:win              # Windows build
npm run build:linux            # Linux build

# Comprehensive builds
npm run build:all              # All platforms

# Distribution packages
npm run dist                   # Same as build:all
npm run dist:mac               # macOS distribution
npm run dist:win               # Windows distribution
npm run dist:linux             # Linux distribution

# Release preparation
npm run release                # Build all platforms for release
```

### Development Scripts
```bash
# Run from source (development)
./scripts/run-macos-source.sh      # macOS development
scripts\run-windows-source.bat      # Windows development
./scripts/run-linux-source.sh       # Linux development

# Run compiled binaries (production)
./scripts/run-macos.sh              # macOS production
scripts\run-windows.bat              # Windows production
./scripts/run-linux.sh               # Linux production
```

## Architecture Overview

### Electron Application Structure
```
VidBeast/
├── src/
│   ├── main.js                    # Electron main process (51KB+)
│   ├── renderer/                 # Renderer process UI
│   │   ├── index.html           # Main UI
│   │   ├── renderer.js          # Renderer logic
│   │   └── styles.css           # UI styling
│   ├── components/              # Reusable UI components
│   ├── services/                # Business logic services
│   ├── lib/                     # Core libraries
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript definitions
│   ├── constants/               # Application constants
│   └── sources/                 # Source configuration
├── assets/                      # Static assets
├── resources/                   # Application resources
├── scripts/                     # Build and run scripts
└── dist/                        # Built applications
```

### Core Technologies
- **Electron v38.1.0**: Cross-platform desktop framework
- **FFmpeg**: Video processing and analysis engine
- **JavaScript**: Core application language with TypeScript configuration
- **Node.js**: Backend runtime and file system operations
- **electron-builder**: Multi-platform build and distribution

### Process Architecture
```
┌─────────────────────────────────────┐
│           Main Process              │
├─────────────────────────────────────┤
│ • FFmpeg process management         │
│ • File system operations           │
│ • Video analysis coordination        │
│ • IPC communication handling         │
│ • Window and application lifecycle  │
└─────────────────────────────────────┘
             ▲ IPC
             │
┌─────────────────────────────────────┐
│         Renderer Process            │
├─────────────────────────────────────┤
│ • Video analysis UI                 │
│ • Progress tracking                 │
│ • User input handling               │
│ • Real-time status updates          │
└─────────────────────────────────────┘
```

## Implementation Details

### FFmpeg Integration
```javascript
// FFmpeg process management
function runFFmpeg(args, options = {}) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });

    ffmpeg.stdout.on('data', (data) => {
      // Process FFmpeg output
      if (options.onProgress) {
        options.onProgress(data.toString());
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      // Process FFmpeg error output
      if (options.onError) {
        options.onError(data.toString());
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}
```

### Video Analysis Engine
```javascript
// Core video corruption detection
class VideoAnalyzer {
  async analyzeVideo(filePath) {
    const analysis = {
      duration: null,
      bitrate: null,
      codec: null,
      resolution: null,
      corruption: [],
      metadata: {}
    };

    // Use FFprobe for technical analysis
    const probeResult = await this.runFFprobe([
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    // Analyze for corruption indicators
    analysis.corruption = await this.detectCorruption(probeResult);

    return analysis;
  }

  async detectCorruption(probeData) {
    const issues = [];

    // Check for common corruption indicators
    if (probeData.format.duration === 'N/A') {
      issues.push('Invalid duration - possible header corruption');
    }

    if (probeData.format.size === '0') {
      issues.push('Zero file size - completely corrupted');
    }

    // Analyze stream integrity
    probeData.streams.forEach(stream => {
      if (stream.codec_name === 'unknown') {
        issues.push(`Unknown codec in stream ${stream.index}`);
      }
    });

    return issues;
  }
}
```

### Security Model
```javascript
// Path validation and sanitization
function validatePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path: path must be a non-empty string');
  }

  // Prevent path traversal attacks
  if (inputPath.includes('..')) {
    throw new Error('Invalid path: path traversal detected');
  }

  // Normalize path
  const normalizedPath = path.normalize(inputPath);

  // Additional security checks
  if (!normalizedPath.startsWith('/') && !normalizedPath.match(/^[A-Za-z]:/)) {
    throw new Error('Invalid path: must be absolute path');
  }

  return normalizedPath;
}

// User-friendly error mapping
function getUserFriendlyError(error) {
  const errorMap = {
    'ENOENT': 'File or directory not found. Please check the path and try again.',
    'EACCES': 'Permission denied. Please check file permissions.',
    'ENOSPC': 'Not enough disk space to complete operation.',
    'EMFILE': 'Too many files open. Please close some applications and try again.',
    'spawn ffmpeg ENOENT': 'FFmpeg not found. Please install FFmpeg and ensure it\'s in your PATH.',
    'spawn ffprobe ENOENT': 'FFprobe not found. Please install FFmpeg and ensure it\'s in your PATH.'
  };

  return errorMap[error.code] || `An error occurred: ${error.message}`;
}
```

## Key Features Implementation

### Video Processing Workflows
```javascript
// Main video repair workflow
class VideoRepairEngine {
  async repairVideo(inputPath, outputPath, options = {}) {
    try {
      // 1. Analyze input video
      const analysis = await this.analyzeVideo(inputPath);

      // 2. Determine repair strategy
      const repairStrategy = this.determineRepairStrategy(analysis);

      // 3. Execute repair process
      await this.executeRepair(inputPath, outputPath, repairStrategy);

      // 4. Verify repair success
      const verification = await this.verifyRepair(outputPath);

      return {
        success: true,
        analysis,
        verification
      };
    } catch (error) {
      return {
        success: false,
        error: getUserFriendlyError(error)
      };
    }
  }

  determineRepairStrategy(analysis) {
    const strategy = {
      reencode: false,
      remux: false,
      fixTimestamps: false,
      repairHeaders: false
    };

    // Determine repair actions based on analysis
    if (analysis.corruption.includes('header corruption')) {
      strategy.repairHeaders = true;
    }

    if (analysis.corruption.includes('timestamp issues')) {
      strategy.fixTimestamps = true;
    }

    return strategy;
  }
}
```

### IPC Communication
```javascript
// Main process IPC handlers
ipcMain.handle('video:analyze', async (event, filePath) => {
  try {
    const validatedPath = validatePath(filePath);
    const analysis = await videoAnalyzer.analyzeVideo(validatedPath);
    return { success: true, data: analysis };
  } catch (error) {
    return { success: false, error: getUserFriendlyError(error) };
  }
});

ipcMain.handle('video:repair', async (event, inputPath, outputPath, options) => {
  try {
    const validatedInput = validatePath(inputPath);
    const validatedOutput = validatePath(outputPath);
    const result = await repairEngine.repairVideo(validatedInput, validatedOutput, options);
    return result;
  } catch (error) {
    return { success: false, error: getUserFriendlyError(error) };
  }
});

// Progress reporting
ipcMain.handle('video:getProgress', (event) => {
  return currentProgress;
});
```

### Progress Tracking
```javascript
// Real-time progress tracking
class ProgressTracker {
  constructor() {
    this.currentProgress = 0;
    this.totalWork = 0;
    this.currentStage = '';
  }

  updateProgress(current, total, stage) {
    this.currentProgress = current;
    this.totalWork = total;
    this.currentStage = stage;

    const percentage = total > 0 ? (current / total) * 100 : 0;

    // Send progress to renderer
    if (mainWindow) {
      mainWindow.webContents.send('progress:update', {
        percentage,
        stage,
        current,
        total
      });
    }
  }
}
```

## Build System Configuration

### Electron Builder Configuration
```json
{
  "build": {
    "appId": "com.vidbeast.app",
    "productName": "VidBeast",
    "copyright": "Copyright © 2025 VidBeast Team",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "assets/**/*",
      "resources/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.video",
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "linux": {
      "target": [
        { "target": "AppImage", "arch": ["x64"] },
        { "target": "deb", "arch": ["x64"] }
      ]
    }
  }
}
```

### FFmpeg Binary Distribution
```javascript
// Platform-specific FFmpeg binary management
function getFFmpegPath() {
  const platform = process.platform;
  const arch = process.arch;

  const binaryMap = {
    'darwin': {
      'x64': 'resources/ffmpeg/mac/ffmpeg',
      'arm64': 'resources/ffmpeg/mac-arm64/ffmpeg'
    },
    'win32': {
      'x64': 'resources/ffmpeg/windows/ffmpeg.exe',
      'ia32': 'resources/ffmpeg/windows/ffmpeg.exe'
    },
    'linux': {
      'x64': 'resources/ffmpeg/linux/ffmpeg',
      'arm64': 'resources/ffmpeg/linux-arm64/ffmpeg'
    }
  };

  return binaryMap[platform]?.[arch];
}
```

## Development Patterns

### Error Handling Strategy
```javascript
// Comprehensive error handling with user-friendly messages
async function handleVideoOperation(operation, ...args) {
  try {
    debugLog(`Starting operation: ${operation}`);
    const result = await operation(...args);
    debugLog(`Operation completed successfully: ${operation}`);
    return { success: true, data: result };
  } catch (error) {
    debugLog(`Operation failed: ${operation}`, error);

    // Log technical details
    console.error('Technical error details:', {
      operation,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Return user-friendly error
    return {
      success: false,
      error: getUserFriendlyError(error),
      technical: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}
```

### Performance Optimization
```javascript
// Memory-efficient video processing
class VideoProcessor {
  constructor() {
    this.maxConcurrentProcesses = 2;
    this.activeProcesses = new Set();
  }

  async processVideo(filePath) {
    // Wait if too many active processes
    while (this.activeProcesses.size >= this.maxConcurrentProcesses) {
      await this.waitForProcessSlot();
    }

    const processId = Date.now().toString();
    this.activeProcesses.add(processId);

    try {
      return await this.executeProcessing(filePath, processId);
    } finally {
      this.activeProcesses.delete(processId);
    }
  }

  async executeProcessing(filePath, processId) {
    // Stream processing for large files
    const stream = fs.createReadStream(filePath, {
      highWaterMark: 1024 * 1024 // 1MB chunks
    });

    return new Promise((resolve, reject) => {
      // Process stream in chunks
      stream.on('data', (chunk) => {
        // Process chunk
      });

      stream.on('end', () => {
        resolve();
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
```

### Logging System
```javascript
// Configurable logging system
const DEBUG = true;
const VERBOSE_PROGRESS = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', new Date().toISOString(), ...args);
  }
}

function progressLog(...args) {
  if (VERBOSE_PROGRESS) {
    console.log('[PROGRESS]', new Date().toISOString(), ...args);
  }
}

// File-based logging for production
function logToFile(message, level = 'info') {
  const logFile = path.join(app.getPath('logs'), `vidbeast-${new Date().toISOString().split('T')[0]}.log`);
  const logEntry = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}\n`;

  fs.appendFileSync(logFile, logEntry);
}
```

## Important Implementation Notes

### Security Considerations
- **Path Validation**: Prevent path traversal attacks with strict validation
- **Input Sanitization**: Sanitize all user inputs before processing
- **File Access**: Limit file system access to user-specified directories
- **Process Isolation**: Run FFmpeg in separate processes with limited permissions

### Performance Optimizations
- **Memory Management**: Stream processing for large video files
- **Concurrent Processing**: Limit concurrent FFmpeg processes
- **Progress Reporting**: Efficient progress tracking without UI blocking
- **Caching**: Cache analysis results to avoid redundant processing

### Platform-Specific Features
- **FFmpeg Binaries**: Include platform-specific FFmpeg binaries
- **File System**: Handle platform-specific file system behaviors
- **UI Integration**: Native menu and system integration
- **Code Signing**: Platform-specific code signing for distribution

### Error Recovery
- **Graceful Degradation**: Continue processing even with partial corruption
- **Backup Creation**: Create backups before repair operations
- **Rollback Support**: Ability to undo failed repair attempts
- **User Guidance**: Clear error messages and recovery suggestions