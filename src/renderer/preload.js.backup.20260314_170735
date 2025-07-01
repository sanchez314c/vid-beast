// VidBeast Preload Script - Secure bridge between main and renderer
// This provides a secure API surface for the renderer process

console.log('🔧 Preload script starting...');

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

console.log('🔧 Loaded contextBridge and ipcRenderer');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC communication
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, func) => {
    const validChannels = [
      'ffmpeg-download-status',
      'scan-progress',
      'analysis-progress',
      'batch-progress',
      'repair-progress',
      'repair-status'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    }
  },

  // Path utilities
  path: {
    basename: (filePath, ext) => path.basename(filePath, ext),
    extname: (filePath) => path.extname(filePath),
    join: (...paths) => path.join(...paths),
    normalize: (filePath) => path.normalize(filePath)
  },

  // File operations through IPC
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
  scanFolder: (folder, recursive, extensions) => ipcRenderer.invoke('scan-folder', folder, recursive, extensions),

  // Analysis operations
  analyzeFile: (filePath, options) => ipcRenderer.invoke('analyze-file', filePath, options),
  batchAnalyze: (files, options) => ipcRenderer.invoke('batch-analyze', files, options),
  stopAnalysis: () => ipcRenderer.send('stop-analysis'),

  // Repair operations
  repairFile: (filePath, repairType, outputDir) => ipcRenderer.invoke('repair-file', filePath, repairType, outputDir),
  advancedRepair: (filePath, options) => ipcRenderer.invoke('advanced-repair', filePath, options),

  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getFFmpegInfo: () => ipcRenderer.invoke('get-ffmpeg-info'),

  // Reports
  saveReport: (content, type) => ipcRenderer.invoke('save-report', content, type)
});

console.log('✅ VidBeast preload script loaded - electronAPI exposed to main world');
