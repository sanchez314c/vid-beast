# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Problem: Application won't install
**Symptoms:**
- Installer fails with error message
- Installation hangs or crashes
- Permission denied errors

**Solutions:**
1. **Check System Requirements**
   - Verify OS version compatibility
   - Ensure sufficient disk space (500MB minimum)
   - Confirm administrator privileges

2. **Windows Specific**
   ```
   # Run installer as Administrator
   Right-click installer → "Run as administrator"
   
   # Check Windows version
   winver
   ```

3. **macOS Specific**
   ```bash
   # Allow unsigned applications
   sudo spctl --master-disable
   
   # Reset Gatekeeper
   sudo spctl --master-enable
   ```

4. **Linux Specific**
   ```bash
   # Make AppImage executable
   chmod +x VidBeast.AppImage
   
   # Install missing dependencies
   sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils
   ```

#### Problem: FFmpeg not found
**Symptoms:**
- "FFmpeg not detected" error message
- Analysis/repair functions disabled
- Settings shows FFmpeg status as "Disconnected"

**Solutions:**
1. **Auto-Configure FFmpeg**
   - Go to Settings → FFmpeg
   - Click "Auto-Configure"
   - Restart application

2. **Manual FFmpeg Installation**
   ```bash
   # Windows (using Chocolatey)
   choco install ffmpeg
   
   # macOS (using Homebrew)
   brew install ffmpeg
   
   # Linux (Ubuntu/Debian)
   sudo apt update
   sudo apt install ffmpeg
   
   # Linux (Fedora/CentOS)
   sudo yum install ffmpeg
   ```

3. **Manual Path Configuration**
   - Go to Settings → FFmpeg
   - Click "Browse" and locate FFmpeg executable
   - Test connection with "Verify" button

### Performance Issues

#### Problem: Slow video processing
**Symptoms:**
- Analysis takes unusually long time
- Repair process is very slow
- High CPU/memory usage

**Solutions:**
1. **Optimize Settings**
   - Go to Settings → Performance
   - Reduce "Concurrent Processes" to 2
   - Enable "Hardware Acceleration" if available
   - Set "Process Priority" to "High"

2. **System Optimization**
   ```bash
   # Close unnecessary applications
   # Free up disk space (minimum 10GB free)
   # Check for malware
   # Update graphics drivers
   ```

3. **File-Specific Solutions**
   - Use "Quick Repair" for minor issues
   - Split large files into smaller segments
   - Try different repair strategies

#### Problem: Application crashes or freezes
**Symptoms:**
- Application unexpectedly closes
- UI becomes unresponsive
- "Not responding" error

**Solutions:**
1. **Immediate Actions**
   - Restart the application
   - Restart your computer
   - Check for available updates

2. **Clear Application Cache**
   ```bash
   # Windows
   del /s /q "%APPDATA%\vid-beast\*"
   
   # macOS
   rm -rf ~/Library/Application\ Support/vid-beast/Cache/*
   
   # Linux
   rm -rf ~/.config/vid-beast/cache/*
   ```

3. **Reset Configuration**
   - Go to Settings → Advanced
   - Click "Reset to Defaults"
   - Restart application

### Video Processing Issues

#### Problem: Analysis fails with error
**Symptoms:**
- "Analysis failed" error message
- No corruption detected in obviously corrupted file
- Error codes or technical error messages

**Solutions:**
1. **Check File Integrity**
   - Verify file is not completely corrupted (0 bytes)
   - Try playing file in VLC Media Player
   - Check file permissions

2. **Adjust Analysis Settings**
   - Go to Settings → Analysis
   - Increase "Analysis Depth"
   - Enable "Deep Scan" option
   - Disable "Fast Analysis" mode

3. **Alternative Analysis Methods**
   ```bash
   # Use FFprobe directly
   ffprobe -v error -show_format -show_streams input.mp4
   
   # Check file with VLC
   # Open file in VLC → Tools → Codec Information
   ```

#### Problem: Repair doesn't fix corruption
**Symptoms:**
- Repaired file still has issues
- Repair completes but file is unchanged
- New corruption introduced

**Solutions:**
1. **Try Different Repair Strategies**
   - Go to Settings → Repair Options
   - Switch from "Conservative" to "Aggressive"
   - Enable "Advanced Repair" options
   - Try "Deep Repair" mode

2. **Multiple Repair Attempts**
   - Run "Quick Repair" first
   - Follow with "Deep Repair" if needed
   - Try different output formats
   - Use "Segment Repair" for large files

3. **Alternative Output Formats**
   - Convert to different container (MP4 → MKV)
   - Change codec settings
   - Adjust bitrate and quality parameters

### File System Issues

#### Problem: Can't access video files
**Symptoms:**
- "Permission denied" errors
- "File not found" errors
- Can't add files to queue

**Solutions:**
1. **Check File Permissions**
   ```bash
   # Windows
   icacls "C:\path\to\video.mp4"
   
   # macOS/Linux
   ls -la "/path/to/video.mp4"
   chmod 644 "/path/to/video.mp4"
   ```

2. **Network Drive Issues**
   - Map network drive locally
   - Copy files to local storage first
   - Check network connectivity
   - Verify network credentials

3. **Special Characters in Paths**
   - Rename files without special characters
   - Move files to simpler path structure
   - Avoid spaces and unicode characters

### Platform-Specific Issues

#### Windows Issues
**Problem: Windows Defender blocks application**
```
Solution:
1. Open Windows Security → Virus & threat protection
2. Click "Manage settings" → Add or remove exclusions
3. Add VidBeast installation folder as exclusion
4. Add VidBeast.exe as process exclusion
```

**Problem: Missing DLL files**
```
Solution:
1. Install Microsoft Visual C++ Redistributable
2. Update Windows to latest version
3. Run System File Checker: sfc /scannow
4. Install latest DirectX runtime
```

#### macOS Issues
**Problem: "App is damaged and can't be opened"**
```bash
Solution:
1. Remove app quarantine attribute
sudo xattr -r -d com.apple.quarantine /Applications/VidBeast.app

2. Reset Gatekeeper
sudo spctl --master-disable
# Install app, then re-enable
sudo spctl --master-enable
```

**Problem: Notarization issues**
```bash
Solution:
1. Allow app from Security & Privacy preferences
2. Right-click app → Open → Click "Open" in dialog
3. Update to latest macOS version
```

#### Linux Issues
**Problem: Missing libraries**
```bash
Solution:
# Ubuntu/Debian
sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0 libasound2

# Fedora/CentOS
sudo yum install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils atk cups-libs libXcomposite libXcursor libXdamage libXrandr libgbm libxkbcommon alsa-lib
```

### Debugging and Diagnostics

#### Enable Debug Mode
1. Go to Settings → Advanced
2. Enable "Debug Mode"
3. Restart application
4. Check debug logs in:
   - Windows: `%APPDATA%/vid-beast/logs/`
   - macOS: `~/Library/Logs/vid-beast/`
   - Linux: `~/.config/vid-beast/logs/`

#### Generate Diagnostic Report
1. Go to Help → Generate Diagnostic Report
2. Include system information and logs
3. Save report file for support ticket
4. Attach report when reporting issues

#### Command Line Diagnostics
```bash
# Check FFmpeg installation
ffmpeg -version
ffprobe -version

# Test video file
ffprobe -v error -show_format -show_streams input.mp4

# System information
# Windows
systeminfo

# macOS
system_profiler SPSoftwareDataType

# Linux
uname -a && lsb_release -a
```

### Getting Help

#### Support Channels
- **GitHub Issues**: [Report bugs](https://github.com/your-repo/vid-beast/issues)
- **Discord Community**: [Live chat support](https://discord.gg/vid-beast)
- **Documentation**: [Full documentation](https://docs.vid-beast.com)
- **Email Support**: support@vid-beast.com

#### When Reporting Issues
Include the following information:
1. **System Information**: OS version, hardware specs
2. **VidBeast Version**: Application version number
3. **Error Messages**: Complete error text and screenshots
4. **Steps to Reproduce**: Detailed reproduction steps
5. **Sample Files**: Non-sensitive sample files (if possible)
6. **Diagnostic Report**: Generated from application

#### Community Resources
- **FAQ**: [Frequently asked questions](FAQ.md)
- **User Guide**: [Complete user documentation](README.md)
- **Video Tutorials**: [YouTube channel](https://youtube.com/vid-beast)
- **Blog**: [Tips and tricks](https://blog.vid-beast.com)

---

**Still having issues?** Contact our support team with diagnostic report for personalized assistance.