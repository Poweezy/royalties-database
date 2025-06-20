# Cleanup script for royalties-database
# This script moves files not associated with royalties.html to the 'redundant-files' directory
# Created: June 20, 2025

# Create backup directory if it doesn't exist
$backupDir = "redundant-files"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory
    Write-Host "Created backup directory: $backupDir"
}

# Create subdirectories in backup to maintain structure
$subDirs = @("js", "css", "components", "html")
foreach ($dir in $subDirs) {
    $path = Join-Path -Path $backupDir -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -Path $path -ItemType Directory
        Write-Host "Created backup subdirectory: $path"
    }
}

# Files to move (files not associated with royalties.html)
$filesToMove = @(
    # HTML files not needed
    "index.html", 
    "test_app.html",
    "icon-fix.html",
    
    # JS files not directly needed for royalties.html
    "js/auth.js",
    "js/dashboard.js", 
    "js/data-manager.js",
    "js/main.js",
    "js/navigation.js",
    "js/section-loaders.js",
    "js/validation.js",
    
    # JS subdirectory files not directly referenced
    "js/actions/actionHandlers.js",
    "js/actions/recordActions.js",
    "js/auth/authManager.js",
    "js/components/auditLogs.js",
    "js/components/Chart.js",
    "js/components/ComponentRegistry.js",
    "js/components/Form.js",
    "js/components/LoadingIndicator.js",
    "js/components/Modal.js",
    "js/components/SearchFilter.js",
    "js/components/StatusBadge.js",
    "js/components/Table.js",
    "js/core/AppCore.js",
    "js/core/ComponentManager.js",
    "js/core/DataManager.js",
    "js/core/EventManager.js",
    "js/data/dataManager.js",
    "js/modules/authentication.js",
    "js/modules/base-module.js",
    "js/modules/ChartManager.js",
    "js/modules/dashboard.js",
    "js/modules/FileManager.js",
    "js/modules/htmlLoader.js",
    "js/modules/IconManager.js",
    "js/modules/navigation.js",
    "js/modules/NavigationManager.js",
    "js/modules/NotificationManager.js",
    "js/modules/template-loader.js",
    "js/modules/UserManager.js",
    "js/sections/dashboard.js",
    "js/services/ApiService.js"
)

# Process each file
foreach ($file in $filesToMove) {
    if (Test-Path $file) {
        # Get directory structure for the backup
        $destDir = Split-Path -Path (Join-Path -Path $backupDir -ChildPath $file)
        
        # Ensure the directory exists
        if (-not (Test-Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Move the file
        $destPath = Join-Path -Path $backupDir -ChildPath $file
        Move-Item -Path $file -Destination $destPath -Force
        Write-Host "Moved: $file -> $destPath"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "`nCleanup completed. Files moved to $backupDir directory."
Write-Host "If you need to restore any files, you can find them there."
