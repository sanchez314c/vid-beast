#!/bin/bash

# 🚀 VidBeast v3.5 - Run from Source on Linux (Development Mode)
# Launches the app directly from source code using Electron

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

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} 🚀 VidBeast v3.5 - Development Mode${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header

print_status "🚀 Starting VidBeast from source (Linux)..."

# Check if we're on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is designed for Linux only"
    print_status "Use run-macos-source.sh for macOS or run-windows-source.bat for Windows"
    exit 1
fi

# Check for required tools
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    print_status "Install with: sudo apt install nodejs (Debian/Ubuntu)"
    print_status "           or: sudo dnf install nodejs (Fedora)"
    print_status "           or: sudo pacman -S nodejs (Arch)"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    print_status "Install with: sudo apt install npm (Debian/Ubuntu)"
    print_status "           or: sudo dnf install npm (Fedora)"
    print_status "           or: sudo pacman -S npm (Arch)"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
fi

# Check if Electron is installed
if ! npm list electron >/dev/null 2>&1; then
    print_status "Installing Electron..."
    npm install --save-dev electron
fi

print_success "All requirements met"

# Set electron flags for better Linux compatibility
export ELECTRON_FORCE_WINDOW_MENU_BAR=1
export ELECTRON_TRASH=gio

# Check for display
if [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
    print_error "No display detected. Cannot run GUI application."
    print_status "Make sure you're running this in a desktop environment."
    exit 1
fi

# Launch the app from source
print_status "Launching VidBeast from source code..."
print_status "🎬 Video corruption analysis and repair engine"
print_status "Press Ctrl+C to stop the application"
echo ""

# Run the app in development mode
npm start

echo ""
print_success "VidBeast development session ended"