# Security Policy

## Supported Versions

We actively maintain security updates for the following versions of VidBeast:

| Version | Supported          |
| ------- | ------------------ |
| 3.5.x   | :white_check_mark: |
| 3.4.x   | :white_check_mark: |
| 3.3.x   | :x:                |
| < 3.3   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in VidBeast, please follow these steps:

### Responsible Disclosure

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. **Do NOT** discuss the vulnerability publicly until it has been addressed
3. Email us directly at: security@vidbeast.com (or create a private issue)

### What to Include

Please include the following information in your report:

- **Description**: A clear description of the vulnerability
- **Impact**: Potential impact and severity assessment
- **Reproduction**: Step-by-step instructions to reproduce the issue
- **Environment**: Operating system, VidBeast version, and relevant system details
- **Files**: Any relevant files, screenshots, or proof-of-concept code

### Response Timeline

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 1 week
- **Progress Updates**: Regular updates every 2 weeks until resolution
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days

## Security Features

### Application Security

- **Code Signing**: All releases are digitally signed for authenticity
- **Sandboxing**: Renderer processes run in restricted sandboxes
- **Input Validation**: All user inputs are validated and sanitized
- **Secure Defaults**: Security-first configuration by default

### Data Protection

- **Local Processing**: Video files are processed locally, not uploaded
- **Temporary Files**: Secure cleanup of temporary processing files
- **Permissions**: Minimal system permissions requested
- **Encryption**: Sensitive configuration data is encrypted

### Build Security

- **Supply Chain**: Dependencies regularly audited for vulnerabilities
- **Automated Scanning**: Security scanning integrated into CI/CD
- **Reproducible Builds**: Build process is reproducible and verifiable
- **Update Integrity**: Application updates are cryptographically verified

## Security Best Practices

### For Users

1. **Download Only from Official Sources**: Get VidBeast from official releases only
2. **Verify Signatures**: Check digital signatures before installation
3. **Keep Updated**: Install security updates promptly
4. **File Sources**: Be cautious when processing videos from untrusted sources
5. **System Security**: Keep your operating system and dependencies updated

### For Developers

1. **Secure Development**: Follow secure coding practices
2. **Dependency Management**: Regularly update and audit dependencies
3. **Code Review**: All changes undergo security-focused code review
4. **Testing**: Include security testing in development workflows
5. **Documentation**: Document security considerations for new features

## Known Security Considerations

### Video File Processing

- **Malformed Files**: VidBeast safely handles malformed video files
- **Memory Limits**: Processing limits prevent memory exhaustion attacks
- **Sandboxing**: FFmpeg processes run in restricted environments
- **Validation**: File format validation before processing

### Electron Security

- **Context Isolation**: Renderer and main processes are properly isolated
- **Node Integration**: Node.js integration disabled in renderer when possible
- **CSP Headers**: Content Security Policy headers implemented
- **Remote Content**: No remote content loading in production builds

## Security Updates

Security updates are released as needed and may include:

- Patches for discovered vulnerabilities
- Updates to address new threat vectors
- Improvements to existing security measures
- Updates to security dependencies

Users will be notified of security updates through:

- GitHub release notifications
- Application update mechanisms
- Security advisory announcements

## Contact

For security-related questions or concerns:

- **Email**: security@vidbeast.com
- **PGP Key**: Available on request for encrypted communications
- **Response Time**: We respond to security inquiries within 48 hours

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who responsibly disclose vulnerabilities (with their permission).

---

**Last Updated**: September 2025  
**Policy Version**: 1.0