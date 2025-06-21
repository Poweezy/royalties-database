# Cleanup script for royalties-database
# This script moves all redundant files to a backup directory
# Run with: ./cleanup-redundant.ps1

Write-Host "=== Mining Royalties Database Cleanup ==="
Write-Host "This script will move redundant files to a backup directory."
Write-Host "The original files will not be deleted, just moved for safety."
Write-Host ""

# Create backup directory if it doesn't exist
$backupDir = "redundant-files-backup"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory | Out-Null
    Write-Host "Created backup directory: $backupDir"
}

# Create subdirectories in backup to maintain structure
$subDirs = @("js", "js/data", "js/modules", "js/sections", "js/services", "js/auth", "js/components", "js/core", "js/ui", "js/utils")
foreach ($dir in $subDirs) {
    $path = Join-Path -Path $backupDir -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -Path $path -ItemType Directory | Out-Null
        Write-Host "Created subdirectory: $path"
    }
}

# Files to move (redundant and duplicate files)
$filesToMove = @(
    # Backup Files
    "app.js.backup",
    "app.js.fixed",
    "app.js.before-fix",
    "app.js.bak",
    
    # Chart Manager Duplicates
    "chart-manager-v2.js",
    "chart-manager.js",
    
    # Redundant Fix Scripts
    "update-scripts.js",
    "update-scripts-improved.js",
    "js/app-fixer.js",
    "js/module-loader-fix.js",
    "js/section-loader-fix.js",
    "js/section-navigation-fix.js",
    "js/resource-tracker.js",
    
    # Empty/Unused Files
    "js/message-handler.js",
    "js/utils/stateManager.js",
    "js/utils/validation.js"
)

$moveCount = 0

# Move each file if it exists
foreach ($file in $filesToMove) {
    if (Test-Path $file) {
        # Create directory structure in backup if needed
        $destDir = Split-Path -Path (Join-Path -Path $backupDir -ChildPath $file)
        if (-not (Test-Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Move the file
        $dest = Join-Path -Path $backupDir -ChildPath $file
        Move-Item -Path $file -Destination $dest -Force
        Write-Host "Moved: $file to $dest"
        $moveCount++
    }
}

Write-Host ""
Write-Host "Cleanup complete: $moveCount files moved to the $backupDir directory"
Write-Host "You can safely delete the $backupDir directory if everything works correctly."
Write-Host ""
Write-Host "To restore a file, use: Move-Item -Path '$backupDir\filename' -Destination '.'"
Write-Host ""