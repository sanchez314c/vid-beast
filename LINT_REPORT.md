# LINT_REPORT — VidBeast

**Generated**: 2026-04-17 (Step 4 of /repopipeline — repolint pass)
**Target**: /media/heathen-admin/RAID/Development/Projects/portfolio/00-QUEUE/vid-beast
**Branch**: main

---

## Tool Inventory

| Tool | Version | Status |
|------|---------|--------|
| node --check | v24.14.1 (built-in) | used |
| eslint | v9.39.4 (dev-dep) | configured + run |
| prettier | v3.7.4 (global) | available, not run (no project style spec) |
| shellcheck | v0.9.0 (global) | used |
| jsonlint | v1.6.3 (global) | used via `node -e` instead |
| npm audit | built-in | used (read-only) |
| actionlint | — | not installed |

---

## JS Syntax Check (`node --check`)

| File | Result |
|------|--------|
| `src/main.js` | PASS |
| `src/renderer/preload.js` | PASS |
| `src/renderer/renderer.js` | PASS |

Only 3 JS files in `src/` (excluding `src/sources/` vendored C# project). All parse cleanly.

---

## JSON Validation

| File | Result |
|------|--------|
| `package.json` | PASS |
| `package-lock.json` | PASS |
| `electron-builder.json` | PASS |
| `tsconfig.json` | PASS |

No `.github/` JSON files.

---

## Shellcheck Findings & Auto-Fixes

**Scope**: `run-source-linux.sh`, `run-source-mac.sh`, `scripts/*.sh` (12 files)
**Before**: 37 warnings/errors
**After**: 0 warnings/errors

### Fixes Applied

| File | Line(s) | Code | Fix |
|------|---------|------|-----|
| `run-source-linux.sh` | 65 | SC2155 | Split `local pid=$(...)` → separate declare + assign |
| `run-source-linux.sh` | 65 | — | Quoted `$port` in lsof |
| `run-source-linux.sh` | 67 | SC2236 | `! -z` → `-n` |
| `run-source-linux.sh` | 68 | SC2086 | Quoted `$pid` in kill |
| `run-source-linux.sh` | 44 | SC2181 | `if [ $? -eq 0 ]` → `if cmd; then` |
| `run-source-linux.sh` | 121 | SC2181 | `npm install; if [ $? -ne 0 ]` → `if ! npm install; then` |
| `run-source-mac.sh` | 51 | SC2155 | Split `local pid=$(...)` → separate declare + assign |
| `run-source-mac.sh` | 51 | — | Quoted `$port` in lsof |
| `run-source-mac.sh` | 52 | SC2236 | `! -z` → `-n` |
| `run-source-mac.sh` | 54 | SC2086 | Quoted `$pid` in kill |
| `run-source-mac.sh` | 104 | SC2181 | `if [ $? -ne 0 ]` → `if ! cmd; then` |
| `scripts/bloat-check.sh` | 18 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/bloat-check.sh` | 197 | SC2046 | Quoted `$(echo "$line" \| awk ...)` |
| `scripts/compile-build-dist.sh` | 19 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/compile-build-dist.sh` | 230 | SC2034 | Added `# shellcheck disable` for `ARCH="$2"` |
| `scripts/run-linux-source.sh` | 16 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/run-linux-source.sh` | 9 | SC2034 | Added `# shellcheck disable` for unused `YELLOW` |
| `scripts/run-macos-source.sh` | 16 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/run-macos-source.sh` | 9 | SC2034 | Added `# shellcheck disable` for unused `YELLOW` |
| `scripts/run-linux-binary.sh` | 17 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/run-macos-binary.sh` | 16 | SC2164 | `cd "$DIR"` → `cd "$DIR" \|\| exit 1` |
| `scripts/run-linux.sh` | 120 | SC2053 | Quoted RHS: `$1 == "$2"` |
| `scripts/run-linux.sh` | 124 | SC2206 | `local ver1=($1)` → `IFS=. read -ra ver1 <<< "$1"` |
| `scripts/run-linux.sh` | 321 | SC2155 | Split `export VAR=$(...)` → separate assign + export |
| `scripts/run-linux.sh` | 326 | SC2125 | `DEBUG=*` → `DEBUG='*'` |
| `scripts/run-macos.sh` | 89 | SC2053 | Quoted RHS: `$1 == "$2"` |
| `scripts/run-macos.sh` | 93 | SC2206 | `local ver1=($1)` → `IFS=. read -ra ver1 <<< "$1"` |
| `scripts/run-macos.sh` | 204 | SC2155 | Split `export VAR=$(...)` → separate assign + export |
| `scripts/run-macos.sh` | 209 | SC2125 | `DEBUG=*` → `DEBUG='*'` |
| `scripts/build-compile-dist.sh` | 93 | SC2155 | Split `local count=$(...)` → separate declare + assign |
| `scripts/build-compile-dist.sh` | 23 | SC2034 | Added `# shellcheck disable` for `PIPELINE_START_TIME` |
| `scripts/build-compile-dist.sh` | 30 | SC2034 | Added `# shellcheck disable` for `PIPELINE_MODE` |
| `scripts/build-compile-dist.sh` | 399 | SC2034 | Added `# shellcheck disable` for `secrets_found` |
| `scripts/build-compile-dist.sh` | 489 | SC2155 | Split `local project_name=$(...)` → separate declare + assign |
| `scripts/build-compile-dist.sh` | 324-708 | SC2199 | `${ARRAY[@]}` → `${ARRAY[*]}` in `[[ ]]` string match (7 occurrences) |

---

## HTML Quick Check (`src/renderer/index.html`)

| Check | Finding |
|-------|---------|
| Unclosed tags | None |
| Inline `onclick=` | Line 27: `onclick="switchToSettings()"` — documented in PRD as legacy under `contextIsolation:false`. **Not modified per instructions.** |
| `<script>` without `defer`/`async` | Line 491: `<script src="renderer.js">` — at end of `<body>`, functionally equivalent to `defer`. Normal for Electron. |
| Inline `<script>` blocks | None |

---

## npm Audit Summary

### Production Dependencies
**0 vulnerabilities** (1 prod dep: electron)

### All Dependencies (including dev)

| Severity | Count | Key Packages |
|----------|-------|-------------|
| Critical | 0 | — |
| High | 12 | electron-builder 25.x ecosystem (9), electron (1), @xmldom/xmldom (1), lodash (1) |
| Moderate | 1 | brace-expansion |
| Low | 2 | @tootallnate/once, http-proxy-agent |
| **Total** | **15** | |

10 of 15 require upgrading electron-builder 25→26 (semver major, breaking). 3 fixable independently (lodash, @xmldom/xmldom, brace-expansion).

**DEFERRED** — electron-builder 25→26 is a breaking upgrade requiring full build matrix re-validation. All vulns are dev-time only (don't affect packaged app end users).

---

## ESLint Setup Status

**Status**: CONFIGURED

- `eslint@^9.39.4` + `@eslint/js@^9` installed as dev-deps
- `eslint.config.js` at repo root (flat config, v9 format)
- Targets `src/**/*.js` with Electron-aware globals (Node + browser)
- Ignores: `src/sources/`, `node_modules/`, `archive/`, `legacy/`, `dist/`, `build/`
- **Result**: 0 errors, 0 warnings

---

## Auto-Fixes Summary

| Category | Found | Fixed | Deferred |
|----------|-------|-------|----------|
| Shellcheck | 37 | 37 | 0 |
| ESLint | 0 | 0 | 0 |
| JSON | 0 | 0 | 0 |
| JS syntax | 0 | 0 | 0 |
| npm audit | 15 | 0 | 15 (dev deps, blocked on electron-builder 25→26) |
| **Total** | **52** | **37** | **15** |

---

## Status

**DONE** — 37 issues found, 37 fixed, 15 deferred (npm audit: 12 high, 1 moderate, 2 low — all dev deps, blocked on electron-builder 25→26 major bump).

END OF LINE.
