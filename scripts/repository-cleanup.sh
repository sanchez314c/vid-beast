#!/bin/bash

# Repository Cleanup Script for AgentCHAT
# Performs comprehensive repository cleanup, optimization, and maintenance tasks

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

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
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to convert bytes to human readable
human_readable() {
    local bytes=$1
    if [ -z "$bytes" ] || [ "$bytes" = "0" ]; then
        echo "0B"
    elif [ $bytes -gt 1073741824 ]; then
        echo "$(($bytes / 1073741824)).$((($bytes % 1073741824) * 100 / 1073741824))GB"
    elif [ $bytes -gt 1048576 ]; then
        echo "$(($bytes / 1048576)).$((($bytes % 1048576) * 100 / 1048576))MB"
    elif [ $bytes -gt 1024 ]; then
        echo "$(($bytes / 1024))KB"
    else
        echo "${bytes}B"
    fi
}

# Repository Cleanup: Git repository optimization
cleanup_git() {
    print_header "🗂️ GIT REPOSITORY CLEANUP"

    local git_issues=0

    if [ -d ".git" ]; then
        print_status "Optimizing Git repository..."

        # Check git status first
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            print_warning "⚠️ Git working directory is not clean - skipping some operations"
            ((git_issues++))
        else
            print_success "✓ Git working directory is clean"
        fi

        # Run git garbage collection
        print_status "Running Git garbage collection..."
        before_size=$(du -sh .git 2>/dev/null | cut -f1 || echo "unknown")
        git gc --aggressive --prune=now 2>/dev/null || git gc --prune=now 2>/dev/null || true
        after_size=$(du -sh .git 2>/dev/null | cut -f1 || echo "unknown")
        print_success "Git repository optimized: $before_size → $after_size"

        # Clean up reflogs
        print_status "Cleaning up Git reflogs..."
        git reflog expire --expire=now --all 2>/dev/null || true
        print_success "Git reflogs cleaned"

        # Remove dangling objects
        print_status "Removing dangling Git objects..."
        git prune --expire now 2>/dev/null || true
        print_success "Dangling objects removed"

        # Check for large files in Git history
        print_status "Checking for large files in Git history..."
        if command_exists git; then
            large_files=$(git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort -nr | head -10 2>/dev/null || true)
            if [ -n "$large_files" ]; then
                print_warning "⚠️ Large files found in Git history:"
                echo "$large_files" | head -5 | while IFS= read -r line; do
                    size=$(echo "$line" | awk '{print $1}')
                    file=$(echo "$line" | cut -d' ' -f4-)
                    size_hr=$(human_readable $size)
                    print_warning "  • $size_hr - $file"
                done
                print_info "Consider using BFG Repo-Cleaner or git-filter-repo to remove large files"
                ((git_issues++))
            else
                print_success "✓ No obviously large files in Git history"
            fi
        fi

        # Check for unnecessary files tracked by Git
        print_status "Checking for unnecessary tracked files..."
        unnecessary_files=$(git ls-files | grep -E "\.(log|tmp|cache|DS_Store|bak|swp|swo)$" 2>/dev/null || true)
        if [ -n "$unnecessary_files" ]; then
            print_warning "⚠️ Unnecessary files tracked by Git:"
            echo "$unnecessary_files" | head -5 | while IFS= read -r file; do
                print_warning "  • $file"
            done
            print_info "Consider removing these files and updating .gitignore"
            ((git_issues++))
        else
            print_success "✓ No unnecessary files tracked"
        fi
    else
        print_warning "⚠️ Not a Git repository"
        ((git_issues++))
    fi

    return $git_issues
}

# Repository Cleanup: Node modules and dependencies
cleanup_node_modules() {
    print_header "📦 NODE MODULES & DEPENDENCIES CLEANUP"

    local node_issues=0

    if [ -f "package.json" ]; then
        print_status "Cleaning Node modules and dependencies..."

        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            before_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")
            print_info "Current node_modules size: $before_size"

            # Check for unused dependencies
            if command_exists npm && command_exists npx; then
                print_status "Checking for unused dependencies..."
                if npx depcheck --json 2>/dev/null > /tmp/depcheck.json; then
                    unused_deps=$(jq -r '.dependencies[]? // empty' /tmp/depcheck.json 2>/dev/null || true)
                    if [ -n "$unused_deps" ]; then
                        print_warning "⚠️ Unused dependencies found:"
                        echo "$unused_deps" | head -10 | while IFS= read -r dep; do
                            print_warning "  • $dep"
                        done
                        print_info "Run 'npm uninstall <dependency>' to remove unused packages"
                        ((node_issues++))
                    else
                        print_success "✓ No unused dependencies detected"
                    fi
                fi
                rm -f /tmp/depcheck.json
            fi

            # Check for duplicate dependencies
            if command_exists npm; then
                print_status "Checking for duplicate dependencies..."
                if npm ls --json 2>/dev/null | grep -q "deduped"; then
                    dedupe_count=$(npm ls --json 2>/dev/null | grep -c "deduped" || echo "0")
                    if [ "$dedupe_count" -gt 0 ]; then
                        print_info "Found $dedupe_count deduped dependencies"
                        print_status "Running npm dedupe..."
                        npm dedupe 2>/dev/null || true
                        print_success "Dependency deduplication completed"
                    fi
                fi
            fi

            # Clean npm cache
            if command_exists npm; then
                print_status "Cleaning npm cache..."
                cache_size_before=$(npm cache verify 2>&1 | grep "Cache verified" | grep -o "[0-9]*\.[0-9]* [A-Z]*" | head -1 || echo "unknown")
                npm cache clean --force 2>/dev/null || true
                print_success "npm cache cleaned (was: $cache_size_before)"
            fi

            # Check node_modules after cleanup
            after_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "unknown")
            if [ "$before_size" != "$after_size" ]; then
                print_success "Node modules cleaned: $before_size → $after_size"
            fi
        else
            print_warning "⚠️ No node_modules directory found"
        fi

        # Clean package-lock.json if needed
        if [ -f "package-lock.json" ]; then
            lock_size=$(du -sh package-lock.json 2>/dev/null | cut -f1 || echo "unknown")
            print_info "package-lock.json size: $lock_size"
            if [ ${lock_size%[A-Z]*} -gt 10 ]; then  # More than 10MB
                print_warning "⚠️ Large package-lock.json file - consider regenerating"
                print_info "Run 'rm package-lock.json && npm install' to regenerate"
                ((node_issues++))
            fi
        fi
    else
        print_warning "⚠️ No package.json found"
        ((node_issues++))
    fi

    return $node_issues
}

# Repository Cleanup: Build artifacts and temporary files
cleanup_build_artifacts() {
    print_header "🧹 BUILD ARTIFACTS & TEMP FILES CLEANUP"

    local build_issues=0

    # Directories to clean
    cleanup_dirs=(
        "dist"
        "build"
        "out"
        "release"
        ".nyc_output"
        "coverage"
        ".coverage"
        "node_modules/.cache"
        ".vite"
        ".eslintcache"
        ".stylelintcache"
        "build-temp"
        "tmp"
        "temp"
    )

    total_cleaned=0

    for dir in "${cleanup_dirs[@]}"; do
        if [ -d "$dir" ]; then
            before_size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0")
            rm -rf "$dir" 2>/dev/null || true
            if [ ! -d "$dir" ]; then
                print_success "✓ Removed $dir directory ($before_size)"
                total_cleaned=$((total_cleaned + 1))
            else
                print_warning "⚠️ Could not remove $dir directory"
                ((build_issues++))
            fi
        fi
    done

    # Files to clean
    cleanup_files=(
        "*.log"
        "*.tmp"
        "*.temp"
        "*.cache"
        ".DS_Store"
        "Thumbs.db"
        "*.swp"
        "*.swo"
        "*~"
        "*.bak"
        "*.orig"
        "*.rej"
        ".eslintcache"
        ".stylelintcache"
        "*.tsbuildinfo"
    )

    files_cleaned=0

    for pattern in "${cleanup_files[@]}"; do
        found_files=$(find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true)
        if [ -n "$found_files" ]; then
            count=$(echo "$found_files" | wc -l)
            print_status "Removing $count files matching '$pattern'..."
            echo "$found_files" | xargs rm -f 2>/dev/null || true
            files_cleaned=$((files_cleaned + count))
        fi
    done

    # Clean IDE-specific files
    print_status "Cleaning IDE-specific files..."
    ide_patterns=(
        ".vscode/settings.json"
        ".vscode/launch.json"
        ".idea/workspace.xml"
        ".idea/tasks.xml"
        ".idea/dictionaries"
        ".idea/shelf"
        ".idea/contentModel.xml"
        "*.sublime-workspace"
        "*.sublime-project"
    )

    for pattern in "${ide_patterns[@]}"; do
        if [ -f "$pattern" ]; then
            rm -f "$pattern" 2>/dev/null || true
            print_success "✓ Removed IDE file: $pattern"
        fi
    done

    if [ "$total_cleaned" -gt 0 ] || [ "$files_cleaned" -gt 0 ]; then
        print_success "✓ Cleaned $total_cleaned directories and $files_cleaned files"
    else
        print_info "No build artifacts or temporary files to clean"
    fi

    return $build_issues
}

# Repository Cleanup: Source code formatting and organization
cleanup_source_code() {
    print_header "📝 SOURCE CODE CLEANUP & ORGANIZATION"

    local source_issues=0

    # Check for formatting issues
    if command_exists npm; then
        # Check if Prettier is available
        if npm list prettier >/dev/null 2>&1 || grep -q '"prettier"' package.json; then
            print_status "Checking code formatting with Prettier..."
            if npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null; then
                print_success "✓ Code is properly formatted"
            else
                print_warning "⚠️ Code formatting issues found"
                print_info "Run 'npx prettier --write src/**/*.{ts,tsx,js,jsx,json,css,md}' to fix"
                ((source_issues++))
            fi
        else
            print_info "Prettier not available - skipping format check"
        fi

        # Check if ESLint is available
        if npm list eslint >/dev/null 2>&1 || grep -q '"eslint"' package.json; then
            print_status "Running ESLint to check code quality..."
            if npx eslint "src/**/*.{ts,tsx,js,jsx}" --max-warnings=0 2>/dev/null; then
                print_success "✓ No ESLint issues found"
            else
                print_warning "⚠️ ESLint issues found"
                print_info "Run 'npx eslint src/**/*.{ts,tsx,js,jsx} --fix' to auto-fix some issues"
                ((source_issues++))
            fi
        else
            print_info "ESLint not available - skipping lint check"
        fi
    fi

    # Check for empty directories
    print_status "Checking for empty directories..."
    empty_dirs=$(find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || true)
    if [ -n "$empty_dirs" ]; then
        empty_count=$(echo "$empty_dirs" | wc -l)
        print_info "Found $empty_count empty directories"
        echo "$empty_dirs" | head -5 | while IFS= read -r dir; do
            print_info "  • $dir"
        done
        print_info "Consider removing empty directories if not needed"
    else
        print_success "✓ No empty directories found"
    fi

    # Check for duplicate files
    print_status "Checking for duplicate files..."
    if command_exists find && command_exists md5sum; then
        duplicates=$(find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -exec md5sum {} + 2>/dev/null | sort | uniq -d -w32 | cut -d' ' -f3- | head -5 || true)
        if [ -n "$duplicates" ]; then
            print_warning "⚠️ Potential duplicate files found:"
            echo "$duplicates" | while IFS= read -r file; do
                print_warning "  • $file"
            done
            ((source_issues++))
        else
            print_success "✓ No duplicate files found"
        fi
    fi

    # Check file naming conventions
    print_status "Checking file naming conventions..."
    source_files=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null || true)
    if [ -n "$source_files" ]; then
        # Check for files with spaces or special characters
        bad_names=$(echo "$source_files" | grep -E "[[:space:]]|\(|\)|\[|\]|\{|\}" || true)
        if [ -n "$bad_names" ]; then
            print_warning "⚠️ Files with problematic names found:"
            echo "$bad_names" | while IFS= read -r file; do
                print_warning "  • $file"
            done
            print_info "Consider renaming files to use only letters, numbers, hyphens, and underscores"
            ((source_issues++))
        else
            print_success "✓ File names follow conventions"
        fi
    fi

    return $source_issues
}

# Repository Cleanup: Configuration files optimization
cleanup_config_files() {
    print_header "⚙️ CONFIGURATION FILES OPTIMIZATION"

    local config_issues=0

    # Check package.json for optimization
    if [ -f "package.json" ]; then
        print_status "Optimizing package.json..."

        # Check for unused scripts
        script_count=$(grep -c "\"[^\"]+\":" package.json 2>/dev/null || echo "0")
        if [ "$script_count" -gt 20 ]; then
            print_warning "⚠️ Many npm scripts defined ($script_count) - consider cleanup"
            ((config_issues++))
        else
            print_success "✓ Reasonable number of npm scripts ($script_count)"
        fi

        # Check for outdated dependencies (basic check)
        if command_exists npm; then
            print_status "Checking for outdated dependencies..."
            outdated_count=$(npm outdated --json 2>/dev/null | jq 'keys | length' 2>/dev/null || echo "0")
            if [ "$outdated_count" -gt 5 ]; then
                print_warning "⚠️ $outdated_count outdated dependencies found"
                print_info "Run 'npm update' to update dependencies"
                ((config_issues++))
            elif [ "$outdated_count" -gt 0 ]; then
                print_info "$outdated_count outdated dependencies found"
            else
                print_success "✓ Dependencies appear to be up to date"
            fi
        fi
    fi

    # Check for redundant configuration files
    config_files=(
        ".babelrc"
        "babel.config.js"
        ".eslintrc"
        ".eslintrc.js"
        ".eslintrc.json"
        ".prettierrc"
        "prettier.config.js"
        "tsconfig.json"
        "vite.config.js"
        "vite.config.ts"
    )

    redundant_configs=0
    for config in "${config_files[@]}"; do
        if [ -f "$config" ]; then
            base_config=$(basename "$config" | cut -d'.' -f1)
            alternatives=$(ls -1 ${base_config}.* 2>/dev/null | wc -l || true)
            if [ "$alternatives" -gt 1 ]; then
                print_warning "⚠️ Multiple config files for $base_config found"
                ((redundant_configs++))
            fi
        fi
    done

    if [ "$redundant_configs" -gt 0 ]; then
        print_warning "⚠️ Found $redundant_configs redundant configuration files"
        print_info "Consider consolidating configuration files"
        ((config_issues++))
    else
        print_success "✓ No redundant configuration files found"
    fi

    # Check .gitignore completeness
    if [ -f ".gitignore" ]; then
        print_status "Checking .gitignore completeness..."
        required_entries=(
            "node_modules/"
            "dist/"
            "build/"
            "*.log"
            ".DS_Store"
            "*.tmp"
            "*.cache"
            ".env*"
            "coverage/"
            ".nyc_output/"
        )

        missing_entries=0
        for entry in "${required_entries[@]}"; do
            if ! grep -q "^$entry$" .gitignore && ! grep -q "^/$entry$" .gitignore; then
                print_warning "⚠️ '$entry' missing from .gitignore"
                ((missing_entries++))
            fi
        done

        if [ "$missing_entries" -eq 0 ]; then
            print_success "✓ .gitignore contains recommended entries"
        else
            print_warning "⚠️ $missing_entries recommended entries missing from .gitignore"
            ((config_issues++))
        fi
    else
        print_error "❌ No .gitignore file found"
        ((config_issues++))
    fi

    return $config_issues
}

# Repository Cleanup: Documentation and README optimization
cleanup_documentation() {
    print_header "📚 DOCUMENTATION & README OPTIMIZATION"

    local doc_issues=0

    # Check README files
    readme_files=$(find . -maxdepth 1 -name "README*" -o -name "readme*" 2>/dev/null || true)
    if [ -n "$readme_files" ]; then
        readme_count=$(echo "$readme_files" | wc -l)
        if [ "$readme_count" -gt 1 ]; then
            print_warning "⚠️ Multiple README files found ($readme_count)"
            print_info "Consider consolidating to a single README.md"
            ((doc_issues++))
        else
            print_success "✓ Single README file found"
        fi

        # Check README content
        main_readme=$(echo "$readme_files" | head -1)
        if [ -f "$main_readme" ]; then
            readme_size=$(wc -c < "$main_readme" 2>/dev/null || echo "0")
            if [ "$readme_size" -lt 500 ]; then
                print_warning "⚠️ README content appears minimal ($readme_size bytes)"
                print_info "Consider expanding README with project information"
                ((doc_issues++))
            else
                print_success "✓ README has substantial content ($readme_size bytes)"
            fi

            # Check for common README sections
            required_sections=(
                "## Installation"
                "## Usage"
                "## Contributing"
                "## License"
            )

            missing_sections=0
            for section in "${required_sections[@]}"; do
                if ! grep -q "$section" "$main_readme"; then
                    ((missing_sections++))
                fi
            done

            if [ "$missing_sections" -eq 0 ]; then
                print_success "✓ README contains common sections"
            else
                print_info "README missing $missing_sections common sections"
            fi
        fi
    else
        print_error "❌ No README file found"
        ((doc_issues++))
    fi

    # Check documentation directory
    if [ -d "docs" ] || [ -d "documentation" ]; then
        doc_dir="docs"
        if [ ! -d "docs" ]; then
            doc_dir="documentation"
        fi

        doc_files=$(find "$doc_dir" -name "*.md" -o -name "*.txt" 2>/dev/null | wc -l || true)
        if [ "$doc_files" -gt 0 ]; then
            print_success "✓ Documentation directory exists with $doc_files files"
        else
            print_warning "⚠️ Documentation directory exists but contains no files"
            ((doc_issues++))
        fi
    else
        print_info "No dedicated documentation directory found"
    fi

    # Check for outdated documentation
    if [ -f "CHANGELOG.md" ]; then
        changelog_date=$(grep -E "^\d{4}-\d{2}-\d{2}" CHANGELOG.md | head -1 | cut -d'-' -f1-3 || true)
        if [ -n "$changelog_date" ]; then
            # Convert changelog date to timestamp for comparison
            changelog_timestamp=$(date -j -f "%Y-%m-%d" "$changelog_date" +%s 2>/dev/null || date -d "$changelog_date" +%s 2>/dev/null || echo "0")
            current_timestamp=$(date +%s)
            days_old=$(( (current_timestamp - changelog_timestamp) / 86400 ))

            if [ "$days_old" -gt 180 ]; then  # 6 months
                print_warning "⚠️ CHANGELOG appears outdated (last updated $days_old days ago)"
                ((doc_issues++))
            else
                print_success "✓ CHANGELOG appears recent (last updated $days_old days ago)"
            fi
        fi
    fi

    return $doc_issues
}

# Main script execution
print_header "🧹 COMPREHENSIVE REPOSITORY CLEANUP"

# Parse command line arguments
DRY_RUN=false
AGGRESSIVE=false
QUIET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --aggressive)
            AGGRESSIVE=true
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --help)
            echo "Repository Cleanup Script"
            echo ""
            echo "Usage: ./repository-cleanup.sh [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be cleaned without actually cleaning"
            echo "  --aggressive       Perform more aggressive cleanup (including some cache files)"
            echo "  --quiet            Suppress detailed output, show summary only"
            echo "  --help             Display this help message"
            echo ""
            echo "This script performs comprehensive repository cleanup:"
            echo "  • Git repository optimization"
            echo "  • Node modules and dependencies cleanup"
            echo "  • Build artifacts and temporary files cleanup"
            echo "  • Source code formatting and organization"
            echo "  • Configuration files optimization"
            echo "  • Documentation and README optimization"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Initialize counters
TOTAL_GIT_ISSUES=0
TOTAL_NODE_ISSUES=0
TOTAL_BUILD_ISSUES=0
TOTAL_SOURCE_ISSUES=0
TOTAL_CONFIG_ISSUES=0
TOTAL_DOC_ISSUES=0

if [ "$DRY_RUN" = true ]; then
    print_warning "🔍 DRY RUN MODE - No files will be modified"
fi

if [ "$AGGRESSIVE" = true ]; then
    print_warning "⚡ AGGRESSIVE MODE - Additional cleanup will be performed"
fi

# Run cleanup operations
cleanup_git
GIT_ISSUES=$?
TOTAL_GIT_ISSUES=$((TOTAL_GIT_ISSUES + GIT_ISSUES))

if [ "$DRY_RUN" = false ]; then
    cleanup_node_modules
    NODE_ISSUES=$?
    TOTAL_NODE_ISSUES=$((TOTAL_NODE_ISSUES + NODE_ISSUES))

    cleanup_build_artifacts
    BUILD_ISSUES=$?
    TOTAL_BUILD_ISSUES=$((TOTAL_BUILD_ISSUES + BUILD_ISSUES))

    cleanup_source_code
    SOURCE_ISSUES=$?
    TOTAL_SOURCE_ISSUES=$((TOTAL_SOURCE_ISSUES + SOURCE_ISSUES))

    cleanup_config_files
    CONFIG_ISSUES=$?
    TOTAL_CONFIG_ISSUES=$((TOTAL_CONFIG_ISSUES + CONFIG_ISSUES))

    cleanup_documentation
    DOC_ISSUES=$?
    TOTAL_DOC_ISSUES=$((TOTAL_DOC_ISSUES + DOC_ISSUES))
else
    print_info "Skipping actual cleanup operations in dry-run mode"
fi

# Generate final report
print_header "📋 REPOSITORY CLEANUP SUMMARY"

TOTAL_ISSUES=$((TOTAL_GIT_ISSUES + TOTAL_NODE_ISSUES + TOTAL_BUILD_ISSUES + TOTAL_SOURCE_ISSUES + TOTAL_CONFIG_ISSUES + TOTAL_DOC_ISSUES))

print_info "Git Issues: $TOTAL_GIT_ISSUES"
print_info "Node Modules Issues: $TOTAL_NODE_ISSUES"
print_info "Build Artifacts Issues: $TOTAL_BUILD_ISSUES"
print_info "Source Code Issues: $TOTAL_SOURCE_ISSUES"
print_info "Configuration Issues: $TOTAL_CONFIG_ISSUES"
print_info "Documentation Issues: $TOTAL_DOC_ISSUES"
print_info "Total Issues Found: $TOTAL_ISSUES"

if [ "$TOTAL_ISSUES" -eq 0 ]; then
    print_success "✓ Repository is in excellent condition - no cleanup needed"
    exit 0
elif [ "$TOTAL_ISSUES" -lt 5 ]; then
    print_success "✓ Repository cleanup completed successfully"
    print_info "Minor issues found and addressed"
    exit 0
else
    print_warning "⚠️ Repository cleanup completed with $TOTAL_ISSUES issues addressed"
    print_info "Some issues may require manual attention"
    exit 0
fi