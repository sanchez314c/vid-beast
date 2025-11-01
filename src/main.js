const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
// const https = require('https'); // Reserved for future use
const { exec } = require('child_process');
// const os = require('os'); // Reserved for future use

// Enable detailed logging (reduced for performance)
const DEBUG = true;
const VERBOSE_PROGRESS = false; // Set to false to reduce CPU load

function debugLog(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', new Date().toISOString(), ...args);
  }
}

function getUserFriendlyError(error) {
  const errorMap = {
    'ENOENT': 'File or directory not found. Please check the path and try again.',
    'EACCES': 'Permission denied. Please check file permissions.',
    'ENOSPC': 'Not enough disk space to complete operation.',
    'EMFILE': 'Too many files open. Please close some applications and try again.',
    'spawn ffmpeg ENOENT': 'FFmpeg not found. Please install FFmpeg and ensure it\'s in your PATH.',
    'spawn ffprobe ENOENT': 'FFprobe not found. Please install FFmpeg and ensure it\'s in your PATH.'
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (error.message && error.message.includes(key)) {
      return message;
    }
    if (error.code === key) {
      return message;
    }
  }

  return `An error occurred: ${error.message || error}. Please try again or contact support.`;
}

// Path validation and sanitization functions
function validatePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path: path must be a non-empty string');
  }

  // Prevent path traversal attacks
  if (inputPath.includes('..')) {
    throw new Error('Invalid path: path traversal detected');
  }

  // Check for null bytes
  if (inputPath.includes('\0')) {
    throw new Error('Invalid path: null byte detected');
  }

  // Normalize the path to prevent variations
  const normalizedPath = path.normalize(inputPath);

  // Ensure path is absolute to prevent confusion
  if (!path.isAbsolute(normalizedPath)) {
    throw new Error('Invalid path: path must be absolute');
  }

  // Check for excessively long paths
  if (normalizedPath.length > 4096) {
    throw new Error('Invalid path: path too long');
  }

  return normalizedPath;
}

function validateVideoExtension(extension) {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.flv', '.webm', '.wmv', '.mpg', '.mpeg'];
  return allowedExtensions.includes(extension.toLowerCase());
}

let mainWindow;
let ffmpegPath = null;
let ffprobePath = null;
let shouldStopAnalysis = false;
const runningProcesses = new Set();

// FFmpeg download URLs for macOS - Reserved for future use
// const FFMPEG_URLS = {
//   darwin: {
//     x64: 'https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip',
//     arm64: 'https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip'
//   }
// };

// const FFPROBE_URLS = {
//   darwin: {
//     x64: 'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip',
//     arm64: 'https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip'
//   }
// };

// Get the platform-specific binary directory and filenames
function getBinaryPaths() {
  const platform = process.platform;
  const arch = process.arch;
  
  let platformDir, ffmpegName, ffprobeName;
  
  if (platform === 'win32') {
    platformDir = 'win32-x64';
    ffmpegName = 'ffmpeg.exe';
    ffprobeName = 'ffprobe.exe';
  } else if (platform === 'darwin') {
    platformDir = arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
    ffmpegName = 'ffmpeg';
    ffprobeName = 'ffprobe';
  } else {
    platformDir = 'linux-x64';
    ffmpegName = 'ffmpeg';
    ffprobeName = 'ffprobe';
  }
  
  // In development, resources are in the project directory
  // In production, resources are in the app.asar.unpacked or resources folder
  let resourcesPath;
  
  if (app.isPackaged) {
    // Production: resources are extracted to process.resourcesPath
    resourcesPath = path.join(process.resourcesPath, 'resources', 'binaries', platformDir);
  } else {
    // Development: resources are in the project directory
    resourcesPath = path.join(__dirname, 'resources', 'binaries', platformDir);
  }
  
  return {
    ffmpegPath: path.join(resourcesPath, ffmpegName),
    ffprobePath: path.join(resourcesPath, ffprobeName),
    platformDir: platformDir
  };
}

// Check if bundled binaries exist and are executable
async function checkBundledFFmpeg() {
  try {
    const { ffmpegPath, ffprobePath } = getBinaryPaths();
    
    // Check if files exist
    if (!fs.existsSync(ffmpegPath) || !fs.existsSync(ffprobePath)) {
      console.log('🔍 Bundled FFmpeg binaries not found');
      return null;
    }
    
    // Test if they work
    const ffmpegResult = await new Promise((resolve) => {
      exec(`"${ffmpegPath}" -version`, (error, stdout) => {
        resolve(!error && stdout.includes('ffmpeg version'));
      });
    });
    
    const ffprobeResult = await new Promise((resolve) => {
      exec(`"${ffprobePath}" -version`, (error, stdout) => {
        resolve(!error && stdout.includes('ffprobe version'));
      });
    });
    
    if (ffmpegResult && ffprobeResult) {
      console.log(`✅ Found bundled FFmpeg: ${ffmpegPath}`);
      console.log(`✅ Found bundled FFprobe: ${ffprobePath}`);
      return {
        ffmpegPath,
        ffprobePath,
        isBundled: true
      };
    }
    
    console.log('⚠️ Bundled FFmpeg binaries exist but are not functional');
    return null;
  } catch (error) {
    console.error('Error checking bundled FFmpeg:', error);
    return null;
  }
}

// Check for system-installed FFmpeg as fallback
async function findSystemFFmpeg() {
  const platform = process.platform;

  let commonPaths = [];
  let commonProbePaths = [];

  if (platform === 'win32') {
    commonPaths = [
      'ffmpeg.exe',
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    commonProbePaths = [
      'ffprobe.exe',
      'C:\\ffmpeg\\bin\\ffprobe.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
      'C:\\Program Files (x86)\\ffmpeg\\bin\\ffprobe.exe'
    ];
  } else {
    commonPaths = [
      '/usr/local/bin/ffmpeg',
      '/opt/homebrew/bin/ffmpeg',
      '/usr/bin/ffmpeg',
      '/usr/local/ffmpeg/bin/ffmpeg',
      '/snap/bin/ffmpeg',
      '/usr/local/opt/ffmpeg/bin/ffmpeg',
      'ffmpeg'
    ];

    commonProbePaths = [
      '/usr/local/bin/ffprobe',
      '/opt/homebrew/bin/ffprobe',
      '/usr/bin/ffprobe',
      '/usr/local/ffmpeg/bin/ffprobe',
      '/snap/bin/ffprobe',
      '/usr/local/opt/ffmpeg/bin/ffprobe',
      'ffprobe'
    ];
  }

  for (let i = 0; i < commonPaths.length; i++) {
    const ffmpegTestPath = commonPaths[i];
    const ffprobeTestPath = commonProbePaths[i];

    try {
      const ffmpegResult = await new Promise((resolve) => {
        exec(`"${ffmpegTestPath}" -version`, (error, stdout) => {
          resolve(!error && stdout.includes('ffmpeg version'));
        });
      });

      const ffprobeResult = await new Promise((resolve) => {
        exec(`"${ffprobeTestPath}" -version`, (error, stdout) => {
          resolve(!error && stdout.includes('ffprobe version'));
        });
      });

      if (ffmpegResult && ffprobeResult) {
        console.log(`Found system FFmpeg: ${ffmpegTestPath}`);
        console.log(`Found system FFprobe: ${ffprobeTestPath}`);
        return {
          ffmpegPath: ffmpegTestPath,
          ffprobePath: ffprobeTestPath,
          isSystem: true
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function ensureFFmpeg() {
  console.log('🔧 Initializing FFmpeg detection...');
  
  // First try bundled binaries
  const bundledFFmpeg = await checkBundledFFmpeg();
  
  if (bundledFFmpeg) {
    ffmpegPath = bundledFFmpeg.ffmpegPath;
    ffprobePath = bundledFFmpeg.ffprobePath;
    
    console.log(`✅ Using bundled FFmpeg at: ${ffmpegPath}`);
    console.log(`✅ Using bundled FFprobe at: ${ffprobePath}`);
    
    if (mainWindow) {
      mainWindow.webContents.send('ffmpeg-download-status', {
        status: 'complete',
        message: 'Using bundled FFmpeg'
      });
    }
    
    return { ffmpegPath, ffprobePath, isBundled: true };
  }
  
  // Fall back to system FFmpeg
  console.log('🔍 Bundled FFmpeg not available, checking system installation...');
  const systemFFmpeg = await findSystemFFmpeg();
  
  if (systemFFmpeg) {
    ffmpegPath = systemFFmpeg.ffmpegPath;
    ffprobePath = systemFFmpeg.ffprobePath;
    
    console.log(`✅ Found system FFmpeg at: ${ffmpegPath}`);
    console.log(`✅ Found system FFprobe at: ${ffprobePath}`);
    
    if (mainWindow) {
      mainWindow.webContents.send('ffmpeg-download-status', {
        status: 'complete',
        message: 'Using system-installed FFmpeg'
      });
    }
    
    return { ffmpegPath, ffprobePath, isSystem: true };
  }
  
  // Neither bundled nor system FFmpeg found
  const binaryPaths = getBinaryPaths();
  const errorMessage = `FFmpeg not found. Please either:
1. Install FFmpeg system-wide, or  
2. Place FFmpeg binaries in resources/binaries/${binaryPaths.platformDir}/`;
  
  console.error('❌', errorMessage);
  
  if (mainWindow) {
    mainWindow.webContents.send('ffmpeg-download-status', {
      status: 'error',
      message: errorMessage
    });
  }
  
  throw new Error(errorMessage);
}

function createWindow() {
  console.log('Creating main window...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
      // Temporarily disabled preload while fixing: preload: path.join(__dirname, 'renderer', 'preload.js')
    },
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // mainWindow.webContents.openDevTools(); // Disabled for production

  // Debug: Check if renderer files are loading
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('✅ Renderer page loaded successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Page failed to load:', errorCode, errorDescription);
  });

  // Cleanup processes when window is closed
  mainWindow.on('closed', () => {
    runningProcesses.forEach(process => {
      try {
        if (!process.killed) {
          process.kill('SIGTERM');
        }
      } catch (error) {
        console.warn('Error cleaning up process on window close:', error.message);
      }
    });
    runningProcesses.clear();
  });
}

app.whenReady().then(async () => {
  await ensureFFmpeg();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Helper function to safely create directories with race condition protection and verification
function ensureDirectoryExists(dirPath) {
  debugLog('Creating directory:', dirPath);

  try {
    // Create directory
    fs.mkdirSync(dirPath, { recursive: true });

    // Verify it exists
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory creation failed: ${dirPath}`);
    }

    // Verify it's writable
    const testFile = path.join(dirPath, '.test_write');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (writeError) {
      throw new Error(`Directory not writable: ${dirPath} - ${writeError.message}`);
    }

    debugLog('Directory verified:', dirPath);
    return true;

  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`Failed to create directory ${dirPath}:`, error);
      throw error;
    }
    return true;
  }
}

// Add test handler for IPC connection
ipcMain.handle('ping', () => {
  console.log('IPC ping received');
  return 'pong';
});

// IPC Handlers
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'm4v', 'flv', 'webm', 'wmv', 'mpg', 'mpeg'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  return result.filePaths;
});

ipcMain.handle('select-folder', async () => {
  try {
    console.log('=== SELECT-FOLDER HANDLER START ===');
    console.log('mainWindow exists:', !!mainWindow);
    console.log('mainWindow destroyed:', mainWindow ? mainWindow.isDestroyed() : 'N/A');

    // Get the target window more safely
    let targetWindow = mainWindow;

    // Try to get focused window only if mainWindow is valid
    if (mainWindow && !mainWindow.isDestroyed()) {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow && !focusedWindow.isDestroyed()) {
        targetWindow = focusedWindow;
      }
    }

    console.log('Using targetWindow:', !!targetWindow);

    if (!targetWindow || targetWindow.isDestroyed()) {
      console.error('No valid window available for dialog');
      // Try to use mainWindow as fallback
      if (!mainWindow) {
        throw new Error('Main window not initialized');
      }
      if (mainWindow.isDestroyed()) {
        throw new Error('Main window has been destroyed');
      }
      targetWindow = mainWindow;
    }

    console.log('Opening dialog...');
    const result = await dialog.showOpenDialog(targetWindow, {
      title: 'Select Video Folder',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Folder'
    });

    console.log('Dialog result:', result);

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      console.log('User canceled folder selection');
      return null;
    }

    const selectedPath = result.filePaths[0];
    console.log('Selected path:', selectedPath);

    // For now, skip validation that might be causing issues
    // Just verify the path exists
    try {
      const stats = await fs.promises.stat(selectedPath);
      if (!stats.isDirectory()) {
        throw new Error('Selected path is not a directory');
      }
    } catch (error) {
      console.error('Error accessing folder:', error);
      throw new Error(`Cannot access selected folder: ${error.message}`);
    }

    console.log('=== SELECT-FOLDER HANDLER SUCCESS ===');
    return selectedPath;
  } catch (error) {
    console.error('=== SELECT-FOLDER HANDLER ERROR ===');
    console.error('Error in select-folder handler:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Folder selection failed: ${error.message}`);
  }
});

ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });

  return result.filePaths[0];
});

// Unified video selection handler
ipcMain.handle('select-videos-unified', async () => {
  try {
    console.log('=== SELECT-VIDEOS-UNIFIED HANDLER START ===');

    // Get the target window
    let targetWindow = mainWindow;
    if (mainWindow && !mainWindow.isDestroyed()) {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow && !focusedWindow.isDestroyed()) {
        targetWindow = focusedWindow;
      }
    }

    if (!targetWindow || targetWindow.isDestroyed()) {
      throw new Error('No valid window available for dialog');
    }

    // First, show a message box to ask user preference
    const choice = await dialog.showMessageBox(targetWindow, {
      type: 'question',
      buttons: ['Select Folder', 'Select Files', 'Cancel'],
      defaultId: 0,
      title: 'Select Videos',
      message: 'How would you like to select videos?',
      detail: 'Choose "Select Folder" to analyze all videos in a folder, or "Select Files" to pick specific video files.',
      cancelId: 2
    });

    console.log('User choice:', choice.response);

    if (choice.response === 2) {
      // User cancelled
      return { cancelled: true };
    }

    if (choice.response === 0) {
      // Select Folder
      const result = await dialog.showOpenDialog(targetWindow, {
        title: 'Select Video Folder',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Select Folder'
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { cancelled: true };
      }

      return {
        type: 'folder',
        path: result.filePaths[0]
      };
    } else if (choice.response === 1) {
      // Select Files
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'm4v', 'flv', 'webm', 'wmv', 'mpg', 'mpeg'];
      const result = await dialog.showOpenDialog(targetWindow, {
        title: 'Select Video Files',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Video Files', extensions: videoExtensions },
          { name: 'All Files', extensions: ['*'] }
        ],
        buttonLabel: 'Select Videos'
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { cancelled: true };
      }

      // Filter to only video files
      const videoFiles = result.filePaths.filter(file => {
        const ext = path.extname(file).toLowerCase().slice(1);
        return videoExtensions.includes(ext);
      });

      if (videoFiles.length === 0) {
        throw new Error('No video files were selected. Please select valid video files.');
      }

      return {
        type: 'files',
        files: videoFiles
      };
    }

  } catch (error) {
    console.error('=== SELECT-VIDEOS-UNIFIED HANDLER ERROR ===');
    console.error('Error in select-videos-unified handler:', error);
    throw new Error(`Video selection failed: ${error.message}`);
  }
});

// FFmpeg-only analysis
async function analyzeFileHandler(event, filePath, options = {}) {
  debugLog(`🔍 Starting analysis for: ${filePath}`);

  try {
    // Validate file path first
    let validatedPath;
    try {
      validatedPath = validatePath(filePath);
    } catch (validationError) {
      throw new Error(`Invalid file path: ${validationError.message}`);
    }

    if (!fs.existsSync(validatedPath)) {
      throw new Error(`File not found: ${validatedPath}`);
    }

    // Verify it's a file and has valid extension
    const stat = fs.statSync(validatedPath);
    if (!stat.isFile()) {
      throw new Error(`Path is not a file: ${validatedPath}`);
    }

    const ext = path.extname(validatedPath).toLowerCase();
    if (!validateVideoExtension(ext)) {
      throw new Error(`Invalid video file extension: ${ext}`);
    }

    return await performFFmpegAnalysis(validatedPath, options);
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      file: filePath,
      error: getUserFriendlyError(error),
      corruptionLevel: 'severe',
      repairFeasible: false,
      issues: ['Analysis failed'],
      recommendations: ['Please check the file and try again']
    };
  }
}

// FFmpeg-based analysis
async function performFFmpegAnalysis(filePath) {
  debugLog(`🔍 ANALYZING WITH FFMPEG: ${filePath}`);

  if (!ffmpegPath || !ffprobePath) {
    throw new Error('FFmpeg is not properly installed or configured.');
  }

  return new Promise((resolve) => {
    const probeArgs = [
      '-v', 'error',
      '-show_error',
      '-show_format',
      '-show_streams',
      '-print_format', 'json',
      filePath
    ];

    const probeProcess = spawn(ffprobePath, probeArgs);
    runningProcesses.add(probeProcess);
    let probeOutput = '';
    let probeError = '';

    probeProcess.stdout.on('data', (data) => {
      probeOutput += data.toString();
    });

    probeProcess.stderr.on('data', (data) => {
      probeError += data.toString();
    });

    probeProcess.on('error', (error) => {
      console.error('❌ PROBE SPAWN ERROR:', error);
      resolve({
        success: false,
        file: filePath,
        error: error.message,
        corruptionLevel: 'severe',
        repairFeasible: true,
        issues: ['Failed to probe file'],
        recommendations: ['File may be severely corrupted']
      });
    });

    probeProcess.on('close', (probeCode) => {
      runningProcesses.delete(probeProcess);

      const ffmpegArgs = [
        '-v', 'error',
        '-i', filePath,
        '-f', 'null',
        '-'
      ];

      const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);
      runningProcesses.add(ffmpegProcess);
      let ffmpegError = '';

      ffmpegProcess.stderr.on('data', (data) => {
        ffmpegError += data.toString();
      });

      ffmpegProcess.on('error', (error) => {
        console.error('❌ FFMPEG SPAWN ERROR:', error);
        resolve({
          success: false,
          file: filePath,
          error: error.message,
          corruptionLevel: 'severe',
          repairFeasible: true,
          issues: ['Failed to analyze file'],
          recommendations: ['File may be severely corrupted']
        });
      });

      ffmpegProcess.on('close', (ffmpegCode) => {
        runningProcesses.delete(ffmpegProcess);
        const result = {
          success: true,
          file: filePath,
          corruptionLevel: 'none',
          repairFeasible: false,
          issues: [],
          recommendations: []
        };

        // Validate probe output format
        try {
          if (probeOutput) {
            JSON.parse(probeOutput); // Validate JSON format
          }
        } catch {
          console.log('Could not parse probe output');
        }

        // Check for errors directly in the condition below
        // const hasProbeErrors = probeCode !== 0 || probeError.length > 0;
        // const hasFFmpegErrors = ffmpegCode !== 0 || ffmpegError.length > 0;

        if (ffmpegCode !== 0 || probeCode !== 0 || ffmpegError.length > 0 || probeError.length > 0) {
          result.corruptionLevel = 'moderate';
          result.repairFeasible = true;

          const allErrors = ffmpegError + probeError;

          if (allErrors.includes('moov atom not found')) {
            result.corruptionLevel = 'severe';
            result.issues.push('Missing moov atom');
          } else if (allErrors.includes('Invalid data')) {
            result.corruptionLevel = 'severe';
            result.issues.push('Invalid data in file');
          } else if (allErrors.includes('Could not find codec')) {
            result.issues.push('Codec issues detected');
          } else if (ffmpegCode !== 0) {
            result.issues.push(`FFmpeg error (exit code ${ffmpegCode})`);
          } else if (probeCode !== 0) {
            result.issues.push(`Probe error (exit code ${probeCode})`);
          }

          if (result.issues.length === 0) {
            result.issues.push('Playback errors detected');
          }

          result.recommendations.push('Attempt repair');
        }

        debugLog(`✅ Analysis complete: ${path.basename(filePath)}`);
        debugLog(`   Corruption: ${result.corruptionLevel}, Repairable: ${result.repairFeasible}`);

        resolve(result);
      });
    });
  });
}

// IPC handlers
ipcMain.handle('analyze-file', analyzeFileHandler);

// Handle stop analysis signal
ipcMain.on('stop-analysis', () => {
  console.log('Received stop analysis signal');
  shouldStopAnalysis = true;

  // Kill all running FFmpeg processes
  runningProcesses.forEach(process => {
    try {
      if (!process.killed) {
        process.kill('SIGTERM');
        console.log('Terminated FFmpeg process');
      }
    } catch (error) {
      console.warn('Error terminating process:', error.message);
    }
  });
  runningProcesses.clear();
});

ipcMain.handle('batch-analyze', async (event, files, options = {}) => {
  debugLog('Starting batch analysis with options:', options);
  debugLog('Output directory:', options.outputDir);

  const results = [];
  shouldStopAnalysis = false;

  // Verify output directory exists and is writable
  if (options.outputDir) {
    try {
      ensureDirectoryExists(options.outputDir);
      debugLog('Output directory verified:', options.outputDir);
    } catch (error) {
      console.error('Output directory error:', error);
      mainWindow.webContents.send('batch-progress', {
        current: 0,
        total: files.length,
        file: '',
        status: 'error',
        error: `Output directory error: ${error.message}`
      });
      return results;
    }
  }

  for (let i = 0; i < files.length; i++) {
    if (shouldStopAnalysis) {
      console.log('Analysis stopped by user');
      break;
    }

    const file = files[i];

    // Add small delay between files to prevent CPU overload
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    }

    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('batch-progress', {
          current: i + 1,
          total: files.length,
          file: file,
          status: 'analyzing'
        });
      }

      const result = await analyzeFileHandler(event, file, options);
      results.push(result);

      debugLog(`Analysis result for ${path.basename(file)}:`, {
        corruptionLevel: result.corruptionLevel,
        repairFeasible: result.repairFeasible,
        success: result.success
      });

      // Healthy files: just log them, don't copy/move
      if (result.success && result.corruptionLevel === 'none') {
        debugLog(`✅ Healthy file left in place: ${file}`);
        result.action = 'left_in_place';
        result.reason = 'file_is_healthy';
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('batch-progress', {
          current: i + 1,
          total: files.length,
          file: file,
          status: 'completed',
          result: result
        });
      }

      // If repair mode is enabled and file is repairable, execute repair immediately
      if (options.repair && result.success && result.repairFeasible && result.corruptionLevel !== 'none') {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('batch-progress', {
            current: i + 1,
            total: files.length,
            file: file,
            status: 'repairing'
          });
        }

        const outputFormat = options.outputFormat || 'mp4-h264';
        const extractOnFailure = options.extractFramesOnFailure || false;
        const failureFrameRate = options.failureFrameRate || '24';

        let repairStrategies = [];
        if (result.corruptionLevel === 'minor') {
          repairStrategies = ['container-repair'];
        } else if (result.corruptionLevel === 'moderate') {
          repairStrategies = ['stream-remux', 'extract-playable'];
        } else {
          repairStrategies = ['extract-playable', 'container-repair', 'stream-remux', 'deep-repair'];
        }

        let repairSuccess = false;

        for (const strategy of repairStrategies) {
          try {
            if (!options.outputDir || options.outputDir.trim() === '') {
              console.warn('No output directory, skipping repair');
              break;
            }

            const repairResult = await repairFileInternal(event, file, strategy, options.outputDir, outputFormat);

            if (repairResult.success) {
              result.repairResult = repairResult;
              repairSuccess = true;

              // Move original corrupt file to corrupt folder and repaired file to fixed folder
              try {
                const corruptPath = await moveCorruptFile(file, options.outputDir);
                const fixedPath = await moveToFixedFolder(repairResult.outputPath, options.outputDir);

                result.movedToCorrupt = true;
                result.corruptPath = corruptPath;
                result.movedToFixed = true;
                result.fixedPath = fixedPath;
                result.action = 'repaired_and_organized';
                result.reason = 'repair_successful';

                debugLog(`📁 Moved original corrupt file to: ${corruptPath}`);
                debugLog(`✅ Moved repaired file to: ${fixedPath}`);
              } catch (moveError) {
                console.error('Failed to organize repaired files:', moveError);
                result.moveError = moveError.message;
              }

              debugLog(`✅ Repair successful: ${repairResult.outputPath}`);

              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('batch-progress', {
                  current: i + 1,
                  total: files.length,
                  file: file,
                  status: 'repaired',
                  repairResult: repairResult
                });
              }

              break;
            }
          } catch (repairError) {
            console.error(`Repair strategy ${strategy} failed for ${file}:`, repairError);
          }
        }

        // If all repair strategies failed, move file to corrupt folder
        if (!repairSuccess) {
          if (options.outputDir) {
            try {
              const corruptPath = await moveCorruptFile(file, options.outputDir);
              result.movedToCorrupt = true;
              result.corruptPath = corruptPath;
              result.action = 'moved_to_corrupt';
              result.reason = 'unrepairable';
              debugLog(`📁 Moved corrupt file to: ${corruptPath}`);
            } catch (moveError) {
              console.error('Failed to move corrupt file:', moveError);
              result.moveError = moveError.message;
            }
          }
        }

        // If all repair strategies failed and frame extraction is enabled
        if (!repairSuccess && extractOnFailure) {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('batch-progress', {
              current: i + 1,
              total: files.length,
              file: file,
              status: 'extracting-frames'
            });
          }

          if (!options.outputDir || options.outputDir.trim() === '') {
            console.warn('No output directory, skipping frame extraction');
            result.framesExtracted = { success: false, error: 'No output directory specified' };
          } else {
            const frameResult = await extractFramesFromVideo(file, options.outputDir, failureFrameRate);

            if (frameResult.success) {
              result.framesExtracted = frameResult;
              debugLog(`✅ Frames extracted to: ${frameResult.framesPath}`);

              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('batch-progress', {
                  current: i + 1,
                  total: files.length,
                  file: file,
                  status: 'frames-extracted',
                  frameResult: frameResult
                });
              }
            }
          }
        }
      }

    } catch (error) {
      results.push({
        success: false,
        error: error,
        file: file
      });
    }
  }

  return results;
});

// Move corrupt/unrepairable files to /corrupt subfolder
async function moveCorruptFile(sourceFile, outputDir) {
  const corruptDir = path.join(outputDir, 'corrupt');

  debugLog('Moving corrupt file:', sourceFile);
  debugLog('To directory:', corruptDir);

  try {
    // Create corrupt directory with verification
    ensureDirectoryExists(corruptDir);

    const fileName = path.basename(sourceFile);
    const targetPath = path.join(corruptDir, fileName);

    debugLog('Target path:', targetPath);

    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }

    // Move file using copy+delete for cross-filesystem compatibility
    await fs.promises.copyFile(sourceFile, targetPath);

    // Verify the copy
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Failed to copy file to: ${targetPath}`);
    }

    // Delete original file after successful copy
    await fs.promises.unlink(sourceFile);

    console.log(`📁 Moved corrupt file: ${fileName} -> ${corruptDir}`);
    return targetPath;

  } catch (error) {
    console.error('❌ Error moving corrupt file:', error);
    throw error;
  }
}

// Move repaired files to /fixed subfolder
async function moveToFixedFolder(repairedFile, outputDir) {
  const fixedDir = path.join(outputDir, 'fixed');

  debugLog('Moving repaired file:', repairedFile);
  debugLog('To directory:', fixedDir);

  try {
    // Create fixed directory with verification
    ensureDirectoryExists(fixedDir);

    const fileName = path.basename(repairedFile);
    const targetPath = path.join(fixedDir, fileName);

    debugLog('Target path:', targetPath);

    // Check if source file exists
    if (!fs.existsSync(repairedFile)) {
      throw new Error(`Repaired file not found: ${repairedFile}`);
    }

    // Move file using copy+delete for cross-filesystem compatibility
    await fs.promises.copyFile(repairedFile, targetPath);

    // Verify the copy
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Failed to copy repaired file to: ${targetPath}`);
    }

    // Delete original file after successful copy
    await fs.promises.unlink(repairedFile);

    console.log(`✅ Moved repaired file: ${fileName} -> ${fixedDir}`);
    return targetPath;

  } catch (error) {
    console.error('❌ Error moving repaired file:', error);
    throw error;
  }
}

// Execute repair operations
ipcMain.handle('repair-file', async (event, filePath, repairType, outputDir) => {
  debugLog(`Repairing ${filePath} using ${repairType} strategy`);
  debugLog('Output directory:', outputDir);

  try {
    // Verify output directory
    if (!outputDir || !fs.existsSync(outputDir)) {
      throw new Error('Output directory not found');
    }

    const result = await repairFileInternal(event, filePath, repairType, outputDir);
    return result;

  } catch (error) {
    console.error('Repair error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Internal repair function with comprehensive error handling
async function repairFileInternal(event, filePath, repairType, outputDir, outputFormat = 'mp4-h264') {
  debugLog(`🔧 REPAIR START: ${path.basename(filePath)} using ${repairType} strategy`);
  debugLog(`🔧 Output directory: ${outputDir}`);
  debugLog(`🔧 Output format: ${outputFormat}`);

  try {
    // Verify output directory exists
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory does not exist: ${outputDir}`);
    }

    const repairedDir = path.join(outputDir, 'temp_repaired');
    ensureDirectoryExists(repairedDir);

    const baseName = path.basename(filePath, path.extname(filePath));

    // Set extension based on format
    let extension = '.mp4';
    if (outputFormat === 'mov-prores') {
      extension = '.mov';
    }

    const outputPath = path.join(repairedDir, `${baseName}_${repairType}${extension}`);
    debugLog('Output path:', outputPath);

    return new Promise((resolve) => {
      let args = [];

      // Base arguments for error handling
      const baseArgs = [
        '-y',  // Overwrite output files
        '-err_detect', 'ignore_err',
        '-fflags', '+genpts+igndts+discardcorrupt',
        '-i', filePath
      ];

      // Format-specific encoding settings
      let encodingArgs = [];
      switch (outputFormat) {
      case 'mp4-h264':
        encodingArgs = [
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '18',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-movflags', '+faststart'
        ];
        break;

      case 'mp4-hevc':
        encodingArgs = [
          '-c:v', 'libx265',
          '-preset', 'medium',
          '-crf', '20',
          '-tag:v', 'hvc1',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-movflags', '+faststart'
        ];
        break;

      case 'mov-prores':
        encodingArgs = [
          '-c:v', 'prores_ks',
          '-profile:v', '2', // ProRes 422
          '-pix_fmt', 'yuv422p10le',
          '-c:a', 'pcm_s16le'
        ];
        break;
      }

      // Combine base args with repair strategy specific args
      switch (repairType) {
      case 'extract-playable':
      case 'container-repair':
      case 'stream-remux':
        args = [...baseArgs, ...encodingArgs, outputPath];
        break;

      case 'deep-repair':
        args = [
          ...baseArgs,
          '-vf', 'setpts=N/FRAME_RATE/TB,format=yuv420p',
          '-g', '25',
          '-bf', '2',
          ...encodingArgs,
          outputPath
        ];
        break;

      default:
        resolve({ success: false, error: 'Unknown repair type' });
        return;
      }

      debugLog('FFmpeg command:', ffmpegPath, args.join(' '));

      // Spawn FFmpeg with lower priority to prevent CPU overload
      const ffmpegProcess = spawn(ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      runningProcesses.add(ffmpegProcess);
      let stderr = '';
      // stdout collection removed - not used in repair process

      let lastProgressTime = 0;
      ffmpegProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        // Log progress every 5 seconds instead of every 500ms
        const timeMatch = data.toString().match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch && VERBOSE_PROGRESS) {
          const currentTime = Date.now();
          if (currentTime - lastProgressTime > 5000) { // 5 seconds
            debugLog('Progress:', timeMatch[0]);
            lastProgressTime = currentTime;
          }
        }
      });

      ffmpegProcess.on('close', (code) => {
        runningProcesses.delete(ffmpegProcess);
        debugLog(`🔧 FFmpeg exit code: ${code}`);
        debugLog(`🔧 Output file exists: ${fs.existsSync(outputPath)}`);

        if (fs.existsSync(outputPath)) {
          const fileSize = fs.statSync(outputPath).size;
          debugLog(`🔧 Output file size: ${fileSize} bytes`);

          if (fileSize > 10000) {  // At least 10KB
            console.log(`✅ Repair successful: ${outputPath}`);
            resolve({
              success: true,
              outputPath: outputPath,
              repairType: repairType,
              fileSize: fileSize
            });
          } else {
            // File too small, delete it
            fs.unlinkSync(outputPath);
            debugLog('🗑️ Deleted too-small output file');
            resolve({
              success: false,
              error: 'Output file too small'
            });
          }
        } else {
          debugLog('❌ No output file created');
          debugLog('FFmpeg stderr:', stderr.slice(-500));  // Last 500 chars
          resolve({
            success: false,
            error: code === 0 ? 'No output file created' : `FFmpeg error code ${code}`
          });
        }
      });

      ffmpegProcess.on('error', (error) => {
        console.error('❌ REPAIR FFmpeg spawn error:', error);
        debugLog('❌ REPAIR FFmpeg spawn failed with args:', args);
        resolve({
          success: false,
          error: error.message
        });
      });
    });

  } catch (error) {
    console.error('Repair internal error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Frame extraction function with enhanced error handling
async function extractFramesFromVideo(filePath, outputDir, frameRate = '24') {
  debugLog('Extracting frames from:', filePath);
  debugLog('Frame rate:', frameRate);

  try {
    // Validate frame rate
    const frameRateNum = parseFloat(frameRate);
    if (isNaN(frameRateNum) || frameRateNum < 0.1 || frameRateNum > 60) {
      throw new Error(`Invalid frame rate: ${frameRate}`);
    }

    const baseName = path.basename(filePath, path.extname(filePath));
    const framesDir = path.join(outputDir, 'extracted_frames', baseName);

    debugLog('Frames directory:', framesDir);

    // Create directory for this video's frames
    ensureDirectoryExists(framesDir);

    const outputPattern = path.join(framesDir, 'frame_%06d.png');

    return new Promise((resolve) => {
      const args = [
        '-i', filePath,
        '-vf', `fps=${frameRate}`,
        '-q:v', '1',
        '-pix_fmt', 'rgb24',
        outputPattern
      ];

      debugLog('FFmpeg command:', ffmpegPath, args.join(' '));

      const ffmpegProcess = spawn(ffmpegPath, args);
      runningProcesses.add(ffmpegProcess);
      let stderr = '';
      let frameCount = 0;

      ffmpegProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        // Count frames being extracted
        const frameMatch = stderr.match(/frame=\s*(\d+)/);
        if (frameMatch) {
          frameCount = parseInt(frameMatch[1]);
          debugLog('Extracting frame:', frameCount);
        }
      });

      ffmpegProcess.on('close', (code) => {
        runningProcesses.delete(ffmpegProcess);
        debugLog('Frame extraction exit code:', code);

        // Count actual extracted files
        try {
          const extractedFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
          const actualFrameCount = extractedFiles.length;

          debugLog(`Extracted ${actualFrameCount} frames to ${framesDir}`);

          if (actualFrameCount > 0) {
            console.log(`📸 Successfully extracted ${actualFrameCount} frames`);
            resolve({
              success: true,
              framesPath: framesDir,
              frameCount: actualFrameCount
            });
          } else {
            // No frames extracted, remove empty directory
            fs.rmdirSync(framesDir, { recursive: true });
            console.log('❌ No frames extracted');
            resolve({
              success: false,
              error: 'No frames were extracted'
            });
          }
        } catch (error) {
          console.error('Error counting extracted frames:', error);
          resolve({
            success: false,
            error: error.message
          });
        }
      });

      ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg spawn error:', error);
        resolve({
          success: false,
          error: error.message
        });
      });
    });

  } catch (error) {
    console.error('Frame extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Advanced repair operations
ipcMain.handle('advanced-repair', async (event, filePath, options) => {
  const outputDir = options.outputDir || path.dirname(filePath);
  const results = [];

  try {
    ensureDirectoryExists(path.join(outputDir, 'repaired'));

    const strategies = [
      { type: 'extract-playable', suffix: '_extracted' },
      { type: 'container-repair', suffix: '_container_fixed' },
      { type: 'stream-remux', suffix: '_remuxed' },
      { type: 'deep-repair', suffix: '_deep_repaired' },
      { type: 'keyframe-repair', suffix: '_keyframe_fixed' }
    ];

    for (const strategy of strategies) {
      event.sender.send('repair-status', {
        file: filePath,
        message: `Trying ${strategy.type} repair...`
      });

      const result = await repairFileInternal(event, filePath, strategy.type, outputDir);

      if (result.success) {
        results.push({
          strategy: strategy.type,
          outputPath: result.outputPath,
          success: true
        });

        if (!options.tryAllStrategies) {
          break;
        }
      }
    }

    return {
      success: results.length > 0,
      results: results
    };

  } catch (error) {
    console.error('Advanced repair error:', error);
    return {
      success: false,
      results: [],
      error: error.message
    };
  }
});

// Scan folder with better error handling
ipcMain.handle('scan-folder', async (event, folderPath, recursive, videoExtensions) => {
  debugLog('Scanning folder:', folderPath);
  debugLog('Recursive:', recursive);
  debugLog('Extensions:', videoExtensions);

  if (!folderPath) {
    throw new Error('No folder path provided');
  }

  // Validate the folder path
  let validatedPath;
  try {
    validatedPath = validatePath(folderPath);
  } catch (validationError) {
    throw new Error(`Invalid folder path: ${validationError.message}`);
  }

  if (!fs.existsSync(validatedPath)) {
    throw new Error(`Folder does not exist: ${validatedPath}`);
  }

  if (!Array.isArray(videoExtensions)) {
    throw new Error('Video extensions must be an array');
  }

  // Validate video extensions
  for (const ext of videoExtensions) {
    if (!validateVideoExtension(ext)) {
      throw new Error(`Invalid video extension: ${ext}`);
    }
  }

  const files = [];

  function scanSync(dirPath, currentDepth = 0) {
    try {
      // Validate each directory path as we traverse
      let safeDirPath;
      try {
        safeDirPath = validatePath(dirPath);
      } catch (validationError) {
        console.warn('Skipping invalid directory path:', dirPath, validationError.message);
        return;
      }

      const items = fs.readdirSync(safeDirPath);

      for (const item of items) {
        if (item.startsWith('.')) continue;

        const fullPath = path.join(safeDirPath, item);

        try {
          // Validate the full path before accessing
          const safeFullPath = validatePath(fullPath);
          const stat = fs.statSync(safeFullPath);

          if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();

            if (videoExtensions.includes(ext)) {
              files.push(safeFullPath);

              if (files.length % 10 === 0 && event.sender && !event.sender.isDestroyed()) {
                try {
                  event.sender.send('scan-progress', {
                    found: files.length,
                    currentPath: safeDirPath,
                    currentFile: item
                  });
                } catch (sendError) {
                  console.warn('Failed to send scan progress:', sendError.message);
                }
              }
            }
          } else if (stat.isDirectory() && recursive && currentDepth < 10) {
            scanSync(safeFullPath, currentDepth + 1);
          }
        } catch (statError) {
          console.warn('Cannot access:', fullPath, statError.message);
        }
      }
    } catch (error) {
      console.error('Error reading directory:', dirPath, error);
    }
  }

  try {
    scanSync(validatedPath);
  } catch (error) {
    console.error('Error during scan:', error);
    throw error;
  }

  if (event.sender && !event.sender.isDestroyed()) {
    try {
      event.sender.send('scan-progress', {
        found: files.length,
        currentPath: folderPath,
        complete: true
      });
    } catch (sendError) {
      console.warn('Failed to send final scan progress:', sendError.message);
    }
  }

  console.log(`Scan complete. Found ${files.length} video files`);
  return files;
});

// Save report
ipcMain.handle('save-report', async (content, type) => {
  try {
    const defaultName = `vidbeast_report_${new Date().toISOString().split('T')[0]}`;
    const filters = type === 'html'
      ? [{ name: 'HTML Files', extensions: ['html'] }]
      : [{ name: 'CSV Files', extensions: ['csv'] }];

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: filters
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, content);
      return { success: true, path: result.filePath };
    }

    return { success: false, error: 'Cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get system info
ipcMain.handle('get-system-info', () => {
  const os = require('os');
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    hostname: os.hostname()
  };
});

// Get FFmpeg info
ipcMain.handle('get-ffmpeg-info', async () => {
  try {
    const isInstalled = fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath);
    let version = 'Unknown';

    if (isInstalled) {
      // Get FFmpeg version
      try {
        const { stdout } = await execPromise(`${ffmpegPath} -version`);
        const versionMatch = stdout.match(/ffmpeg version ([^\s]+)/);
        if (versionMatch) {
          version = versionMatch[1];
        }
      } catch (error) {
        console.error('Error getting FFmpeg version:', error);
      }
    }

    return {
      ffmpegPath: ffmpegPath,
      ffprobePath: ffprobePath,
      isInstalled: isInstalled,
      version: version
    };
  } catch (error) {
    console.error('Error in get-ffmpeg-info:', error);
    return {
      ffmpegPath: null,
      ffprobePath: null,
      isInstalled: false,
      version: 'Error'
    };
  }
});

// Check hardware acceleration support
ipcMain.handle('check-hw-acceleration', async () => {
  try {
    if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
      return { available: false, codecs: [], gpuInfo: null };
    }

    // Check for hardware encoders
    const { stdout } = await execPromise(`${ffmpegPath} -hide_banner -encoders`);

    const hwEncoders = [];
    const hwPatterns = [
      { pattern: /h264_videotoolbox/i, name: 'H.264 (VideoToolbox)', codec: 'h264_videotoolbox' },
      { pattern: /hevc_videotoolbox/i, name: 'HEVC (VideoToolbox)', codec: 'hevc_videotoolbox' },
      { pattern: /h264_nvenc/i, name: 'H.264 (NVENC)', codec: 'h264_nvenc' },
      { pattern: /hevc_nvenc/i, name: 'HEVC (NVENC)', codec: 'hevc_nvenc' },
      { pattern: /h264_qsv/i, name: 'H.264 (QuickSync)', codec: 'h264_qsv' },
      { pattern: /hevc_qsv/i, name: 'HEVC (QuickSync)', codec: 'hevc_qsv' },
      { pattern: /h264_amf/i, name: 'H.264 (AMF)', codec: 'h264_amf' },
      { pattern: /hevc_amf/i, name: 'HEVC (AMF)', codec: 'hevc_amf' }
    ];

    hwPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(stdout)) {
        hwEncoders.push(name);
      }
    });

    // Get GPU info (macOS specific)
    let gpuInfo = null;
    if (process.platform === 'darwin') {
      try {
        const { stdout: gpuStdout } = await execPromise('system_profiler SPDisplaysDataType');
        const gpuMatch = gpuStdout.match(/Chipset Model: ([^\n]+)/);
        if (gpuMatch) {
          gpuInfo = gpuMatch[1].trim();
        }
      } catch (error) {
        console.log('Could not get GPU info:', error.message);
      }
    }

    return {
      available: hwEncoders.length > 0,
      codecs: hwEncoders,
      gpuInfo: gpuInfo
    };
  } catch (error) {
    console.error('Error checking hardware acceleration:', error);
    return { available: false, codecs: [], gpuInfo: null };
  }
});

// Helper function for promisified exec
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
