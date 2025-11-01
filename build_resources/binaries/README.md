# FFmpeg Binaries

This directory contains bundled FFmpeg binaries for different platforms.

## Directory Structure
- `darwin-x64/`: macOS Intel binaries (ffmpeg, ffprobe)
- `darwin-arm64/`: macOS Apple Silicon binaries (ffmpeg, ffprobe)
- `win32-x64/`: Windows 64-bit binaries (ffmpeg.exe, ffprobe.exe)
- `linux-x64/`: Linux 64-bit binaries (ffmpeg, ffprobe)

## Installation Instructions

To bundle FFmpeg with VidBeast, download the appropriate binaries for each platform:

### macOS
Download from: https://evermeet.cx/ffmpeg/
- Place `ffmpeg` and `ffprobe` in both `darwin-x64/` and `darwin-arm64/` folders

### Windows
Download from: https://www.gyan.dev/ffmpeg/builds/
- Place `ffmpeg.exe` and `ffprobe.exe` in `win32-x64/` folder

### Linux
Download from: https://johnvansickle.com/ffmpeg/
- Place `ffmpeg` and `ffprobe` in `linux-x64/` folder

## File Permissions
Make sure binary files have execute permissions (chmod +x) on Unix-based systems.