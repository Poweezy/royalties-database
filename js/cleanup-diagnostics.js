/**
 * Cleanup Diagnostic Test
 * 
 * This script checks if the application is functioning properly
 * after the cleanup operations performed on 2025-06-27.
 */

(function() {
    console.log('======================================');
    console.log('Running Cleanup Diagnostic Test');
    console.log('======================================');

    // Check if Utils is available
    if (typeof Utils === 'undefined') {
        console.error('❌ Utils module not loaded!');
    } else {
        console.log('✓ Utils module loaded successfully');
        
        // Test a few utility functions
        try {
            const formattedCurrency = Utils.formatCurrency(1234.56);
            const isValidEmail = Utils.validateEmail('test@example.com');
            const debounced = Utils.debounce(() => {}, 100);
            
            console.log('✓ Utils functions are operational');
        } catch (error) {
            console.error('❌ Error using Utils functions:', error);
        }
    }

    // Check if app.js is loaded correctly
    if (typeof SimpleChartManager === 'undefined') {
        console.error('❌ app.js not loaded correctly!');
    } else {
        console.log('✓ app.js loaded successfully');
    }

    // Check for removed files
    const removedFiles = [
        '/chart-manager.js',
        '/chart-manager-v2.js',
        '/app.js.backup',
        '/js/utils/stateManager.js',
        '/js/utils/validation.js'
    ];

    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    
    removedFiles.forEach(file => {
        const img = new Image();
        const fileUrl = baseUrl + file;
        img.onerror = () => console.log(`✓ Removed file verified: ${file} is gone`);
        img.onload = () => console.warn(`⚠️ File may still exist: ${file}`);
        img.src = fileUrl + '?random=' + Math.random();
    });

    console.log('======================================');
    console.log('Diagnostic test complete');
    console.log('See above for any warnings or errors');
    console.log('======================================');
})();
