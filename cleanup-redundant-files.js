/**
 * Cleanup Script for Redundant Files
 * This script identifies and lists redundant files in the royalties-database project
 * Run with: node cleanup-redundant-files.js
 */

const fs = require('fs');
const path = require('path');

// Define redundant files based on CLEAN-UP-GUIDE.md and analysis
const redundantFiles = [
    // Backup files
    'app.js.backup',
    'app.js.fixed',
    'app.js.before-fix',
    'app.js.bak',

    // Chart manager duplicates (functionality moved to js/chart-manager.js)
    'chart-manager-v2.js',
    'chart-manager.js',  // root folder version

    // Fix scripts replaced by consolidated versions
    'update-scripts.js',
    'update-scripts-improved.js',
    'js/app-fixer.js',
    'js/module-loader-fix.js',
    'js/section-loader-fix.js',
    'js/section-navigation-fix.js',
    'js/resource-tracker.js',

    // Empty/unused files
    'js/message-handler.js',
    'js/utils/stateManager.js',
    'js/utils/validation.js'
];

// Core needed files - DO NOT DELETE
const coreFiles = [
    'app.js',
    'royalties.html',
    'royalties.css',
    'js/chart-manager.js',
    'js/module-loader.js',
    'js/component-initializer.js',
    'js/diagnostics.js',
    'js/sidebar-manager.js',
    'fix.js',
    'manifest.json',
    'favicon.svg'
];

console.log('=== Mining Royalties Database Redundant Files ===');
console.log('The following files are redundant and can be safely moved to a backup directory:\n');

// Check if files exist and print them
let foundRedundantFiles = [];
redundantFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            console.log(`- ${file}`);
            foundRedundantFiles.push(file);
        }
    } catch (err) {
        // Ignore errors
    }
});

console.log(`\nFound ${foundRedundantFiles.length} redundant files.`);

// Create backup directory if needed
const backupDir = 'redundant-backup';
if (!fs.existsSync(backupDir)) {
    console.log(`\nCreating backup directory: ${backupDir}`);
    fs.mkdirSync(backupDir, { recursive: true });
}

// Ask user to confirm backup/deletion
console.log('\nOptions:');
console.log('1. Move redundant files to backup directory');
console.log('2. Just list files (no action)');
console.log('\nTo move files, run: node cleanup-redundant-files.js --move');
console.log('To delete files directly (not recommended), run: node cleanup-redundant-files.js --delete');

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--move')) {
    moveRedundantFiles();
} else if (args.includes('--delete')) {
    console.log('\nWARNING: This will permanently delete files. It is recommended to use --move instead.');
    console.log('To confirm deletion, run: node cleanup-redundant-files.js --delete --confirm');
    
    if (args.includes('--confirm')) {
        deleteRedundantFiles();
    }
}

// Function to move files to backup directory
function moveRedundantFiles() {
    console.log(`\nMoving ${foundRedundantFiles.length} redundant files to ${backupDir}...`);
    let moveCount = 0;
    
    foundRedundantFiles.forEach(file => {
        try {
            const dirname = path.dirname(file);
            const backupPath = path.join(backupDir, file);
            const backupDirPath = path.dirname(backupPath);
            
            // Create the necessary subdirectory structure
            if (!fs.existsSync(backupDirPath)) {
                fs.mkdirSync(backupDirPath, { recursive: true });
            }
            
            // Move file
            fs.renameSync(file, backupPath);
            console.log(`  Moved: ${file} -> ${backupPath}`);
            moveCount++;
        } catch (err) {
            console.error(`  Error moving ${file}: ${err.message}`);
        }
    });
    
    console.log(`\nSuccessfully moved ${moveCount} of ${foundRedundantFiles.length} redundant files.`);
}

// Function to delete files (use with caution)
function deleteRedundantFiles() {
    console.log(`\nDeleting ${foundRedundantFiles.length} redundant files...`);
    let deleteCount = 0;
    
    foundRedundantFiles.forEach(file => {
        try {
            fs.unlinkSync(file);
            console.log(`  Deleted: ${file}`);
            deleteCount++;
        } catch (err) {
            console.error(`  Error deleting ${file}: ${err.message}`);
        }
    });
    
    console.log(`\nSuccessfully deleted ${deleteCount} of ${foundRedundantFiles.length} redundant files.`);
}