# Scripts Directory

**Purpose**: Contains all project automation scripts for build, deployment, and maintenance.

## Directory Structure

### `/build/`
- Build automation scripts
- Platform-specific build configurations
- Cross-platform compilation utilities

### `/deploy/`
- Deployment automation scripts
- Environment-specific deployment configs
- Release management utilities

### `/maintenance/`
- System maintenance and cleanup scripts
- Database maintenance utilities
- Log rotation and cleanup

### `/development/`
- Development workflow automation
- Code generation scripts  
- Development environment setup

## Main Scripts

- **`compile-build-dist.sh`** - Complete multi-platform build system
- **`bloat-check.sh`** - VidBeast-specific bloat analysis
- **`temp-cleanup.sh`** - System temp cleanup utilities

## Usage

All scripts should be executable and include:
- Color-coded output for better UX
- Error handling and validation
- Cross-platform compatibility where applicable
- Comprehensive logging
- Progress indicators for long operations

## Standards

- Use descriptive names
- Include header comments with purpose and usage
- Follow consistent color coding scheme  
- Validate prerequisites before execution
- Provide helpful error messages with solutions