# API Documentation

## IPC Communication API

VidBeast uses Electron's IPC (Inter-Process Communication) for secure communication between the main and renderer processes.

### Main Process Handlers

#### video:analyze
Analyzes a video file for corruption and metadata.

```javascript
// Renderer process
const result = await ipcRenderer.invoke('video:analyze', filePath);

// Response format
{
  success: true,
  data: {
    duration: number,
    bitrate: number,
    codec: string,
    resolution: { width: number, height: number },
    corruption: string[],
    metadata: object
  }
}
```

#### video:repair
Repairs a corrupted video file using various strategies.

```javascript
// Renderer process
const result = await ipcRenderer.invoke('video:repair', inputPath, outputPath, options);

// Options
{
  reencode: boolean,
  remux: boolean,
  fixTimestamps: boolean,
  repairHeaders: boolean
}

// Response format
{
  success: true,
  analysis: object,
  verification: object
}
```

#### video:getProgress
Gets current progress of ongoing video operations.

```javascript
// Renderer process
const progress = await ipcRenderer.invoke('video:getProgress');

// Response format
{
  percentage: number,
  stage: string,
  current: number,
  total: number
}
```

### Progress Updates

The main process sends progress updates to the renderer:

```javascript
// Renderer process - listen for progress updates
ipcRenderer.on('progress:update', (event, data) => {
  console.log('Progress:', data);
  // data format:
  // {
  //   percentage: number,
  //   stage: string,
  //   current: number,
  //   total: number
  // }
});
```

## FFmpeg Integration API

### runFFmpeg
Executes FFmpeg with specified arguments and options.

```javascript
function runFFmpeg(args, options = {}) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });

    ffmpeg.stdout.on('data', (data) => {
      if (options.onProgress) {
        options.onProgress(data.toString());
      }
    });

    ffmpeg.stderr.on('data', (data) => {
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

### runFFprobe
Executes FFprobe for media analysis.

```javascript
async function runFFprobe(args) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', args);
    
    let output = '';
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`FFprobe exited with code ${code}`));
      }
    });
  });
}
```

## Error Handling API

### validatePath
Validates and sanitizes file paths to prevent security issues.

```javascript
function validatePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path: path must be a non-empty string');
  }

  if (inputPath.includes('..')) {
    throw new Error('Invalid path: path traversal detected');
  }

  const normalizedPath = path.normalize(inputPath);

  if (!normalizedPath.startsWith('/') && !normalizedPath.match(/^[A-Za-z]:/)) {
    throw new Error('Invalid path: must be absolute path');
  }

  return normalizedPath;
}
```

### getUserFriendlyError
Maps technical errors to user-friendly messages.

```javascript
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

## Video Analysis API

### VideoAnalyzer Class

```javascript
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

    const probeResult = await this.runFFprobe([
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    analysis.corruption = await this.detectCorruption(probeResult);

    return analysis;
  }

  async detectCorruption(probeData) {
    const issues = [];

    if (probeData.format.duration === 'N/A') {
      issues.push('Invalid duration - possible header corruption');
    }

    if (probeData.format.size === '0') {
      issues.push('Zero file size - completely corrupted');
    }

    probeData.streams.forEach(stream => {
      if (stream.codec_name === 'unknown') {
        issues.push(`Unknown codec in stream ${stream.index}`);
      }
    });

    return issues;
  }
}
```

## Video Repair API

### VideoRepairEngine Class

```javascript
class VideoRepairEngine {
  async repairVideo(inputPath, outputPath, options = {}) {
    try {
      const analysis = await this.analyzeVideo(inputPath);
      const repairStrategy = this.determineRepairStrategy(analysis);
      await this.executeRepair(inputPath, outputPath, repairStrategy);
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

## Progress Tracking API

### ProgressTracker Class

```javascript
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

## Security API

### Security Considerations
- All file paths are validated before processing
- User inputs are sanitized to prevent injection attacks
- FFmpeg processes run in restricted environments
- Temporary files are securely cleaned up after processing

### Best Practices
- Always use `validatePath()` on user-provided file paths
- Implement proper error handling with user-friendly messages
- Use IPC for secure communication between processes
- Clean up resources and temporary files after operations