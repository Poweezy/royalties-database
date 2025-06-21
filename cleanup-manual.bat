@echo off
echo === Mining Royalties Database Cleanup ===
echo This batch file will move redundant files to a backup directory.
echo The original files will not be deleted, just moved for safety.
echo.

REM Create backup directory if it doesn't exist
if not exist redundant-files-backup mkdir redundant-files-backup
echo Created backup directory: redundant-files-backup

REM Create subdirectories in backup to maintain structure
if not exist redundant-files-backup\js mkdir redundant-files-backup\js
if not exist redundant-files-backup\js\data mkdir redundant-files-backup\js\data
if not exist redundant-files-backup\js\modules mkdir redundant-files-backup\js\modules
if not exist redundant-files-backup\js\sections mkdir redundant-files-backup\js\sections
if not exist redundant-files-backup\js\services mkdir redundant-files-backup\js\services
if not exist redundant-files-backup\js\auth mkdir redundant-files-backup\js\auth
if not exist redundant-files-backup\js\components mkdir redundant-files-backup\js\components
if not exist redundant-files-backup\js\core mkdir redundant-files-backup\js\core
if not exist redundant-files-backup\js\ui mkdir redundant-files-backup\js\ui
if not exist redundant-files-backup\js\utils mkdir redundant-files-backup\js\utils

set /a moveCount=0

REM Move backup files
if exist app.js.backup (
  move app.js.backup redundant-files-backup\
  echo Moved: app.js.backup
  set /a moveCount+=1
)
if exist app.js.fixed (
  move app.js.fixed redundant-files-backup\
  echo Moved: app.js.fixed
  set /a moveCount+=1
)
if exist app.js.before-fix (
  move app.js.before-fix redundant-files-backup\
  echo Moved: app.js.before-fix
  set /a moveCount+=1
)
if exist app.js.bak (
  move app.js.bak redundant-files-backup\
  echo Moved: app.js.bak
  set /a moveCount+=1
)

REM Move chart manager duplicates
if exist chart-manager-v2.js (
  move chart-manager-v2.js redundant-files-backup\
  echo Moved: chart-manager-v2.js
  set /a moveCount+=1
)
if exist chart-manager.js (
  move chart-manager.js redundant-files-backup\
  echo Moved: chart-manager.js
  set /a moveCount+=1
)

REM Move redundant fix scripts
if exist update-scripts.js (
  move update-scripts.js redundant-files-backup\
  echo Moved: update-scripts.js
  set /a moveCount+=1
)
if exist update-scripts-improved.js (
  move update-scripts-improved.js redundant-files-backup\
  echo Moved: update-scripts-improved.js
  set /a moveCount+=1
)
if exist js\app-fixer.js (
  move js\app-fixer.js redundant-files-backup\js\
  echo Moved: js\app-fixer.js
  set /a moveCount+=1
)
if exist js\module-loader-fix.js (
  move js\module-loader-fix.js redundant-files-backup\js\
  echo Moved: js\module-loader-fix.js
  set /a moveCount+=1
)
if exist js\section-loader-fix.js (
  move js\section-loader-fix.js redundant-files-backup\js\
  echo Moved: js\section-loader-fix.js
  set /a moveCount+=1
)
if exist js\section-navigation-fix.js (
  move js\section-navigation-fix.js redundant-files-backup\js\
  echo Moved: js\section-navigation-fix.js
  set /a moveCount+=1
)
if exist js\resource-tracker.js (
  move js\resource-tracker.js redundant-files-backup\js\
  echo Moved: js\resource-tracker.js
  set /a moveCount+=1
)

REM Move empty/unused files
if exist js\message-handler.js (
  move js\message-handler.js redundant-files-backup\js\
  echo Moved: js\message-handler.js
  set /a moveCount+=1
)
if exist js\utils\stateManager.js (
  move js\utils\stateManager.js redundant-files-backup\js\utils\
  echo Moved: js\utils\stateManager.js
  set /a moveCount+=1
)
if exist js\utils\validation.js (
  move js\utils\validation.js redundant-files-backup\js\utils\
  echo Moved: js\utils\validation.js
  set /a moveCount+=1
)

echo.
echo Cleanup complete: %moveCount% files moved to the redundant-files-backup directory
echo You can safely delete the redundant-files-backup directory if everything works correctly.
echo.
echo To restore a file, use: move redundant-files-backup\filename .
echo.

pause
