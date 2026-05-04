# Version Map

## Active Version

| Version | Location | Status | Notes |
|---------|----------|--------|-------|
| **3.5.0** | `/` (root) | 🟢 **ACTIVE** | Cross-platform Electron desktop app for video corruption analysis & repair, bundled FFmpeg toolchain |

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 3.5.0 | 2026-03-14 | Neo-Noir Glass Monitor restyle, security hardening (path traversal, command injection avoidance, IPC channel allowlist), main.js Linux Chromium flags injection (enable-transparent-visuals, disable-gpu-compositing, no-sandbox) |
| 3.0.0 | 2025-09 | Full FFmpeg integration, advanced repair engine, multi-strategy repair (extract-playable / container-repair / stream-remux / deep-repair), real-time progress, HTML/CSV export, batch processing, frame extraction |

## Archive Locations

Local timestamped backups: `archive/`

| Backup | Date | Notes |
|--------|------|-------|
| `20260207_194340.zip` | 2026-02-07 | |
| `20260208_132037.zip` | 2026-02-08 | |
| `20260208_143732.zip` | 2026-02-08 | |
| `20260217_224522.zip` | 2026-02-17 | |
| `20260314_161526.tar.gz` | 2026-03-14 | |
| `20260417_231223-pre-pipeline-step3.zip` | 2026-04-17 | Pre-/repoprep snapshot |
| `neo-noir-restyle-backup-20260314_202152/` | 2026-03-14 | Pre-restyle snapshot dir |
| `docs-cleanup-20260417/` | 2026-04-17 | Files archived during /repodocs (Step 2) |

Pre-trash (soft delete): `/media/heathen-admin/RAID/AI-Pre-Trash/vid-beast/{TIMESTAMP}/`
- 2026-04-17 move: `src/main.js.backup.*` files, `build_resources_legacy/` (consolidated into `resources/`)

## Legacy Versions

`legacy/` folder contains pre-restyle / pre-restructure code preserved as reference. Not packaged, not built.

Vendored reference (NOT a VidBeast version): `src/sources/videoduplicatefinder-master/` — C# project (VideoDuplicateFinder by 0x90d) kept as design inspiration for a not-yet-implemented duplicate detection feature. Excluded from packaging via `package.json` `build.files` `!src/sources/**`.

---

*Last Updated: 2026-04-17 (during /repopipeline Step 3 /repoprep)*
