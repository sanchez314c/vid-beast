#!/bin/bash

# 🧹 SYSTEM TEMP CLEANUP FOR ELECTRON BUILDS
# Cleans up build artifacts that accumulate in system temp directories

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

print_status "🧹 Starting comprehensive temp cleanup..."

# Function to get directory size safely
get_dir_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1 || echo "Unknown"
    else
        echo "N/A"
    fi
}

# macOS cleanup
if [ "$(uname)" = "Darwin" ]; then
    print_status "🍎 macOS temp cleanup..."

    # Find the user's temp directory
    TEMP_BASE=$(find /private/var/folders -name "T" -type d 2>/dev/null | head -1)
    if [ -n "$TEMP_BASE" ]; then
        PARENT_DIR=$(dirname "$TEMP_BASE")
        BEFORE_SIZE=$(get_dir_size "$PARENT_DIR")
        print_info "Temp directory: $PARENT_DIR ($BEFORE_SIZE)"

        # Count files before cleanup
        BUILD_DIRS=$(find "$PARENT_DIR" -name "t-*" -type d 2>/dev/null | wc -l)
        ELECTRON_DIRS=$(find "$PARENT_DIR" -name "electron-*" -type d 2>/dev/null | wc -l)

        print_info "Found $BUILD_DIRS build directories, $ELECTRON_DIRS electron directories"

        # Clean up build artifacts (older than 1 day)
        print_status "Removing old build artifacts..."
        find "$PARENT_DIR" -name "t-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find "$PARENT_DIR" -name "CFNetworkDownload_*.tmp" -mtime +1 -delete 2>/dev/null || true
        find "$PARENT_DIR" -name "electron-download-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find "$PARENT_DIR" -name "package-dir-staging-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find "$PARENT_DIR" -name "com.anthropic.claudefordesktop.ShipIt.*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find "$PARENT_DIR" -name "com.docker.install" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true

        AFTER_SIZE=$(get_dir_size "$PARENT_DIR")
        print_success "macOS cleanup complete: $BEFORE_SIZE → $AFTER_SIZE"
    else
        print_warning "Could not locate macOS temp directory"
    fi

    # Clean up additional macOS locations
    print_status "Cleaning additional macOS locations..."

    # Clean user's Downloads for old build artifacts
    if [ -d "$HOME/Downloads" ]; then
        OLD_BUILDS=$(find "$HOME/Downloads" -name "*.dmg" -mtime +7 2>/dev/null | wc -l)
        if [ $OLD_BUILDS -gt 0 ]; then
            print_info "Found $OLD_BUILDS old .dmg files in Downloads"
        fi
    fi

    # Clean npm cache
    if command -v npm >/dev/null 2>&1; then
        CACHE_SIZE=$(npm cache verify 2>/dev/null | grep "Cache verified" | awk '{print $4}' || echo "0")
        if [ "$CACHE_SIZE" != "0" ]; then
            print_info "npm cache: $CACHE_SIZE files"
        fi
    fi
fi

# Linux cleanup
if [ "$(uname)" = "Linux" ]; then
    print_status "🐧 Linux temp cleanup..."

    if [ -d "/tmp" ]; then
        BEFORE_SIZE=$(get_dir_size "/tmp")
        print_info "System temp: /tmp ($BEFORE_SIZE)"

        # Clean up build artifacts
        print_status "Removing old build artifacts..."
        find /tmp -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find /tmp -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find /tmp -name "tmp-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        find /tmp -name "appimage-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true

        AFTER_SIZE=$(get_dir_size "/tmp")
        print_success "Linux cleanup complete: $BEFORE_SIZE → $AFTER_SIZE"
    fi

    # Clean user temp directories
    for temp_dir in "$HOME/.cache" "$HOME/.tmp"; do
        if [ -d "$temp_dir" ]; then
            TEMP_SIZE=$(get_dir_size "$temp_dir")
            if [ "$TEMP_SIZE" != "N/A" ]; then
                print_info "User temp: $temp_dir ($TEMP_SIZE)"
            fi
        fi
    done
fi

# Windows cleanup (if running in WSL or Git Bash)
if [[ "$(uname)" == *"MINGW"* ]] || [[ "$(uname)" == *"CYGWIN"* ]] || [ -n "$WSL_DISTRO_NAME" ]; then
    print_status "🪟 Windows temp cleanup..."

    # Try to access Windows temp directories
    for temp_path in "/c/Users/*/AppData/Local/Temp" "/mnt/c/Users/*/AppData/Local/Temp" "$USERPROFILE/AppData/Local/Temp"; do
        if [ -d "$temp_path" ]; then
            BEFORE_SIZE=$(get_dir_size "$temp_path")
            print_info "Windows temp: $temp_path ($BEFORE_SIZE)"

            # Clean electron build artifacts
            find "$temp_path" -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$temp_path" -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            break
        fi
    done
fi

# Clean project-specific temp directories
print_status "🗂️  Cleaning project temp directories..."

# Clean common project temp locations
for temp_dir in ".tmp" "tmp" "temp" "build-temp" ".cache"; do
    if [ -d "$temp_dir" ]; then
        TEMP_SIZE=$(get_dir_size "$temp_dir")
        print_info "Project temp: $temp_dir ($TEMP_SIZE)"

        # Only clean if it's clearly a temp directory
        if [[ "$temp_dir" == *"tmp"* ]] || [[ "$temp_dir" == *"temp"* ]] || [[ "$temp_dir" == *"cache"* ]]; then
            rm -rf "$temp_dir" 2>/dev/null || true
            print_success "Cleaned $temp_dir"
        fi
    fi
done

# Clean node_modules cache
if [ -d "node_modules/.cache" ]; then
    CACHE_SIZE=$(get_dir_size "node_modules/.cache")
    print_info "Node modules cache: $CACHE_SIZE"
    rm -rf node_modules/.cache 2>/dev/null || true
    print_success "Cleaned node_modules cache"
fi

# Clean electron cache
if [ -d "$HOME/.cache/electron" ]; then
    ELECTRON_CACHE_SIZE=$(get_dir_size "$HOME/.cache/electron")
    print_info "Electron cache: $ELECTRON_CACHE_SIZE"
fi

# Summary and recommendations
print_status "📊 Cleanup summary and recommendations:"

print_info "Regular maintenance tasks:"
print_info "  • Run temp cleanup weekly"
print_info "  • Monitor temp directory sizes"
print_info "  • Set up automated cleanup scripts"
print_info "  • Use custom temp directories for builds"

print_info "Prevention strategies:"
print_info "  • Configure electron-builder to use custom temp paths"
print_info "  • Add cleanup steps to build scripts"
print_info "  • Use Docker for isolated builds"
print_info "  • Monitor disk usage regularly"

print_success "🎉 Temp cleanup complete!"

# Optional: Create a cleanup cron job suggestion
if command -v crontab >/dev/null 2>&1; then
    print_info "💡 To automate this cleanup, add to crontab:"
    print_info "    0 2 * * 0 $(pwd)/scripts/temp-cleanup.sh"
    print_info "    (Runs every Sunday at 2 AM)"
fi