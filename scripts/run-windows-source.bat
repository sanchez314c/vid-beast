@echo off
setlocal enabledelayedexpansion

REM 🚀 VidBeast v3.5 - Run from Source on Windows (Development Mode)
REM Launches the app directly from source code using Electron

REM Set colors
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set PURPLE=[95m
set NC=[0m

REM Get script directory
cd /d "%~dp0"

echo.
echo %PURPLE%============================================%NC%
echo %PURPLE% 🚀 VidBeast v3.5 - Development Mode%NC%
echo %PURPLE%============================================%NC%
echo.

echo %BLUE%[%TIME%]%NC% Starting VidBeast from source (Windows)...

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo %RED%[%TIME%] X%NC% package.json not found. Make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo %BLUE%[%TIME%]%NC% Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[%TIME%] X%NC% Failed to install dependencies
        pause
        exit /b 1
    )
    echo %GREEN%[%TIME%] OK%NC% Dependencies installed
)

REM Check if Electron is installed
call npm list electron >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %BLUE%[%TIME%]%NC% Installing Electron...
    call npm install --save-dev electron
)

echo %GREEN%[%TIME%] OK%NC% All requirements met

REM Launch the app from source
echo %BLUE%[%TIME%]%NC% Launching VidBeast from source code...
echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
echo %BLUE%[%TIME%]%NC% Press Ctrl+C to stop the application
echo.

REM Run the app in development mode
call npm start

echo.
echo %GREEN%[%TIME%] OK%NC% VidBeast development session ended
pause