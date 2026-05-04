# AUDIT_REPORT — VidBeast

**Generated**: 2026-04-17 (Step 5 of /repopipeline)
**Run by**: Master Control (claude-x sub-agent dispatched but Z.AI rate-limited 14:38 with 0 output; killed and audit completed locally)
**Target**: /media/heathen-admin/RAID/Development/Projects/portfolio/00-QUEUE/vid-beast
**Stack**: Electron 38.1.0, vanilla JS, FFmpeg-bundled

---

## Executive Summary

VidBeast (3.5.0) audit covers `src/main.js` (1786 LOC), `src/renderer/{preload,renderer}.js`, `src/renderer/{index.html,styles.css}`. Vendored C# project at `src/sources/videoduplicatefinder-master/` excluded.

**Overall posture**: Hardened well for the deliberately-permissive Electron config (nodeIntegration:true, contextIsolation:false — intentional, documented in `main.js:351` and `PRD.md §13` and §14.3). Security-critical paths use `validatePath()` (block `../`, null bytes, non-absolute, len > 4096) and `validateVideoExtension()` (allowlist of 10 extensions). All FFmpeg invocations via `spawn(cmd, [args])` with array args — no shell. The single `exec()` site (`spawnPromise` superseded it; `execPromise` retained only for hardcoded `system_profiler SPDisplaysDataType` macOS GPU detection).

Most flagged issues from PRD §14 were already fixed in prior pipeline passes (dead-code comment block, "Remove Audio" UI list entry, `keyframe-repair` strategy in `advanced-repair`). Two new findings auto-fixed this pass: dead IPC channels in preload allowlist, leftover `Keyframe Rebuild` mention in Help section.

---

## Findings by Severity

### CRITICAL
None.

### HIGH
None.

### MEDIUM
None.

### LOW

| ID | File:Line | Finding | Fix |
|----|-----------|---------|-----|
| L-01 | `src/renderer/preload.js:21,23` | Dead allowlist entries: `analysis-progress` and `repair-progress` channels were whitelisted for `ipcRenderer.on()` subscription but main.js never emits them. Renderer code never subscribes either. Confused future maintainers. | **AUTO-FIXED** — removed both entries. Allowlist now: `ffmpeg-download-status`, `scan-progress`, `batch-progress`, `repair-status` (matches actual emit sites). |
| L-02 | `src/renderer/index.html:389` | Help section "Repair Strategies" subsection still listed `Keyframe Rebuild` even though the strategy was removed from the actual `advanced-repair` strategies array (main.js:1478-1483) and from the Repair Queue tab (index.html:240-243). Misleading user-facing doc. | **AUTO-FIXED** — removed the dangling `<li>Keyframe Rebuild</li>` from Help section. |

### INFO

| ID | File:Line | Note |
|----|-----------|------|
| I-01 | `src/renderer/index.html` | No `<meta http-equiv="Content-Security-Policy">` tag. Acceptable given file://-only loading and no remote content. Could be hardened with `default-src 'self' 'unsafe-inline' 'unsafe-eval' file:` if future migration to `contextIsolation:true`. |
| I-02 | `src/renderer/index.html:27` | Inline `onclick="switchToSettings()"` on settings button. Works only because of `nodeIntegration:true` + `contextIsolation:false`. Documented in PRD §14.14. **Not migrated** — would silently break under hardened webPreferences; migration must happen alongside config flip. |
| I-03 | `src/main.js` (was L-?) | `#useGPUAcceleration` settings checkbox is detected at lines ~1700 (`check-hw-acceleration` IPC), reported to UI, but never consumed by `repairFileInternal` codec selection (encoding always uses `libx264`/`libx265`/`prores_ks`). Either implement codec switching or strip the checkbox. **DEFERRED** — falls under feature work, not audit fix. Documented in PRD §14.10. |
| I-04 | `src/main.js` settings tab | `#maxThreads`, `#timeoutSeconds`, `#autoRepair`, `#preserveOriginal` are UI-only with no IPC wiring. Settings tab is largely cosmetic at v3.5.0. **DEFERRED** — feature work. |
| I-05 | `package.json` build/devDeps | 15 dev-only npm-audit vulns (12 high, 1 mod, 2 low) all in `node-tar`/`cacache` via `electron-builder@25.1.8`. Fix requires breaking upgrade to `electron-builder@26.8.1`. **DEFERRED** — covered in Step 4 LINT_REPORT.md. |

---

## Verified Clean (no findings)

### Security
- `validatePath()` (main.js:40-70): blocks `..`, null bytes, non-absolute, len > 4096. Applied at `analyzeFileHandler` (file path), `scan-folder` (folder path + per-recursive-step path), `advanced-repair` (BOTH `filePath` AND `outputDir` — improvement over prior pass that only validated `filePath`).
- `validateVideoExtension()` (main.js:72-75): allowlist `.mp4 .mov .avi .mkv .m4v .flv .webm .wmv .mpg .mpeg`. Applied at `analyzeFileHandler` and as input validation for `scan-folder` extension array.
- `spawn()` array args: every FFmpeg/FFprobe spawn site (lines ~150, 230, 720, 760, 1280, 1390) passes args as `[...]` not concatenated strings. No shell injection surface.
- `execPromise()` (main.js:~1754): used ONLY for hardcoded string `system_profiler SPDisplaysDataType`. No other callers. Safe.
- `shell.openExternal` protocol guard (`open-external` IPC handler): URL parsed via `new URL()`; only `http:`, `https:`, `mailto:` allowed. Other schemes silently dropped.
- `dialog.showOpenDialog` filters: video file picker restricted to allowlisted extensions; folder picker uses `openDirectory` only.
- IPC channel allowlist (preload.js): post-fix, matches actual emit sites 1:1.

### Correctness
- FFmpeg child process tracking: every `spawn()` push to `runningProcesses` Set; every `'close'` handler `delete()` from Set. Verified at all 8 spawn sites.
- SIGTERM cleanup: `stop-analysis` IPC (lines ~841) iterates Set + sends SIGTERM. `mainWindow.on('closed')` (lines ~376) does the same. No orphan processes after window close.
- 100ms inter-file delay (line ~900): preserved (intentional I/O pacing).
- 10KB output threshold (line ~1317): preserved (filters false-positive repair successes).
- JSON.parse wrapped in try/catch (line ~797).

### Resource Management
- `mainWindow.webContents.send` calls guarded by `mainWindow && !mainWindow.isDestroyed()` at 7+ sites in `batch-analyze`. Two FFmpeg-status sends (lines 264, 285, 303) guarded by `if (mainWindow)` (no `isDestroyed()` check, but called only during initial `ensureFFmpeg` before window destruction is possible — acceptable).
- `fs.promises.copyFile` + `fs.promises.unlink` cross-fs-safe pattern in `moveCorruptFile` and `moveToFixedFolder`.
- IPC handlers registered once at module load (no re-registration in handlers).
- No `setInterval` / `setTimeout` polling loops (only the 100ms inter-file delay, which is one-shot per iteration).

### Electron Best Practices
- `BrowserWindow.webPreferences` (lines ~345): `nodeIntegration:true`, `contextIsolation:false`, `webSecurity:false`, `sandbox:false` — intentional, documented. Source comment at line 351 warns NEVER set `experimentalFeatures:true` (breaks contextBridge IPC on Linux).
- Linux Chromium flags injected before `app.whenReady()` (lines ~390-396): `enable-transparent-visuals`, `disable-gpu-compositing`, `no-sandbox`. Survives in packaged builds.
- No `webContents.on('will-navigate')` / `'new-window')` handlers — VidBeast only calls `loadFile()` (no `loadURL`), so navigation is impossible. Acceptable.
- No permission request handlers — VidBeast doesn't use camera/mic/notifications/geolocation. Acceptable.

### Build Health
- `package.json` `build.files` exclusions (Step 3): `!**/*.backup.*`, `!src/sources/**` — verified present. Backup artifacts and 700+ vendored C# files excluded from packaging.
- `electron-builder.json` icon paths (Step 3): now `resources/icons/icon.{icns,ico,png}` — files exist at those paths.
- Run scripts shellcheck-clean (Step 4 LINT_REPORT verified 0 issues post-fix).

---

## Auto-Fixes Applied (this pass)

| File | Lines | Change |
|------|-------|--------|
| `src/renderer/preload.js` | 18-25 | Removed dead allowlist entries `analysis-progress`, `repair-progress` from `validChannels` array. Final allowlist: `[ffmpeg-download-status, scan-progress, batch-progress, repair-status]`. |
| `src/renderer/index.html` | 389 | Removed dangling `<li><strong>Keyframe Rebuild:</strong> ...</li>` from Help section "Repair Strategies" list. Now matches actual implementation (4 strategies: Extract Playable, Container Repair, Stream Remux, Deep Repair). |

---

## Deferred Items

| Item | Reason |
|------|--------|
| `#useGPUAcceleration` codec switching | Feature work, not audit fix. Requires implementing per-codec hardware encoder selection (h264_videotoolbox / h264_nvenc / h264_qsv / h264_amf) with CPU fallback. Documented in PRD §14.10. |
| `#maxThreads`, `#timeoutSeconds`, `#autoRepair`, `#preserveOriginal` UI wiring | Feature work. Settings tab is cosmetic at v3.5.0. |
| `electron-builder` 25→26 upgrade (resolves 15 dev-only npm-audit vulns) | Breaking change. Requires re-validating full mac/win/linux × 6+ targets × multi-arch matrix. Should be a dedicated PR. |
| Inline `onclick=` migration | Coupled to `contextIsolation:true` migration. Doing one without the other breaks. Documented in PRD §14.14. |
| `nodeIntegration:false` / `contextIsolation:true` flip | Architectural; would require renderer.js refactor (no `require()` in renderer; all Node APIs through preload). Out of audit scope. |
| `<meta CSP>` tag | Optional hardening; meaningful only after the architectural flip above. |

---

## Final Verification

- `node --check src/main.js` → OK
- `node --check src/renderer/preload.js` → OK
- `node --check src/renderer/renderer.js` → OK
- `eslint src/` → 0 errors, 0 warnings (Step 4 baseline maintained)
- `npm audit --omit=dev` → 0 vulnerabilities

---

## Status

**DONE_WITH_CONCERNS** — 2 LOW findings, 2 auto-fixed, 0 deferred at LOW severity. 5 INFO items deferred (3 are feature work, 1 is the documented npm-audit electron-builder breaking upgrade, 1 is the documented architectural flip). No CRITICAL/HIGH/MEDIUM findings. Repo is audit-clean for the v3.5.0 release surface.
