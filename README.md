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

## Codebase Cleanup
The project includes tools to clean up redundant files:

- **cleanup-redundant.ps1** - PowerShell script to move redundant files to backup
- **cleanup-redundant.bat** - Batch file version of the cleanup script
- **cleanup-guide.html** - Interactive guide showing which files are required vs. redundant
- **redundant-files-manifest.json** - Detailed metadata about redundant files

To clean up the codebase, run either `./cleanup-redundant.ps1` (PowerShell) or `cleanup-redundant.bat` (Command Prompt). These scripts will move redundant files to a backup directory without deleting them.
- **css/** - Stylesheets for the application

### Recent Improvements (June 2025)
- Enhanced component loading with support for multiple component paths
- Added validation for sidebar sections to ensure they exist
- Improved error handling for missing components
- Better visual feedback for unavailable sections
- Fixed sidebar section visibility issues
- Cleaned up redundant files for a leaner codebase (July 2025)

## Codebase Cleanup (July 2025)
The codebase has been streamlined by removing:
- Duplicate backup files (app.js.backup, app.js.fixed, etc.)
- Redundant chart manager implementations (consolidated in js/chart-manager.js)
- Multiple fix scripts (consolidated in fix.js)
- Empty/unused utility files
- Legacy files from early development

A PowerShell cleanup script (`cleanup-redundant.ps1`) is available to safely move these redundant files to a backup directory if needed.

## Setup and Usage
1. Clone the repository
2. Open royalties.html in a web server (not directly from file system)
3. Login with test credentials:
   - Admin: admin/admin123
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
