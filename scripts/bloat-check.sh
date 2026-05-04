#!/bin/bash

# 🔍 VidBeast v3.5 - BLOAT CHECK SCRIPT FOR ELECTRON/NODE APPS
# Comprehensive analysis of build size and optimization opportunities

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory and project root
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
    echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
    echo ""
}

# Function to convert bytes to human readable
human_readable() {
    local bytes=$1
    if [ $bytes -gt 1073741824 ]; then
        echo "$(($bytes / 1073741824))GB"
    elif [ $bytes -gt 1048576 ]; then
        echo "$(($bytes / 1048576))MB"
    elif [ $bytes -gt 1024 ]; then
        echo "$(($bytes / 1024))KB"
    else
        echo "${bytes}B"
    fi
}

print_header "🔍 VIDBEAST v3.5 COMPREHENSIVE BLOAT CHECK"

# Check if in Node.js project
if [ ! -f "package.json" ]; then
    print_error "No package.json found. Run this in your project root directory."
    exit 1
fi

PROJECT_NAME=$(grep '"name"' package.json | cut -d'"' -f4)
PROJECT_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
print_status "Analyzing project: $PROJECT_NAME v$PROJECT_VERSION"

# 1. Node modules analysis
print_header "📦 NODE MODULES ANALYSIS"

if [ -d "node_modules" ]; then
    NODE_SIZE=$(du -sb node_modules 2>/dev/null | cut -f1)
    NODE_SIZE_HR=$(human_readable $NODE_SIZE)
    print_info "Total node_modules size: $NODE_SIZE_HR"
    
    # Size categories
    if [ $NODE_SIZE -gt 1073741824 ]; then
        print_warning "⚠️  LARGE: Node modules > 1GB - optimization recommended"
    elif [ $NODE_SIZE -gt 536870912 ]; then
        print_warning "⚠️  MEDIUM: Node modules > 500MB - consider cleanup"
    else
        print_success "✓ Node modules size acceptable"
    fi
    
    echo ""
    print_info "Top 10 largest dependencies:"
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10 | while read size dir; do
        basename_dir=$(basename "$dir")
        if [ ${#size} -gt 4 ] || [[ $size == *"M"* ]] || [[ $size == *"G"* ]]; then
            print_warning "  $size - $basename_dir"
        else
            print_info "  $size - $basename_dir"
        fi
    done
else
    print_warning "No node_modules directory found"
fi

# 2. Dependencies analysis
print_header "📋 DEPENDENCIES ANALYSIS"

if command -v npm >/dev/null 2>&1; then
    PROD_DEPS=$(npm ls --production --depth=0 2>/dev/null | grep -c "├─\|└─" || echo "0")
    DEV_DEPS=$(npm ls --development --depth=0 2>/dev/null | grep -c "├─\|└─" || echo "0")
    
    print_info "Production dependencies: $PROD_DEPS"
    print_info "Development dependencies: $DEV_DEPS"
    
    # Check for duplicates
    print_status "Checking for duplicate packages..."
    DUPES=$(npm dedupe --dry-run 2>/dev/null | grep -c "removed" || echo "0")
    if [ "$DUPES" -gt 0 ]; then
        print_warning "⚠️  Found $DUPES duplicate packages"
        print_info "  Run 'npm dedupe' to remove duplicates"
    else
        print_success "✓ No duplicate packages found"
    fi
    
    # Check for unused dependencies
    if command -v npx >/dev/null 2>&1; then
        print_status "Scanning for unused dependencies..."
        UNUSED_COUNT=0
        
        # Simple check for obviously unused packages
        if [ -f "package.json" ]; then
            while read -r dep; do
                if [ -n "$dep" ] && ! grep -r "$dep" src/ >/dev/null 2>&1; then
                    UNUSED_COUNT=$((UNUSED_COUNT + 1))
                fi
            done < <(grep -o '"[^"]*":' package.json | grep -v '"name"\|"version"\|"description"' | head -5 | cut -d'"' -f2)
        fi
        
        if [ "$UNUSED_COUNT" -gt 0 ]; then
            print_warning "⚠️  Found ~$UNUSED_COUNT potentially unused dependencies"
            print_info "  Run 'npx depcheck' for detailed analysis"
        else
            print_success "✓ No obviously unused dependencies"
        fi
    fi
fi

# 3. Build configuration analysis
print_header "⚙️  BUILD CONFIGURATION ANALYSIS"

if [ -f "build/electron-builder.config.js" ]; then
    print_status "Checking electron-builder configuration..."
    
    # Check for common bloat patterns
    if grep -q '"node_modules/\*\*/\*"' build/electron-builder.config.js; then
        print_error "❌ CRITICAL: Including 'node_modules/**/*' in build files!"
        print_info "  This will massively bloat your builds"
    fi
    
    if grep -q '"dist/\*\*/\*"' build/electron-builder.config.js; then
        print_warning "⚠️  Including 'dist/**/*' may include unwanted files"
    fi
    
    if grep -q '"src/\*\*/\*"' build/electron-builder.config.js; then
        print_warning "⚠️  Including all source files in production build"
    fi
    
    if ! grep -q '"\!\*\*\/\*.map"' build/electron-builder.config.js; then
        print_warning "⚠️  Not excluding source maps (*.map files)"
    fi
    
    print_info "Current build files configuration:"
    grep -A 15 '"files":' build/electron-builder.config.js | head -20 || echo "  Configuration found in build/electron-builder.config.js"
else
    print_warning "No electron-builder configuration found in build/"
fi

# 4. Build output analysis
print_header "📦 BUILD OUTPUT ANALYSIS"

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sb dist 2>/dev/null | cut -f1)
    DIST_SIZE_HR=$(human_readable $DIST_SIZE)
    print_info "Total dist size: $DIST_SIZE_HR"
    
    echo ""
    print_info "Build outputs by type:"
    
    # Check different package types
    for ext in dmg pkg exe msi AppImage deb rpm zip tar.gz; do
        COUNT=$(find dist -name "*.$ext" 2>/dev/null | wc -l)
        if [ $COUNT -gt 0 ]; then
            find dist -name "*.$ext" -exec ls -lah {} \; 2>/dev/null | while read -r line; do
                if [ -n "$line" ]; then
                    SIZE=$(echo $line | awk '{print $5}')
                    NAME=$(basename "$(echo "$line" | awk '{print $9}')")
                    
                    # Convert size to MB for comparison
                    SIZE_MB=0
                    if [[ $SIZE == *"G" ]]; then
                        SIZE_MB=$(echo $SIZE | sed 's/G.*//' | awk '{print int($1*1024)}')
                    elif [[ $SIZE == *"M" ]]; then
                        SIZE_MB=$(echo $SIZE | sed 's/M.*//' | awk '{print int($1)}')
                    fi
                    
                    if [ $SIZE_MB -gt 500 ]; then
                        print_warning "  ⚠️  $NAME: $SIZE (LARGE)"
                    elif [ $SIZE_MB -gt 200 ]; then
                        print_info "  📦 $NAME: $SIZE"
                    else
                        print_success "  ✓ $NAME: $SIZE"
                    fi
                fi
            done
        fi
    done
    
    # Check unpacked sizes
    for dir in mac mac-arm64 mac-universal win-unpacked win-ia32-unpacked linux-unpacked; do
        if [ -d "dist/$dir" ]; then
            UNPACKED_SIZE=$(du -sb "dist/$dir" 2>/dev/null | cut -f1)
            UNPACKED_SIZE_HR=$(human_readable $UNPACKED_SIZE)
            print_info "  $dir: $UNPACKED_SIZE_HR"
        fi
    done
else
    print_warning "No dist directory found. Run a build first."
fi

# 5. FFmpeg binaries analysis (VidBeast specific)
print_header "🎬 VIDBEAST SPECIFIC ANALYSIS"

if [ -d "resources/binaries" ]; then
    print_status "Checking FFmpeg binaries..."
    BINARIES_SIZE=$(du -sh resources/binaries 2>/dev/null | cut -f1)
    print_info "FFmpeg binaries total size: $BINARIES_SIZE"
    
    for platform_dir in resources/binaries/*; do
        if [ -d "$platform_dir" ]; then
            PLATFORM_SIZE=$(du -sh "$platform_dir" 2>/dev/null | cut -f1)
            PLATFORM_NAME=$(basename "$platform_dir")
            print_info "  $PLATFORM_NAME: $PLATFORM_SIZE"
            
            # Check individual binaries
            for binary in "$platform_dir"/*; do
                if [ -f "$binary" ]; then
                    BINARY_SIZE=$(ls -lah "$binary" | awk '{print $5}')
                    BINARY_NAME=$(basename "$binary")
                    print_info "    $BINARY_NAME: $BINARY_SIZE"
                fi
            done
        fi
    done
else
    print_warning "No FFmpeg binaries found in resources/binaries"
fi

# Check for video test files or sample data
if [ -d "src/sources/vdfscreenshots" ]; then
    SCREENSHOTS_SIZE=$(du -sh src/sources/vdfscreenshots 2>/dev/null | cut -f1)
    print_warning "⚠️  Screenshots directory found: $SCREENSHOTS_SIZE"
    print_info "  Consider moving to docs/ or excluding from builds"
fi

# 6. Recommendations
print_header "💡 VIDBEAST OPTIMIZATION RECOMMENDATIONS"

# Size-based recommendations
if [ -n "$NODE_SIZE" ] && [ $NODE_SIZE -gt 536870912 ]; then
    print_warning "📦 Node modules optimization:"
    print_info "  • Run 'npm dedupe' to remove duplicates"
    print_info "  • Run 'npm audit fix' to update vulnerable packages"
    print_info "  • Consider switching to lighter alternatives for heavy dependencies"
fi

if [ -n "$DIST_SIZE" ] && [ $DIST_SIZE -gt 209715200 ]; then
    print_warning "🏗️  Build optimization:"
    print_info "  • Review electron-builder files configuration"
    print_info "  • Exclude source maps with '!**/*.map'"
    print_info "  • Exclude development files: '!dev/**/*', '!docs/**/*'"
    print_info "  • Consider excluding screenshots: '!**/vdfscreenshots/**/*'"
fi

# VidBeast-specific recommendations
print_info "🎬 VidBeast-specific improvements:"
print_info "  • FFmpeg binaries are necessary but large - this is expected"
print_info "  • Move screenshots to docs/ folder to exclude from builds"
print_info "  • Use 'extraResources' for FFmpeg binaries (already configured)"
print_info "  • Set up proper .gitignore and .npmignore for temp files"

# Configuration recommendations
print_info "📋 Configuration improvements:"
print_info "  • Use 'asarUnpack' only for FFmpeg binaries if needed"
print_info "  • Exclude test files: '!**/test/**', '!**/*.test.js'"
print_info "  • Exclude logs: '!logs/**/*', '!**/*.log'"
print_info "  • Set compression to 'maximum' in electron-builder config"

# Size targets
print_header "🎯 SIZE TARGETS & BENCHMARKS FOR VIDEO APPS"

print_info "VidBeast app size guidelines (including FFmpeg):"
print_success "  ✓ Excellent: < 150MB (per platform)"
print_info "  📊 Good: 150-300MB (per platform)"
print_warning "  ⚠️  Acceptable: 300-500MB (per platform)"
print_error "  ❌ Needs optimization: > 500MB (per platform)"

echo ""
print_info "Quick optimization commands:"
echo "  npm dedupe"
echo "  npm audit fix"
echo "  npm prune --production"
echo "  ./scripts/compile-build-dist.sh --no-bloat-check"

print_header "✅ VIDBEAST BLOAT CHECK COMPLETE"

# Final summary
TOTAL_ISSUES=0
if [ -n "$NODE_SIZE" ] && [ $NODE_SIZE -gt 536870912 ]; then
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi
if [ -n "$DIST_SIZE" ] && [ $DIST_SIZE -gt 524288000 ]; then  # 500MB for video app
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

if [ $TOTAL_ISSUES -eq 0 ]; then
    print_success "🎉 No major bloat issues detected for VidBeast!"
elif [ $TOTAL_ISSUES -eq 1 ]; then
    print_warning "⚠️  Found 1 optimization opportunity"
else
    print_warning "⚠️  Found $TOTAL_ISSUES optimization opportunities"
fi

print_info "💾 Regular bloat checks recommended monthly"
print_info "🎬 Remember: VidBeast includes FFmpeg binaries - some size is expected"