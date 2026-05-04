# WIRE_AUDIT_REPORT — VidBeast

**Generated**: 2026-04-17 (Step 8 of /repopipeline)
**Run by**: Master Control (claude-x sub-agent dispatched but Z.AI rate-limited at 4:34, killed; audit completed locally — small surface, 19 IPC channels)
**Target**: /media/heathen-admin/RAID/Development/Projects/portfolio/00-QUEUE/vid-beast

---

## Executive Summary

VidBeast IPC topology is small (≤20 channels). Pre-Step-8 baseline already had Step 6 cleanup applied (2 dead receivers + 1 orphan function in renderer.js, 2 dead allowlist entries in preload.js, 1 dangling UI list item).

This pass found and removed 2 additional dead handlers in main.js — both were `ipcMain.handle()` registrations for channels that the renderer never invokes (the only paths to them were via preload.js's `electronAPI.*` methods which renderer bypasses entirely).

Architectural note (NOT a fix, NOT in scope): renderer.js does `const { ipcRenderer } = require('electron')` at line 8 and calls `ipcRenderer.invoke/send/on` directly — bypasses preload.js's `contextBridge('electronAPI', ...)` entirely. preload.js exposes ~20 methods (selectFiles, selectFolder, batchAnalyze, etc.) of which renderer consumes ZERO. Only `electronAPI.path.basename` is touched (3 sites in renderer.js, lines 345, 357, 365). The contextBridge surface is functional dead weight kept for future migration to `contextIsolation: true` (which would require refactoring renderer.js to ditch direct `require('electron')`). See PRD §14.3 for the rationale.

---

## IPC Channel Inventory

| # | Channel | Direction | Status | Sites |
|---|---------|-----------|--------|-------|
| 1 | `ping` | invoke R→M | ACTIVE | renderer.js:82, main.js:434 |
| 2 | `minimize-window` | invoke R→M | ACTIVE | renderer.js:2014, main.js:440 |
| 3 | `maximize-window` | invoke R→M | ACTIVE | renderer.js:2017, main.js:444 |
| 4 | `close-window` | invoke R→M | ACTIVE | renderer.js:2020, main.js:450 |
| 5 | `open-external` | invoke R→M | ACTIVE | renderer.js:279, main.js:455 |
| 6 | ~~`select-files`~~ | invoke R→M | **DEAD_HANDLER → REMOVED** | was main.js:467-481 |
| 7 | `select-folder` | invoke R→M | ACTIVE | renderer.js:535, main.js:484 |
| 8 | `select-output-folder` | invoke R→M | ACTIVE | renderer.js:628, 650; main.js:554 |
| 9 | `select-videos-unified` | invoke R→M | ACTIVE | renderer.js:439, main.js:568 |
| 10 | ~~`analyze-file`~~ | invoke R→M | **DEAD_HANDLER → REMOVED** | was main.js:838 (registration); function `analyzeFileHandler` retained — still called internally by `batch-analyze` at main.js:~885 |
| 11 | `stop-analysis` | send R→M | ACTIVE | renderer.js:822, main.js:841 |
| 12 | `batch-analyze` | invoke R→M | ACTIVE | renderer.js:761, main.js:859 |
| 13 | `repair-file` | invoke R→M | ACTIVE | renderer.js:1415, 1468; main.js:1159 |
| 14 | `advanced-repair` | invoke R→M | ACTIVE | renderer.js:1394, main.js:1468 |
| 15 | `scan-folder` | invoke R→M | ACTIVE | renderer.js:465, 587; main.js:1522 |
| 16 | `save-report` | invoke R→M | ACTIVE | renderer.js:1525, 1547; main.js:1633 |
| 17 | `get-system-info` | invoke R→M | ACTIVE | renderer.js:1750, main.js:1657 |
| 18 | `get-ffmpeg-info` | invoke R→M | ACTIVE | renderer.js:1763, main.js |
| 19 | `check-hw-acceleration` | invoke R→M | ACTIVE | renderer.js:1802, main.js |
| P1 | `ffmpeg-download-status` | push M→R | ACTIVE | main.js:264, 285, 303 → renderer.js:317 |
| P2 | `scan-progress` | push M→R | ACTIVE | main.js:1587, 1618 → renderer.js:327 |
| P3 | `batch-progress` | push M→R | ACTIVE | main.js:874, 901, 926, 938, 996, 1032, 1051 → renderer.js:342 |
| P4 | `repair-status` | push M→R | ACTIVE | main.js:1486 → renderer.js:422 |
| ~~P5~~ | ~~`analysis-progress`~~ | push M→R | DEAD_RECEIVER (Step 6 removed renderer listener and preload allowlist entry) | n/a |
| ~~P6~~ | ~~`repair-progress`~~ | push M→R | DEAD_RECEIVER (Step 6 removed renderer listener, preload allowlist entry, and orphan `updateRepairProgress` function) | n/a |

**Final state**: 17 ACTIVE invoke/send channels + 4 ACTIVE push channels = 21 live wires. 0 dead.

---

## DOM Wiring

Spot-checked DOM IDs in renderer.js against index.html. All references to `getElementById` and `addEventListener` resolve. No orphan handlers found this pass.

The inline `onclick="switchToSettings()"` at index.html:27 is documented (PRD §14.14, AUDIT_REPORT.md I-02) — works under `nodeIntegration:true` + `contextIsolation:false`. Not a wiring defect; would require coupled refactor to migrate.

Settings tab inputs (`#maxThreads`, `#timeoutSeconds`, `#autoRepair`, `#preserveOriginal`, `#useGPUAcceleration`) have DOM elements but no JS read paths or IPC wiring. Already documented (AUDIT_REPORT.md I-03, I-04). Feature work — not a dead-wire fix.

---

## Function Call Graph Analysis

main.js: 18 function declarations, all with ≥2 occurrences (declaration + ≥1 call). No orphans. (Verified Step 6, re-verified post Step-8 fixes.)

renderer.js: 1 orphan removed in Step 6 (`updateRepairProgress`). No new orphans this pass.

preload.js: pure module-load setup — no internal functions to orphan.

---

## State Variable Analysis

main.js module-scope state:
- `mainWindow` — written in `createWindow`, read at 30+ sites. Active.
- `ffmpegPath`, `ffprobePath` — written in `ensureFFmpeg`, read in spawn calls. Active.
- `shouldStopAnalysis` — written in `stop-analysis` handler + reset in batch-analyze, read in batch loop. Active.
- `runningProcesses` (Set) — mutated at all spawn/close sites + iterated for SIGTERM cleanup. Active.
- `DEBUG`, `VERBOSE_PROGRESS` — read by debugLog and progress logging. Active.

No unused module-scope vars in main.js.

renderer.js: state inspection skipped at function scope; module-scope arrays (`selectedFiles`, `analysisResults`, `repairQueue`) all show read+write paths.

---

## electronAPI Unused Surface (Informational — NOT removed)

Preload exposes 19 methods on `window.electronAPI`. Renderer consumes ONLY `electronAPI.path.{basename}` (3 sites). Unused methods:

`invoke`, `send`, `on`, `selectFiles`, `selectFolder`, `selectOutputFolder`, `scanFolder`, `analyzeFile`, `batchAnalyze`, `stopAnalysis`, `repairFile`, `advancedRepair`, `getSystemInfo`, `getFFmpegInfo`, `saveReport`, `windowMinimize`, `windowMaximize`, `windowClose`, `openExternal`.

Plus `electronAPI.path.{extname,join,normalize}` (only `basename` is touched).

**Why kept**: Removing them is functionally safe (renderer doesn't use them), but the preload surface is the canonical gateway for the eventual `contextIsolation:true` migration. Stripping it would force a full re-implementation later. Documented as deferred architectural work.

---

## Dead CSS (Informational, no fix)

Not enumerated — out of pipeline scope. Spot check: all major selectors in styles.css map to elements in index.html (verified `.btn-*`, `.title-bar*`, `.tab-content`, `.about-modal`, `.glass-bg`, `.gradient-card`, `.status-bar`, etc.). No obvious dead rules.

---

## Auto-Fixes Applied

| File | Lines (before) | Change |
|------|----------------|--------|
| `src/main.js` | 467-481 | Removed `ipcMain.handle('select-files', ...)` block (15 lines incl. try/catch). Channel was registered but renderer never invokes it — only path to it was via preload's `electronAPI.selectFiles()` which renderer bypasses. Functionally equivalent video-file picking is provided by `select-videos-unified` (active, used). |
| `src/main.js` | 837-838 | Removed `ipcMain.handle('analyze-file', analyzeFileHandler);` (and the preceding `// IPC handlers` comment). Channel registration was dead (renderer never invokes 'analyze-file'). The function `analyzeFileHandler` is retained — still called from inside `batch-analyze` (main.js:~885) as a regular JS call. |

main.js: 1789 → 1772 LOC (17 lines removed).

---

## Deferred Items

| Item | Reason |
|------|--------|
| Remove unused `electronAPI` methods from preload.js (19 of 19 IPC methods + 3 of 4 path methods) | Coupled to `contextIsolation:true` migration. Stripping now would force re-implementing the bridge later. PRD §14.3 documents this as intentional. |
| Refactor renderer.js to consume `electronAPI` instead of `require('electron')` direct | Architectural. Requires coordinated `contextIsolation:true` flip + removal of all `require()` calls in renderer + migration of inline `onclick=` (index.html:27). Not a dead-wire fix; feature-grade work. |
| Settings tab inputs not wired to IPC (`#maxThreads`, `#timeoutSeconds`, `#autoRepair`, `#preserveOriginal`, `#useGPUAcceleration`) | Feature work, not dead-wire. AUDIT_REPORT.md I-03/I-04. |
| Dead CSS enumeration | Low-priority informational; out of `/repowireaudit` scope. |

---

## Final Verification

- `node --check src/main.js` → OK
- `node --check src/renderer/preload.js` → OK
- `node --check src/renderer/renderer.js` → OK
- `eslint src/` → 0 errors, 0 warnings
- `npx electron-builder --linux --dir` (Step 7 baseline) → still builds; no IPC change affects packaging

---

## Status

**DONE** — 2 findings (D_HANDLER=2: select-files + analyze-file IPC registrations), 2 auto-fixed, 19 deferred (preload.js electronAPI methods kept per architectural pin; documented in PRD §14.3).
