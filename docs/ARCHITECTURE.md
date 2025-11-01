# VidBeast Architecture Documentation

## System Overview

VidBeast is a cross-platform Electron desktop application for video corruption analysis and repair. The architecture follows a modular design with clear separation between the main process (backend) and renderer process (frontend).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VidBeast Application                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐        ┌─────────────────────┐   │
│  │   Main Process      │        │ Renderer Process   │   │
│  │   (Node.js)        │◄──────►│   (Browser)        │   │
│  └─────────────────────┘        └─────────────────────┘   │
│           ▲                                    ▲          │
│           │                                    │          │
│  ┌────────▼────────┐                   ┌───────▼───────┐ │
│  │   FFmpeg       │                   │   UI/UX       │ │
│  │   Processes    │                   │   Components   │ │
│  └─────────────────┘                   └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Main Process Architecture

The main process handles core application logic, system integration, and video processing operations.

### Core Components

```javascript
VidBeast Main Process/
├── Application Lifecycle/
│   ├── app.js                    // Main application entry point
│   ├── window-manager.js          // Window creation and management
│   └── menu.js                   // Native menu configuration
├── Video Processing Engine/
│   ├── video-analyzer.js          // Corruption detection engine
│   ├── video-repair.js            // Repair workflow orchestration
│   ├── ffmpeg-wrapper.js          // FFmpeg process management
│   └── progress-tracker.js        // Real-time progress tracking
├── File System Management/
│   ├── file-manager.js            // File operations and validation
│   ├── path-utils.js              // Cross-platform path handling
│   └── temp-manager.js            // Temporary file cleanup
├── Security & Validation/
│   ├── input-validator.js          // User input sanitization
│   ├── path-security.js           // Path traversal prevention
│   └── error-handler.js           // Error mapping and reporting
└── IPC Communication/
    ├── ipc-handlers.js             // Main process IPC endpoints
    ├── event-emitter.js           // Custom event system
    └── state-manager.js          // Application state management
```

## Renderer Process Architecture

The renderer process provides the user interface using web technologies (HTML, CSS, JavaScript).

### UI Components

```javascript
VidBeast Renderer Process/
├── Core UI/
│   ├── main-window.html           // Main application window
│   ├── renderer.js               // Renderer process entry point
│   └── styles.css               // Application styling
├── Components/
│   ├── file-dropzone.js          // Drag & drop file input
│   ├── analysis-dashboard.js     // Analysis results display
│   ├── repair-queue.js          // Batch processing interface
│   ├── progress-indicator.js     // Real-time progress display
│   └── settings-panel.js        // Configuration interface
├── Services/
│   ├── ipc-client.js            // Main process communication
│   ├── file-service.js          // File selection and management
│   ├── theme-manager.js         // UI theme handling
│   └── notification-service.js  // User notifications
└── Utilities/
    ├── dom-utils.js              // DOM manipulation helpers
    ├── formatters.js            // Data formatting utilities
    └── validators.js           // Client-side validation
```

## Data Flow Architecture

### Video Analysis Workflow

```
User Input (Drag & Drop)
        ↓
   File Validation
        ↓
   IPC Communication
        ↓
   Main Process Handler
        ↓
   FFprobe Analysis
        ↓
   Corruption Detection
        ↓
   Results Processing
        ↓
   IPC Response
        ↓
   UI Update
```

### Video Repair Workflow

```
Repair Request
        ↓
   Strategy Selection
        ↓
   FFmpeg Execution
        ↓
   Progress Monitoring
        ↓
   Output Validation
        ↓
   Success/Failure Report
```

## Security Architecture

### Process Isolation

- **Main Process**: Has full Node.js access for system operations
- **Renderer Process**: Runs in sandboxed environment with limited privileges
- **FFmpeg Processes**: Spawned as separate processes with restricted permissions

### Security Layers

1. **Input Validation**
   - Path traversal prevention
   - File type validation
   - Size limit enforcement

2. **Process Sandboxing**
   - Renderer context isolation
   - Restricted Node.js integration
   - Content Security Policy headers

3. **File System Security**
   - Absolute path requirements
   - Permission validation
   - Temporary file cleanup

## Performance Architecture

### Memory Management

```javascript
// Streaming processing for large files
const stream = fs.createReadStream(filePath, {
  highWaterMark: 1024 * 1024 // 1MB chunks
});

// Concurrent process limiting
class ProcessLimiter {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
    this.activeProcesses = new Set();
  }
  
  async execute(processFn) {
    while (this.activeProcesses.size >= this.maxConcurrent) {
      await this.waitForSlot();
    }
    
    const processId = Date.now();
    this.activeProcesses.add(processId);
    
    try {
      return await processFn();
    } finally {
      this.activeProcesses.delete(processId);
    }
  }
}
```

### Caching Strategy

- **Analysis Results**: Cache video metadata to avoid re-analysis
- **FFmpeg Binaries**: Cache binary paths for performance
- **UI State**: Cache component states for faster navigation

## Platform-Specific Architecture

### macOS
- **Code Signing**: Developer certificate integration
- **Notarization**: Automated Apple notarization
- **Universal Binary**: Intel + ARM64 support
- **Native Integration**: macOS menu and system services

### Windows
- **Code Signing**: Authenticode certificate integration
- **Installer Formats**: MSI and NSIS support
- **Registry Integration**: Windows registry handling
- **Defender Compatibility**: Windows Defender whitelist handling

### Linux
- **Package Formats**: AppImage, DEB, RPM, Snap support
- **Desktop Integration**: Desktop file and menu integration
- **Library Dependencies**: Dynamic library management
- **Permission Handling**: Linux permission model

## Build Architecture

### Build System Components

```javascript
Build System/
├── electron-builder.json          // Build configuration
├── scripts/
│   └── build-compile-dist.sh      // Universal build script
├── resources/
│   └── binaries/               // Platform-specific FFmpeg
└── dist/                       // Build outputs
```

### Multi-Platform Build Process

1. **Environment Setup**
   - Node.js and npm installation
   - Platform-specific dependencies
   - Code signing certificates

2. **Source Preparation**
   - TypeScript compilation
   - Asset optimization
   - Binary inclusion

3. **Platform Building**
   - Electron packaging
   - Code signing
   - Installer creation

4. **Distribution**
   - Artifact generation
   - Checksum creation
   - Release preparation

## Extension Architecture

### Plugin System Design

```javascript
// Plugin interface
class VideoProcessorPlugin {
  constructor(config) {
    this.name = config.name;
    this.version = config.version;
    this.supportedFormats = config.formats;
  }
  
  async analyze(filePath) {
    throw new Error('Must implement analyze method');
  }
  
  async repair(inputPath, outputPath) {
    throw new Error('Must implement repair method');
  }
}

// Plugin registry
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }
  
  register(plugin) {
    this.plugins.set(plugin.name, plugin);
  }
  
  getPlugin(name) {
    return this.plugins.get(name);
  }
}
```

## Configuration Architecture

### Settings Management

```javascript
// Configuration structure
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
  "repair": {
    "defaultStrategy": "conservative",
    "createBackups": true,
    "verifyOutput": true
  },
  "ui": {
    "showAdvancedOptions": false,
    "compactMode": false,
    "animationSpeed": "normal"
  }
}
```

## Monitoring & Logging Architecture

### Logging System

```javascript
// Log levels and destinations
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(level = LogLevel.INFO) {
    this.level = level;
    this.logFile = path.join(app.getPath('logs'), 'vidbeast.log');
  }
  
  log(level, message, meta = {}) {
    if (level <= this.level) {
      const entry = {
        timestamp: new Date().toISOString(),
        level: Object.keys(LogLevel)[level],
        message,
        meta
      };
      
      this.writeToFile(entry);
      this.sendToConsole(entry);
    }
  }
}
```

### Performance Monitoring

- **Memory Usage**: Track heap and process memory
- **CPU Usage**: Monitor processing CPU consumption
- **File Operations**: Log file I/O performance
- **User Actions**: Track UI interaction patterns

## Testing Architecture

### Test Structure

```javascript
Test Suite/
├── Unit Tests/
│   ├── video-analyzer.test.js
│   ├── ffmpeg-wrapper.test.js
│   └── path-utils.test.js
├── Integration Tests/
│   ├── ipc-communication.test.js
│   ├── file-processing.test.js
│   └── ui-interaction.test.js
├── End-to-End Tests/
│   ├── complete-workflow.test.js
│   ├── batch-processing.test.js
│   └── error-recovery.test.js
└── Performance Tests/
    ├── memory-usage.test.js
    ├── processing-speed.test.js
    └── concurrent-operations.test.js
```

---

This architecture provides a solid foundation for VidBeast's video processing capabilities while maintaining security, performance, and cross-platform compatibility.