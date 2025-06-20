@echo off
REM Cleanup batch file for royalties-database
REM This script moves files not associated with royalties.html to the 'redundant-files' directory
REM Created: June 20, 2025

echo === Mining Royalties Database Cleanup ===
echo.

REM Create backup directory if it doesn't exist
if not exist redundant-files mkdir redundant-files
echo Created backup directory: redundant-files

REM Create subdirectories in backup to maintain structure
if not exist redundant-files\js mkdir redundant-files\js
if not exist redundant-files\js\actions mkdir redundant-files\js\actions
if not exist redundant-files\js\auth mkdir redundant-files\js\auth
if not exist redundant-files\js\components mkdir redundant-files\js\components
if not exist redundant-files\js\core mkdir redundant-files\js\core
if not exist redundant-files\js\data mkdir redundant-files\js\data
if not exist redundant-files\js\modules mkdir redundant-files\js\modules
if not exist redundant-files\js\sections mkdir redundant-files\js\sections
if not exist redundant-files\js\services mkdir redundant-files\js\services
echo Created backup subdirectories

echo.
echo === Moving unnecessary HTML files ===
if exist index.html move index.html redundant-files\
if exist test_app.html move test_app.html redundant-files\
if exist icon-fix.html move icon-fix.html redundant-files\

echo.
echo === Moving unnecessary JavaScript files ===
if exist js\auth.js move js\auth.js redundant-files\js\
if exist js\dashboard.js move js\dashboard.js redundant-files\js\
if exist js\data-manager.js move js\data-manager.js redundant-files\js\
if exist js\main.js move js\main.js redundant-files\js\
if exist js\navigation.js move js\navigation.js redundant-files\js\
if exist js\section-loaders.js move js\section-loaders.js redundant-files\js\
if exist js\validation.js move js\validation.js redundant-files\js\

REM Move JavaScript subdirectory files
if exist js\actions\*.js move js\actions\*.js redundant-files\js\actions\
if exist js\auth\*.js move js\auth\*.js redundant-files\js\auth\
if exist js\components\*.js move js\components\*.js redundant-files\js\components\
if exist js\core\*.js move js\core\*.js redundant-files\js\core\
if exist js\data\*.js move js\data\*.js redundant-files\js\data\
if exist js\modules\*.js move js\modules\*.js redundant-files\js\modules\
if exist js\sections\*.js move js\sections\*.js redundant-files\js\sections\
if exist js\services\*.js move js\services\*.js redundant-files\js\services\

echo.
echo === Cleanup completed ===
echo Files have been moved to the redundant-files directory.
echo Please check file-cleanup-report.html for more information.
echo.
echo Remember to test the application thoroughly after cleanup.
echo If you need to restore any files, you can find them in the redundant-files directory.
echo.
pause
