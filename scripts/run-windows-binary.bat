@echo off
setlocal enabledelayedexpansion

REM 🚀 VidBeast v3.5 - Run Compiled Binary on Windows
REM Launches the compiled Windows app from dist folder

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
echo %PURPLE% 🚀 VidBeast v3.5 - Binary Launch%NC%
echo %PURPLE%============================================%NC%
echo.

echo %BLUE%[%TIME%]%NC% Launching compiled VidBeast (Windows)...

REM Check if dist directory exists
if not exist "dist" (
    echo %RED%[%TIME%] X%NC% No dist/ directory found. Please run compile-build-dist.sh first.
    echo.
    echo Build VidBeast first using:
    echo   - Git Bash: ./scripts/compile-build-dist.sh
    echo   - WSL: ./scripts/compile-build-dist.sh
    echo   - PowerShell with WSL: wsl ./scripts/compile-build-dist.sh
    pause
    exit /b 1
)

REM Find the executable
set "APP_PATH="

REM Check for unpacked executable first (faster launch)
if exist "dist\win-unpacked\VidBeast.exe" (
    set "APP_PATH=dist\win-unpacked\VidBeast.exe"
    echo %BLUE%[%TIME%]%NC% Found unpacked executable: VidBeast.exe
    echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
    goto :found
)

REM Check for other unpacked executables
for %%F in (dist\win-unpacked\*.exe) do (
    set "APP_PATH=%%F"
    echo %BLUE%[%TIME%]%NC% Found unpacked executable: %%~nxF
    echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
    goto :found
)

REM Check for 32-bit unpacked version
if exist "dist\win-ia32-unpacked\VidBeast.exe" (
    set "APP_PATH=dist\win-ia32-unpacked\VidBeast.exe"
    echo %BLUE%[%TIME%]%NC% Found 32-bit unpacked executable: VidBeast.exe
    echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
    goto :found
)

for %%F in (dist\win-ia32-unpacked\*.exe) do (
    set "APP_PATH=%%F"
    echo %BLUE%[%TIME%]%NC% Found 32-bit unpacked executable: %%~nxF
    echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
    goto :found
)

REM Check for installer files (will install the app)
for %%F in (dist\*.exe) do (
    REM Skip blockmap files
    echo %%F | findstr /C:".blockmap" >nul
    if errorlevel 1 (
        set "APP_PATH=%%F"
        echo %YELLOW%[%TIME%] !%NC% Found installer: %%~nxF
        echo %YELLOW%[%TIME%] !%NC% Note: This will install VidBeast on your system
        echo %BLUE%[%TIME%]%NC% 🎬 Video corruption analysis and repair engine
        goto :found
    )
)

REM No executable found
echo %RED%[%TIME%] X%NC% Could not find VidBeast executable in dist/ directory
echo.
echo %YELLOW%[%TIME%] !%NC% Available files in dist/:
dir dist /b
echo.
echo To build VidBeast first, run:
echo   - Git Bash: ./scripts/compile-build-dist.sh
echo   - WSL: ./scripts/compile-build-dist.sh
echo   - PowerShell: wsl ./scripts/compile-build-dist.sh
pause
exit /b 1

:found
REM Launch the application
echo %BLUE%[%TIME%]%NC% Launching VidBeast...
echo %BLUE%[%TIME%]%NC% Starting video corruption analysis and repair engine...
start "" "!APP_PATH!"

echo %GREEN%[%TIME%] OK%NC% VidBeast launched successfully!
echo %BLUE%[%TIME%]%NC% The app is now running - check your taskbar or desktop
pause