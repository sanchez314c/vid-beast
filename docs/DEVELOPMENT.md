# Development Guide

## Getting Started

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** for version control
- **Platform-specific tools**:
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio Build Tools
  - Linux: build-essential

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/vidbeast/vidbeast.git
cd vidbeast

# Install dependencies
npm install

# Verify installation
npm run verify
```

## Development Workflow

### Core Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start with debugging enabled
npm run dev:debug

# Standard application start
npm start

# Clean build artifacts and logs
npm run clean

# Run linting
npm run lint

# Run type checking
npm run typecheck
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

## Project Structure

### Source Organization

```
src/
├── main.js                    # Electron main process
├── renderer/                  # Renderer process UI
│   ├── index.html            # Main UI
│   ├── renderer.js           # Renderer logic
│   └── styles.css           # UI styling
├── components/              # Reusable UI components
├── services/                # Business logic services
├── lib/                    # Core libraries
├── utils/                  # Utility functions
├── types/                  # TypeScript definitions
├── constants/              # Application constants
└── sources/                # Source configuration
```

### Key Files

- **main.js**: Electron main process entry point
- **package.json**: Dependencies and scripts configuration
- **electron-builder.json**: Build configuration
- **tsconfig.json**: TypeScript configuration

## Architecture Overview

### Main Process

The main process handles:
- Application lifecycle
- Window management
- File system operations
- FFmpeg process spawning
- IPC communication

### Renderer Process

The renderer process handles:
- User interface
- User input
- Progress display
- Real-time updates

### IPC Communication

```javascript
// Main process handlers
ipcMain.handle('video:analyze', async (event, filePath) => {
  // Handle video analysis
});

ipcMain.handle('video:repair', async (event, inputPath, outputPath) => {
  // Handle video repair
});

// Renderer process calls
const result = await ipcRenderer.invoke('video:analyze', filePath);
```

## Development Features

### Hot Reload

The development server includes hot reload for:
- Renderer process changes
- CSS updates
- JavaScript modifications

### Debug Tools

```bash
# Enable debug logging
DEBUG=* npm run dev

# Open DevTools automatically
npm run dev:debug

# Inspect main process
npm run dev:inspect
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch
```

## Code Style

### JavaScript Standards

- Use **ES6+** features
- Prefer **async/await** over callbacks
- Use **const/let** instead of var
- Follow **semicolons** and proper indentation

```javascript
// Good example
const analyzeVideo = async (filePath) => {
  try {
    const result = await videoAnalyzer.analyze(filePath);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// Bad example
function analyzeVideo(filePath, callback) {
  videoAnalyzer.analyze(filePath, function(err, result) {
    if (err) {
      console.log('Analysis failed', err)
      callback(err)
    } else {
      callback(null, result)
    }
  })
}
```

### Naming Conventions

- **Files**: kebab-case (video-analyzer.js)
- **Variables**: camelCase (videoAnalyzer)
- **Constants**: UPPER_SNAKE_CASE (MAX_FILE_SIZE)
- **Classes**: PascalCase (VideoAnalyzer)
- **Functions**: camelCase (analyzeVideo)

### Comment Standards

```javascript
/**
 * Analyzes a video file for corruption
 * @param {string} filePath - Path to video file
 * @returns {Promise<Object>} Analysis results
 * @throws {Error} If analysis fails
 */
const analyzeVideo = async (filePath) => {
  // Validate input path
  if (!filePath) {
    throw new Error('File path is required');
  }
  
  // Perform analysis
  const result = await performAnalysis(filePath);
  
  return result;
};
```

## Component Development

### Creating Components

```javascript
// components/ProgressBar.js
class ProgressBar {
  constructor(container) {
    this.container = container;
    this.progress = 0;
    this.render();
  }
  
  setProgress(value) {
    this.progress = Math.max(0, Math.min(100, value));
    this.update();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${this.progress}%"></div>
        <span class="progress-text">${this.progress}%</span>
      </div>
    `;
  }
  
  update() {
    const fill = this.container.querySelector('.progress-fill');
    const text = this.container.querySelector('.progress-text');
    
    fill.style.width = `${this.progress}%`;
    text.textContent = `${this.progress}%`;
  }
}

module.exports = ProgressBar;
```

### Using Components

```javascript
// renderer.js
const ProgressBar = require('./components/ProgressBar');

const progressContainer = document.getElementById('progress');
const progressBar = new ProgressBar(progressContainer);

// Update progress
progressBar.setProgress(50);
```

## Service Development

### Creating Services

```javascript
// services/VideoService.js
class VideoService {
  constructor() {
    this.ffmpegPath = this.getFFmpegPath();
  }
  
  async analyze(filePath) {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ];
    
    return this.runFFprobe(args);
  }
  
  async repair(inputPath, outputPath, options) {
    const args = this.buildRepairArgs(inputPath, outputPath, options);
    return this.runFFmpeg(args);
  }
  
  getFFmpegPath() {
    // Platform-specific binary selection
    const platform = process.platform;
    const arch = process.arch;
    
    // Return appropriate path
  }
}

module.exports = VideoService;
```

## FFmpeg Integration

### Process Management

```javascript
// utils/ProcessManager.js
class ProcessManager {
  constructor() {
    this.activeProcesses = new Set();
    this.maxConcurrent = 2;
  }
  
  async execute(command, args, options = {}) {
    // Wait if too many active processes
    while (this.activeProcesses.size >= this.maxConcurrent) {
      await this.waitForSlot();
    }
    
    const processId = Date.now();
    this.activeProcesses.add(processId);
    
    try {
      return await this.spawnProcess(command, args, options);
    } finally {
      this.activeProcesses.delete(processId);
    }
  }
  
  spawnProcess(command, args, options) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }
}
```

## Error Handling

### Error Types

```javascript
// utils/Errors.js
class VidBeastError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'VidBeastError';
    this.code = code;
    this.details = details;
  }
}

class FileNotFoundError extends VidBeastError {
  constructor(filePath) {
    super(`File not found: ${filePath}`, 'FILE_NOT_FOUND', { filePath });
  }
}

class CorruptedFileError extends VidBeastError {
  constructor(filePath, corruption) {
    super(`File corrupted: ${filePath}`, 'FILE_CORRUPTED', { filePath, corruption });
  }
}
```

### Error Handling Pattern

```javascript
// services/ErrorHandler.js
const handleError = (error, context = {}) => {
  // Log technical details
  console.error('Error occurred:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Return user-friendly message
  return getUserFriendlyError(error);
};

const getUserFriendlyError = (error) => {
  const errorMap = {
    'ENOENT': 'File not found. Please check the path and try again.',
    'EACCES': 'Permission denied. Please check file permissions.',
    'FILE_CORRUPTED': 'The file appears to be corrupted.',
    'FFMPEG_ERROR': 'Video processing failed. Please try a different file.'
  };
  
  return errorMap[error.code] || 'An unexpected error occurred.';
};
```

## Debugging

### Main Process Debugging

```bash
# Debug main process
npm run dev:inspect

# Connect with Chrome DevTools
# Open chrome://inspect and connect to the target
```

### Renderer Process Debugging

```javascript
// Enable DevTools in development
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}

// Debug logging
const debug = require('debug')('vidbeast:renderer');
debug('Renderer process started');
```

### Common Debugging Techniques

```javascript
// Log IPC communication
ipcMain.on('debug:ipc', (event, data) => {
  console.log('IPC Debug:', data);
});

// Profile performance
const start = performance.now();
await performOperation();
const duration = performance.now() - start;
console.log(`Operation took ${duration}ms`);

// Memory debugging
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', usage);
}, 5000);
```

## Performance Optimization

### Memory Management

```javascript
// Stream processing for large files
const processLargeFile = async (filePath) => {
  const stream = fs.createReadStream(filePath, {
    highWaterMark: 1024 * 1024 // 1MB chunks
  });
  
  for await (const chunk of stream) {
    await processChunk(chunk);
  }
};

// Clean up resources
const cleanup = () => {
  // Close file handles
  // Clear temporary files
  // Reset state
};

process.on('exit', cleanup);
process.on('SIGINT', cleanup);
```

### Async Operations

```javascript
// Use Promise.all for parallel operations
const analyzeMultiple = async (filePaths) => {
  const promises = filePaths.map(path => analyzeVideo(path));
  return Promise.all(promises);
};

// Use Promise.allSettled for fault tolerance
const analyzeMultipleSafe = async (filePaths) => {
  const promises = filePaths.map(path => 
    analyzeVideo(path).catch(error => ({ error, path }))
  );
  return Promise.allSettled(promises);
};
```

## Testing

### Unit Tests

```javascript
// tests/video-analyzer.test.js
const { expect } = require('chai');
const VideoAnalyzer = require('../src/services/VideoAnalyzer');

describe('VideoAnalyzer', () => {
  let analyzer;
  
  beforeEach(() => {
    analyzer = new VideoAnalyzer();
  });
  
  it('should detect corrupted files', async () => {
    const result = await analyzer.analyze('test/fixtures/corrupted.mp4');
    expect(result.corruption).to.not.be.empty;
  });
  
  it('should handle valid files', async () => {
    const result = await analyzer.analyze('test/fixtures/valid.mp4');
    expect(result.corruption).to.be.empty;
  });
});
```

### Integration Tests

```javascript
// tests/integration/ipc.test.js
const { app, BrowserWindow } = require('electron');
const { expect } = require('chai');

describe('IPC Communication', () => {
  let window;
  
  before(async () => {
    await app.whenReady();
    window = new BrowserWindow({ show: false });
  });
  
  it('should handle video analysis requests', async () => {
    const result = await window.webContents.executeJavaScript(`
      window.electronAPI.analyzeVideo('test.mp4')
    `);
    
    expect(result).to.have.property('success');
    expect(result.data).to.have.property('duration');
  });
});
```

## Contributing

### Before Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Write** tests for new functionality
4. **Ensure** all tests pass
5. **Follow** code style guidelines
6. **Commit** with descriptive messages
7. **Push** to your fork
8. **Create** a pull request

### Pull Request Process

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit changes
git add .
git commit -m "feat: add new video analysis feature"

# Push to fork
git push origin feature/new-feature

# Create pull request
# Through GitHub interface
```

### Code Review Guidelines

- **Review** code for correctness and style
- **Check** test coverage
- **Verify** documentation is updated
- **Test** on multiple platforms if applicable
- **Provide** constructive feedback

---

This development guide provides comprehensive information for contributing to VidBeast.