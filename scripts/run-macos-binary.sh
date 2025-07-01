#!/bin/bash

# 🚀 VidBeast v3.5 - Run Compiled Binary on macOS
# Launches the compiled macOS app from dist folder

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

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

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} 🚀 VidBeast v3.5 - Binary Launch${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo ""
}

print_header

print_status "🚀 Launching compiled VidBeast (macOS)..."

# Check if we're on macOS
if [ "$(uname)" != "Darwin" ]; then
    print_error "This script is designed for macOS only"
    print_status "For other platforms:"
    print_status "  Windows: Use run-windows-binary.bat"
    print_status "  Linux: Use ./run-linux-binary.sh"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    print_error "No dist/ directory found. Please run ./scripts/compile-build-dist.sh first."
    exit 1
fi

# Detect system architecture
ARCH=$(uname -m)
APP_PATH=""

# Choose appropriate build based on architecture
if [ "$ARCH" = "arm64" ]; then
    print_status "Detected Apple Silicon Mac (ARM64)"
    # Look for ARM version first, then universal, then Intel
    if [ -d "dist/mac-arm64" ]; then
        APP_PATH=$(find dist/mac-arm64 -name "*.app" -type d | head -n 1)
        print_status "Using ARM64 native build"
    elif [ -d "dist/mac-universal" ]; then
        APP_PATH=$(find dist/mac-universal -name "*.app" -type d | head -n 1)
        print_status "Using Universal build"
    elif [ -d "dist/mac" ]; then
        APP_PATH=$(find dist/mac -name "*.app" -type d | head -n 1)
        print_warning "ARM64 build not found, using Intel build with Rosetta"
    fi
else
    print_status "Detected Intel Mac (x64)"
    # Look for Intel version first, then universal
    if [ -d "dist/mac" ]; then
        APP_PATH=$(find dist/mac -name "*.app" -type d | head -n 1)
        print_status "Using Intel native build"
    elif [ -d "dist/mac-universal" ]; then
        APP_PATH=$(find dist/mac-universal -name "*.app" -type d | head -n 1)
        print_status "Using Universal build"
    fi
fi

# If still no app found, look anywhere in dist
if [ -z "$APP_PATH" ]; then
    APP_PATH=$(find dist -name "*.app" -type d | head -n 1)
fi

# Check for symlink in project root (created by build script)
if [ -z "$APP_PATH" ] && [ -L "VidBeast.app" ]; then
    APP_PATH="VidBeast.app"
    print_status "Using symlinked app bundle"
fi

# Launch the app if found
if [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ]; then
    print_success "Found VidBeast: $(basename "$APP_PATH")"
    print_status "🎬 Video corruption analysis and repair engine"
    print_status "Launching..."
    
    # Launch the app
    open "$APP_PATH"
    
    print_success "VidBeast launched successfully!"
    print_status "The app is now running - check your dock or applications"
else
    print_error "Could not find VidBeast.app bundle in dist/ directory"
    print_warning "Available files in dist/:"
    
    if [ -d "dist" ]; then
        ls -la dist/ | head -20
    fi
    
    print_status ""
    print_status "To build VidBeast first, run:"
    print_status "  ./scripts/compile-build-dist.sh"
    
    exit 1
fi