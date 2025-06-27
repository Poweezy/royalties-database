# ====================================================================
# CODEBASE CLEANUP SCRIPT
# ====================================================================
# This script removes all unnecessary files and keeps only the essential
# files needed for the Mining Royalties Manager to work perfectly.
# ====================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MINING ROYALTIES MANAGER CLEANUP" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define the base directory
$baseDir = Split-Path $MyInvocation.MyCommand.Path

# Files and folders to KEEP (essential for the application to work)
$essentialFiles = @(
    # Main HTML entry point
    "royalties.html",
    
    # Essential CSS files
    "css\base.css",
    "css\variables.css", 
    "css\layout.css",
    "css\components.css",
    "css\forms.css",
    "css\tables.css",
    "css\buttons.css",
    "css\badges.css",
    "css\utilities.css",
    "css\main.css",
    "royalties.css",
    
    # Core JavaScript files (only the essential ones)
    "app.js",                                    # Main application logic
    "js\utils.js",                              # Utility functions
    "js\enhanced-notification-system.js",       # Notification system
    "js\unified-chart-solution.js",             # Chart management
    "js\ultimate-chart-solution.js",            # Extended chart features
    "js\magical-chart-solution.js",             # Auto chart initialization
    "js\final-system-unification.js",           # System integration
    "js\unified-component-loader.js",           # Component loading
    "js\component-diagnostics.js",              # Component diagnostics
    "js\component-initializer.js",              # Component initialization
    "js\sidebar-manager.js",                    # Sidebar functionality
    "js\startup.js",                            # Application startup
    "js\dashboard.js",                          # Dashboard functionality
    
    # Component HTML files (all are needed for different sections)
    "components\sidebar.html",
    "components\dashboard.html", 
    "components\user-management.html",
    "components\royalty-records.html",
    "components\contract-management.html",
    "components\reporting-analytics.html",
    "components\communication.html",
    "components\notifications.html",
    "components\compliance.html",
    "components\regulatory-management.html",
    "components\profile.html",
    
    # Essential configuration files
    "manifest.json",                            # PWA manifest
    "sw.js",                                    # Service worker
    "favicon.svg",                              # Site icon
    
    # Important documentation
    "README.md"
)

# Files and patterns to DELETE (cleanup targets)
$filesToDelete = @(
    # Duplicate/legacy HTML files
    "royalties-enhanced.html",
    "royalties-optimized.html", 
    "royalties-clean.html",
    "dashboard-debug.html",
    "error-fix-test.html",
    "system-test.html",
    "test-*.html",
    "verify-*.html",
    
    # Duplicate/legacy JavaScript files
    "js\app-*.js",                             # All app variants except main
    "app-*.js",                                # Root level app variants
    "js\chart-*.js",                           # Legacy chart files
    "js\dashboard-chart*.js",                  # Legacy dashboard chart files
    "js\production-chart*.js",                 # Legacy production chart files
    "js\audit-dashboard*.js",                  # Legacy audit files
    "js\charts-consolidated.js",               # Consolidated but replaced
    "js\module-loader.js",                     # Replaced by unified-component-loader
    "js\enhanced-utils.js",                    # Duplicate of utils
    "js\master-cleanup-solution.js",           # Cleanup script, not runtime
    "js\section-navigation-fix.js",            # Fix applied, no longer needed
    "js\component-path-fix.js",                # Fix applied, no longer needed
    "js\critical-final-chart-fix.js",          # Fix applied, no longer needed
    "js\resource-tracker.js",                  # Not essential
    "js\unified-notification-system.js",       # Duplicate, using enhanced version
    
    # Utility subdirectories (functionality moved to main utils.js)
    "js\utils\*",
    
    # Core subdirectories (functionality integrated into main files)
    "js\core\*",
    
    # Documentation and cleanup files
    "*.md",                                     # All markdown files except README
    "!README.md",                              # Keep README.md
    "docs\*",                                   # All documentation folders
    "tools\*",                                  # All tool scripts
    "*.ps1",                                    # All PowerShell scripts (including this one after run)
    
    # Test and debug files
    "*debug*",
    "*test*",
    "*verify*",
    
    # Status and planning files
    "*-SUMMARY.md",
    "*-STATUS.md", 
    "*-PLAN.md",
    "*-REPORT.md",
    "*documentation*",
    "*implementation*",
    "*enhancement*",
    "*cleanup*",
    "*final*",
    "*unified*",
    "*comprehensive*",
    "PROJECT-*",
    "DASHBOARD-*",
    "FINAL-*",
    "CLEANUP-*",
    "COMPONENT-*",
    
    # Chart-related documentation
    "chart-*",
    "notification-system-documentation.md",
    "system-unification-documentation.md"
)

# Folders to DELETE completely
$foldersToDelete = @(
    "docs",
    "tools", 
    "js\utils",
    "js\core"
)

Write-Host "Starting cleanup process..." -ForegroundColor Green
Write-Host ""

# Create backup directory first
$backupDir = "$baseDir\BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup at: $backupDir" -ForegroundColor Yellow
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Function to safely delete with backup
function Remove-WithBackup {
    param($Path, $IsDirectory = $false)
    
    if (Test-Path $Path) {
        try {
            $relativePath = [System.IO.Path]::GetRelativePath($baseDir, $Path)
            $backupPath = Join-Path $backupDir $relativePath
            
            if ($IsDirectory) {
                # Create parent directory in backup
                $backupParent = Split-Path $backupPath -Parent
                if (!(Test-Path $backupParent)) {
                    New-Item -Path $backupParent -ItemType Directory -Force | Out-Null
                }
                # Copy directory to backup
                Copy-Item -Path $Path -Destination $backupPath -Recurse -Force
                # Remove original
                Remove-Item -Path $Path -Recurse -Force
                Write-Host "Deleted directory: $relativePath" -ForegroundColor Red
            } else {
                # Create parent directory in backup if needed
                $backupParent = Split-Path $backupPath -Parent  
                if (!(Test-Path $backupParent)) {
                    New-Item -Path $backupParent -ItemType Directory -Force | Out-Null
                }
                # Copy file to backup
                Copy-Item -Path $Path -Destination $backupPath -Force
                # Remove original
                Remove-Item -Path $Path -Force
                Write-Host "Deleted file: $relativePath" -ForegroundColor Red
            }
        } catch {
            Write-Host "Error deleting $Path : $_" -ForegroundColor Magenta
        }
    }
}

# Delete specific folders first
Write-Host "Removing unnecessary folders..." -ForegroundColor Yellow
foreach ($folder in $foldersToDelete) {
    $fullPath = Join-Path $baseDir $folder
    Remove-WithBackup $fullPath $true
}

# Delete specific files
Write-Host ""
Write-Host "Removing unnecessary files..." -ForegroundColor Yellow

# Get all files in the directory
$allFiles = Get-ChildItem -Path $baseDir -Recurse -File

foreach ($file in $allFiles) {
    $relativePath = [System.IO.Path]::GetRelativePath($baseDir, $file.FullName)
    
    # Check if this file should be kept
    $shouldKeep = $false
    foreach ($essential in $essentialFiles) {
        if ($relativePath -eq $essential) {
            $shouldKeep = $true
            break
        }
    }
    
    # If not essential, check if it matches deletion patterns
    if (-not $shouldKeep) {
        $shouldDelete = $false
        
        foreach ($pattern in $filesToDelete) {
            # Handle negation patterns (files to explicitly keep)
            if ($pattern.StartsWith("!")) {
                $keepPattern = $pattern.Substring(1)
                if ($relativePath -like $keepPattern) {
                    $shouldDelete = $false
                    $shouldKeep = $true
                    break
                }
            }
            # Handle wildcard patterns
            elseif ($relativePath -like $pattern) {
                $shouldDelete = $true
            }
            # Handle specific files
            elseif ($relativePath -eq $pattern) {
                $shouldDelete = $true
            }
        }
        
        if ($shouldDelete -and -not $shouldKeep) {
            Remove-WithBackup $file.FullName
        }
    }
}

# Clean up empty directories
Write-Host ""
Write-Host "Removing empty directories..." -ForegroundColor Yellow
do {
    $emptyDirs = Get-ChildItem -Path $baseDir -Recurse -Directory | Where-Object { 
        (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 
    }
    
    foreach ($dir in $emptyDirs) {
        if ($dir.FullName -ne $baseDir -and $dir.FullName -ne $backupDir) {
            $relativePath = [System.IO.Path]::GetRelativePath($baseDir, $dir.FullName)
            Remove-Item -Path $dir.FullName -Force
            Write-Host "Removed empty directory: $relativePath" -ForegroundColor DarkGray
        }
    }
} while ($emptyDirs.Count -gt 0)

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Count remaining files
$remainingFiles = Get-ChildItem -Path $baseDir -Recurse -File | Where-Object { 
    $_.FullName -notlike "$backupDir*" 
}

Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Files remaining: $($remainingFiles.Count)" -ForegroundColor Green
Write-Host "- Backup created at: $backupDir" -ForegroundColor Yellow
Write-Host ""

Write-Host "Essential files kept:" -ForegroundColor Green
foreach ($file in $essentialFiles) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING!)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "The codebase has been cleaned up and optimized!" -ForegroundColor Green
Write-Host "All essential files for the Mining Royalties Manager are preserved." -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the application using: royalties.html" -ForegroundColor Cyan
Write-Host ""

# Self-delete this cleanup script
Write-Host "Removing this cleanup script..." -ForegroundColor DarkGray
Start-Sleep -Seconds 2
Remove-Item -Path $MyInvocation.MyCommand.Path -Force
