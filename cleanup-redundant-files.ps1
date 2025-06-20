# Cleanup script for royalties-database
# This script moves files not associated with royalties.html to the 'redundant-files' directory
# Created: June 20, 2025

Write-Host "=== Mining Royalties Database Cleanup ==="
Write-Host ""

# Create backup directory if it doesn't exist
$backupDir = "redundant-files"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory
    Write-Host "Created backup directory: $backupDir"
}

# Create subdirectories in backup to maintain structure
$subDirs = @("js", "js/data", "js/modules", "js/sections", "js/services", "js/auth", "js/components", "js/core", "components", "html", "css")
foreach ($dir in $subDirs) {
    $path = Join-Path -Path $backupDir -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -Path $path -ItemType Directory -Force
        Write-Host "Created backup subdirectory: $path"
    }
}

# Files to move (files not associated with royalties.html)
$filesToMove = @(
    # Backup files
    "app.js.bak",
    "app.js.backup",
    "app.js.fixed",
    
    # Test files
    "test_app.html",
    "icon-fix.html",
    
    # Duplicate or unused JavaScript files
    "js/data/dataManager.js",
    "js/modules/*.js",
    "js/sections/*.js",
    "js/services/*.js",
    "js/auth.js",
    "js/auth/authManager.js",
    "js/dashboard.js",
    "js/main.js",
    "js/utils.js",
    "js/validation.js",
    "js/data-manager.js",
    "js/section-loaders.js",
    "js/ui/dashboardManager.js",
    "js/ui/navigationManager.js",
    "js/ui/sectionManagers.js",
    "js/core/DataManager.js",
    "js/core/AppCore.js",
    "js/core/ComponentManager.js",
    "js/core/EventManager.js"
)

$moveCount = 0

# Move each file if it exists
foreach ($file in $filesToMove) {
    # Handle wildcards
    if ($file -match "\*") {
        $matchingFiles = Get-ChildItem -Path $file -ErrorAction SilentlyContinue
        
        foreach ($matchingFile in $matchingFiles) {
            $relativePath = $matchingFile.FullName.Replace((Get-Location).Path + "\", "")
            $destPath = Join-Path -Path $backupDir -ChildPath $relativePath
            $destDir = [System.IO.Path]::GetDirectoryName($destPath)
            
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            
            if (Test-Path $matchingFile.FullName) {
                Move-Item -Path $matchingFile.FullName -Destination $destPath -Force
                Write-Host "Moved: $relativePath to $destPath"
                $moveCount++
            }
        }
    }
    else {
        if (Test-Path $file) {
            $destPath = Join-Path -Path $backupDir -ChildPath $file
            $destDir = [System.IO.Path]::GetDirectoryName($destPath)
            
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            
            Move-Item -Path $file -Destination $destPath -Force
            Write-Host "Moved: $file to $destPath"
            $moveCount++
        }
    }
}

Write-Host ""
Write-Host "Cleanup complete: $moveCount files moved to the $backupDir directory"
Write-Host "You can safely delete the $backupDir directory if everything works correctly."
Write-Host ""
Write-Host "To restore a file, use: Move-Item -Path '$backupDir\filename' -Destination '.'"
Write-Host ""
