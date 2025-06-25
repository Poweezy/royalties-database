# Codebase Cleanup Guide

This document lists redundant files that can be safely removed from the codebase.

## Redundant Files to Delete

### Backup Files
- ✓ `app.js.backup` (REMOVED)
- `app.js.fixed` (in redundant-files/)
- `app.js.before-fix`
- `app.js.bak` (in redundant-files/)

### Chart Manager Duplicates
- ✓ `chart-manager-v2.js` (REMOVED - functionality moved to `js/chart-manager.js`)
- ✓ `chart-manager.js` (REMOVED - functionality moved to `js/chart-manager.js`)

### Redundant Fix Scripts
- `update-scripts.js` (replaced by simplified `fix.js`)
- `update-scripts-improved.js` (replaced by simplified `fix.js`)
- `js/app-fixer.js` (functionality integrated into `fix.js`)
- `js/module-loader-fix.js` (functionality integrated into `fix.js`)
- `js/section-loader-fix.js` (functionality integrated into `fix.js`)
- `js/section-navigation-fix.js` (functionality integrated into `fix.js`)
- `js/resource-tracker.js` (functionality integrated into `fix.js`)

### Empty/Unused Files
- `js/message-handler.js` (empty file)
- ✓ `js/utils/stateManager.js` (REMOVED)
- ✓ `js/utils/validation.js` (REMOVED)
- `redundant-files/js/sections/dashboard.js` (empty file)

### Redundant Module Files
These files in the redundant-files directory are duplicated by proper implementations in the main js directory:
- All files in `redundant-files/` directory

## Other Improvements

1. The core functionality is handled by these key files:
   - `app.js`
   - `js/chart-manager.js`
   - `js/module-loader.js`
   - `js/component-initializer.js`
   - `js/diagnostics.js`
   - `js/utils.js` (Added - consolidated utility functions)

2. For better organization, consider moving all JS files to the js directory.

## Clean-Up Procedure

1. First, back up all files (create a zip archive of the entire project)
2. Delete the redundant files listed above
3. Verify the application works correctly after deletion
4. If any issues occur, restore from the backup

Keeping a lean codebase improves maintainability, reduces confusion, and makes it easier to identify the active code.