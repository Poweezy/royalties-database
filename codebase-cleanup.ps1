# Mining Royalties Database - Codebase Cleanup Script
# This script removes duplicate, test, and temporary files to clean up the codebase

Write-Host "🧹 Starting Codebase Cleanup..." -ForegroundColor Green

# Files to remove - duplicates, tests, and temporary files
$filesToRemove = @(
    "test_app.html",
    "test-fixes.html", 
    "royalties-fixed.html",
    "royalties-clean.html",
    "clean-login.html",
    "debug-login.html", 
    "login-test.html",
    "fix_html.js",
    "icon-fix.html",
    "simple_cleanup.ps1",
    "cleanup_duplicates.ps1",
    "remove_audit_duplicate.ps1",
    "remove_regulatory_duplicate.ps1",
    "semantic-search.css",
    "professional-improvements.css",
    "professional-semantic-search.css",
    "LOGIN_CODE_FIX.md",
    "LOGIN_CREDENTIALS.md", 
    "LOGIN_FIXES.md",
    "DASHBOARD_FIXES.md",
    "# Code Citations.md"
)

# Remove duplicate and test files
foreach ($file in $filesToRemove) {
    $fullPath = Join-Path $PWD $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "✅ Removed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Gray
    }
}

# Check for and remove any duplicate app.js (keep the one in js/ folder)
if (Test-Path "app.js") {
    Write-Host "ℹ️  Found duplicate app.js in root - checking content..." -ForegroundColor Cyan
    
    # Compare with js/app.js to see if they're different
    if (Test-Path "js\app.js") {
        $rootContent = Get-Content "app.js" -Raw
        $jsContent = Get-Content "js\app.js" -Raw
        
        if ($rootContent -eq $jsContent) {
            Remove-Item "app.js" -Force
            Write-Host "✅ Removed duplicate app.js from root (identical to js/app.js)" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️  Root app.js differs from js/app.js - manual review needed" -ForegroundColor Red
        }
    }
}

# Create backup of important files before cleanup
Write-Host "📦 Creating backup of core files..." -ForegroundColor Cyan
$backupDir = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$coreFiles = @("royalties.html", "royalties.css", "manifest.json", "README.md", "favicon.svg")
foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir
        Write-Host "✅ Backed up: $file" -ForegroundColor Green
    }
}

# Copy js folder to backup
if (Test-Path "js") {
    Copy-Item "js" -Destination "$backupDir\js" -Recurse
    Write-Host "✅ Backed up: js/ folder" -ForegroundColor Green
}

Write-Host "`n🎉 Codebase cleanup completed!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   • Removed duplicate and test files" -ForegroundColor White
Write-Host "   • Created backup in: $backupDir" -ForegroundColor White
Write-Host "   • Core application files preserved" -ForegroundColor White

Write-Host "`n📁 Remaining core files:" -ForegroundColor Cyan
Get-ChildItem -File | Where-Object { $_.Name -notlike "backup-*" -and $_.Name -ne "codebase-cleanup.ps1" } | ForEach-Object { 
    Write-Host "   • $($_.Name)" -ForegroundColor White 
}

Write-Host "`n🏗️  Project structure after cleanup:" -ForegroundColor Cyan
Write-Host "   royalties-database/" -ForegroundColor White
Write-Host "   ├── royalties.html (main application)" -ForegroundColor White
Write-Host "   ├── royalties.css (main styles)" -ForegroundColor White
Write-Host "   ├── semantic-search-enhancements.css (enhanced UI)" -ForegroundColor White
Write-Host "   ├── semantic-search-ui.js (enhanced functionality)" -ForegroundColor White
Write-Host "   ├── manifest.json (PWA config)" -ForegroundColor White
Write-Host "   ├── favicon.svg (app icon)" -ForegroundColor White
Write-Host "   ├── README.md (documentation)" -ForegroundColor White
Write-Host "   └── js/" -ForegroundColor White
Write-Host "       ├── app.js (main application logic)" -ForegroundColor White
Write-Host "       └── modules/" -ForegroundColor White
Write-Host "           ├── ChartManager.js" -ForegroundColor White
Write-Host "           ├── FileManager.js" -ForegroundColor White
Write-Host "           ├── IconManager.js" -ForegroundColor White
Write-Host "           ├── NavigationManager.js" -ForegroundColor White
Write-Host "           ├── NotificationManager.js" -ForegroundColor White
Write-Host "           └── UserManager.js" -ForegroundColor White

Write-Host "`n✨ The codebase is now clean and organized!" -ForegroundColor Green
