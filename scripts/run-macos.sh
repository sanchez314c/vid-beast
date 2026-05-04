#!/bin/bash

# VidBeast v3.5 - macOS Launcher Script
# Cross-platform video corruption analysis and repair tool

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="VidBeast v3.5"
MIN_NODE_VERSION="16.0.0"
MIN_NPM_VERSION="8.0.0"

# Header
echo -e "${PURPLE}========================================${NC}"
echo -e "${PURPLE}          $APP_NAME - macOS            ${NC}"
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
            echo "VidBeast macOS Launcher"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dev, --development    Run in development mode with logging"
            echo "  --verbose              Enable verbose output"
            echo "  --install-deps         Install missing dependencies automatically"
            echo "  --help                 Show this help message"
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

# System requirements check
echo -e "${BLUE}🔍 Checking system requirements for macOS...${NC}"

# Check macOS version
MACOS_VERSION=$(sw_vers -productVersion)
echo -e "${GREEN}✅ macOS version: $MACOS_VERSION${NC}"

# Check architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    echo -e "${GREEN}✅ Architecture: Apple Silicon (ARM64)${NC}"
elif [[ "$ARCH" == "x86_64" ]]; then
    echo -e "${GREEN}✅ Architecture: Intel (x64)${NC}"
else
    echo -e "${YELLOW}⚠️  Unknown architecture: $ARCH${NC}"
fi

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

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    if [[ "$INSTALL_DEPS" == true ]]; then
        echo -e "${BLUE}📦 Installing Node.js via Homebrew...${NC}"
        if command -v brew >/dev/null 2>&1; then
            brew install node
        else
            echo -e "${RED}❌ Homebrew is not installed. Please install Node.js manually.${NC}"
            echo -e "${YELLOW}💡 Install from: https://nodejs.org/${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}💡 Install from: https://nodejs.org/${NC}"
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
if [[ "$ARCH" == "arm64" ]]; then
    BUNDLED_FFMPEG="resources/binaries/darwin-arm64/ffmpeg"
elif [[ "$ARCH" == "x86_64" ]]; then
    BUNDLED_FFMPEG="resources/binaries/darwin-x64/ffmpeg"
fi

if [[ -n "$BUNDLED_FFMPEG" && -f "$BUNDLED_FFMPEG" && -x "$BUNDLED_FFMPEG" ]]; then
    echo -e "${GREEN}✅ Bundled FFmpeg found for $ARCH${NC}"
    FFMPEG_FOUND=true
elif command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG_VERSION=$(ffmpeg -version 2>/dev/null | head -1 | cut -d' ' -f3)
    echo -e "${GREEN}✅ System FFmpeg found: $FFMPEG_VERSION${NC}"
    FFMPEG_FOUND=true
else
    echo -e "${YELLOW}⚠️  FFmpeg not found${NC}"
    if [[ "$INSTALL_DEPS" == true ]]; then
        echo -e "${BLUE}📦 Installing FFmpeg via Homebrew...${NC}"
        if command -v brew >/dev/null 2>&1; then
            brew install ffmpeg
            FFMPEG_FOUND=true
        else
            echo -e "${YELLOW}⚠️  Homebrew not available${NC}"
        fi
    else
        echo -e "${YELLOW}💡 Install with: brew install ffmpeg${NC}"
        echo -e "${YELLOW}💡 Or run with --install-deps to auto-install${NC}"
    fi
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