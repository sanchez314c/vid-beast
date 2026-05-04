## Summary
Brief description of what this PR does.

## Changes
- Change 1
- Change 2

## Type
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (requires CHANGELOG.md major bump)
- [ ] Refactor (no functional change)
- [ ] Documentation only
- [ ] Build / packaging / CI

## Tested on
- [ ] macOS (specify arch: x64 / arm64)
- [ ] Windows (specify arch)
- [ ] Linux (distro + arch)

## Verification
How was this tested? Include the actual files/folders used or the FFmpeg invocation that was exercised.
- Sample file(s) tried:
- Repair strategies exercised:
- Output format verified:

## Checklist
- [ ] Source builds cleanly: `npm run dev`
- [ ] Production build succeeds for at least one platform: `npm run build:linux` (or mac/win)
- [ ] No new ESLint or console errors in the renderer DevTools
- [ ] No new shell injection paths (every `child_process.spawn` uses array args, no `exec` with concatenated user input)
- [ ] CHANGELOG.md updated with a one-line entry under the next unreleased version
- [ ] Documentation updated (README / docs/) if behavior or commands changed
- [ ] No secrets, tokens, or `.env` files committed
- [ ] Backup files (`*.backup.*`) not introduced into `src/`
