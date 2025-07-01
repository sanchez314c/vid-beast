# Frequently Asked Questions

## General Questions

### What is VidBeast?
VidBeast is an advanced video corruption analysis and repair engine with FFmpeg integration. It helps users detect, analyze, and repair corrupted video files that other tools can't handle.

### What video formats does VidBeast support?
VidBeast supports all major video formats:
- MP4, MOV, AVI, MKV, FLV, WebM
- WMV, MPG, MPEG, M4V
- And most other container formats

### Is VidBeast free?
VidBeast is open source under the MIT license. The basic version is free to use and modify.

### What platforms does VidBeast run on?
VidBeast supports:
- **macOS**: Intel, Apple Silicon, and Universal builds
- **Windows**: x64, x86, and ARM64
- **Linux**: x64, ARM64, and ARMv7l

## Installation

### How do I install VidBeast?
See the [Installation Guide](INSTALLATION.md) for detailed instructions for your platform.

### Do I need to install FFmpeg separately?
No. VidBeast includes platform-specific FFmpeg binaries. However, you can use your system FFmpeg if preferred.

### Why does Windows Defender flag VidBeast?
This is a false positive common to new applications. You can safely add VidBeast to Windows Defender exclusions or wait for signature verification.

## Usage

### How do I analyze a video file?
1. Launch VidBeast
2. Drag and drop video files into the application
3. Click "Analyze" to start corruption detection
4. Review the analysis results

### How do I repair a corrupted video?
1. Analyze the video file first
2. Review the corruption report
3. Click "Repair" to start the repair process
4. Choose repair options if prompted
5. Wait for completion and check results

### Can VidBeast repair all corruption?
No. Some corruption is too severe to repair. VidBeast will:
- Repair container issues (most common)
- Extract playable portions from partially corrupted files
- Fix audio/video sync issues
- Recover metadata

However, completely destroyed files may be unrecoverable.

### How long does analysis take?
Analysis time depends on:
- File size (larger files take longer)
- Corruption level (more corruption = more analysis)
- System performance

Typical times:
- Small files (<100MB): 5-30 seconds
- Medium files (100MB-1GB): 30 seconds-2 minutes
- Large files (>1GB): 2-10 minutes

## Technical

### What causes video corruption?
Common causes include:
- **Incomplete downloads/transfers**
- **Storage device failures**
- **Software crashes during recording**
- **File system errors**
- **Malware or virus damage**
- **Power failures during writing**

### How does VidBeast detect corruption?
VidBeast uses multiple analysis methods:
- **Container validation**: Checks file structure integrity
- **Stream analysis**: Validates video/audio streams
- **Bitstream inspection**: Examines encoded data
- **Playability testing**: Attempts to decode content

### What repair strategies does VidBeast use?
VidBeast employs multiple strategies:
1. **Container repair**: Fixes file structure issues
2. **Stream remuxing**: Rebuilds video/audio streams
3. **Frame extraction**: Salvages decodable frames
4. **Audio repair**: Fixes corrupted audio tracks

### Can VidBeast recover lost data?
VidBeast cannot recover data that was never written or has been completely overwritten. It can only:
- Repair existing corrupted data
- Extract salvageable portions
- Reconstruct damaged metadata

## Troubleshooting

### VidBeast won't start
**Solutions:**
1. Check if your system meets requirements
2. Ensure all dependencies are installed
3. Try running as administrator
4. Check antivirus software isn't blocking it
5. Reinstall the application

### Analysis fails with error
**Common solutions:**
1. Check file permissions
2. Ensure file isn't in use by another program
3. Verify file format is supported
4. Check available disk space
5. Try with a different file

### Repair doesn't improve the file
**Possible reasons:**
1. File is too severely corrupted
2. Corruption type isn't repairable
3. Original file had no recoverable content
4. Repair strategy wasn't appropriate

**Try:**
1. Different repair options
2. Extract only playable portions
3. Use a backup copy if available

### Application crashes during processing
**Solutions:**
1. Check available memory (large files need more RAM)
2. Close other applications
3. Process smaller files first
4. Update to latest version
5. Report the issue with details

### Progress bar stuck
**Causes:**
1. Very large file processing
2. Complex corruption requiring more time
3. System resource limitations

**Actions:**
1. Wait longer (some operations take time)
2. Check system resources
3. Try with a smaller file
4. Restart the application

## Performance

### How can I improve performance?
**Optimizations:**
1. Use SSD storage for faster I/O
2. Ensure sufficient RAM (16GB+ recommended)
3. Close unnecessary applications
4. Use appropriate repair settings
5. Process files sequentially, not in parallel

### Why does VidBeast use so much memory?
Video processing is memory-intensive because:
- Large files must be loaded for analysis
- Multiple data structures track corruption
- Repair operations create temporary copies

**To reduce usage:**
1. Process smaller files
2. Close other applications
3. Increase virtual memory if needed

## Security

### Is VidBeast safe to use?
Yes. VidBeast:
- Processes files locally (no cloud uploads)
- Uses sandboxed processes
- Has been security reviewed
- Is open source for transparency

### Does VidBeast collect data?
No. VidBeast:
- Does not collect personal data
- Does not upload file contents
- Does not track usage (unless enabled)
- Does not require internet for basic operation

### How are my files protected?
VidBeast protects your files by:
- Never modifying original files
- Creating backups before repairs
- Using secure temporary storage
- Cleaning up temporary files automatically

## Advanced

### Can I use VidBeast from command line?
Yes. VidBeast includes CLI support:
```bash
# Analyze a file
vidbeast analyze video.mp4

# Repair a file
vidbeast repair video.mp4 --output repaired.mp4

# Batch process
vidbeast batch /videos/ --output /repaired/
```

### How do I integrate VidBeast into my workflow?
Options include:
- **Drag and drop**: Direct file input
- **Command line**: Script integration
- **File association**: Open with VidBeast
- **API**: Programmatic access (planned)

### Can I extend VidBeast functionality?
Yes. VidBeast supports:
- **Plugin system**: Custom processors
- **Script integration**: Automation
- **API access**: For developers
- **Open source**: Modify and contribute

## Licensing

### Can I use VidBeast commercially?
Yes. VidBeast uses the MIT license, which permits:
- Commercial use
- Modification
- Distribution
- Private use
- Sublicensing

### What are my obligations?
Under MIT license, you must:
- Include the license text
- Preserve copyright notices
- Not hold authors liable
- Not use trademark without permission

## Support

### How do I get help?
Options:
1. **Documentation**: Check this FAQ and guides
2. **Community**: Join our Discord server
3. **Issues**: Report on GitHub
4. **Email**: Contact support@vidbeast.com

### How do I report bugs?
Please include:
- **Description**: What happened
- **Steps to reproduce**: Exact actions
- **Expected vs actual**: What should vs did happen
- **System info**: OS, version, hardware
- **Files**: Sample files if possible and safe

### How do I request features?
1. Check if already requested in issues
2. Create a new issue with "enhancement" label
3. Describe the use case and benefit
4. Provide examples if helpful

## Development

### How can I contribute to VidBeast?
See the [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

### What skills are needed?
Helpful skills include:
- **JavaScript/TypeScript**: Core development
- **Electron**: Desktop application development
- **FFmpeg**: Video processing knowledge
- **Node.js**: Backend development
- **Testing**: Quality assurance

### Where can I find the source code?
Source code is available at:
- **GitHub**: https://github.com/vidbeast/vidbeast
- **MIT License**: Free to use and modify

---

**Still have questions?**

- Check our [documentation index](DOCUMENTATION_INDEX.md)
- Visit our [website](https://vidbeast.com)
- Join our [Discord community](https://discord.gg/vidbeast)
- Contact [support](mailto:support@vidbeast.com)

**Last Updated**: October 2025