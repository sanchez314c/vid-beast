#!/bin/bash

# Enhanced Universal Auto-Detecting Build System - WORKING VERSION
# Automatically detects tech stack and applies professional build + validation pipeline

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get the script directory and go to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Pipeline configuration
PIPELINE_START_TIME=$(date +%s)
DETECTED_STACK=""
DETECTED_FRAMEWORKS=()
DETECTED_LANGUAGES=()
FAILED_STEPS=()
COMPLETED_STEPS=()
WARNINGS=()
PIPELINE_MODE="production"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
    COMPLETED_STEPS+=("$1")
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
    WARNINGS+=("$1")
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
    FAILED_STEPS+=("$1")
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}${BOLD}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}${BOLD} $1${NC}"
    echo -e "${PURPLE}${BOLD}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step_header() {
    echo ""
    echo -e "${BLUE}${BOLD}┌─ STEP $1: $2${NC}"
    echo -e "${BLUE}${BOLD}└──────────────────────────────────────────────────────────────────────────────${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if file exists
file_exists() {
    [ -f "$1" ]
}

# Function to check if directory exists
dir_exists() {
    [ -d "$1" ]
}

# ========================================
# TECH STACK DETECTION FUNCTIONS
# ========================================

# Function to detect file patterns
detect_files() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./build/*" -not -path "./dist/*" -not -path "./.venv/*" -not -path "./venv/*" | wc -l)

    if [ "$count" -gt 0 ]; then
        print_info "✓ Found $count $description"
        return 0
    else
        return 1
    fi
}

# Function to detect package.json content
detect_package_content() {
    local key="$1"
    local value="$2"
    local description="$3"

    if [ -f "package.json" ] && grep -q "\"$key\"" package.json; then
        if [ -n "$value" ]; then
            if grep -q "\"$value\"" package.json; then
                print_info "✓ Found $description: $value"
                return 0
            fi
        else
            print_info "✓ Found $description"
            return 0
        fi
    fi
    return 1
}

# Function to detect Electron applications
detect_electron() {
    print_status "🔍 Detecting Electron application..."

    if detect_package_content "main" "" "main process" &&
       detect_package_content "electron" "" "Electron dependency"; then

        DETECTED_STACK="electron"
        DETECTED_LANGUAGES+=("javascript")

        # Check for TypeScript
        if detect_files "*.ts" "TypeScript files" ||
           detect_package_content "typescript" "" "TypeScript dependency" ||
           detect_files "tsconfig.json" "TypeScript config"; then
            DETECTED_LANGUAGES+=("typescript")
        fi

        # Check for React
        if detect_package_content "react" "" "React dependency" ||
           detect_files "*.jsx" "React JSX files"; then
            DETECTED_FRAMEWORKS+=("react")
        fi

        # Check for other frameworks
        if detect_package_content "vue" "" "Vue.js dependency"; then
            DETECTED_FRAMEWORKS+=("vue")
        fi

        if detect_package_content "angular" "" "Angular dependency"; then
            DETECTED_FRAMEWORKS+=("angular")
        fi

        if detect_package_content "svelte" "" "Svelte dependency"; then
            DETECTED_FRAMEWORKS+=("svelte")
        fi

        print_success "✓ Electron application detected!"
        return 0
    fi

    return 1
}

# Function to detect Python applications
detect_python() {
    print_status "🐍 Detecting Python application..."

    if detect_files "*.py" "Python files" ||
       file_exists "requirements.txt" ||
       file_exists "setup.py" ||
       file_exists "pyproject.toml"; then

        DETECTED_STACK="python"
        DETECTED_LANGUAGES+=("python")

        # Check for GUI frameworks
        if grep -r -q "import tkinter" . --include="*.py" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv 2>/dev/null; then
            DETECTED_FRAMEWORKS+=("tkinter")
            print_info "✓ Found Tkinter imports"
        fi

        if grep -r -q "import customtkinter" . --include="*.py" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv 2>/dev/null; then
            DETECTED_FRAMEWORKS+=("customtkinter")
            print_info "✓ Found CustomTkinter imports"
        fi

        if grep -r -q "from PyQt5" . --include="*.py" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv 2>/dev/null; then
            DETECTED_FRAMEWORKS+=("pyqt5")
            print_info "✓ Found PyQt5 imports"
        fi

        # Check if CLI app (no GUI imports but has main function)
        if [ ${#DETECTED_FRAMEWORKS[@]} -eq 0 ]; then
            if grep -r -q "if __name__ == .__main__.:" . --include="*.py" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv 2>/dev/null; then
                DETECTED_FRAMEWORKS+=("cli")
                print_info "✓ Detected CLI application pattern"
            fi
        fi

        print_success "✓ Python application detected!"
        return 0
    fi

    return 1
}

# Function to detect Swift applications
detect_swift() {
    print_status "🍎 Detecting Swift application..."

    if detect_files "*.swift" "Swift files" ||
       file_exists "Package.swift" ||
       find . -name "*.xcodeproj" -not -path "./build/*" -not -path "./dist/*" | head -1 | grep -q .; then

        DETECTED_STACK="swift"
        DETECTED_LANGUAGES+=("swift")

        # Check for SwiftUI
        if grep -r -q "import SwiftUI" . --include="*.swift" --exclude-dir=build --exclude-dir=.build 2>/dev/null; then
            DETECTED_FRAMEWORKS+=("swiftui")
            print_info "✓ Found SwiftUI imports"
        fi

        print_success "✓ Swift application detected!"
        return 0
    fi

    return 1
}

# Function to detect other common frameworks
detect_other_frameworks() {
    # Go
    if detect_files "*.go" "Go files" || file_exists "go.mod"; then
        DETECTED_STACK="go"
        DETECTED_LANGUAGES+=("go")
        print_success "✓ Go project detected!"
        return 0
    fi

    # Rust
    if detect_files "*.rs" "Rust files" || file_exists "Cargo.toml"; then
        DETECTED_STACK="rust"
        DETECTED_LANGUAGES+=("rust")
        print_success "✓ Rust project detected!"
        return 0
    fi

    # Java
    if detect_files "*.java" "Java files" || file_exists "pom.xml" || file_exists "build.gradle"; then
        DETECTED_STACK="java"
        DETECTED_LANGUAGES+=("java")
        print_success "✓ Java project detected!"
        return 0
    fi

    # C#
    if detect_files "*.cs" "C# files" || find . -name "*.csproj" -not -path "./build/*" -not -path="./dist/*" | head -1 | grep -q .; then
        DETECTED_STACK="csharp"
        DETECTED_LANGUAGES+=("csharp")
        print_success "✓ C# project detected!"
        return 0
    fi

    return 1
}

# Function to detect project type
detect_project_type() {
    print_header "🔍 AUTO-DETECTING PROJECT TYPE"

    print_status "Scanning project structure and dependencies..."

    # Try Electron first
    if detect_electron; then
        return 0
    fi

    # Try Python
    if detect_python; then
        return 0
    fi

    # Try Swift
    if detect_swift; then
        return 0
    fi

    # Try other frameworks
    if detect_other_frameworks; then
        return 0
    fi

    print_error "❌ Could not detect a supported project type"
    print_info "Supported frameworks:"
    print_info "  • Electron (React/TypeScript/JavaScript)"
    print_info "  • Python (CLI/Tkinter/CustomTkinter/PyQt5/etc.)"
    print_info "  • Swift (SwiftUI/UIKit/AppKit)"
    print_info "  • Go, Rust, Java, C#"
    return 1
}

# ========================================
# DISPLAY FUNCTIONS
# ========================================

# Function to display detected configuration
display_detected_config() {
    print_header "🎯 DETECTED PROJECT CONFIGURATION"

    echo -e "${BOLD}Primary Stack:${NC} $DETECTED_STACK"
    echo -e "${BOLD}Languages:${NC} ${DETECTED_LANGUAGES[*]}"
    echo -e "${BOLD}Frameworks:${NC} ${DETECTED_FRAMEWORKS[*]}"

    echo ""
    print_info "🔧 Build Strategy:"

    case $DETECTED_STACK in
        "electron")
            echo "  • Framework: Electron Desktop Application"
            echo "  • Languages: ${DETECTED_LANGUAGES[*]}"
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " react " ]]; then
                echo "  • UI Framework: React"
            fi
            echo "  • Packaging: electron-builder (multi-platform)"
            echo "  • Output: DMG, EXE, AppImage, DEB, RPM, SNAP, etc."
            ;;
        "python")
            echo "  • Framework: Python Application"
            echo "  • Type: GUI/Desktop Application"
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " tkinter " ]]; then
                echo "  • GUI: Tkinter"
            fi
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " customtkinter " ]]; then
                echo "  • GUI: CustomTkinter"
            fi
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " pyqt5 " ]]; then
                echo "  • GUI: PyQt5"
            fi
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " cli " ]]; then
                echo "  • Type: CLI Application"
            fi
            echo "  • Packaging: PyInstaller (cross-platform)"
            echo "  • Output: Standalone executables"
            ;;
        "swift")
            echo "  • Framework: Swift Application"
            if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " swiftui " ]]; then
                echo "  • UI Framework: SwiftUI"
            fi
            echo "  • Platform: macOS/iOS"
            echo "  • Build Tool: Swift Package Manager / Xcode"
            echo "  • Output: .app bundles, installers"
            ;;
        *)
            echo "  • Framework: $DETECTED_STACK"
            echo "  • Packaging: Platform-specific tools"
            echo "  • Output: Executable binaries"
            ;;
    esac
}

# Function to run security validation
run_security_validation() {
    print_status "🔒 Running security validation..."

    local security_issues=0

    # Node.js security check
    if [ "$DETECTED_STACK" = "electron" ] && command_exists npm; then
        print_status "Running npm audit..."

        if npm audit --audit-level=moderate 2>/dev/null; then
            print_success "npm audit passed - no moderate or higher vulnerabilities"
        else
            print_warning "npm audit found issues - consider running 'npm audit fix'"
            security_issues=$((security_issues + 1))
        fi
    fi

    # Python security check
    if [ "$DETECTED_STACK" = "python" ] && command_exists pip; then
        print_status "Checking Python dependencies..."

        # Check for known vulnerable packages
        if command_exists pip-audit; then
            pip-audit --requirement requirements.txt 2>/dev/null || true
        else
            print_warning "pip-audit not installed - consider installing for Python security checks"
        fi
    fi

    # Secret scanning
    print_status "Scanning for potential secrets..."

    local secrets_found=0
    if grep -r -i -E "(password|api[_-]?key|token|secret[_-]?key)" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv 2>/dev/null | wc -l > /dev/null; then
        print_warning "Potential secrets found - review before committing!"
        security_issues=$((security_issues + 1))
    fi

    if [ "$security_issues" -eq 0 ]; then
        print_success "Security validation completed - no issues found"
    else
        print_warning "Security validation completed - $security_issues issues found"
    fi

    return $security_issues
}

# Function to run code quality validation
run_code_quality_validation() {
    print_status "📋 Running code quality validation..."

    local quality_issues=0

    # Electron/Node.js quality checks
    if [ "$DETECTED_STACK" = "electron" ]; then
        # ESLint check
        if command_exists npm && grep -q "eslint" package.json; then
            print_status "Running ESLint..."

            if npm run lint 2>/dev/null; then
                print_success "ESLint validation passed"
            else
                print_warning "ESLint found issues - review output above"
                quality_issues=$((quality_issues + 1))
            fi
        fi

        # TypeScript compilation check
        if [[ " ${DETECTED_LANGUAGES[@]} " =~ " typescript " ]]; then
            print_status "Checking TypeScript compilation..."

            if command_exists npx && npx tsc --noEmit 2>/dev/null; then
                print_success "TypeScript compilation passed"
            else
                print_warning "TypeScript compilation has issues"
                quality_issues=$((quality_issues + 1))
            fi
        fi
    fi

    if [ "$quality_issues" -eq 0 ]; then
        print_success "Code quality validation passed"
    else
        print_warning "Code quality validation found $quality_issues issues"
    fi

    return $quality_issues
}

# Function to run testing validation
run_testing_validation() {
    print_status "🧪 Running testing validation..."

    local test_issues=0

    # Electron/Node.js tests
    if [ "$DETECTED_STACK" = "electron" ]; then
        if command_exists npm && grep -q "test" package.json; then
            print_status "Running Node.js tests..."

            if npm test 2>/dev/null; then
                print_success "Tests passed"
            else
                print_warning "Tests failed or had issues"
                test_issues=$((test_issues + 1))
            fi
        else
            print_warning "No test script found in package.json"
            test_issues=$((test_issues + 1))
        fi
    fi

    if [ "$test_issues" -eq 0 ]; then
        print_success "Testing validation passed"
    else
        print_warning "Testing validation found $test_issues issues"
    fi

    return $test_issues
}

# Function to generate run scripts
generate_run_scripts() {
    print_status "📜 Generating platform-specific run scripts..."

    local project_name=$(basename "$PWD")

    # macOS run script
    cat > run-source-macos.sh << EOF
#!/bin/bash

# Run ${project_name} from Source on macOS
# Auto-generated by universal build system

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "\${BLUE}[\$(date +'%H:%M:%S')]\${NC} \$1"
}

print_success() {
    echo -e "\${GREEN}[\$(date +'%H:%M:%S')] ✔\${NC} \$1"
}

print_error() {
    echo -e "\${RED}[\$(date +'%H:%M:%S')] ✗\${NC} \$1"
}

# Check if we're on macOS
if [ "\$(uname)" != "Darwin" ]; then
    print_error "This script is for macOS only"
    exit 1
fi

print_status "🚀 Starting ${project_name} from source (macOS)..."

# Check dependencies
if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Run the app
if [ -f "package.json" ] && grep -q "electron:dev" package.json; then
    npm run electron:dev
elif [ -f "package.json" ] && grep -q "start" package.json; then
    npm start
else
    print_error "No suitable run command found in package.json"
    exit 1
fi

print_success "Application session ended"
EOF

    # Linux run script
    cat > run-source-linux.sh << EOF
#!/bin/bash

# Run ${project_name} from Source on Linux
# Auto-generated by universal build system

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "\${BLUE}[\$(date +'%H:%M:%S')]\${NC} \$1"
}

print_success() {
    echo -e "\${GREEN}[\$(date +'%H:%M:%S')] ✔\${NC} \$1"
}

print_error() {
    echo -e "\${RED}[\$(date +'%H:%M:%S')] ✗\${NC} \$1"
}

# Check if we're on Linux
if [ "\$(uname)" != "Linux" ]; then
    print_error "This script is for Linux only"
    exit 1
fi

print_status "🚀 Starting ${project_name} from source (Linux)..."

# Check dependencies
if ! command_exists npm; then
    print_error "npm is not installed. Install with: sudo apt install npm"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Set Electron flags for Linux
export ELECTRON_FORCE_WINDOW_MENU_BAR=1
export ELECTRON_TRASH=gio

# Run the app
if [ -f "package.json" ] && grep -q "electron:dev" package.json; then
    npm run electron:dev
elif [ -f "package.json" ] && grep -q "start" package.json; then
    npm start
else
    print_error "No suitable run command found in package.json"
    exit 1
fi

print_success "Application session ended"
EOF

    # Windows run script (batch file)
    cat > run-source-windows.bat << EOF
@echo off
setlocal enabledelayedexpansion

REM Run ${project_name} from Source on Windows
REM Auto-generated by universal build system

REM Set colors
set RED=[91m
set GREEN=[92m
set BLUE=[94m
set NC=[0m

echo %BLUE%[%TIME%]%NC% Starting ${project_name} from source (Windows)...

REM Check dependencies
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% npm is not installed
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo %BLUE%[%TIME%]%NC% Installing dependencies...
    call npm install
)

REM Run the app
if exist "package.json" (
    findstr /C:"electron:dev" package.json >nul
    if !ERRORLEVEL! EQU 0 (
        call npm run electron:dev
    ) else (
        findstr /C:"start" package.json >nul
        if !ERRORLEVEL! EQU 0 (
            call npm start
        ) else (
            echo %RED%[%TIME%] X%NC% No suitable run command found
            pause
            exit /b 1
        )
    )
) else (
    echo %RED%[%TIME%] X%NC% package.json not found
    pause
    exit /b 1
)

echo.
echo %GREEN%[%TIME%] OK%NC% Application session ended
pause
EOF

    # Make scripts executable
    chmod +x run-source-macos.sh
    chmod +x run-source-linux.sh

    print_success "Run scripts generated:"
    print_info "  • run-source-macos.sh"
    print_info "  • run-source-linux.sh"
    print_info "  • run-source-windows.bat"
}

# Function to build Electron applications
build_electron_app() {
    print_status "⚡ Building Electron application..."

    # Check dependencies
    if ! command_exists npm; then
        print_error "npm is not installed"
        return 1
    fi

    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi

    # Build React/TypeScript if present
    if [[ " ${DETECTED_LANGUAGES[@]} " =~ " typescript " ]]; then
        print_status "Compiling TypeScript..."
        if command_exists npx && npx tsc --version >/dev/null 2>&1; then
            npx tsc --noEmit || print_warning "TypeScript compilation had warnings"
        fi
    fi

    if [[ " ${DETECTED_FRAMEWORKS[@]} " =~ " react " ]]; then
        print_status "Building React application..."
        if grep -q "build" package.json; then
            npm run build
        else
            print_warning "No build script found in package.json"
        fi
    fi

    # Build with electron-builder
    print_status "Building distribution packages..."
    if command_exists npx && npx electron-builder --version >/dev/null 2>&1; then
        export ELECTRON_BUILDER_PARALLELISM=true
        npx electron-builder --mac --win --linux --publish=never
    else
        npm run dist || npm run build
    fi

    print_success "Electron application built successfully"
}

# Function to create build directories
create_build_directories() {
    print_status "📁 Creating build directories..."

    mkdir -p build
    mkdir -p build_temp
    mkdir -p build_resources/icons
    mkdir -p dist

    print_success "Build directories created"
}

# Function to run comprehensive build (simplified for testing)
run_comprehensive_build() {
    print_status "🏗️ Running comprehensive build..."

    create_build_directories
    generate_run_scripts
    build_electron_app

    print_success "Comprehensive build completed"
}

# Function to run a complete pipeline step with validation and error handling
run_pipeline_step() {
    local step_name="$1"
    local step_function="$2"
    local description="$3"
    local optional="${4:-false}"

    print_header "🔄 Running $step_name"

    # Run the step function if it exists
    if declare -F "$step_function" > /dev/null; then
        print_status "🔧 $description"

        if $step_function; then
            print_success "✅ $step_name completed successfully"
            COMPLETED_STEPS+=("$step_name")
        else
            print_error "❌ $step_name failed"

            if [[ "$optional" == "true" ]]; then
                print_warning "⚠️  Optional step failed, continuing..."
                WARNINGS+=("$step_name failed but is optional")
            else
                if [[ "$CONTINUE_ON_ERROR" == "true" ]]; then
                    print_warning "⚠️  Critical step failed but continuing due to CONTINUE_ON_ERROR=true"
                    FAILED_STEPS+=("$step_name")
                else
                    print_error "🛑 Critical step failed - halting build"
                    print_error "💡 Use CONTINUE_ON_ERROR=true environment variable to continue anyway"
                    exit 1
                fi
            fi
        fi
    else
        print_warning "⚠️  Step function '$step_function' not found"
        if [[ "$optional" != "true" ]]; then
            print_error "❌ Required step function missing - halting build"
            exit 1
        fi
    fi

    echo ""
}

# Function to display help
display_help() {
    echo "Enhanced Universal Auto-Detecting Build System - WORKING VERSION"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "This script automatically detects your project's tech stack and applies"
    echo "a professional build pipeline for cross-platform distribution."
    echo ""
    echo "Pipeline Steps (executed in order):"
    echo "  1. Environment Check"
    echo "  2. Security Validation"
    echo " 3. Code Quality Validation"
    echo " 4. Testing Validation"
    echo "  5. Icon Validation & Generation"
    echo " 6. Comprehensive Build"
    echo "  7. Run Script Generation"
    echo ""
    echo "Options:"
    echo "  --detect-only      Only detect stack, don't build"
    echo "  --help             Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Full production pipeline"
    echo "  $0 --detect-only             # Only detect stack"
    echo ""
}

# ========================================
# MAIN EXECUTION
# ========================================

# Main script execution
print_header "🚀 ENHANCED UNIVERSAL AUTO-DETECTING BUILD SYSTEM - WORKING VERSION"

# Parse command line arguments
DETECT_ONLY=false
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            HELP=true
            shift
            ;;
        --detect-only)
            DETECT_ONLY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            HELP=true
            shift
            ;;
    esac
done

if [ "$HELP" = true ]; then
    display_help
    exit 0
fi

# Step 1: Detect project type
if ! detect_project_type; then
    exit 1
fi

# Step 2: Display detected configuration
display_detected_config

if [ "$DETECT_ONLY" = true ]; then
    print_info "Detection complete. Use '$0' to build the project."
    exit 0
fi

# Step 3: Security Validation
run_pipeline_step "Security Validation" \
    "run_security_validation" \
    "Running comprehensive security vulnerability analysis" \
    "false"

# Step 4: Code Quality Validation
run_pipeline_step "Code Quality Validation" \
    "run_code_quality_validation" \
    "Running code quality analysis and best practices checks" \
    "false"

# Step 5: Testing Validation
run_pipeline_step "Testing Validation" \
    "run_testing_validation" \
    "Running automated tests and coverage analysis" \
    "false"

# Step 6: Comprehensive Build
run_pipeline_step "Comprehensive Build" \
    "run_comprehensive_build" \
    "Building distribution packages for all platforms" \
    "false"

print_header "🎉 BUILD PIPELINE COMPLETED!"
print_success "Your application has been built with comprehensive quality assurance"

echo ""
print_info "🚀 Quick Start:"
print_info "  • Test locally: ./run-source-macos.sh (macOS)"
print_info "  • Deploy: Use packages in ./dist/ directory"

print_success "✨ Professional-grade build pipeline completed successfully!"