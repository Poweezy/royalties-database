/**
 * Chart Diagnostic Script
 * This script helps diagnose issues with chart rendering in the Mining Royalties app
 */

(function() {
    'use strict';
    
    console.log('=== CHART DIAGNOSTICS STARTING ===');
    
    // Check if Chart.js is loaded
    const chartJsLoaded = typeof Chart !== 'undefined';
    console.log('Chart.js loaded:', chartJsLoaded);
    
    // Check if chartManager is available
    const chartManagerAvailable = typeof window.chartManager !== 'undefined';
    console.log('Chart Manager available:', chartManagerAvailable);
    
    // Check if all chart canvas elements exist
    const expectedCanvasIds = [
        'revenue-trends-chart',
        'revenue-by-entity-chart',
        'payment-timeline-chart', 
        'forecast-chart',
        'mineral-performance-chart'
    ];
    
    console.log('Checking canvas elements:');
    const missingCanvases = [];
    expectedCanvasIds.forEach(id => {
        const canvas = document.getElementById(id);
        const exists = !!canvas;
        console.log(`- ${id}: ${exists ? '✓ Found' : '✗ Missing'}`);
        if (!exists) {
            missingCanvases.push(id);
        }
    });
    
    // Try to diagnose chart manager issues
    if (chartManagerAvailable) {
        console.log('Chart Manager Methods:');
        const chartManagerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.chartManager))
            .filter(method => typeof window.chartManager[method] === 'function');
        
        console.log(chartManagerMethods);
        
        // Check if specific methods exist
        const requiredMethods = [
            'create',
            'createRevenueChart',
            'createProductionChart',
            'destroyAll'
        ];
        
        console.log('Required chart methods:');
        requiredMethods.forEach(method => {
            const exists = chartManagerMethods.includes(method) || 
                          typeof window.chartManager[method] === 'function';
            console.log(`- ${method}: ${exists ? '✓ Available' : '✗ Missing'}`);
        });
        
        // Check for charts that may already be created
        console.log('Existing charts:', window.chartManager.charts ? 
            `${window.chartManager.charts.size} charts found` : 'No chart collection found');
    }
    
    // Try to fix problems
    if (!chartJsLoaded) {
        console.log('Attempting to load Chart.js dynamically...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js loaded dynamically ✓');
            window.location.reload();
        };
        script.onerror = () => console.error('Failed to load Chart.js dynamically ✗');
        document.head.appendChild(script);
    }
    
    if (missingCanvases.length > 0) {
        console.warn(`Missing canvas elements: ${missingCanvases.join(', ')}`);
        console.log('This might happen if the dashboard HTML didn\'t load properly');
    }
    
    // Fix chart manager if needed
    if (!chartManagerAvailable && chartJsLoaded) {
        console.log('Chart.js is loaded but chartManager is not available. Attempting to fix...');
        // Try to load chart manager script
        const script = document.createElement('script');
        script.src = 'js/chart-manager.js?v=' + Date.now();
        script.onload = () => console.log('Chart manager loaded dynamically ✓');
        script.onerror = () => console.error('Failed to load chart manager dynamically ✗');
        document.head.appendChild(script);
    }
    
    // Provide recommendations
    console.log('=== DIAGNOSTIC RECOMMENDATIONS ===');
    
    if (!chartJsLoaded) {
        console.log('1. Ensure Chart.js is properly loaded before any chart initialization');
    }
    
    if (!chartManagerAvailable) {
        console.log('2. Check that js/chart-manager.js is loaded and executed before dashboard initialization');
    }
    
    if (missingCanvases.length > 0) {
        console.log('3. Verify that the dashboard HTML contains all expected canvas elements');
        console.log('   - Check HTML structure in components/dashboard.html');
    }
    
    console.log('4. Check browser console for any JavaScript errors');
    console.log('5. Verify that dashboard section is properly loaded before chart initialization');
    
    console.log('=== CHART DIAGNOSTICS COMPLETE ===');
})();
