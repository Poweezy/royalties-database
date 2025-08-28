# AGENTS.md - Mining Royalties Manager

## Test Commands
- **Run Playwright tests**: `npx playwright test`
- **Run single test**: `npx playwright test forgot_password.spec.js`
- **Run tests with UI**: `npx playwright test --ui`
- **Test enhanced features**: Open `test-enhanced-features.html` in browser
- **Test enhanced GIS**: Open `test-gis-enhanced.html` in browser
- **Simple GIS test**: `node test-gis-simple.js` (Node.js test)

## Architecture
- **Frontend-only PWA** (Progressive Web App) - no backend server
- **Local storage**: IndexedDB for all data persistence
- **Main entry**: `royalties.html` with ES6 modules
- **Core modules**: `/js/modules/` (ChartManager, UserManager, NavigationManager, etc.)
- **Services**: `/js/services/` (database.service.js, auth.service.js, user-security.service.js, permission.service.js)
- **Components**: `/js/components/` (BulkOperationsPanel.js, UserProfileModal.js)
- **Authentication**: Client-side only with hardcoded demo users

## Enhanced User Management Features
- **Bulk Operations**: Multi-user activation, deactivation, role assignment, email, import/export
- **Advanced Permissions**: Granular permission system with role inheritance and templates
- **Enhanced User Features**: Comprehensive profiles, password policies, activity monitoring, onboarding
- **Security Enhancements**: Failed login tracking, account lockout, security notifications, session management
- **Enhanced GIS Dashboard**: Advanced mapping with multiple layers, overlays, analysis tools, and enhanced features

## Code Style Guidelines
- **ES6 modules**: Use `import/export` syntax
- **File structure**: PascalCase for classes, camelCase for instances
- **Error handling**: Use ErrorHandler class from `utils/error-handler.js`
- **Async/await**: Preferred over Promises
- **Comments**: JSDoc format for class/method documentation
- **CSS**: BEM naming convention, utility classes
- **Service imports**: Import services as `{ serviceName }`
- **Component structure**: Modular, reusable UI components with event delegation

## Development
- Serve locally with HTTP server for testing (required for ES6 modules)
- Service worker enabled for offline functionality
- No build step required - vanilla JS/HTML/CSS
- Enhanced CSS styles in `/css/user-management-enhanced.css`

## Enhanced User Management Integration
- **Main integration file**: `js/user-management-enhanced.js`
- **Services**: Import user-security.service.js and permission.service.js for advanced features
- **Components**: Use BulkOperationsPanel and UserProfileModal for enhanced UI
- **Database**: Extended IndexedDB schema with security and audit stores
- **Responsive**: All enhanced features work on desktop, tablet, and mobile

## Security Features
- **Login tracking**: Failed attempts, successful logins, session management
- **Password policies**: Configurable strength requirements and expiration
- **Audit logging**: Comprehensive activity and security event logging
- **Permission system**: Role-based access with granular permissions
- **Account security**: Lockout policies, 2FA support, security notifications
