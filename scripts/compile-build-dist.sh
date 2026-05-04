#!/bin/bash

# 🚀 VidBeast v3.5 - Complete Multi-Platform Build System
# Builds for macOS, Windows, and Linux with all installer types
# Includes automatic temp cleanup and bloat monitoring

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT" || exit 1

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get directory size safely
get_dir_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1 || echo "Unknown"
    else
        echo "N/A"
    fi
}

# Function to cleanup system temp directories
cleanup_system_temp() {
    print_status "🧹 Cleaning system temp directories..."
    
    # macOS temp cleanup
    if [ "$(uname)" = "Darwin" ]; then
        TEMP_DIR=$(find /private/var/folders -name "Temporary*" -type d 2>/dev/null | head -1)
        if [ -n "$TEMP_DIR" ]; then
            PARENT_DIR=$(dirname "$TEMP_DIR")
            BEFORE_SIZE=$(get_dir_size "$PARENT_DIR")
            
            # Clean up build artifacts (older than 1 day)
            find "$PARENT_DIR" -name "t-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "CFNetworkDownload_*.tmp" -mtime +1 -delete 2>/dev/null || true
            find "$PARENT_DIR" -name "electron-download-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "package-dir-staging-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "com.anthropic.claudefordesktop.ShipIt.*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "com.docker.install" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            
            AFTER_SIZE=$(get_dir_size "$PARENT_DIR")
            print_success "macOS temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi
    
    # Linux temp cleanup
    if [ "$(uname)" = "Linux" ]; then
        if [ -d "/tmp" ]; then
            BEFORE_SIZE=$(get_dir_size "/tmp")
            find /tmp -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "tmp-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "appimage-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            AFTER_SIZE=$(get_dir_size "/tmp")
            print_success "Linux temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi
}

# Function to set custom temp directory
setup_build_temp() {
    BUILD_TEMP_DIR="$PROJECT_ROOT/build-temp"
    mkdir -p "$BUILD_TEMP_DIR"
    export TMPDIR="$BUILD_TEMP_DIR"
    export TMP="$BUILD_TEMP_DIR"
    export TEMP="$BUILD_TEMP_DIR"
    export ELECTRON_CACHE="/Users/heathen-admin/.cache/electron"
    print_info "Using custom temp directory: $BUILD_TEMP_DIR"
}

# Function to perform bloat check
bloat_check() {
    print_status "🔍 Performing bloat analysis..."
    
    # Check node_modules size
    if [ -d "node_modules" ]; then
        NODE_SIZE=$(get_dir_size "node_modules")
        print_info "Node modules size: $NODE_SIZE"
        
        # Find largest dependencies
        print_info "Top 5 largest dependencies:"
        du -sh node_modules/* 2>/dev/null | sort -hr | head -5 | while read size dir; do
            print_info "  $size - $(basename "$dir")"
        done
    fi
    
    # Check for duplicates
    if command_exists npm; then
        DUPES_OUTPUT=$(npm dedupe --dry-run 2>/dev/null | grep -c "removed" 2>/dev/null || echo "0")
        # Extract just the first number in case of multiple outputs
        DUPES=$(echo "$DUPES_OUTPUT" | sed 's/[^0-9]*//g' | head -1 || echo "0")
        # Ensure it's a valid number
        if [[ "$DUPES" =~ ^[0-9]+$ ]] && [ "$DUPES" -gt 0 ]; then
            print_warning "⚠️  Found $DUPES duplicate packages - run 'npm dedupe'"
        fi
    fi
}

# Function to cleanup build temp after build
cleanup_build_temp() {
    if [ -n "$BUILD_TEMP_DIR" ] && [ -d "$BUILD_TEMP_DIR" ]; then
        print_status "🧹 Cleaning build temp directory..."
        TEMP_SIZE=$(get_dir_size "$BUILD_TEMP_DIR")
        rm -rf "$BUILD_TEMP_DIR" 2>/dev/null || true
        print_success "Cleaned build temp: $TEMP_SIZE"
    fi
}

# Function to create Windows icon from PNG
create_windows_icon() {
    print_status "🖼️  Preparing Windows icon..."
    
    if [ -f "assets/icons/icon.png" ]; then
        if command_exists convert; then
            # Use ImageMagick to create .ico
            convert "assets/icons/icon.png" -resize 256x256 "assets/icons/icon.ico" 2>/dev/null || true
            if [ -f "assets/icons/icon.ico" ]; then
                print_success "Created icon.ico from icon.png"
            fi
        elif command_exists sips && [ "$(uname)" = "Darwin" ]; then
            # macOS native image conversion
            sips -z 256 256 "assets/icons/icon.png" --out "assets/icons/icon.ico" 2>/dev/null || true
            if [ -f "assets/icons/icon.ico" ]; then
                print_success "Created icon.ico from icon.png (sips)"
            fi
        else
            print_warning "No image conversion tool available for creating .ico"
        fi
    fi
}

# Function to display help
show_help() {
    echo ""
    print_header "VidBeast v3.5 - Complete Multi-Platform Build System"
    echo ""
    echo "Usage: ./scripts/compile-build-dist.sh [options]"
    echo ""
    echo "Options:"
    echo "  --no-clean         Skip cleaning build artifacts"
    echo "  --no-temp-clean    Skip system temp cleanup"
    echo "  --no-bloat-check   Skip bloat analysis"
    echo "  --platform PLAT    Build for specific platform (mac, win, linux, all)"
    echo "  --arch ARCH        Build for specific architecture (x64, ia32, arm64, all)"
    echo "  --quick            Quick build (single platform only)"
    echo "  --help             Display this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/compile-build-dist.sh                    # Full build for all platforms"
    echo "  ./scripts/compile-build-dist.sh --platform mac     # macOS only"
    echo "  ./scripts/compile-build-dist.sh --quick            # Quick build for current platform"
    echo "  ./scripts/compile-build-dist.sh --no-clean         # Build without cleaning first"
    echo ""
    echo "Supported Output Formats:"
    echo "  📱 macOS:    .dmg, .pkg, .zip (Intel + ARM + Universal)"
    echo "  🖥️  Windows:  .exe, .msi, .appx, .zip, portable (x64 + x86)"
    echo "  🐧 Linux:    .AppImage, .deb, .rpm, .snap, .tar.gz (x64 + ARM)"
    echo ""
}

# Parse command line arguments
NO_CLEAN=false
NO_TEMP_CLEAN=false
NO_BLOAT_CHECK=false
PLATFORM="all"
ARCH="all"
QUICK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-clean)
            NO_CLEAN=true
            shift
            ;;
        --no-temp-clean)
            NO_TEMP_CLEAN=true
            shift
            ;;
        --no-bloat-check)
            NO_BLOAT_CHECK=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --arch)
            # shellcheck disable=SC2034
            ARCH="$2"
            shift 2
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Trap to ensure cleanup on exit
trap cleanup_build_temp EXIT

print_header "🚀 VidBeast v3.5 - Multi-Platform Build System"

# Check for required tools
print_status "Checking requirements..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check for optional tools for better builds
if command_exists wine; then
    print_info "Wine detected - Windows builds will include better signatures"
fi

if command_exists docker; then
    print_info "Docker detected - Linux builds will be more compatible"
fi

print_success "All requirements met"

# Cleanup system temp directories first
if [ "$NO_TEMP_CLEAN" = false ]; then
    cleanup_system_temp
fi

# Setup custom build temp directory
setup_build_temp

# Perform bloat check before build
if [ "$NO_BLOAT_CHECK" = false ]; then
    bloat_check
fi

# Step 1: Clean everything if not skipped
if [ "$NO_CLEAN" = false ]; then
    print_status "🧹 Purging all existing builds..."
    rm -rf dist/
    rm -rf build/
    rm -rf node_modules/.cache/
    rm -rf out/
    rm -rf *.app 2>/dev/null || true  # Remove any .app symlinks
    print_success "All build artifacts purged"
fi

# Step 2: Install/update dependencies
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    print_status "📦 Installing dependencies (first time)..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_success "Dependencies already installed"
fi

# Install electron-builder if not present
if ! npm list electron-builder >/dev/null 2>&1; then
    print_status "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

print_success "Dependencies ready"

# Step 3: Prepare icons
create_windows_icon

# Step 4: Determine build targets
print_status "🎯 Determining build targets..."
BUILD_CMD="npm run build:all"

if [ "$QUICK" = true ]; then
    print_info "Quick build mode - building for current platform only"
    if [ "$(uname)" = "Darwin" ]; then
        BUILD_CMD="npm run dist:mac"
    elif [ "$(uname)" = "Linux" ]; then
        BUILD_CMD="npm run dist:linux"
    else
        BUILD_CMD="npm run dist:win"
    fi
elif [ "$PLATFORM" != "all" ]; then
    case $PLATFORM in
        mac)
            BUILD_CMD="npm run dist:mac"
            print_info "Building for macOS only"
            ;;
        win)
            BUILD_CMD="npm run dist:win"
            print_info "Building for Windows only"
            ;;
        linux)
            BUILD_CMD="npm run dist:linux"
            print_info "Building for Linux only"
            ;;
        *)
            print_error "Invalid platform: $PLATFORM"
            exit 1
            ;;
    esac
else
    print_info "Building for all platforms"
fi

# Step 5: Build all platform binaries and packages
print_header "🏗️  Building Platform Binaries and Packages"
print_status "Targets: macOS (Intel + ARM + Universal), Windows (x64 + x86), Linux (x64 + ARM)"
print_status "Installers: .dmg, .pkg, .exe, .msi, .appx, .AppImage, .deb, .rpm, .snap"

# Clear problematic npm environment variables for cross-platform builds
unset npm_config_target_platform
unset npm_config_target_arch
unset npm_config_electron_prebuilt_cache

# Run the build with parallelism
export ELECTRON_BUILDER_PARALLELISM=18
export ELECTRON_SKIP_BINARY_DOWNLOAD=1
$BUILD_CMD
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "All platform builds completed successfully"

# Step 6: Create macOS app symlink
if [ -d "dist/mac" ]; then
    APP_PATH=$(find dist/mac -name "*.app" -type d | head -1)
    if [ -n "$APP_PATH" ]; then
        SYMLINK_NAME="$(basename "$APP_PATH")"
        ln -sf "$APP_PATH" "$SYMLINK_NAME" 2>/dev/null || true
        print_success "Created macOS app symlink: $SYMLINK_NAME"
    fi
fi

# Step 7: Post-build bloat analysis
if [ "$NO_BLOAT_CHECK" = false ]; then
    print_status "🔍 Post-build size analysis..."
    
    if [ -d "dist" ]; then
        TOTAL_SIZE=$(get_dir_size "dist")
        print_info "Total build output size: $TOTAL_SIZE"
        
        # Check individual package sizes
        for file in dist/*.dmg dist/*.exe dist/*.msi dist/*.AppImage dist/*.zip; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lah "$file" | awk '{print $5}')
                NAME=$(basename "$file")
                print_info "  $NAME: $SIZE"
                
                # Warning for large files
                SIZE_MB=$(ls -l "$file" | awk '{print int($5/1024/1024)}')
                if [ "$SIZE_MB" -gt 500 ]; then
                    print_warning "⚠️  Large package detected: $NAME ($SIZE)"
                fi
            fi
        done
    fi
fi

# Step 8: Display build results
print_header "📋 VidBeast v3.5 Build Results Summary"

if [ -d "dist" ]; then
    # Count files by type
    MAC_COUNT=$(find dist -name "*.dmg" -o -name "*.pkg" -o -name "*.zip" | grep -E "(mac|darwin)" | wc -l)
    WIN_COUNT=$(find dist -name "*.exe" -o -name "*.msi" -o -name "*.appx" -o -name "*-win.zip" | wc -l)
    LINUX_COUNT=$(find dist -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" -o -name "*.tar.gz" | wc -l)
    
    print_info "📊 Build Statistics:"
    echo "   📱 macOS packages: $MAC_COUNT"
    echo "   🖥️  Windows packages: $WIN_COUNT"
    echo "   🐧 Linux packages: $LINUX_COUNT"
    echo ""
    
    # macOS builds
    if [ $MAC_COUNT -gt 0 ]; then
        print_success "📱 macOS Builds:"
        [ -d "dist/mac" ] && echo "   ✓ Intel: dist/mac/*.app"
        [ -d "dist/mac-arm64" ] && echo "   ✓ ARM64: dist/mac-arm64/*.app"
        [ -d "dist/mac-universal" ] && echo "   ✓ Universal: dist/mac-universal/*.app"
        find dist -name "*.dmg" -type f | while read -r dmg; do
            size=$(ls -lh "$dmg" | awk '{print $5}')
            echo "   ✓ DMG: $(basename "$dmg") ($size)"
        done
        find dist -name "*.pkg" -type f | while read -r pkg; do
            size=$(ls -lh "$pkg" | awk '{print $5}')
            echo "   ✓ PKG: $(basename "$pkg") ($size)"
        done
        echo ""
    fi
    
    # Windows builds
    if [ $WIN_COUNT -gt 0 ]; then
        print_success "🖥️  Windows Builds:"
        [ -d "dist/win-unpacked" ] && echo "   ✓ x64 Unpacked: dist/win-unpacked/"
        [ -d "dist/win-ia32-unpacked" ] && echo "   ✓ x86 Unpacked: dist/win-ia32-unpacked/"
        find dist -name "*.exe" -type f | while read -r exe; do
            size=$(ls -lh "$exe" | awk '{print $5}')
            echo "   ✓ EXE: $(basename "$exe") ($size)"
        done
        find dist -name "*.msi" -type f | while read -r msi; do
            size=$(ls -lh "$msi" | awk '{print $5}')
            echo "   ✓ MSI: $(basename "$msi") ($size)"
        done
        find dist -name "*.appx" -type f | while read -r appx; do
            size=$(ls -lh "$appx" | awk '{print $5}')
            echo "   ✓ APPX: $(basename "$appx") ($size)"
        done
        find dist -name "*-win.zip" -type f | while read -r zip; do
            size=$(ls -lh "$zip" | awk '{print $5}')
            echo "   ✓ Portable: $(basename "$zip") ($size)"
        done
        echo ""
    fi
    
    # Linux builds
    if [ $LINUX_COUNT -gt 0 ]; then
        print_success "🐧 Linux Builds:"
        [ -d "dist/linux-unpacked" ] && echo "   ✓ Unpacked: dist/linux-unpacked/"
        find dist -name "*.AppImage" -type f | while read -r app; do
            size=$(ls -lh "$app" | awk '{print $5}')
            echo "   ✓ AppImage: $(basename "$app") ($size)"
        done
        find dist -name "*.deb" -type f | while read -r deb; do
            size=$(ls -lh "$deb" | awk '{print $5}')
            echo "   ✓ DEB: $(basename "$deb") ($size)"
        done
        find dist -name "*.rpm" -type f | while read -r rpm; do
            size=$(ls -lh "$rpm" | awk '{print $5}')
            echo "   ✓ RPM: $(basename "$rpm") ($size)"
        done
        find dist -name "*.snap" -type f | while read -r snap; do
            size=$(ls -lh "$snap" | awk '{print $5}')
            echo "   ✓ Snap: $(basename "$snap") ($size)"
        done
        find dist -name "*.tar.gz" -type f | while read -r tar; do
            size=$(ls -lh "$tar" | awk '{print $5}')
            echo "   ✓ TAR.GZ: $(basename "$tar") ($size)"
        done
        echo ""
    fi
    
    # Auto-update files
    print_info "🔄 Auto-update files:"
    for yml in dist/*.yml; do
        if [ -f "$yml" ]; then
            echo "   ✓ $(basename "$yml")"
        fi
    done
else
    print_warning "No dist directory found. Build may have failed."
fi

echo ""
print_header "🎉 VidBeast v3.5 Build System Complete!"
print_status "📁 All binaries and packages are in: ./dist/"

# Cleanup recommendations
echo ""
print_info "🧹 Cleanup & Optimization Tips:"
print_info "  • Regular temp cleanup: Run with --no-temp-clean to skip"
print_info "  • Bloat monitoring: Run bloat checks monthly"
print_info "  • Size optimization: Review package.json build.files configuration"
if [ -n "$BUILD_TEMP_DIR" ]; then
    print_info "  • Build temp cleaned automatically"
fi

print_status ""
print_info "To run VidBeast:"
print_info "  📱 macOS:   ./run-macos-source.sh (dev) or ./run-macos.sh (binary)"
print_info "  🖥️  Windows: run-windows-source.bat (dev) or run-windows.bat (binary)"
print_info "  🐧 Linux:   ./run-linux-source.sh (dev) or ./run-linux.sh (binary)"

print_header "✨ Ready for Distribution!"