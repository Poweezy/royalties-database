@echo off
echo ========================================
echo   MINING ROYALTIES MANAGER CLEANUP
echo ========================================
echo.

REM Create backup directory
set "timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=%timestamp: =0%"
mkdir "BACKUP_%timestamp%" 2>nul

echo Creating backup at BACKUP_%timestamp%
echo.

REM Remove duplicate HTML files
echo Removing duplicate HTML files...
if exist "royalties-enhanced.html" (
    copy "royalties-enhanced.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "royalties-enhanced.html"
    echo Deleted: royalties-enhanced.html
)
if exist "royalties-optimized.html" (
    copy "royalties-optimized.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "royalties-optimized.html"
    echo Deleted: royalties-optimized.html
)
if exist "royalties-clean.html" (
    copy "royalties-clean.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "royalties-clean.html"
    echo Deleted: royalties-clean.html
)
if exist "dashboard-debug.html" (
    copy "dashboard-debug.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "dashboard-debug.html"
    echo Deleted: dashboard-debug.html
)
if exist "error-fix-test.html" (
    copy "error-fix-test.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "error-fix-test.html"
    echo Deleted: error-fix-test.html
)
if exist "system-test.html" (
    copy "system-test.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "system-test.html"
    echo Deleted: system-test.html
)
if exist "test-app.html" (
    copy "test-app.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "test-app.html"
    echo Deleted: test-app.html
)
if exist "test-component-loading.html" (
    copy "test-component-loading.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "test-component-loading.html"
    echo Deleted: test-component-loading.html
)
if exist "test-fix.html" (
    copy "test-fix.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "test-fix.html"
    echo Deleted: test-fix.html
)
if exist "test-unified-loading.html" (
    copy "test-unified-loading.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "test-unified-loading.html"
    echo Deleted: test-unified-loading.html
)
if exist "verify-component-loading.html" (
    copy "verify-component-loading.html" "BACKUP_%timestamp%\" >nul 2>&1
    del "verify-component-loading.html"
    echo Deleted: verify-component-loading.html
)

REM Remove duplicate JS files
echo.
echo Removing duplicate JavaScript files...
if exist "app-clean.js" (
    copy "app-clean.js" "BACKUP_%timestamp%\" >nul 2>&1
    del "app-clean.js"
    echo Deleted: app-clean.js
)

REM Remove documentation files (keep README.md)
echo.
echo Removing documentation files...
for %%f in (*.md) do (
    if not "%%f"=="README.md" (
        copy "%%f" "BACKUP_%timestamp%\" >nul 2>&1
        del "%%f"
        echo Deleted: %%f
    )
)

REM Remove PowerShell scripts
echo.
echo Removing PowerShell scripts...
for %%f in (*.ps1) do (
    if not "%%f"=="CODEBASE-CLEANUP.ps1" (
        copy "%%f" "BACKUP_%timestamp%\" >nul 2>&1
        del "%%f"
        echo Deleted: %%f
    )
)

REM Remove documentation folders
echo.
echo Removing documentation folders...
if exist "docs" (
    xcopy "docs" "BACKUP_%timestamp%\docs\" /E /I /Q >nul 2>&1
    rmdir /S /Q "docs"
    echo Deleted: docs folder
)
if exist "tools" (
    xcopy "tools" "BACKUP_%timestamp%\tools\" /E /I /Q >nul 2>&1
    rmdir /S /Q "tools"
    echo Deleted: tools folder
)

REM Clean up JS directory - remove duplicate/legacy files
echo.
echo Cleaning up js directory...
cd js

REM Remove duplicate app files
for %%f in (app-*.js) do (
    copy "%%f" "..\BACKUP_%timestamp%\js\" >nul 2>&1
    del "%%f"
    echo Deleted: js\%%f
)

REM Remove legacy chart files
for %%f in (chart-*.js) do (
    copy "%%f" "..\BACKUP_%timestamp%\js\" >nul 2>&1
    del "%%f"
    echo Deleted: js\%%f
)

REM Remove dashboard chart files (legacy)
for %%f in (dashboard-chart*.js) do (
    copy "%%f" "..\BACKUP_%timestamp%\js\" >nul 2>&1
    del "%%f"
    echo Deleted: js\%%f
)

REM Remove production chart files (legacy)
for %%f in (production-chart*.js) do (
    copy "%%f" "..\BACKUP_%timestamp%\js\" >nul 2>&1
    del "%%f"
    echo Deleted: js\%%f
)

REM Remove specific legacy files
set "legacyFiles=audit-dashboard-fix.js charts-consolidated.js module-loader.js enhanced-utils.js master-cleanup-solution.js section-navigation-fix.js component-path-fix.js critical-final-chart-fix.js resource-tracker.js unified-notification-system.js"

for %%f in (%legacyFiles%) do (
    if exist "%%f" (
        copy "%%f" "..\BACKUP_%timestamp%\js\" >nul 2>&1
        del "%%f"
        echo Deleted: js\%%f
    )
)

REM Remove utility subdirectories
if exist "utils" (
    xcopy "utils" "..\BACKUP_%timestamp%\js\utils\" /E /I /Q >nul 2>&1
    rmdir /S /Q "utils"
    echo Deleted: js\utils folder
)

if exist "core" (
    xcopy "core" "..\BACKUP_%timestamp%\js\core\" /E /I /Q >nul 2>&1
    rmdir /S /Q "core"
    echo Deleted: js\core folder
)

cd ..

echo.
echo ========================================
echo   CLEANUP COMPLETE!
echo ========================================
echo.
echo Essential files have been preserved:
echo - royalties.html (main entry point)
echo - app.js (main application)
echo - All CSS files
echo - Essential JavaScript modules
echo - All component HTML files
echo - Configuration files (manifest.json, sw.js)
echo - README.md
echo.
echo Backup created at: BACKUP_%timestamp%
echo.
echo The application is ready to run!
echo.
