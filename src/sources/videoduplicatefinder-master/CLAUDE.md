# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video Duplicate Finder is a cross-platform .NET application built with Avalonia UI that finds duplicate video and image files based on visual similarity. Unlike traditional duplicate finders, it can identify duplicates with different resolutions, frame rates, and even watermarks.

## Common Development Commands

### Building and Running
```bash
# Build the solution
dotnet build

# Run the GUI application
dotnet run --project VDF.GUI/VDF.GUI.csproj

# Build for release
dotnet build -c Release

# Publish for current platform
dotnet publish VDF.GUI/VDF.GUI.csproj -c Release -r osx-x64 --self-contained

# Run the published macOS binary
./publish-macos/VDF.GUI
```

### Platform-Specific Publishing
```bash
# macOS (Intel)
dotnet publish VDF.GUI/VDF.GUI.csproj -c Release -r osx-x64 --self-contained

# macOS (Apple Silicon)
dotnet publish VDF.GUI/VDF.GUI.csproj -c Release -r osx-arm64 --self-contained

# Windows
dotnet publish VDF.GUI/VDF.GUI.csproj -c Release -r win-x64 --self-contained

# Linux
dotnet publish VDF.GUI/VDF.GUI.csproj -c Release -r linux-x64 --self-contained
```

## Architecture Overview

### Solution Structure
- **VDF.Core**: Core library containing video analysis engine, FFmpeg integration, and business logic
- **VDF.GUI**: Avalonia-based cross-platform GUI application

### Core Components

#### VDF.Core
- **ScanEngine.cs**: Main scanning engine orchestrating duplicate detection
- **FFTools/**: FFmpeg and FFprobe integration for video analysis
  - **FfmpegEngine.cs**: Video frame extraction and processing
  - **FFProbeEngine.cs**: Media metadata extraction
  - **FFmpegNative/**: Native FFmpeg library bindings for performance
- **FileEntry.cs**: Represents analyzed media files with hashes and metadata
- **MediaInfo.cs**: Media file information container
- **Utils/**: Utility classes for logging, database operations, and file handling

#### VDF.GUI
- **Program.cs**: Application entry point with Avalonia configuration
- **MainWindow.xaml/cs**: Primary application window
- **ViewModels/**: MVVM view models for UI logic
- **Views/**: Avalonia XAML views for UI components

### Key Architecture Patterns
1. **MVVM Pattern**: ReactiveUI-based MVVM architecture for clean separation of concerns
2. **Async Processing**: Extensive use of async/await for responsive UI during scanning
3. **FFmpeg Integration**: Dual approach with process-based and native library options
4. **Cross-Platform Design**: Platform-agnostic code with specific handling where needed

## FFmpeg Requirements

The application requires FFmpeg and FFprobe binaries to function:

### Installation Locations
- Same directory as VDF.GUI.dll
- Subdirectory named `bin`
- System PATH

### Platform-Specific Installation
- **Windows**: Download from ffmpeg.org (shared GPL version required for native binding)
- **Linux**: `sudo apt-get install ffmpeg`
- **macOS**: `brew install ffmpeg`

## Key Technical Details

### Target Framework
- .NET 9.0 with nullable reference types enabled

### Major Dependencies
- **Avalonia 11.2.3**: Cross-platform UI framework
- **ActiPro Avalonia Controls**: Enhanced UI components
- **FFmpeg.AutoGen**: FFmpeg native library bindings
- **protobuf-net**: Efficient serialization for scan results
- **SixLabors.ImageSharp**: Image processing for thumbnails

### Scanning Process
1. File enumeration based on configured paths and filters
2. Media info extraction via FFprobe
3. Frame extraction and hash generation
4. Similarity comparison using perceptual hashing
5. Duplicate grouping based on threshold

### Performance Features
- Incremental database for fast rescanning
- Parallel processing with configurable thread count
- Native FFmpeg integration option for speed
- Efficient frame sampling strategies

## Development Considerations

### Platform Detection
The application uses `UsePlatformDetect()` in Avalonia configuration and handles platform-specific paths and behaviors accordingly.

### File Permissions
- macOS: May require terminal permissions in Privacy & Security settings
- macOS: Binary signing may be needed: `codesign --force --sign - ./VDF.GUI`

### Debugging
- Visual Studio 2022 recommended for development
- Cross-platform debugging supported via VS Code with C# extension

### Native Libraries
The `publish-macos` directory contains platform-specific native libraries:
- Avalonia native libraries (libAvaloniaNative.dylib)
- SkiaSharp graphics (libSkiaSharp.dylib)
- .NET runtime libraries
- FFmpeg integration support