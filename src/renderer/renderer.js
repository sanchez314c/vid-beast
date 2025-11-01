// VidBeast Renderer Process - v3.0.0
// This file handles the UI and communicates with main process via IPC

console.log('🚀 VidBeast Renderer starting...');


// Temporarily using direct IPC while fixing security configuration
const { ipcRenderer } = require('electron');
const path = require('path');

console.log('📡 ipcRenderer loaded successfully');

// Global variables
let currentFiles = [];
let analysisResults = [];
let repairQueue = [];
let isAnalyzing = false;
let isRepairing = false;
let analysisStartTime = null;
let durationTimer = null;
let progressChart = null;
// Removed realTimeStats - using statsManager only to prevent conflicts

// Promise timeout wrapper to prevent hanging operations
function promiseWithTimeout(promise, timeoutMs = 30000, operation = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// Video file extensions
const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.flv', '.webm', '.wmv', '.mpg', '.mpeg'];

// Create a stats manager to prevent race conditions
const statsManager = {
  _stats: { healthy: 0, repairable: 0, corrupted: 0, repaired: 0 },
  _updating: false,

  reset() {
    this._stats = { healthy: 0, repairable: 0, corrupted: 0, repaired: 0 };
  },

  update(type, increment = 1) {
    // Prevent race conditions by using atomic updates
    if (this._updating) {
      setTimeout(() => this.update(type, increment), 1);
      return;
    }

    this._updating = true;
    try {
      if (this._stats.hasOwnProperty(type)) {
        this._stats[type] = Math.max(0, this._stats[type] + increment);
      }
    } finally {
      this._updating = false;
    }
  },

  getStats() {
    return { ...this._stats };
  }
};

// DOM elements
let sourceInput, currentFileSpan, totalFilesSpan, startTimeSpan, durationSpan;
let filesFoundSpan, corruptedCountSpan, repairableCountSpan, successRateSpan;

// Chart update throttling
let lastChartUpdate = 0;
const CHART_UPDATE_THROTTLE = 100; // Only update chart every 100ms

// Test IPC connection
async function testIPCConnection() {
  try {
    console.log('Testing IPC connection...');
    const result = await ipcRenderer.invoke('ping');
    console.log('IPC test result:', result);
    return result === 'pong';
  } catch (error) {
    console.error('IPC test failed:', error);
    return false;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎯 DOM Content Loaded - initializing UI...');
  console.log('VidBeast renderer initialized');

  // Test IPC first
  const ipcWorking = await testIPCConnection();
  if (!ipcWorking) {
    console.error('IPC communication is not working properly');
    showNotification('Application communication error. Please restart the app.', 'error');
  }

  initializeElements();
  initializeEventListeners();
  loadSettings();
  await loadSystemInfo();

  // Check FFmpeg status
  checkFFmpegStatus();

  // Initialize chart last to prevent blocking other functionality
  initializeChart();
});

function initializeElements() {
  const requiredElements = {
    sourceInput: 'sourceInput',
    statusTitle: 'statusTitle',
    currentFileSpan: 'currentFile',
    totalFilesSpan: 'totalFiles',
    startTimeSpan: 'startTime',
    durationSpan: 'duration',
    filesFoundSpan: 'filesFound',
    corruptedCountSpan: 'corruptedCount',
    repairableCountSpan: 'repairableCount',
    successRateSpan: 'successRate'
  };

  const missingElements = [];

  for (const [varName, elementId] of Object.entries(requiredElements)) {
    const element = document.getElementById(elementId);
    if (!element) {
      missingElements.push(elementId);
    }
    window[varName] = element;
  }

  if (missingElements.length > 0) {
    const errorMsg = `Warning: Some UI elements not found: ${missingElements.join(', ')}`;
    console.warn(errorMsg);
    console.warn('App will continue with reduced functionality');
    // Remove the alert and throw - just log and continue
  }
}

function initializeEventListeners() {
  // Unified video selection
  const selectVideosBtn = document.getElementById('selectVideos');
  if (selectVideosBtn) {
    selectVideosBtn.addEventListener('click', async () => {
      console.log('Select Videos button clicked');
      try {
        await selectVideosUnified();
      } catch (error) {
        console.error('Error from select videos click:', error);
        console.error('Stack trace:', error.stack);
        showNotification('Failed to open selection dialog', 'error');
      }
    });
  } else {
    console.error('selectVideos button not found');
  }

  // Analysis controls
  const startAnalysisBtn = document.getElementById('startAnalysis');
  const stopAnalysisBtn = document.getElementById('stopAnalysis');

  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', startAnalysis);
  } else {
    console.error('startAnalysis button not found');
  }

  if (stopAnalysisBtn) {
    stopAnalysisBtn.addEventListener('click', stopAnalysis);
  } else {
    console.error('stopAnalysis button not found');
  }

  // Settings
  const selectOutputBtn = document.getElementById('selectOutput');
  const selectFrameOutputBtn = document.getElementById('selectFrameOutput');

  if (selectOutputBtn) {
    selectOutputBtn.addEventListener('click', selectOutputFolder);
  } else {
    console.error('selectOutput button not found');
  }

  if (selectFrameOutputBtn) {
    selectFrameOutputBtn.addEventListener('click', selectFrameOutputFolder);
  } else {
    console.error('selectFrameOutput button not found');
  }

  // Extract frames toggle
  const extractFramesElement = document.getElementById('extractFrames');
  const frameOptionsElement = document.getElementById('frameOptions');
  if (extractFramesElement && frameOptionsElement) {
    extractFramesElement.addEventListener('change', function() {
      frameOptionsElement.style.display = this.checked ? 'block' : 'none';
    });
  } else {
    console.warn('Extract frames toggle elements not found');
  }

  // Tab navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  if (navTabs.length > 0) {
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
  } else {
    console.warn('No navigation tabs found');
  }

  // Export functionality
  const exportReportBtn = document.getElementById('exportReport');
  const exportCSVBtn = document.getElementById('exportCSV');
  
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', exportReport);
  } else {
    console.warn('exportReport button not found');
  }
  
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', exportCSV);
  } else {
    console.warn('exportCSV button not found');
  }

  // Repair controls
  const startRepairsBtn = document.getElementById('startRepairs');
  const clearQueueBtn = document.getElementById('clearQueue');
  
  if (startRepairsBtn) {
    startRepairsBtn.addEventListener('click', startRepairs);
  } else {
    console.warn('startRepairs button not found');
  }
  
  if (clearQueueBtn) {
    clearQueueBtn.addEventListener('click', clearRepairQueue);
  } else {
    console.warn('clearQueue button not found');
  }

  // Advanced repair options
  document.getElementById('enableAdvancedRepair').addEventListener('change', function() {
    document.getElementById('advancedRepairOptions').style.display = this.checked ? 'block' : 'none';
  });

  // Frame extraction on failure options
  document.getElementById('extractFramesOnFailure').addEventListener('change', function() {
    document.getElementById('frameExtractionOptions').style.display = this.checked ? 'block' : 'none';
  });
}

// IPC Event Listeners
ipcRenderer.on('ffmpeg-download-status', (event, data) => {
  if (data.status === 'downloading') {
    showNotification('Downloading FFmpeg...', 'info');
  } else if (data.status === 'complete') {
    showNotification('FFmpeg setup complete!', 'success');
  } else if (data.status === 'error') {
    showNotification(data.message, 'error');
  }
});

ipcRenderer.on('scan-progress', (event, data) => {
  console.log('Scan progress:', data);

  if (data.complete) {
    updateStatus(`Scan complete - Found ${data.found} video files`);
  } else {
    updateStatus(`Scanning: ${data.found} videos found...`);
    if (data.currentFile && currentFileSpan) {
      currentFileSpan.textContent = data.currentFile;
    }
  }

  if (filesFoundSpan) filesFoundSpan.textContent = data.found;
});

ipcRenderer.on('analysis-progress', (event, data) => {
  console.log('Analysis progress:', data.file);
  if (currentFileSpan) {
    currentFileSpan.textContent = electronAPI.path.basename(data.file);
  }

  if (progressChart && analysisResults.length > 0) {
    updateProgressChart();
  }
});

ipcRenderer.on('batch-progress', (event, data) => {
  console.log('Batch progress:', `${data.current}/${data.total} - ${data.status}`);

  if (totalFilesSpan) totalFilesSpan.textContent = data.total; // Show TOTAL files, not current
  if (currentFileSpan) currentFileSpan.textContent = electronAPI.path.basename(data.file);

  // Handle different statuses
  if (data.status === 'analyzing') {
    updateStatus(`Analyzing file ${data.current} of ${data.total}...`);
  } else if (data.status === 'completed' && data.result && data.result.success) {
    // Update real-time statistics when we get a result
    console.log('🔥 RECEIVED ANALYSIS RESULT:', {
      file: electronAPI.path.basename(data.file),
      corruptionLevel: data.result.corruptionLevel,
      repairFeasible: data.result.repairFeasible,
      issues: data.result.issues
    });

    // Update counters based on corruption level
    if (data.result.corruptionLevel === 'none') {
      statsManager.update('healthy');
      console.log('📗 MARKED AS HEALTHY');
    } else if (data.result.repairFeasible) {
      statsManager.update('repairable');
      console.log('🔶 MARKED AS REPAIRABLE');
    } else {
      statsManager.update('corrupted');
      console.log('🔴 MARKED AS CORRUPTED');
    }

    // Update the chart immediately with new data (throttled)
    const currentStats = statsManager.getStats();
    const now = Date.now();
    if (now - lastChartUpdate > CHART_UPDATE_THROTTLE) {
      updateProgressChart(currentStats);
      lastChartUpdate = now;
    }

    // Force update sidebar statistics immediately
    updateSidebarStats(currentStats, data.total);

    updateStatus(`Analyzed: ${path.basename(data.file)} - ${data.result.corruptionLevel}`);
  } else if (data.status === 'repairing') {
    updateStatus(`Repairing file ${data.current} of ${data.total}...`);
  } else if (data.status === 'repaired' && data.repairResult && data.repairResult.success) {
    updateStatus(`Repaired: ${path.basename(data.file)} → /repaired/`);
    showNotification(`Repaired: ${path.basename(data.file)}`, 'success');

    // Update repair counter - ONLY for successful repairs
    statsManager.update('repaired');
    const currentStats = statsManager.getStats();
    const totalRepairedElement = document.getElementById('totalRepaired');
    if (totalRepairedElement) totalRepairedElement.textContent = currentStats.repaired;

    // Update progress chart with repaired files
    updateProgressChart({
      healthy: currentStats.healthy,
      corrupted: currentStats.corrupted,
      repaired: currentStats.repaired
    });
  } else if (data.status === 'repair-failed') {
    updateStatus(`Repair failed for: ${path.basename(data.file)}`);
  } else if (data.status === 'extracting-frames') {
    updateStatus(`Extracting frames from: ${path.basename(data.file)}...`);
  } else if (data.status === 'frames-extracted' && data.frameResult) {
    updateStatus(`Extracted ${data.frameResult.frameCount} frames from: ${path.basename(data.file)}`);
    showNotification(`Extracted ${data.frameResult.frameCount} frames to /extracted_frames/`, 'info');
  }

  // Update real-time statistics if analysis result is included
  if (data.result && data.status === 'completed') {
    if (data.result.success && data.result.corruptionLevel) {
      if (data.result.corruptionLevel === 'none') {
        statsManager.update('healthy');
      } else if (data.result.repairFeasible) {
        statsManager.update('repairable');
      } else {
        statsManager.update('corrupted');
      }

      // Update chart with real-time data (throttled)
      const now = Date.now();
      if (now - lastChartUpdate > CHART_UPDATE_THROTTLE) {
        updateProgressChart(statsManager.getStats());
        lastChartUpdate = now;
      }

      // Update sidebar stats in real-time
      updateSidebarStats(currentStats, data.current);
    }
  }

  if (analysisStartTime) {
    const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    if (durationSpan) durationSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});

ipcRenderer.on('repair-progress', (event, data) => {
  console.log('Repair progress:', data);
  updateRepairProgress(data.file, data.progress, data.type);
});

ipcRenderer.on('repair-status', (event, data) => {
  updateStatus(`Repair: ${data.message}`);
});

// File selection functions
// Unified video selection function
async function selectVideosUnified() {
  console.log('=== SELECT VIDEOS UNIFIED START ===');

  try {
    // Show loading state
    if (sourceInput) {
      sourceInput.value = 'Opening selection dialog...';
    }
    updateStatus('Select videos or a folder containing videos...');

    // Show a custom dialog with options
    const result = await ipcRenderer.invoke('select-videos-unified');

    if (!result || result.cancelled) {
      console.log('User cancelled selection');
      if (sourceInput) {
        sourceInput.value = '';
      }
      updateStatus('Ready');
      return;
    }

    if (result.type === 'folder') {
      // Handle folder selection
      console.log('Folder selected:', result.path);
      if (sourceInput) {
        sourceInput.value = result.path;
      }

      updateStatus('Scanning folder for videos...');

      const recursiveModeElement = document.getElementById('recursiveMode');
      const recursive = recursiveModeElement ? recursiveModeElement.checked : false;
      console.log('Recursive mode:', recursive);

      try {
        const files = await promiseWithTimeout(
          ipcRenderer.invoke('scan-folder', result.path, recursive, videoExtensions),
          120000, // 2 minute timeout
          'Folder scanning'
        );
        console.log('Scan results:', files.length, 'files found');

        currentFiles = files;
        updateStatus(`Found ${files.length} video files`);
        if (filesFoundSpan) filesFoundSpan.textContent = files.length;

        if (files.length === 0) {
          updateStatus(recursive ?
            'No video files found in folder or subfolders' :
            'No video files found in folder (try enabling Recursive mode)');
        } else {
          console.log('First few files:', files.slice(0, 5));
        }
      } catch (scanError) {
        console.error('Error scanning folder:', scanError);
        updateStatus('Error scanning folder. Please check permissions and try again.');
        showNotification('Failed to scan folder. Check console for details.', 'error');
      }
    } else if (result.type === 'files') {
      // Handle file selection
      console.log('Files selected:', result.files.length);
      currentFiles = result.files;

      if (result.files.length === 1) {
        if (sourceInput) sourceInput.value = result.files[0];
      } else {
        if (sourceInput) sourceInput.value = `${result.files.length} video files selected`;
      }

      updateStatus(`Selected ${result.files.length} video file(s)`);
      if (filesFoundSpan) filesFoundSpan.textContent = result.files.length;
    }

  } catch (error) {
    console.error('Error in selectVideosUnified:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    updateStatus('Error selecting videos. Please try again.');
    showNotification('Failed to select videos. Check console for details.', 'error');
    currentFiles = [];
    if (sourceInput) sourceInput.value = '';
  }
}

// Legacy functions removed - using selectVideosUnified

/* Keeping selectFolder for potential future use but currently unused
async function selectFolder() {
  console.log('=== SELECT FOLDER START ===');
  console.log('sourceInput exists:', !!sourceInput);
  console.log('videoExtensions:', videoExtensions);

  try {
    // Show loading state
    if (sourceInput) {
      sourceInput.value = 'Selecting folder...';
    }
    updateStatus('Opening folder selection dialog...');

    let folder;
    try {
      folder = await ipcRenderer.invoke('select-folder');
      console.log('Folder selection result:', folder);
    } catch (ipcError) {
      console.error('IPC Error during folder selection:', ipcError);
      console.error('Error details:', {
        message: ipcError.message,
        stack: ipcError.stack,
        code: ipcError.code
      });

      // Reset UI state
      if (sourceInput) {
        sourceInput.value = '';
      }
      updateStatus('Ready');

      // Show user-friendly error
      if (ipcError.message.includes('Main window not initialized')) {
        showNotification('Application error. Please restart VidBeast.', 'error');
      } else if (ipcError.message.includes('destroyed')) {
        showNotification('Window error. Please restart VidBeast.', 'error');
      } else {
        showNotification('Failed to open folder dialog. Please try again.', 'error');
      }
      return;
    }

    if (folder === null) {
      console.log('User cancelled folder selection');
      if (sourceInput) {
        sourceInput.value = '';
      }
      updateStatus('Ready');
      return;
    }

    if (folder) {
      console.log('Setting source input to:', folder);
      if (sourceInput) {
        sourceInput.value = folder;
      } else {
        console.error('sourceInput is null!');
      }

      updateStatus('Scanning folder for videos...');

      const recursiveModeElement = document.getElementById('recursiveMode');
      const recursive = recursiveModeElement ? recursiveModeElement.checked : false;
      console.log('Recursive mode:', recursive);

      try {
        const files = await promiseWithTimeout(
          ipcRenderer.invoke('scan-folder', folder, recursive, videoExtensions),
          120000, // 2 minute timeout for folder scanning
          'Folder scanning'
        );
        console.log('Scan results:', files.length, 'files found');

        currentFiles = files;
        updateStatus(`Found ${files.length} video files`);
        if (filesFoundSpan) filesFoundSpan.textContent = files.length;

        if (files.length === 0) {
          updateStatus(recursive ?
            'No video files found in folder or subfolders' :
            'No video files found in folder (try enabling Recursive mode)');
        } else {
          console.log('First few files:', files.slice(0, 5));
        }
      } catch (scanError) {
        console.error('Error scanning folder:', scanError);
        updateStatus('Error scanning folder. Please check permissions and try again.');
        showNotification('Failed to scan folder. Check console for details.', 'error');
      }
    } else {
      console.log('No folder selected');
    }
  } catch (error) {
    console.error('Error in selectFolder:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    updateStatus('Error selecting folder. Please try again.');
    showNotification('Failed to select folder. Check console for details.', 'error');
  }
}
*/

async function selectOutputFolder() {
  try {
    const folder = await ipcRenderer.invoke('select-output-folder');
    if (folder) {
      const outputFolderElement = document.getElementById('outputFolder');
      if (outputFolderElement) {
        outputFolderElement.value = folder;
        console.log('Output folder selected:', folder);
        updateStatus(`Output folder selected: ${path.basename(folder)}`);
      } else {
        console.error('Output folder input element not found');
        showNotification('Error: Could not find output folder input', 'error');
        updateStatus('Error: UI element missing for output folder');
      }
    }
  } catch (error) {
    console.error('Error selecting output folder:', error);
    updateStatus('Error selecting output folder: ' + (error.message || 'Unknown error'));
    showNotification('Failed to select output folder. Please try again.', 'error');
  }
}

async function selectFrameOutputFolder() {
  try {
    const folder = await ipcRenderer.invoke('select-output-folder');
    if (folder) {
      const frameOutputElement = document.getElementById('frameOutput');
      if (frameOutputElement) {
        frameOutputElement.value = folder;
        console.log('Frame output folder selected:', folder);
        updateStatus(`Frame output folder selected: ${path.basename(folder)}`);
      } else {
        console.error('Frame output input element not found');
        showNotification('Error: Could not find frame output input', 'error');
        updateStatus('Error: UI element missing for frame output folder');
      }
    }
  } catch (error) {
    console.error('Error selecting frame output folder:', error);
    updateStatus('Error selecting frame output folder: ' + (error.message || 'Unknown error'));
    showNotification('Failed to select frame output folder. Please try again.', 'error');
  }
}

// Analysis functions
async function startAnalysis() {
  if (currentFiles.length === 0) {
    updateStatus('Please select files or folder first');
    return;
  }

  if (isAnalyzing) {
    updateStatus('Analysis already in progress');
    return;
  }

  isAnalyzing = true;
  analysisResults = [];
  statsManager.reset();
  analysisStartTime = Date.now();

  // Reset progress chart data safely
  if (progressChart && progressChart.data) {
    progressChart.data = { healthy: 0, corrupted: 0, repaired: 0, total: 0 };
    updateProgressChart(statsManager.getStats());
  }

  // Update UI with null checks
  const startAnalysisBtn = document.getElementById('startAnalysis');
  const stopAnalysisBtn = document.getElementById('stopAnalysis');
  if (startAnalysisBtn) startAnalysisBtn.disabled = true;
  if (stopAnalysisBtn) stopAnalysisBtn.disabled = false;
  updateStatus('Starting analysis...');
  if (startTimeSpan) startTimeSpan.textContent = new Date().toLocaleTimeString();

  // Skip chart animation during analysis for performance
  // startChartAnimation();

  // Start duration timer
  durationTimer = setInterval(() => {
    if (analysisStartTime) {
      const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      if (durationSpan) durationSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);

  try {
    // Check output folder FIRST
    const outputFolderElement = document.getElementById('outputFolder');
    if (!outputFolderElement) {
      console.error('Output folder element not found');
      showNotification('Error: Output folder element not found', 'error');
      return;
    }

    const outputFolderValue = outputFolderElement.value;
    if (!outputFolderValue || outputFolderValue.trim() === '') {
      showNotification('Please select an output folder first!', 'error');
      updateStatus('Please select an output folder');
      return;
    }

    // Get analysis options with safe DOM access
    const getElementValue = (id, defaultValue = '', isCheckbox = false) => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`Element not found: ${id}, using default: ${defaultValue}`);
        return defaultValue;
      }
      return isCheckbox ? element.checked : element.value;
    };

    const options = {
      detailed: getElementValue('detailedMode', false, true),
      repair: getElementValue('enableRepair', false, true),
      extractFrames: getElementValue('extractFrames', false, true),
      frameRate: getElementValue('frameRate', '24'),
      frameOutput: getElementValue('frameOutput', ''),
      outputDir: getElementValue('outputFolder', ''),
      outputFormat: getElementValue('outputFormat', 'mp4-h264'),
      extractFramesOnFailure: getElementValue('extractFramesOnFailure', false, true),
      failureFrameRate: getElementValue('failureFrameRate', '24'),
      maxThreads: getElementValue('maxThreads', '4'),
      timeoutSeconds: getElementValue('timeoutSeconds', '120'),
      autoRepair: getElementValue('autoRepair', false, true),
      preserveOriginal: getElementValue('preserveOriginal', false, true)
    };

    console.log('Starting batch analysis with options:', options);

    let results;
    try {
      results = await promiseWithTimeout(
        ipcRenderer.invoke('batch-analyze', currentFiles, options),
        600000, // 10 minute timeout for batch analysis
        'Batch analysis'
      );

      if (!results || !Array.isArray(results)) {
        throw new Error('Invalid analysis results received');
      }

      analysisResults = results;
      processAnalysisResults(results);
    } catch (analysisError) {
      console.error('Batch analysis failed:', analysisError);
      updateStatus('Analysis failed: ' + (analysisError.message || 'Unknown error'));
      showNotification('Analysis failed. Check console for details.', 'error');
      return;
    }

    // Count organized files for status message
    const healthyCount = results.filter(r => r.copiedToHealthy).length;
    const repairableCount = results.filter(r => r.repairFeasible).length;

    let statusMessage = `Analysis complete - Processed ${results.length} files`;
    if (healthyCount > 0) {
      statusMessage += ` (${healthyCount} copied to /healthy/)`;
    }
    if (repairableCount > 0) {
      statusMessage += ` (${repairableCount} queued for repair)`;
    }

    updateStatus(statusMessage);

  } catch (error) {
    console.error('Analysis error:', error);
    updateStatus('Analysis failed: ' + error.message);
  } finally {
    stopAnalysis();
  }
}

function stopAnalysis() {
  // Actually stop the analysis process
  isAnalyzing = false;

  // Stop chart animation first
  stopChartAnimation();

  // Update UI with null checks
  const startAnalysisBtn = document.getElementById('startAnalysis');
  const stopAnalysisBtn = document.getElementById('stopAnalysis');
  if (startAnalysisBtn) startAnalysisBtn.disabled = false;
  if (stopAnalysisBtn) stopAnalysisBtn.disabled = true;

  // Stop duration timer
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }

  // Tell main process to stop if possible
  try {
    ipcRenderer.send('stop-analysis');
  } catch (error) {
    console.log('Could not send stop signal to main process:', error);
  }

  updateStatus('Analysis stopped');
}

function processAnalysisResults(results) {
  let corrupted = 0;
  let repairable = 0;
  let healthy = 0;
  let copiedToHealthy = 0;

  results.forEach(result => {
    if (result.success && result.corruptionLevel) {
      if (result.corruptionLevel !== 'none') {
        corrupted++;
        if (result.repairFeasible) {
          repairable++;
        }
      } else {
        healthy++;
        if (result.copiedToHealthy) {
          copiedToHealthy++;
        }
      }
    }
  });

  // Update stats
  if (corruptedCountSpan) corruptedCountSpan.textContent = corrupted;
  if (repairableCountSpan) repairableCountSpan.textContent = repairable;

  const successRate = results.length > 0 ? Math.round(((healthy + repairable) / results.length) * 100) : 0;
  if (successRateSpan) successRateSpan.textContent = successRate + '%';

  // Update chart
  updateProgressChart();

  // Update results tab
  updateResultsTab(results);

  // Add repairable files to repair queue
  if (repairable > 0) {
    addToRepairQueue(results.filter(r => r.repairFeasible));
  }

  // Show file organization summary
  if (copiedToHealthy > 0) {
    showNotification(`${copiedToHealthy} healthy files copied to /healthy/`, 'success');
  }
}

function updateProgressChart(realTimeData = null) {
  if (!progressChart || !progressChart.data || !progressChart.ctx || !progressChart.canvas) {
    console.warn('Progress chart not initialized, skipping update');
    return;
  }

  let healthy = 0, corrupted = 0, repaired = 0;

  if (realTimeData) {
    // Use real-time data during analysis
    healthy = realTimeData.healthy || 0;
    repaired = realTimeData.repaired || 0;
    corrupted = realTimeData.corrupted || 0;

    console.log('Updating chart with real-time data:', {
      healthy, corrupted, repaired,
      total: healthy + corrupted + repaired
    });
  } else if (analysisResults.length > 0) {
    // Use final analysis results
    analysisResults.forEach(result => {
      if (result.success && result.corruptionLevel) {
        if (result.corruptionLevel === 'none') {
          healthy++;
        } else if (result.repairFeasible) {
          repaired++;
        } else {
          corrupted++;
        }
      }
    });
  }

  // Update custom progress circle data
  progressChart.data.healthy = healthy;
  progressChart.data.corrupted = corrupted;
  progressChart.data.repaired = repaired;
  progressChart.data.total = healthy + corrupted + repaired;

  console.log('Chart data updated:', progressChart.data);

  // Update legend counts
  const healthyCount = document.querySelector('.healthy-count');
  const corruptedCount = document.querySelector('.corrupted-count');
  const repairedCount = document.querySelector('.repaired-count');

  if (healthyCount) healthyCount.textContent = healthy;
  if (corruptedCount) corruptedCount.textContent = corrupted;
  if (repairedCount) repairedCount.textContent = repaired;

  // Redraw the circle
  console.log('Calling drawProgressCircle...');
  if (progressChart && progressChart.ctx && progressChart.canvas) {
    drawProgressCircle();
  }

  // Canvas update handled by drawing
}

// Chart animation and rotation variables
// const chartRotation = 0; // Reserved for animation
let chartAnimationFrame = null;

// Custom animated progress circle - built from scratch
function initializeChart() {
  try {
    const chartElement = document.getElementById('progressChart');
    if (!chartElement) {
      console.error('Chart element not found');
      return;
    }

    console.log('Chart element found:', chartElement);
    console.log('Chart element tag:', chartElement.tagName);

    // The HTML already has a canvas element, so use it directly
    const canvas = chartElement;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.cssText = `
            width: 300px;
            height: 300px;
            max-width: 100%;
            display: block;
            margin: 0 auto;
            background: transparent;
        `;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context');
      return;
    }

    progressChart = {
      canvas: canvas,
      ctx: ctx,
      data: { healthy: 0, corrupted: 0, repaired: 0, total: 0 },
      animationOffset: 0
    };

    console.log('Canvas initialized:', canvas);
    console.log('Context initialized:', ctx);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

    // Find or create legend container
    let legendContainer = canvas.parentElement.querySelector('.custom-legend');
    if (!legendContainer) {
      legendContainer = document.createElement('div');
      legendContainer.className = 'custom-legend';
      legendContainer.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
                font-size: 12px;
                color: white;
            `;

      const legendItems = [
        { text: 'Healthy', color: '#00FF00' },
        { text: 'Corrupted', color: '#FF0000' },
        { text: 'Repaired', color: '#FFD700' }
      ];

      legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.innerHTML = `
                    <span style="display: inline-block; width: 12px; height: 12px; background: ${item.color}; border-radius: 50%; margin-right: 5px;"></span>
                    ${item.text} (<span class="${item.text.toLowerCase()}-count">0</span>)
                `;
        legendContainer.appendChild(legendItem);
      });

      canvas.parentElement.appendChild(legendContainer);
    }

    // Draw initial empty circle
    drawProgressCircle();

    console.log('Custom progress circle initialized successfully');
  } catch (error) {
    console.error('Error initializing custom chart:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Draw the custom animated progress circle
function drawProgressCircle() {
  try {
    if (!progressChart || !progressChart.ctx || !progressChart.canvas) {
      console.warn('Progress chart not ready for drawing');
      return;
    }

    // Check if canvas is still attached to DOM
    if (!document.contains(progressChart.canvas)) {
      console.warn('Progress chart canvas no longer in DOM');
      return;
    }

    const ctx = progressChart.ctx;
    const canvas = progressChart.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    const lineWidth = 30;

    console.log('Drawing progress circle with data:', progressChart.data);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background circle (4th color - creates movement illusion)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#444444'; // Dark gray background band
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Calculate angles for each section
    const total = progressChart.data.total;

    if (total > 0) {
      const healthyAngle = (progressChart.data.healthy / total) * 2 * Math.PI;
      const corruptedAngle = (progressChart.data.corrupted / total) * 2 * Math.PI;
      const repairedAngle = (progressChart.data.repaired / total) * 2 * Math.PI;

      let currentAngle = -Math.PI / 2; // Start from top

      // Draw Healthy section (Green)
      if (progressChart.data.healthy > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + healthyAngle);
        ctx.strokeStyle = '#00FF00'; // Bright Green
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        currentAngle += healthyAngle;
      }

      // Draw Corrupted section (Red)
      if (progressChart.data.corrupted > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + corruptedAngle);
        ctx.strokeStyle = '#FF0000'; // Bright Red
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        currentAngle += corruptedAngle;
      }

      // Draw Repaired section (Gold)
      if (progressChart.data.repaired > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + repairedAngle);
        ctx.strokeStyle = '#FFD700'; // Gold
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }

    // Draw animated moving segments on background band for illusion of movement
    if (isAnalyzing) {
      drawMovingSegments(ctx, centerX, centerY, radius, lineWidth);
    }

    // Draw center text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${progressChart.data.total}`, centerX, centerY - 5);
    ctx.font = '12px Arial';
    ctx.fillText('Files', centerX, centerY + 15);

    console.log('Progress circle drawn successfully');
  } catch (error) {
    console.error('Error drawing progress circle:', error);
    console.error('Stack trace:', error.stack);
    // Don't re-throw to prevent cascade errors
  }
}

// Draw moving segments on the background band
function drawMovingSegments(ctx, centerX, centerY, radius, lineWidth) {
  const segmentCount = 12; // Number of moving segments
  const segmentLength = (2 * Math.PI) / segmentCount / 3; // Length of each segment

  ctx.strokeStyle = '#666666'; // Slightly lighter than background
  ctx.lineWidth = lineWidth;

  for (let i = 0; i < segmentCount; i++) {
    const startAngle = (i * 2 * Math.PI / segmentCount) + progressChart.animationOffset;
    const endAngle = startAngle + segmentLength;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  }
}

// Start spinning animation during analysis
// Animation function - reserved for future use
/* function startChartAnimation() {
  // Stop any existing animation first
  stopChartAnimation();

  if (!progressChart || !progressChart.ctx || !progressChart.canvas) {
    console.warn('Chart not initialized, cannot start animation');
    return;
  }

  isAnalyzing = true;

  function animate() {
    if (!isAnalyzing || !progressChart || !progressChart.ctx || !progressChart.canvas) {
      stopChartAnimation();
      return;
    }

    // Update animation offset for moving segments
    progressChart.animationOffset += 0.05; // Slow smooth rotation
    if (progressChart.animationOffset >= 2 * Math.PI) {
      progressChart.animationOffset = 0;
    }

    // Redraw the progress circle with animation
    drawProgressCircle();

    chartAnimationFrame = requestAnimationFrame(animate);
  }

  animate();
} */

// Stop spinning animation
function stopChartAnimation() {
  isAnalyzing = false;

  // Cancel any pending animation frame
  if (chartAnimationFrame) {
    cancelAnimationFrame(chartAnimationFrame);
    chartAnimationFrame = null;
  }

  // Draw final static circle if chart is still available
  try {
    if (progressChart && progressChart.ctx && progressChart.canvas && document.contains(progressChart.canvas)) {
      progressChart.animationOffset = 0;
      drawProgressCircle();
    }
  } catch (error) {
    console.warn('Error drawing final chart state:', error.message);
    // Clear the reference if the canvas is invalid
    if (progressChart) {
      progressChart = null;
    }
  }
}

function cleanupChart() {
  try {
    stopChartAnimation();
    if (progressChart && progressChart.ctx && progressChart.canvas) {
      // Save the current transform state
      progressChart.ctx.save();
      // Reset the transform to default
      progressChart.ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Clear the entire canvas
      progressChart.ctx.clearRect(0, 0, progressChart.canvas.width, progressChart.canvas.height);
      // Restore the transform
      progressChart.ctx.restore();
    }
  } catch (error) {
    console.error('Error cleaning up chart:', error);
    // Don't re-throw, just log and continue
  }
}

// Tab switching
function switchTab(tabName) {
  try {
    // Temporarily disable cleanup to prevent errors
    // cleanupChart();

    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    } else {
      console.error(`Tab button not found: [data-tab="${tabName}"]`);
      return;
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabName + 'Tab');
    if (targetContent) {
      targetContent.classList.add('active');
    } else {
      console.error(`Tab content not found: ${tabName}Tab`);
      return;
    }

    console.log(`Successfully switched to tab: ${tabName}`);
  } catch (error) {
    console.error('Error switching tabs:', error);
    console.error('Tab name:', tabName);
  }
}

// Repair queue functions
function addToRepairQueue(repairableResults) {
  const queueBody = document.getElementById('queueBody');
  if (!queueBody) {
    console.error('queueBody element not found - Repair Queue tab may not be loaded');
    showNotification('Repair Queue tab not available', 'error');
    return;
  }
  
  queueBody.innerHTML = ''; // Clear existing queue
  repairQueue = []; // Reset queue

  repairableResults.forEach(result => {
    if (result.repairFeasible) {
      const queueItem = {
        file: result.file,
        corruptionLevel: result.corruptionLevel,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
        status: 'queued'
      };

      repairQueue.push(queueItem);

      const row = document.createElement('tr');
      const fileName = path.basename(result.file);
      const fileSize = getFileSize();
      // Auto-detect strategy is selected by default in the dropdown

      row.setAttribute('data-file', result.file);
      row.innerHTML = `
                <td>${fileName}</td>
                <td>${fileSize}</td>
                <td>${result.corruptionLevel}</td>
                <td>
                    <select class="repair-strategy-select" data-file="${result.file}">
                        <option value="auto" selected>Auto-detect</option>
                        <option value="extract-playable">Extract Playable</option>
                        <option value="container-repair">Container Repair</option>
                        <option value="stream-remux">Stream Remux</option>
                        <option value="deep-repair">Deep Repair (Re-encode)</option>
                        <option value="keyframe-repair">Keyframe Rebuild</option>
                        <option value="remove-audio">Remove Audio</option>
                    </select>
                </td>
                <td class="repair-status">Queued</td>
                <td><div class="progress-bar"><div class="progress" style="width: 0%"></div></div></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="repairSingleFile('${result.file}')">Repair</button>
                    <button class="btn btn-sm btn-warning" onclick="removeFromQueue(this)">Remove</button>
                </td>
            `;

      queueBody.appendChild(row);
    }
  });

  updateStatus(`Added ${repairQueue.length} files to repair queue`);
}

function getFileSize() {
  // This would need actual file size from main process
  return 'Unknown';
}

// Function for intelligent repair strategy selection - reserved for future use
/* function getRepairStrategy(corruptionLevel, recommendations) {
  // Intelligent strategy selection based on corruption level and recommendations
  if (recommendations && recommendations.length > 0) {
    if (recommendations[0].includes('container repair')) return 'Container Repair';
    if (recommendations[0].includes('extract')) return 'Extract Playable';
    if (recommendations[0].includes('remux')) return 'Stream Remux';
  }

  switch (corruptionLevel) {
  case 'minor': return 'Container Repair';
  case 'moderate': return 'Stream Remux';
  case 'severe': return 'Extract Playable';
  default: return 'Auto-detect';
  }
} */

// Start repair process
async function startRepairs() {
  if (repairQueue.length === 0) {
    updateStatus('No files in repair queue');
    return;
  }

  if (isRepairing) {
    updateStatus('Repair already in progress');
    return;
  }

  isRepairing = true;
  const startRepairsBtn = document.getElementById('startRepairs');
  if (startRepairsBtn) startRepairsBtn.disabled = true;

  const outputFolderElement = document.getElementById('outputFolder');
  const outputDir = outputFolderElement ? outputFolderElement.value : '';
  if (!outputDir || outputDir.trim() === '') {
    updateStatus('Please select an output folder first');
    if (startRepairsBtn) startRepairsBtn.disabled = false;
    isRepairing = false;
    return;
  }

  updateStatus(`Starting repair of ${repairQueue.length} files...`);

  // Process each file in queue
  for (let i = 0; i < repairQueue.length; i++) {
    const item = repairQueue[i];
    const row = document.querySelector(`tr[data-file="${item.file}"]`);
    const strategySelect = row.querySelector('.repair-strategy-select');
    const strategy = strategySelect.value;

    updateRepairStatus(item.file, 'Processing...');

    try {
      const baseName = path.basename(item.file, path.extname(item.file));

      // If auto-detect, use advanced repair
      if (strategy === 'auto') {
        const advancedOptions = {
          outputDir: outputDir,
          tryAllStrategies: document.getElementById('tryAllStrategies')?.checked || false,
          preserveQuality: document.getElementById('preserveQuality')?.checked || true
        };

        try {
          const result = await promiseWithTimeout(
            ipcRenderer.invoke('advanced-repair', item.file, advancedOptions),
            300000, // 5 minute timeout for repair operations
            'Advanced repair'
          );

          if (result && result.success) {
            updateRepairStatus(item.file, 'Completed', 100);
            showNotification(`Repaired: ${baseName} → /repaired/`, 'success');
          } else {
            updateRepairStatus(item.file, 'Failed');
            showNotification(`Failed to repair: ${baseName}`, 'error');
          }
        } catch (repairError) {
          console.error('Advanced repair failed:', repairError);
          updateRepairStatus(item.file, 'Error');
          showNotification(`Repair error: ${baseName}`, 'error');
        }
      } else {
        // Use specific repair strategy - pass outputDir instead of outputPath
        try {
          const result = await promiseWithTimeout(
            ipcRenderer.invoke('repair-file', item.file, strategy, outputDir),
            300000, // 5 minute timeout for repair operations
            'Repair file'
          );

          if (result && result.success) {
            updateRepairStatus(item.file, 'Completed', 100);
            showNotification(`Repaired: ${baseName} → /repaired/`, 'success');
          } else {
            updateRepairStatus(item.file, 'Failed');
            showNotification(`Failed to repair: ${baseName}`, 'error');
          }
        } catch (repairError) {
          console.error('Specific repair failed:', repairError);
          updateRepairStatus(item.file, 'Error');
          showNotification(`Repair error: ${baseName}`, 'error');
        }
      }

    } catch (error) {
      console.error('General repair error:', error);
      updateRepairStatus(item.file, 'Error');
      showNotification('Repair process encountered an error', 'error');
    }
  }

  if (startRepairsBtn) startRepairsBtn.disabled = false;
  isRepairing = false;
  updateStatus('Repair process complete - Check /repaired/ folder for results');
}

// Repair single file
async function repairSingleFile(filePath) {
  try {
    const outputDir = document.getElementById('outputFolder').value;
    if (!outputDir || outputDir.trim() === '') {
      updateStatus('Please select an output folder first');
      return;
    }

    const row = document.querySelector(`tr[data-file="${filePath}"]`);
    if (!row) {
      throw new Error('File not found in repair queue');
    }

    const strategySelect = row.querySelector('.repair-strategy-select');
    const strategy = strategySelect.value;

    updateRepairStatus(filePath, 'Processing...');

    const baseName = path.basename(filePath, path.extname(filePath));

    const result = await ipcRenderer.invoke('repair-file', filePath, strategy, outputDir);

    if (result.success) {
      updateRepairStatus(filePath, 'Completed', 100);
      showNotification(`Repaired: ${baseName} → /repaired/`, 'success');
    } else {
      updateRepairStatus(filePath, 'Failed');
      showNotification(`Failed to repair: ${baseName}`, 'error');
    }
  } catch (error) {
    console.error('Single repair error:', error);
    updateRepairStatus(filePath, 'Error');
    showNotification('Repair failed. Check console for details.', 'error');
  }
}

function updateRepairStatus(filePath, status, progress = 0) {
  const row = document.querySelector(`tr[data-file="${filePath}"]`);
  if (row) {
    const statusElement = row.querySelector('.repair-status');
    if (statusElement) statusElement.textContent = status;
    const progressBar = row.querySelector('.progress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }
}

function updateRepairProgress(filePath, progress) {
  const row = document.querySelector(`tr[data-file="${filePath}"]`);
  if (row) {
    const progressBar = row.querySelector('.progress');
    if (progressBar) {
      // Estimate progress percentage based on time
      const percentage = Math.min(95, (progress / 60) * 100); // Assume 60 seconds average
      progressBar.style.width = `${percentage}%`;
    }
  }
}

function clearRepairQueue() {
  document.getElementById('queueBody').innerHTML = '';
  repairQueue = [];
  updateStatus('Repair queue cleared');
}

function removeFromQueue(button) {
  const row = button.closest('tr');
  const file = row.getAttribute('data-file');

  // Remove from queue array
  repairQueue = repairQueue.filter(item => item.file !== file);

  // Remove from UI
  row.remove();

  updateStatus('Removed from queue');
}

// Export functions
async function exportReport() {
  if (analysisResults.length === 0) {
    updateStatus('No analysis results to export');
    return;
  }

  try {
    const html = generateHTMLReport(analysisResults);
    const result = await ipcRenderer.invoke('save-report', html, 'html');

    if (result.success) {
      updateStatus(`Report exported to ${result.path}`);
      showNotification('Report exported successfully', 'success');
    } else {
      updateStatus('Export failed: ' + result.error);
    }
  } catch (error) {
    console.error('Export error:', error);
    updateStatus('Export failed');
  }
}

async function exportCSV() {
  if (analysisResults.length === 0) {
    updateStatus('No analysis results to export');
    return;
  }

  try {
    const csv = generateCSVReport(analysisResults);
    const result = await ipcRenderer.invoke('save-report', csv, 'csv');

    if (result.success) {
      updateStatus(`CSV exported to ${result.path}`);
      showNotification('CSV exported successfully', 'success');
    } else {
      updateStatus('Export failed: ' + result.error);
    }
  } catch (error) {
    console.error('CSV export error:', error);
    updateStatus('CSV export failed');
  }
}

function generateHTMLReport(results) {
  const timestamp = new Date().toLocaleString();
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>VidBeast Analysis Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .header { background: #333; color: white; padding: 20px; border-radius: 8px; }
            .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #333; color: white; }
            .healthy { color: #4CAF50; font-weight: bold; }
            .corrupted { color: #F44336; font-weight: bold; }
            .repairable { color: #FF9800; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: white; }
            .badge-success { background: #4CAF50; }
            .badge-warning { background: #FF9800; }
            .badge-danger { background: #F44336; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>VidBeast Analysis Report</h1>
            <p>Generated: ${timestamp}</p>
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Files Analyzed:</strong> ${results.length}</p>
            <p><strong>Healthy Files:</strong> <span class="healthy">${results.filter(r => r.corruptionLevel === 'none').length}</span></p>
            <p><strong>Corrupted Files:</strong> <span class="corrupted">${results.filter(r => r.corruptionLevel !== 'none').length}</span></p>
            <p><strong>Repairable Files:</strong> <span class="repairable">${results.filter(r => r.repairFeasible).length}</span></p>
        </div>
        
        <table>
            <tr>
                <th>File</th>
                <th>Status</th>
                <th>Corruption Level</th>
                <th>Repairable</th>
                <th>Issues</th>
                <th>Recommendations</th>
            </tr>`;

  results.forEach(result => {
    const fileName = path.basename(result.file);
    const status = result.corruptionLevel === 'none' ? 'Healthy' : 'Corrupted';
    const statusClass = result.corruptionLevel === 'none' ? 'healthy' : 'corrupted';
    const repairable = result.repairFeasible ? 'Yes' : 'No';
    const issues = result.issues ? result.issues.join(', ') : 'None';
    const recommendations = result.recommendations ? result.recommendations.join('; ') : 'None';

    let levelBadge = '';
    switch (result.corruptionLevel) {
    case 'none': levelBadge = '<span class="badge badge-success">None</span>'; break;
    case 'minor': levelBadge = '<span class="badge badge-warning">Minor</span>'; break;
    case 'moderate': levelBadge = '<span class="badge badge-warning">Moderate</span>'; break;
    case 'severe': levelBadge = '<span class="badge badge-danger">Severe</span>'; break;
    case 'catastrophic': levelBadge = '<span class="badge badge-danger">Catastrophic</span>'; break;
    }

    html += `
            <tr>
                <td>${fileName}</td>
                <td class="${statusClass}">${status}</td>
                <td>${levelBadge}</td>
                <td class="${result.repairFeasible ? 'repairable' : ''}">${repairable}</td>
                <td>${issues}</td>
                <td>${recommendations}</td>
            </tr>`;
  });

  html += `
        </table>
    </body>
    </html>`;

  return html;
}

function generateCSVReport(results) {
  let csv = 'File,Status,Corruption Level,Repairable,Issues,Recommendations\n';

  results.forEach(result => {
    const fileName = path.basename(result.file);
    const status = result.corruptionLevel === 'none' ? 'Healthy' : 'Corrupted';
    const repairable = result.repairFeasible ? 'Yes' : 'No';
    const issues = result.issues ? result.issues.join('; ') : 'None';
    const recommendations = result.recommendations ? result.recommendations.join('; ') : 'None';

    csv += `"${fileName}","${status}","${result.corruptionLevel || 'unknown'}","${repairable}","${issues}","${recommendations}"\n`;
  });

  return csv;
}

// Results tab update
function updateResultsTab(results) {
  const totalAnalyzedElement = document.getElementById('totalAnalyzed');
  if (totalAnalyzedElement) totalAnalyzedElement.textContent = results.length;

  const totalCorruptedElement = document.getElementById('totalCorrupted');
  if (totalCorruptedElement) totalCorruptedElement.textContent = results.filter(r => r.corruptionLevel !== 'none').length;

  const totalRepairedElement = document.getElementById('totalRepaired');
  if (totalRepairedElement) totalRepairedElement.textContent = '0'; // Updated when repairs complete

  const resultsDetails = document.getElementById('resultsDetails');
  resultsDetails.innerHTML = '';

  if (results.length > 0) {
    const detailsHTML = results.map(result => {
      const fileName = path.basename(result.file);
      const statusClass = result.corruptionLevel === 'none' ? 'status-healthy' : 'status-corrupted';

      return `
                <div class="result-item ${statusClass}">
                    <h4>${fileName}</h4>
                    <p><strong>Status:</strong> ${result.corruptionLevel === 'none' ? 'Healthy' : 'Corrupted (' + result.corruptionLevel + ')'}</p>
                    <p><strong>Repairable:</strong> ${result.repairFeasible ? 'Yes' : 'No'}</p>
                    ${result.issues && result.issues.length > 0 ? '<p><strong>Issues:</strong> ' + result.issues.join(', ') + '</p>' : ''}
                    ${result.recommendations && result.recommendations.length > 0 ? '<p><strong>Recommendations:</strong><br>' + result.recommendations.map(r => '• ' + r).join('<br>') + '</p>' : ''}
                </div>
            `;
    }).join('');

    resultsDetails.innerHTML = detailsHTML;
  }
}

// Utility functions
function updateStatus(message) {
  try {
    const statusTitleElement = document.getElementById('statusTitle');
    if (statusTitleElement) statusTitleElement.textContent = message;

    const footerStatus = document.getElementById('footerStatus');
    if (footerStatus) footerStatus.textContent = message;

    console.log('Status:', message);
  } catch {
    console.log('Status (fallback):', message);
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  if (notification) notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

async function loadSystemInfo() {
  try {
    const systemInfo = await ipcRenderer.invoke('get-system-info');
    const cpuInfoElement = document.getElementById('cpuInfo');
    if (cpuInfoElement) cpuInfoElement.textContent = `${systemInfo.cpus} cores`;

    const memInfoElement = document.getElementById('memInfo');
    if (memInfoElement) memInfoElement.textContent = `${systemInfo.memory}GB RAM`;
  } catch (error) {
    console.error('Error loading system info:', error);
  }
}

async function checkFFmpegStatus() {
  try {
    const ffmpegInfo = await ipcRenderer.invoke('get-ffmpeg-info');
    const statusElement = document.getElementById('ffmpegStatus');

    if (!statusElement) {
      console.error('FFmpeg status element not found');
      return;
    }

    if (ffmpegInfo.isInstalled) {
      console.log('FFmpeg is installed:', ffmpegInfo.ffmpegPath);
      statusElement.innerHTML = `
                <span style="color: #4CAF50;">✅ FFmpeg Installed</span><br>
                <span style="font-size: 12px; color: #999;">Path: ${ffmpegInfo.ffmpegPath}</span><br>
                <span style="font-size: 12px; color: #999;">Version: ${ffmpegInfo.version || 'Unknown'}</span>
            `;

      // Check for hardware acceleration
      checkHardwareAcceleration();
    } else {
      console.log('FFmpeg not found, will be downloaded on first use');
      statusElement.innerHTML = `
                <span style="color: #FF9800;">⚠️ FFmpeg Not Found</span><br>
                <span style="font-size: 12px;">Will be automatically downloaded on first use</span>
            `;
    }
  } catch (error) {
    console.error('Error checking FFmpeg status:', error);
    const statusElement = document.getElementById('ffmpegStatus');
    if (statusElement) {
      statusElement.innerHTML = `
                <span style="color: #F44336;">❌ Error checking FFmpeg</span><br>
                <span style="font-size: 12px;">${error.message}</span>
            `;
    }
  }
}

async function checkHardwareAcceleration() {
  try {
    const hwAccelInfo = await ipcRenderer.invoke('check-hw-acceleration');

    // Update the GPU acceleration checkbox and add indicator
    const gpuCheckbox = document.getElementById('useGPUAcceleration');
    const settingsGroup = gpuCheckbox?.closest('.setting-item');

    if (settingsGroup) {
      // Remove any existing hardware info
      const existingInfo = settingsGroup.querySelector('.hw-accel-info');
      if (existingInfo) existingInfo.remove();

      // Add hardware acceleration info
      const hwInfo = document.createElement('div');
      hwInfo.className = 'hw-accel-info';
      hwInfo.style.cssText = 'margin-top: 8px; padding: 8px; background: #2a2a2a; border-radius: 4px; font-size: 12px;';

      if (hwAccelInfo.available) {
        hwInfo.innerHTML = `
                    <span style="color: #4CAF50;">✅ Hardware Acceleration Available</span><br>
                    <span style="color: #999;">Supported codecs: ${hwAccelInfo.codecs.join(', ')}</span><br>
                    <span style="color: #999;">GPU: ${hwAccelInfo.gpuInfo || 'Unknown'}</span>
                `;
        if (gpuCheckbox) gpuCheckbox.disabled = false;
      } else {
        hwInfo.innerHTML = `
                    <span style="color: #666;">❌ Hardware Acceleration Not Available</span><br>
                    <span style="color: #666;">CPU encoding will be used</span>
                `;
        if (gpuCheckbox) {
          gpuCheckbox.disabled = true;
          gpuCheckbox.checked = false;
        }
      }

      settingsGroup.appendChild(hwInfo);
    }

    // Also add indicator to the header
    updateHeaderHardwareIndicator(hwAccelInfo);

  } catch (error) {
    console.error('Error checking hardware acceleration:', error);
  }
}

function updateHeaderHardwareIndicator(hwAccelInfo) {
  const systemInfo = document.getElementById('systemInfo');
  if (!systemInfo) return;

  // Remove existing GPU indicator if any
  const existingGpu = systemInfo.querySelector('.gpu-indicator');
  if (existingGpu) existingGpu.remove();

  // Add GPU indicator
  const gpuIndicator = document.createElement('span');
  gpuIndicator.className = 'gpu-indicator';
  gpuIndicator.style.cssText = 'margin-left: 10px;';

  if (hwAccelInfo.available) {
    gpuIndicator.innerHTML = '<span style="color: #4CAF50;">🎮 GPU Accel</span>';
    gpuIndicator.title = `Hardware acceleration available: ${hwAccelInfo.gpuInfo || 'GPU detected'}`;
  } else {
    gpuIndicator.innerHTML = '<span style="color: #666;">💻 CPU Only</span>';
    gpuIndicator.title = 'No hardware acceleration available';
  }

  systemInfo.appendChild(gpuIndicator);
}

function loadSettings() {
  // Load settings from localStorage
  const settings = JSON.parse(localStorage.getItem('vidBeastSettings') || '{}');

  const setSetting = (id, value, isCheckbox = false) => {
    const element = document.getElementById(id);
    if (element && value !== undefined) {
      if (isCheckbox) {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  };

  setSetting('maxThreads', settings.maxThreads);
  setSetting('timeoutSeconds', settings.timeoutSeconds);
  setSetting('autoRepair', settings.autoRepair, true);
  setSetting('preserveOriginal', settings.preserveOriginal, true);
}

function saveSettings() {
  const getSetting = (id, isCheckbox = false) => {
    const element = document.getElementById(id);
    if (!element) return isCheckbox ? false : '';
    return isCheckbox ? element.checked : element.value;
  };

  const settings = {
    maxThreads: getSetting('maxThreads'),
    timeoutSeconds: getSetting('timeoutSeconds'),
    autoRepair: getSetting('autoRepair', true),
    preserveOriginal: getSetting('preserveOriginal', true)
  };

  localStorage.setItem('vidBeastSettings', JSON.stringify(settings));
}

// Save settings when they change
document.addEventListener('change', (e) => {
  if (e.target.closest('#settingsTab')) {
    saveSettings();
  }
});

// Global error handler (handled by comprehensive handler below)

// Function to update sidebar statistics
function updateSidebarStats(stats, totalFiles) {
  // Update Files Found
  if (filesFoundSpan) {
    filesFoundSpan.textContent = totalFiles || currentFiles.length || 0;
  }

  // Update Corrupted Count (corrupted + repairable)
  const totalCorrupted = (stats.corrupted || 0) + (stats.repairable || 0);
  if (corruptedCountSpan) {
    corruptedCountSpan.textContent = totalCorrupted;
    // Add color based on count
    if (totalCorrupted > 0) {
      corruptedCountSpan.style.color = '#FF9800';
    }
  }

  // Update Repairable Count
  if (repairableCountSpan) {
    repairableCountSpan.textContent = stats.repairable || 0;
    // Add color based on count
    if (stats.repairable > 0) {
      repairableCountSpan.style.color = '#4CAF50';
    }
  }

  // Update Success Rate
  const totalAnalyzed = (stats.healthy || 0) + (stats.repairable || 0) + (stats.corrupted || 0);
  const successRate = totalAnalyzed > 0 ?
    Math.round(((stats.healthy + stats.repairable) / totalAnalyzed) * 100) : 0;
  if (successRateSpan) {
    successRateSpan.textContent = successRate + '%';
    // Color code success rate
    if (successRate >= 80) {
      successRateSpan.style.color = '#4CAF50';
    } else if (successRate >= 50) {
      successRateSpan.style.color = '#FF9800';
    } else if (successRate > 0) {
      successRateSpan.style.color = '#F44336';
    }
  }

  // Update legend counts in chart area
  const healthyCount = document.querySelector('.healthy-count');
  const corruptedCount = document.querySelector('.corrupted-count');
  const repairedCount = document.querySelector('.repaired-count');

  if (healthyCount) healthyCount.textContent = stats.healthy || 0;
  if (corruptedCount) corruptedCount.textContent = stats.corrupted || 0;
  if (repairedCount) repairedCount.textContent = stats.repaired || 0;
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
}

.notification-info {
    background: #2196F3;
}

.notification-success {
    background: #4CAF50;
}

.notification-error {
    background: #F44336;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.result-item {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #444;
}

.result-item.status-healthy {
    border-left-color: #4CAF50;
}

.result-item.status-corrupted {
    border-left-color: #F44336;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background: linear-gradient(45deg, #00d4ff, #0099cc);
    transition: width 0.3s ease;
}

.repair-strategy-select {
    background: #333;
    color: white;
    border: 1px solid #555;
    padding: 4px 8px;
    border-radius: 4px;
}

#advancedRepairOptions {
    background: #1a1a1a;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 10px;
    margin-top: 10px;
}

#progressChart {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.analyzing #progressChart {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
}

.rotating-label {
    z-index: 10;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.rotating-label .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

.static-legend {
    z-index: 10;
}
`;
document.head.appendChild(style);

// Add global error handlers to prevent error cascades
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
  // Prevent the error from propagating
  event.preventDefault();
  return true;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise:', event.promise);

  // Show user-friendly error notification
  const errorMessage = event.reason?.message || 'An unexpected error occurred';
  showNotification(`Error: ${errorMessage}`, 'error');
  updateStatus(`Error: ${errorMessage}`);

  // Reset UI state if analysis was in progress
  if (isAnalyzing) {
    stopAnalysis();
  }

  // Prevent the unhandled rejection from being logged to console
  event.preventDefault();
});

// Add window unload handler to cleanup properly
window.addEventListener('beforeunload', () => {
  try {
    cleanupChart();
    if (durationTimer) {
      clearInterval(durationTimer);
      durationTimer = null;
    }
  } catch (error) {
    console.error('Error during window cleanup:', error);
  }
});

console.log('VidBeast Renderer v3.0.0 loaded successfully');

// Make functions available for onclick handlers
window.repairSingleFile = repairSingleFile;
window.removeFromQueue = removeFromQueue;
