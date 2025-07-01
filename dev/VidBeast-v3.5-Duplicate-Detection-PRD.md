# VidBeast v3.5 - Video Duplicate Detection Feature PRD

## Product Requirements Document
**Version:** 1.0  
**Date:** August 3, 2025  
**Product:** VidBeast v3.5  
**Feature:** Video Duplicate Detection Integration

## 1. Executive Summary

VidBeast v3.5 will integrate advanced video duplicate detection capabilities inspired by the Video Duplicate Finder project. This feature will enable users to identify duplicate videos based on visual similarity rather than exact file matching, supporting different resolutions, frame rates, and even watermarked content.

## 2. Background and Objectives

### 2.1 Background
- VidBeast v3.0 focuses on video corruption analysis and repair
- Users often have duplicate videos consuming storage space
- Current tools only find exact file matches, missing visually similar content
- Video Duplicate Finder demonstrates effective perceptual hashing techniques

### 2.2 Objectives
- Integrate duplicate detection without disrupting existing functionality
- Maintain VidBeast's current tech stack (Electron + JavaScript)
- Provide seamless user experience within existing UI
- Leverage existing FFmpeg integration for frame extraction

## 3. Feature Requirements

### 3.1 Core Functionality

#### 3.1.1 Duplicate Detection Engine
- **Perceptual Hashing**: Implement video fingerprinting using perceptual hashes
- **Frame Sampling**: Extract frames at strategic positions (10%, 25%, 50%, 75%, 90%)
- **Similarity Scoring**: Calculate similarity percentage between video pairs
- **Batch Processing**: Support scanning multiple directories simultaneously
- **Progress Tracking**: Real-time progress updates during scanning

#### 3.1.2 Detection Algorithms
- **Visual Similarity**: Compare videos with different resolutions/bitrates
- **Threshold Configuration**: User-adjustable similarity threshold (70-100%)
- **Smart Sampling**: Adaptive frame selection based on video duration
- **Performance Optimization**: Parallel processing with configurable thread count

### 3.2 User Interface Requirements

#### 3.2.1 New UI Components
- **Duplicate Finder Tab**: New tab alongside existing Analysis/Repair tabs
- **Scan Configuration Panel**: 
  - Directory selection (multiple paths)
  - File type filters
  - Similarity threshold slider
  - Advanced options (thread count, frame count)
- **Results Display**:
  - Grouped duplicate sets
  - Side-by-side thumbnail comparison
  - File metadata comparison
  - Action buttons (delete, move, keep)

#### 3.2.2 Integration Points
- Utilize existing tab navigation system
- Reuse current file selection components
- Extend existing progress bar implementation
- Maintain consistent visual styling

### 3.3 Technical Requirements

#### 3.3.1 Architecture
- **Main Process Integration**:
  - New `duplicateScanner.js` module
  - IPC handlers for scan operations
  - Frame extraction using existing FFmpeg
  - Hash generation and comparison logic

- **Renderer Process Updates**:
  - New duplicate finder view components
  - Results visualization
  - User interaction handlers

#### 3.3.2 Data Flow
1. User selects directories and configures scan
2. Renderer sends scan request via IPC
3. Main process enumerates video files
4. FFmpeg extracts frames at specified positions
5. Generate perceptual hashes for each frame set
6. Compare hashes between all video pairs
7. Group similar videos based on threshold
8. Return results to renderer for display

### 3.4 Performance Requirements
- Scan 1000 videos in under 10 minutes
- Memory usage under 500MB for typical scans
- Non-blocking UI during scan operations
- Incremental results display
- Ability to pause/resume scans

## 4. Implementation Plan

### 4.1 Phase 1: Core Infrastructure
- Create duplicate detection module
- Implement perceptual hashing algorithm
- Add IPC communication handlers
- Basic frame extraction pipeline

### 4.2 Phase 2: User Interface
- Design and implement Duplicate Finder tab
- Create scan configuration controls
- Build results display components
- Integrate progress tracking

### 4.3 Phase 3: Advanced Features
- Thumbnail comparison view
- Batch operations (delete/move)
- Scan history and incremental scanning
- Export duplicate reports

### 4.4 Phase 4: Optimization
- Performance tuning
- Memory optimization
- UI responsiveness improvements
- Cross-platform testing

## 5. Dependencies

### 5.1 New NPM Packages
- `jimp` or `sharp`: Image processing for hash generation
- `image-hash`: Perceptual hashing library (alternative)
- `xxhashjs`: Fast hashing for file identification

### 5.2 Existing Dependencies
- FFmpeg: Frame extraction (already integrated)
- Electron IPC: Communication layer
- Chart.js: Results visualization

## 6. User Stories

1. **As a user**, I want to find duplicate videos across multiple folders to free up disk space
2. **As a user**, I want to identify similar videos even if they have different resolutions
3. **As a user**, I want to see visual comparisons of potential duplicates before deleting
4. **As a user**, I want to set how similar videos must be to be considered duplicates
5. **As a user**, I want to track scan progress and pause if needed

## 7. Success Metrics

- Correctly identify 95%+ of duplicate videos
- False positive rate under 5%
- Scan performance meets target speeds
- User satisfaction with duplicate detection accuracy
- No regression in existing VidBeast functionality

## 8. Risk Mitigation

### 8.1 Technical Risks
- **Memory Usage**: Implement streaming hash comparison
- **CPU Load**: Add throttling and priority controls
- **FFmpeg Compatibility**: Test with various FFmpeg versions
- **Large Video Files**: Implement smart sampling strategies

### 8.2 User Experience Risks
- **Accidental Deletion**: Implement confirmation dialogs
- **Performance Impact**: Add low-priority scan mode
- **Complex UI**: Provide simple and advanced modes

## 9. Testing Strategy

### 9.1 Unit Tests
- Hash generation accuracy
- Similarity calculation correctness
- File enumeration logic
- IPC message handling

### 9.2 Integration Tests
- End-to-end scan workflow
- UI responsiveness during scans
- FFmpeg integration stability
- Cross-platform compatibility

### 9.3 Performance Tests
- Large directory scanning
- Memory leak detection
- CPU usage monitoring
- UI responsiveness metrics

## 10. Documentation Requirements

- Update CLAUDE.md with duplicate detection architecture
- Add user guide for duplicate finder feature
- Document new IPC endpoints
- Provide troubleshooting guide

## 11. Future Enhancements

- Machine learning-based similarity detection
- Audio duplicate detection
- Cloud storage integration
- Automated duplicate resolution rules
- Integration with file managers

## 12. Acceptance Criteria

- [ ] Duplicate detection engine successfully identifies similar videos
- [ ] UI provides intuitive scan configuration and results display
- [ ] Performance meets specified requirements
- [ ] No regression in existing VidBeast features
- [ ] Documentation is complete and accurate
- [ ] All tests pass on Windows, macOS, and Linux