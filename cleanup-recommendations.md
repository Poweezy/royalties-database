# Cleanup Recommendations

The following files are redundant or duplicate and should be deleted to fix navigation issues:

## Backup/Old Files
- `app.js.backup` - Backup of old app.js
- `app.js.bak` - Another backup of app.js
- `app.js.fixed` - Fixed version that's now merged into app.js

## Redundant/Duplicate Files
- `js/navigation-fix-loader.js` - Now replaced by app-navigation-fix.js
- `js/audit-dashboard-fix.js` - Now consolidated into audit-dashboard-navigation-fix.js
- `js/app-fixer.js` - Merged into app-navigation-fix.js
- `fix.js` - Replaced by fix-loader.js

## Old Documentation
- `NAVIGATION-FIX-README.md` - Replaced by NAVIGATION-FIX.md

## Redundant Files in the redundant-files Directory
All files in the `redundant-files` directory can be safely deleted as they're outdated versions of files now properly maintained in the main directories.

## How to Run the Cleanup Script

To safely clean up these files and fix navigation issues:

1. Open your browser to the application
2. Open the Developer Console (F12 or right-click > Inspect > Console)
3. Copy and paste the code from `cleanup-script.js`
4. Press Enter to run the script

The script will perform the following actions:
- Fix navigation issues by applying the proper handlers
- Mark redundant files in the console (these can be manually deleted later)
- Apply a runtime fix for the `updateAuditEvents` function to prevent page reloads

You can run this script each time you load the application until the redundant files are removed from the codebase.