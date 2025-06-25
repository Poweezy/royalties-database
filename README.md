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

## Running the Application

The Mining Royalties Manager is designed to work best when served through a web server. You can:

1. **Use a local web server**:
   - Python: `python -m http.server`
   - Node.js: `npx http-server`
   - VS Code: Install the "Live Server" extension and click "Go Live"

2. **Open directly**:
   - Open `royalties.html` in your web browser
   - Note: Some features may be limited when opening directly from the file system

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
- Fixed CSS syntax errors in main.css
- Consolidated to using royalties.html as the main entry point
- Improved service worker error handling
- Enhanced component loading system with fallbacks

## Troubleshooting

### Common Issues

1. **"This file does not exist" errors in console**:
   - Make sure all component files are in the correct locations
   - Try serving through a web server instead of opening directly

2. **Login doesn't work**:
   - Make sure JavaScript is enabled in your browser
   - Try clearing browser cache and cookies
   - Ensure you're using the correct credentials

3. **Charts or metrics don't load**:
   - Check if Chart.js is loading correctly
   - Check browser console for any specific errors
   - Try a different browser

4. **Service worker errors**:
   - These are usually harmless messages about communication channels
   - Can be safely ignored if the application functions correctly

### HTTP 500 Errors When Loading Components
If you encounter HTTP 500 errors in the console when components are loading, it may be due to issues with the component paths. The application tries to load components from both `components/` and `html/components/` directories.

**Solution:**
1. Make sure all component HTML files exist in both directories
2. Run the diagnostics helper in the console to identify and fix issues:

```javascript
// Load the diagnostics helper (if not already loaded)
const script = document.createElement('script');
script.src = 'diagnostics-helper.js';
document.head.appendChild(script);

// Once loaded, run the diagnostics
setTimeout(() => {
  if (window.RoyaltiesDiagnostics) {
    RoyaltiesDiagnostics.runAllDiagnostics();
  } else {
    console.error('Diagnostics helper not loaded');
  }
}, 1000);
```

3. If needed, force-load the essential components:
```javascript
RoyaltiesDiagnostics.forceLoadEssentialComponents();
```

### Empty Component Files
If component files exist but are empty:

1. Copy the content from the `components/` directory to `html/components/` using this PowerShell command:
```powershell
Get-ChildItem -Path ".\components\*.html" | ForEach-Object { Copy-Item -Path $_.FullName -Destination ".\html\components\$($_.Name)" -Force }
```

2. Refresh the page and try again.

### Component Test Page
If you're experiencing issues with component loading, use the included component test page:

1. Open `component-test.html` in your browser
2. This page will test all components in all directories and show which ones are available
3. Fix any missing or empty component files

The test will check for components in:
- `components/` directory
- `html/components/` directory
- `templates/` directory

### Running Diagnostics

The application includes built-in diagnostics tools:

1. **URL Parameter Method**:
   - Add `?diagnostics=true` to the URL (e.g., `http://localhost:8000/royalties.html?diagnostics=true`)
   - Open browser console (F12 or Ctrl+Shift+I) to view results

2. **Diagnostics Helper Script**:
   - Open browser console (F12 or Ctrl+Shift+I)
   - Load the diagnostics helper: `fetch('diagnostics-helper.js').then(r => r.text()).then(eval)`
   - Or run it directly by opening diagnostics-helper.js in the browser

The diagnostics tools will:
- Check if all required components are available
- Verify that all script files are loaded
- Attempt to fix common issues automatically
- Provide detailed information about the application state
