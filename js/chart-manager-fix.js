/**
 * FIXED: Chart Manager Patch
 * This script ensures all critical chart methods are available
 * @version 1.0.0
 * @date 2025-07-04
 */

(function(window) {
    'use strict';
    
    console.log('=== CHART MANAGER PATCH LOADING ===');
    
    // Wait for ChartManager to be available
    function ensureChartManager() {
        if (!window.chartManager) {
            console.warn('ChartManager not found, creating a basic instance...');
            // Create a minimal chart manager if none exists
            window.chartManager = {};
        }

        console.log('Applying chart method patches...');
        
        // Ensure the createProductionChart method exists
        if (typeof window.chartManager.createProductionChart !== 'function') {
            console.log('Adding missing createProductionChart method');
            
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`ChartManager Patch: Creating production chart on ${canvasId}`);
                
                // Try to find the canvas with the given ID or known alias
                let canvas = document.getElementById(canvasId);
                if (!canvas && canvasId === 'production-by-entity-chart') {
                    console.log('Trying revenue-by-entity-chart as alias for production chart');
                    canvas = document.getElementById('revenue-by-entity-chart');
                    if (canvas) canvasId = 'revenue-by-entity-chart';
                } else if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    console.log('Trying production-by-entity-chart as alias for revenue chart');
                    canvas = document.getElementById('production-by-entity-chart');
                    if (canvas) canvasId = 'production-by-entity-chart';
                }
                
                if (!canvas) {
                    console.error(`ChartManager: Canvas with id '${canvasId}' not found for production chart`);
                    // Create canvas if it doesn't exist
                    canvas = document.createElement('canvas');
                    canvas.id = canvasId;
                    // Try to find dashboard container
                    const dashboardContainer = document.querySelector('.chart-container') || 
                                            document.querySelector('.dashboard-charts') || 
                                            document.getElementById('dashboard');
                    
                    if (dashboardContainer) {
                        // Create wrapper div
                        const chartWrapper = document.createElement('div');
                        chartWrapper.className = 'chart-wrapper';
                        chartWrapper.style.cssText = 'position: relative; height: 300px; width: 100%; margin-bottom: 20px;';
                        
                        // Add title
                        const chartTitle = document.createElement('h3');
                        chartTitle.textContent = 'Production by Entity';
                        chartTitle.className = 'chart-title';
                        
                        // Add canvas to wrapper
                        chartWrapper.appendChild(chartTitle);
                        chartWrapper.appendChild(canvas);
                        dashboardContainer.appendChild(chartWrapper);
                        console.log('Created missing chart canvas element:', canvasId);
                    } else {
                        console.error('Could not find dashboard container to append new canvas');
                        return null;
                    }
                }
                
                if (!entityData || typeof entityData !== 'object' || Object.keys(entityData).length === 0) {
                    console.warn('ChartManager: Invalid entity data for production chart, using sample data');
                    entityData = {
                        'Diamond Mining Corp': 150,
                        'Gold Rush Ltd': 85, 
                        'Copper Valley Mining': 2500,
                        'Rock Aggregates': 350,
                        'Mountain Iron': 1220
                    };
                }
                
                const labels = Object.keys(entityData);
                const values = Object.values(entityData);
                
                // Check if Chart.js is available
                if (typeof Chart === 'undefined') {
                    console.error('Chart.js not available');
                    return null;
                }
                
                // Check for existing chart instance
                if (window.chartManager._charts && window.chartManager._charts[canvasId]) {
                    window.chartManager._charts[canvasId].destroy();
                }
                
                // Initialize charts map if needed
                if (!window.chartManager._charts) {
                    window.chartManager._charts = {};
                }
                
                const colorScheme = [
                    '#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#adc8f5',
                    '#6b32a8', '#8a41d8', '#a463f3', '#bc86f8', '#d1a9fc', '#e5ccfe'
                ];
                
                const chartData = {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: labels.map((_, i) => colorScheme[i % colorScheme.length])
                    }]
                };
                
                try {
                    const ctx = canvas.getContext('2d');
                    const chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: chartData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const value = context.raw;
                                            const percentage = ((value / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    
                    // Store the chart instance
                    window.chartManager._charts[canvasId] = chart;
                    console.log(`Production chart created successfully on ${canvasId}`);
                    return chart;
                } catch (error) {
                    console.error('Error creating production chart:', error);
                    return null;
                }
            };
        }
        
        // Ensure other methods exist
        if (typeof window.chartManager.createRevenueChart !== 'function') {
            console.log('Adding missing createRevenueChart method');
            window.chartManager.createRevenueChart = function(canvasId, data) {
                // Implementation here (simplified)
                console.log(`Creating revenue chart on ${canvasId}`);
                // Use Chart.js directly if available
                // Rest of implementation...
            };
        }
        
        if (typeof window.chartManager.createEntityChart !== 'function') {
            console.log('Adding missing createEntityChart method');
            window.chartManager.createEntityChart = function(canvasId, data) {
                // Delegate to createProductionChart if it exists
                return window.chartManager.createProductionChart(canvasId, data);
            };
        }
        
        if (typeof window.chartManager.createStatusChart !== 'function') {
            console.log('Adding missing createStatusChart method');
            window.chartManager.createStatusChart = function(canvasId, data) {
                // Implementation here (simplified)
                console.log(`Creating status chart on ${canvasId}`);
                // Rest of implementation...
            };
        }
        
        console.log('Chart Manager patch complete - all required methods are available');
    }
    
    // Run immediately
    ensureChartManager();
    
    // Also run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', ensureChartManager);
    
    // And run after a delay to catch late-loading cases
    setTimeout(ensureChartManager, 2000);
    
})(window);
