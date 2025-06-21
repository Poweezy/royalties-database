@echo off
REM Cleanup batch file for royalties-database
REM This script moves redundant files to a backup directory
REM Created: June 26, 2025

echo === Mining Royalties Database Cleanup ===
echo.
echo This script will move redundant files to a backup directory.
echo The original files will not be deleted, just moved for safety.
echo.

REM Create backup directory if it doesn't exist
set BACKUP_DIR=redundant-files-backup
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
echo Created backup directory: %BACKUP_DIR%

REM Create subdirectories in backup to maintain structure
if not exist %BACKUP_DIR%\js mkdir %BACKUP_DIR%\js
if not exist %BACKUP_DIR%\js\data mkdir %BACKUP_DIR%\js\data
if not exist %BACKUP_DIR%\js\modules mkdir %BACKUP_DIR%\js\modules
if not exist %BACKUP_DIR%\js\sections mkdir %BACKUP_DIR%\js\sections
if not exist %BACKUP_DIR%\js\services mkdir %BACKUP_DIR%\js\services
if not exist %BACKUP_DIR%\js\auth mkdir %BACKUP_DIR%\js\auth
if not exist %BACKUP_DIR%\js\components mkdir %BACKUP_DIR%\js\components
if not exist %BACKUP_DIR%\js\core mkdir %BACKUP_DIR%\js\core
if not exist %BACKUP_DIR%\js\ui mkdir %BACKUP_DIR%\js\ui
if not exist %BACKUP_DIR%\js\utils mkdir %BACKUP_DIR%\js\utils

echo Created subdirectories for backup

REM Move backup files
set MOVED_COUNT=0

REM Backup Files
call :move_file app.js.backup
call :move_file app.js.fixed
call :move_file app.js.before-fix
call :move_file app.js.bak

REM Chart Manager Duplicates
call :move_file chart-manager-v2.js
call :move_file chart-manager.js

REM Redundant Fix Scripts
call :move_file update-scripts.js
call :move_file update-scripts-improved.js
call :move_file js\app-fixer.js
call :move_file js\module-loader-fix.js
call :move_file js\section-loader-fix.js
call :move_file js\section-navigation-fix.js
call :move_file js\resource-tracker.js

REM Empty/Unused Files
call :move_file js\message-handler.js
call :move_file js\utils\stateManager.js
call :move_file js\utils\validation.js

echo.
echo Cleanup complete: %MOVED_COUNT% files moved to the %BACKUP_DIR% directory
echo You can safely delete the %BACKUP_DIR% directory if everything works correctly.
echo.
echo To restore a file, use: move %BACKUP_DIR%\filename .
echo.

goto :eof

:move_file
if exist %1 (
    echo Moving: %1
    move %1 %BACKUP_DIR%\%1
    set /a MOVED_COUNT+=1
)
goto :eof