# Development Workflow

## Overview

This document outlines the development workflow for VidBeast, including setup, coding practices, testing, and deployment processes. Following this workflow ensures consistent, high-quality contributions.

## Development Environment Setup

### Prerequisites
- **Node.js**: v24.8.0 or higher
- **npm**: v10.0.0 or higher
- **Git**: v2.30.0 or higher
- **FFmpeg**: v7.0+ (for testing)
- **Code Editor**: VS Code (recommended)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-repo/vid-beast.git
cd vid-beast

# Install dependencies
npm install

# Set up development environment
npm run dev:setup

# Verify installation
npm run verify
```

### VS Code Configuration
Install recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Electron
- GitLens

## Branch Strategy

### Main Branches
- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`release/x.x.x`**: Release preparation branches

### Feature Branches
- **`feature/feature-name`**: New features
- **`bugfix/issue-number`**: Bug fixes
- **`hotfix/critical-fix`**: Emergency production fixes
- **`docs/documentation-update`**: Documentation changes

### Branch Naming Conventions
```bash
# Feature branches
feature/video-analysis-engine
feature/user-interface-redesign
feature/ffmpeg-integration

# Bug fix branches
bugfix/123-memory-leak
bugfix/456-ffmpeg-crash

# Hotfix branches
hotfix/critical-security-patch
hotfix/production-crash-fix
```

## Development Process

### 1. Create Feature Branch
```bash
# Ensure latest main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Push to remote
git push -u origin feature/your-feature-name
```

### 2. Development Workflow
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linting continuously
npm run lint:watch

# Build for testing
npm run build:dev
```

### 3. Code Quality Checks
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck

# Run all tests
npm run test

# Check code coverage
npm run test:coverage
```

## Coding Standards

### JavaScript/TypeScript Guidelines
- Use ES2022+ features appropriately
- Implement proper error handling
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Organization
```
src/
├── main.js                 # Electron main process
├── renderer/               # Renderer process
│   ├── index.html         # Main UI
│   ├── renderer.js        # Renderer logic
│   └── styles.css        # UI styling
├── components/            # Reusable UI components
├── services/             # Business logic
├── lib/                  # Core libraries
├── utils/                # Utility functions
├── types/                # TypeScript definitions
└── constants/            # Application constants
```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(video): add corruption detection algorithm

Implement new FFmpeg-based corruption detection that analyzes
video streams for common corruption patterns.

Closes #123
```

```
fix(ui): resolve memory leak in video preview

Fixed memory leak caused by unclosed video preview streams.
Added proper cleanup in component unmount.

Fixes #456
```

## Testing Strategy

### Test Categories
1. **Unit Tests**: Individual function/component testing
2. **Integration Tests**: Multi-component interaction testing
3. **End-to-End Tests**: Full user workflow testing
4. **Performance Tests**: Resource usage and speed testing

### Test Structure
```
tests/
├── unit/                 # Unit tests
│   ├── services/        # Service layer tests
│   ├── components/      # Component tests
│   └── utils/          # Utility function tests
├── integration/         # Integration tests
├── e2e/               # End-to-end tests
├── fixtures/          # Test data
└── helpers/           # Test utilities
```

### Writing Tests
```javascript
// Example unit test
describe('VideoAnalyzer', () => {
  test('should detect corruption in damaged video', async () => {
    const analyzer = new VideoAnalyzer();
    const result = await analyzer.analyzeVideo('damaged.mp4');
    
    expect(result.corruption.length).toBeGreaterThan(0);
    expect(result.corruption[0].type).toBe('header_corruption');
  });
});

// Example integration test
describe('Video Repair Workflow', () => {
  test('should complete full repair process', async () => {
    const inputPath = 'corrupted.mp4';
    const outputPath = 'repaired.mp4';
    
    const result = await repairEngine.repairVideo(inputPath, outputPath);
    
    expect(result.success).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- VideoAnalyzer.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Code Review Process

### Pull Request Requirements
1. **Comprehensive Description**: Explain what and why
2. **Testing Evidence**: Show test results
3. **Documentation Updates**: Update relevant docs
4. **Breaking Changes**: Clearly document any breaking changes
5. **Screenshots**: Include UI changes screenshots

### Pull Request Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-platform testing (Windows/macOS/Linux)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process
1. **Self-Review**: Author reviews own changes
2. **Peer Review**: At least one team member review
3. **Automated Checks**: CI/CD pipeline validation
4. **Approval**: Required approvals before merge
5. **Merge**: Squash and merge to maintain clean history

## Build and Deployment

### Development Builds
```bash
# Development build
npm run build:dev

# Test build
npm run build:test

# Local testing
npm run start:dev
```

### Production Builds
```bash
# Build for current platform
npm run build

# Build for all platforms
npm run build:all

# Platform-specific builds
npm run build:mac
npm run build:win
npm run build:linux
```

### Release Process
1. **Version Update**: Update package.json version
2. **Changelog**: Update CHANGELOG.md
3. **Tag Release**: Create git tag
4. **Build**: Create production builds
5. **Test**: Verify builds on all platforms
6. **Release**: Publish to GitHub Releases
7. **Update**: Update documentation and website

### Automated Deployment
```bash
# Release automation
npm run release

# Deploy to distribution channels
npm run deploy:stable
npm run deploy:beta
```

## Quality Assurance

### Continuous Integration
- **GitHub Actions**: Automated testing and building
- **Code Coverage**: Minimum 80% coverage requirement
- **Security Scanning**: Automated vulnerability scanning
- **Performance Testing**: Automated performance benchmarks

### Code Quality Metrics
- **Maintainability Index**: Target > 70
- **Technical Debt**: Keep technical debt low
- **Duplicate Code**: < 3% duplication
- **Complexity**: Maintain low cyclomatic complexity

### Performance Monitoring
- **Memory Usage**: Monitor for memory leaks
- **CPU Usage**: Optimize for efficiency
- **Startup Time**: Fast application startup
- **Response Time**: Responsive UI interactions

## Documentation Workflow

### Documentation Types
1. **API Documentation**: Code-level documentation
2. **User Documentation**: End-user guides
3. **Developer Documentation**: Development guides
4. **Architecture Documentation**: System design docs

### Documentation Updates
- Update docs alongside code changes
- Use consistent formatting
- Include examples and code snippets
- Review documentation for accuracy

### Documentation Review
- Technical accuracy review
- User experience review
- Accessibility compliance
- Translation requirements

## Security Considerations

### Security Checklist
- [ ] Input validation implemented
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] Secure file operations
- [ ] Dependency security scan
- [ ] Code review for security issues

### Security Testing
```bash
# Security audit
npm audit

# Dependency check
npm run security:check

# Static analysis
npm run security:scan
```

## Troubleshooting Development Issues

### Common Development Problems
1. **FFmpeg Integration Issues**
   - Verify FFmpeg installation
   - Check path configuration
   - Test with sample files

2. **Electron Development Issues**
   - Clear application cache
   - Restart development server
   - Check main/renderer process communication

3. **Build Issues**
   - Clean build artifacts
   - Update dependencies
   - Check platform-specific requirements

### Debugging Tools
- **Chrome DevTools**: Renderer process debugging
- **Node.js Debugger**: Main process debugging
- **Electron DevTools**: Electron-specific debugging
- **Memory Profiling**: Memory leak detection

---

This workflow ensures consistent, high-quality development practices for the VidBeast project. All contributors should follow these guidelines to maintain code quality and project standards.