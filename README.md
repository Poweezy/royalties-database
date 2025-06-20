# Mining Royalties Manager

The Mining Royalties Manager is a comprehensive system for managing royalty payments, user access, compliance, and reporting in the mining sector. It is designed to streamline operations, ensure regulatory adherence, and provide actionable insights through analytics, with a focus on Eswatini's mining industry and SADC regional standards.

## Main Features
- Dashboard with key metrics and charts
- User Management
- Royalty Records Management
- Contract Management
- Audit Dashboard
- Reporting & Analytics
- Compliance Monitoring
- Regulatory Management

## Project Structure
The project follows a modular structure with clear separation of concerns:

- **royalties.html** - Main entry point and HTML container
- **app.js** - Core application logic
- **js/module-loader.js** - Dynamic component loading system with multi-path support
- **js/chart-manager.js** - Chart creation and management
- **js/component-initializer.js** - Ensures components are properly initialized
- **js/sidebar-manager.js** - Validates and manages sidebar sections
- **js/diagnostics.js** - Helps diagnose and troubleshoot issues
- **components/** - HTML templates for various sections
- **css/** - Stylesheets for the application

### Recent Improvements (June 2025)
- Enhanced component loading with support for multiple component paths
- Added validation for sidebar sections to ensure they exist
- Improved error handling for missing components
- Better visual feedback for unavailable sections
- Fixed sidebar section visibility issues

## Setup and Usage
1. Clone the repository
2. Open royalties.html in a web server (not directly from file system)
3. Login with test credentials:
   - Admin: admin/admin123
   - Editor: editor/editor123
   - Viewer: viewer/viewer123

## Notes for Developers
- The application uses a component-based architecture
- Components are loaded dynamically from the 'components' directory
- Chart visualizations are handled by the Chart.js library
- Data is currently stored in-memory (no backend)

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Maintenance
Last updated: June 21, 2025

## Recent Cleanup (June 2025)
- Consolidated chart management functionality to js/chart-manager.js
- Removed redundant chart manager implementations (chart-manager.js and chart-manager-v2.js in root folder)
- Added component-initializer.js to ensure proper loading of all UI components
- Added diagnostics.js for troubleshooting and monitoring component loading
- Improved error handling in module-loader.js and app.js
- Updated service worker cache configuration
