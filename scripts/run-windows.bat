@echo off
setlocal EnableDelayedExpansion

REM VidBeast v3.5 - Windows Launcher Script
REM Cross-platform video corruption analysis and repair tool

title VidBeast v3.5 - Windows Launcher

REM Configuration
set "APP_NAME=VidBeast v3.5"
set "MIN_NODE_VERSION=16.0.0"
set "MIN_NPM_VERSION=8.0.0"

REM Parse command line arguments
set "DEV_MODE=false"
set "VERBOSE=false"
set "INSTALL_DEPS=false"
set "SHOW_HELP=false"

:parse_args
if "%1"=="" goto :args_done
if /i "%1"=="--dev" set "DEV_MODE=true" & shift & goto :parse_args
if /i "%1"=="--development" set "DEV_MODE=true" & shift & goto :parse_args
if /i "%1"=="--verbose" set "VERBOSE=true" & shift & goto :parse_args
if /i "%1"=="--install-deps" set "INSTALL_DEPS=true" & shift & goto :parse_args
if /i "%1"=="--help" set "SHOW_HELP=true" & shift & goto :parse_args
echo Unknown option: %1
exit /b 1

:args_done

REM Show help if requested
if "%SHOW_HELP%"=="true" (
    echo VidBeast Windows Launcher
    echo.
    echo Usage: %~nx0 [options]
    echo.
    echo Options:
    echo   --dev, --development    Run in development mode with logging
    echo   --verbose              Enable verbose output
    echo   --install-deps         Install missing dependencies automatically
    echo   --help                 Show this help message
    echo.
    exit /b 0
)

REM Header
echo ========================================
echo           %APP_NAME% - Windows
echo    Video Corruption Analysis ^& Repair
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM System requirements check
echo [94m🔍 Checking system requirements for Windows...[0m

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set "WIN_VERSION=%%i.%%j"
echo [92m✅ Windows version: %WIN_VERSION%[0m

REM Check architecture
if defined ProgramFiles(x86) (
    echo [92m✅ Architecture: x64 ^(64-bit^)[0m
    set "ARCH=x64"
) else (
    echo [92m✅ Architecture: x86 ^(32-bit^)[0m
    set "ARCH=x86"
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [91m❌ Node.js is not installed[0m
    if "%INSTALL_DEPS%"=="true" (
        echo [94m📦 Please install Node.js manually from: https://nodejs.org/[0m
        echo [93m💡 Windows does not support automatic Node.js installation[0m
        pause
        exit /b 1
    ) else (
        echo [93m💡 Install from: https://nodejs.org/[0m
        echo [93m💡 Or run with --install-deps for guidance[0m
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
set "NODE_VERSION=%NODE_VERSION:~1%"
echo [92m✅ Node.js version: %NODE_VERSION%[0m

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [91m❌ npm is not installed[0m
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
echo [92m✅ npm version: %NPM_VERSION%[0m

REM Check FFmpeg
echo [94m🔍 Checking FFmpeg availability...[0m
set "FFMPEG_FOUND=false"

REM Check bundled FFmpeg first
if "%ARCH%"=="x64" (
    set "BUNDLED_FFMPEG=resources\binaries\win32-x64\ffmpeg.exe"
) else (
    set "BUNDLED_FFMPEG=resources\binaries\win32-x86\ffmpeg.exe"
)

if exist "%BUNDLED_FFMPEG%" (
    echo [92m✅ Bundled FFmpeg found for %ARCH%[0m
    set "FFMPEG_FOUND=true"
) else (
    ffmpeg -version >nul 2>&1
    if not errorlevel 1 (
        echo [92m✅ System FFmpeg found[0m
        set "FFMPEG_FOUND=true"
    ) else (
        echo [93m⚠️  FFmpeg not found[0m
        if "%INSTALL_DEPS%"=="true" (
            echo [93m💡 Please install FFmpeg manually:[0m
            echo [93m💡 1. Download from: https://ffmpeg.org/download.html[0m
            echo [93m💡 2. Extract to a folder[0m
            echo [93m💡 3. Add to system PATH[0m
            echo [93m💡 4. Restart this script[0m
        ) else (
            echo [93m💡 Install FFmpeg and add to PATH[0m
            echo [93m💡 Or run with --install-deps for guidance[0m
        )
    )
)

REM Install npm dependencies
if not exist "node_modules" (
    echo [94m📦 Installing npm dependencies...[0m
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [91m❌ Failed to install dependencies[0m
        pause
        exit /b 1
    )
)

REM Launch application
echo.
echo [95m🚀 Launching %APP_NAME%...[0m
if "%DEV_MODE%"=="true" (
    echo [96mMode: Development[0m
) else (
    echo [96mMode: Production[0m
)
if "%FFMPEG_FOUND%"=="true" (
    echo [96mFFmpeg: Available[0m
) else (
    echo [96mFFmpeg: System fallback[0m
)
echo.

REM Set environment variables
if "%DEV_MODE%"=="true" (
    set "NODE_ENV=development"
) else (
    set "NODE_ENV=production"
)

REM Launch with appropriate settings
if "%DEV_MODE%"=="true" (
    if "%VERBOSE%"=="true" (
        set "DEBUG=*"
        call npm run dev
    ) else (
        call npm run dev
    )
) else (
    call npm start
)

if errorlevel 1 (
    echo.
    echo [91m❌ Application failed to start[0m
    pause
    exit /b 1
)

echo.
echo [92m🎉 Application closed successfully[0m
pause