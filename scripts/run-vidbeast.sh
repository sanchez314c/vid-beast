#!/bin/bash

# VidBeast - Quick Launch Script
# Simple wrapper to launch VidBeast easily

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_progress() {
    echo -e "${YELLOW}⟳ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f "main.js" ]]; then
    print_error "VidBeast not found in current directory"
    print_info "Please run this script from the VidBeast project directory"
    exit 1
fi

print_info "🎬 VidBeast - Video Corruption Analysis & Repair Engine"
print_info "Starting VidBeast..."

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    print_progress "Installing dependencies..."
    if command -v npm &> /dev/null; then
        npm install
        print_success "Dependencies installed"
    else
        print_error "npm not found. Please install Node.js first."
        exit 1
    fi
fi

# Kill any existing VidBeast processes
print_progress "Cleaning up any existing processes..."
pkill -f "vidbeast\|VidBeast" 2>/dev/null || true

# Launch VidBeast
print_success "Launching VidBeast..."
npm start

print_info "VidBeast closed."