#!/bin/bash

# VidBeast v3.5 - Linux Launcher Script  
# Cross-platform video corruption analysis and repair tool

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="VidBeast v3.5"
MIN_NODE_VERSION="16.0.0"
MIN_NPM_VERSION="8.0.0"

# Header
echo -e "${PURPLE}========================================${NC}"
echo -e "${PURPLE}          $APP_NAME - Linux            ${NC}"
echo -e "${PURPLE}   Video Corruption Analysis & Repair  ${NC}"
echo -e "${PURPLE}========================================${NC}"
echo ""

# Parse command line arguments
DEV_MODE=false
VERBOSE=false
INSTALL_DEPS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev|--development)
            DEV_MODE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --install-deps)
            INSTALL_DEPS=true
            shift
            ;;
        --help)
            echo "VidBeast Linux Launcher"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dev, --development    Run in development mode with logging"
            echo "  --verbose              Enable verbose output"
            echo "  --install-deps         Install missing dependencies automatically"
            echo "  --help                 Show this help message"
            echo ""
            echo "Supported distributions:"
            echo "  - Ubuntu/Debian (apt)"
            echo "  - CentOS/RHEL/Fedora (yum/dnf)"
            echo "  - Arch Linux (pacman)"
            echo "  - SUSE (zypper)"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

cd "$SCRIPT_DIR"

# Detect Linux distribution
detect_distro() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        DISTRO=$NAME
        DISTRO_ID=$ID
        DISTRO_VERSION=$VERSION_ID
    elif command -v lsb_release >/dev/null 2>&1; then
        DISTRO=$(lsb_release -si)
        DISTRO_VERSION=$(lsb_release -sr)
        DISTRO_ID=$(echo "$DISTRO" | tr '[:upper:]' '[:lower:]')
    else
        DISTRO="Unknown"
        DISTRO_ID="unknown"
        DISTRO_VERSION="unknown"
    fi
}

# System requirements check
echo -e "${BLUE}🔍 Checking system requirements for Linux...${NC}"

detect_distro
echo -e "${GREEN}✅ Distribution: $DISTRO $DISTRO_VERSION${NC}"

# Check architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        echo -e "${GREEN}✅ Architecture: x64 (64-bit)${NC}"
        ARCH_DIR="linux-x64"
        ;;
    aarch64|arm64)
        echo -e "${GREEN}✅ Architecture: ARM64 (64-bit)${NC}"
        ARCH_DIR="linux-arm64"
        ;;
    *)
        echo -e "${YELLOW}⚠️  Architecture: $ARCH (may not be fully supported)${NC}"
        ARCH_DIR="linux-x64"
        ;;
esac

# Function to compare versions
version_compare() {
    if [[ $1 == "$2" ]]; then
        return 0
    fi
    local IFS=.
    local i
    local ver1 ver2
    IFS=. read -ra ver1 <<< "$1"
    IFS=. read -ra ver2 <<< "$2"
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Package installation functions
install_nodejs_debian() {
    echo -e "${BLUE}📦 Installing Node.js via apt...${NC}"
    sudo apt update
    sudo apt install -y nodejs npm
}

install_nodejs_rhel() {
    echo -e "${BLUE}📦 Installing Node.js via yum/dnf...${NC}"
    if command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y nodejs npm
    else
        sudo yum install -y nodejs npm
    fi
}

install_nodejs_arch() {
    echo -e "${BLUE}📦 Installing Node.js via pacman...${NC}"
    sudo pacman -S --noconfirm nodejs npm
}

install_nodejs_suse() {
    echo -e "${BLUE}📦 Installing Node.js via zypper...${NC}"
    sudo zypper install -y nodejs npm
}

install_ffmpeg_debian() {
    echo -e "${BLUE}📦 Installing FFmpeg via apt...${NC}"
    sudo apt update
    sudo apt install -y ffmpeg
}

install_ffmpeg_rhel() {
    echo -e "${BLUE}📦 Installing FFmpeg via yum/dnf...${NC}"
    if command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y ffmpeg
    else
        sudo yum install -y epel-release
        sudo yum install -y ffmpeg
    fi
}

install_ffmpeg_arch() {
    echo -e "${BLUE}📦 Installing FFmpeg via pacman...${NC}"
    sudo pacman -S --noconfirm ffmpeg
}

install_ffmpeg_suse() {
    echo -e "${BLUE}📦 Installing FFmpeg via zypper...${NC}"
    sudo zypper install -y ffmpeg
}

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    if [[ "$INSTALL_DEPS" == true ]]; then
        case "$DISTRO_ID" in
            ubuntu|debian|pop|mint)
                install_nodejs_debian
                ;;
            centos|rhel|fedora|rocky|almalinux)
                install_nodejs_rhel
                ;;
            arch|manjaro)
                install_nodejs_arch
                ;;
            opensuse*|sles)
                install_nodejs_suse
                ;;
            *)
                echo -e "${YELLOW}💡 Please install Node.js manually for your distribution${NC}"
                exit 1
                ;;
        esac
    else
        echo -e "${YELLOW}💡 Install with your package manager:${NC}"
        echo -e "${YELLOW}   Ubuntu/Debian: sudo apt install nodejs npm${NC}"
        echo -e "${YELLOW}   CentOS/RHEL: sudo yum install nodejs npm${NC}"
        echo -e "${YELLOW}   Fedora: sudo dnf install nodejs npm${NC}"
        echo -e "${YELLOW}   Arch: sudo pacman -S nodejs npm${NC}"
        echo -e "${YELLOW}💡 Or run with --install-deps to auto-install${NC}"
        exit 1
    fi
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
version_compare "$NODE_VERSION" "$MIN_NODE_VERSION"
case $? in
    0|1) echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}" ;;
    2) 
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old (minimum: $MIN_NODE_VERSION)${NC}"
        exit 1
        ;;
esac

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
version_compare "$NPM_VERSION" "$MIN_NPM_VERSION"
case $? in
    0|1) echo -e "${GREEN}✅ npm version: $NPM_VERSION${NC}" ;;
    2)
        echo -e "${RED}❌ npm version $NPM_VERSION is too old (minimum: $MIN_NPM_VERSION)${NC}"
        exit 1
        ;;
esac

# Check FFmpeg
echo -e "${BLUE}🔍 Checking FFmpeg availability...${NC}"
FFMPEG_FOUND=false

# Check bundled FFmpeg first
BUNDLED_FFMPEG="resources/binaries/$ARCH_DIR/ffmpeg"
if [[ -f "$BUNDLED_FFMPEG" && -x "$BUNDLED_FFMPEG" ]]; then
    echo -e "${GREEN}✅ Bundled FFmpeg found for $ARCH${NC}"
    FFMPEG_FOUND=true
elif command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG_VERSION=$(ffmpeg -version 2>/dev/null | head -1 | cut -d' ' -f3)
    echo -e "${GREEN}✅ System FFmpeg found: $FFMPEG_VERSION${NC}"
    FFMPEG_FOUND=true
else
    echo -e "${YELLOW}⚠️  FFmpeg not found${NC}"
    if [[ "$INSTALL_DEPS" == true ]]; then
        case "$DISTRO_ID" in
            ubuntu|debian|pop|mint)
                install_ffmpeg_debian
                FFMPEG_FOUND=true
                ;;
            centos|rhel|fedora|rocky|almalinux)
                install_ffmpeg_rhel
                FFMPEG_FOUND=true
                ;;
            arch|manjaro)
                install_ffmpeg_arch
                FFMPEG_FOUND=true
                ;;
            opensuse*|sles)
                install_ffmpeg_suse
                FFMPEG_FOUND=true
                ;;
            *)
                echo -e "${YELLOW}⚠️  Could not auto-install FFmpeg for $DISTRO${NC}"
                ;;
        esac
    else
        echo -e "${YELLOW}💡 Install with your package manager:${NC}"
        echo -e "${YELLOW}   Ubuntu/Debian: sudo apt install ffmpeg${NC}"
        echo -e "${YELLOW}   CentOS/RHEL: sudo yum install ffmpeg${NC}"
        echo -e "${YELLOW}   Fedora: sudo dnf install ffmpeg${NC}"
        echo -e "${YELLOW}   Arch: sudo pacman -S ffmpeg${NC}"
        echo -e "${YELLOW}💡 Or run with --install-deps to auto-install${NC}"
    fi
fi

# Check X11/Wayland display
if [[ -z "$DISPLAY" && -z "$WAYLAND_DISPLAY" ]]; then
    echo -e "${YELLOW}⚠️  No display server detected (X11/Wayland)${NC}"
    echo -e "${YELLOW}💡 Make sure you're running in a graphical environment${NC}"
fi

# Install npm dependencies
if [[ ! -d "node_modules" ]]; then
    echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
    npm install --no-audit --no-fund
fi

# Launch application
echo ""
echo -e "${PURPLE}🚀 Launching $APP_NAME...${NC}"
echo -e "${CYAN}Mode: $(if [[ "$DEV_MODE" == true ]]; then echo "Development"; else echo "Production"; fi)${NC}"
echo -e "${CYAN}FFmpeg: $(if [[ "$FFMPEG_FOUND" == true ]]; then echo "Available"; else echo "System fallback"; fi)${NC}"
echo -e "${CYAN}Display: $(if [[ -n "$DISPLAY" ]]; then echo "X11"; elif [[ -n "$WAYLAND_DISPLAY" ]]; then echo "Wayland"; else echo "Unknown"; fi)${NC}"
echo ""

# Set environment variables
NODE_ENV=$(if [[ "$DEV_MODE" == true ]]; then echo "development"; else echo "production"; fi)
export NODE_ENV

# Launch with appropriate settings
if [[ "$DEV_MODE" == true ]]; then
    if [[ "$VERBOSE" == true ]]; then
        DEBUG='*' npm run dev
    else
        npm run dev
    fi
else
    npm start
fi