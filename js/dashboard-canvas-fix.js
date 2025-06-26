/**
 * Dashboard Canvas Fix Script
 * This script ensures all necessary canvas elements exist in the dashboard
 * Version 1.0.0 - 2025-06-30
 */

(function() {
    'use strict';
    
    console.log('=== DASHBOARD CANVAS FIX SCRIPT STARTING ===');
    
    // Wait for DOM content to be loaded
    function fixDashboardCanvases() {
        console.log('Checking and fixing dashboard canvas elements...');
        
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection) {
            console.warn('Dashboard section not found, retrying in 500ms...');
            setTimeout(fixDashboardCanvases, 500);
            return;
        }
        
        // List of expected canvas elements with their container selectors
        const expectedCanvases = [
            { id: 'revenue-trends-chart', container: '.chart-container', title: 'Revenue Trends' },
            { id: 'revenue-by-entity-chart', container: '.chart-container', title: 'Revenue by Entity' },
            { id: 'payment-timeline-chart', container: '.chart-container', title: 'Payment Timeline' },
            { id: 'forecast-chart', container: '.forecast-chart-container', title: 'Forecast' },
            { id: 'mineral-performance-chart', container: '.chart-container', title: 'Mineral Performance' }
        ];
        
        // Check each expected canvas
        expectedCanvases.forEach(canvasInfo => {
            const canvas = document.getElementById(canvasInfo.id);
            if (!canvas) {
                console.log(`Canvas element '${canvasInfo.id}' not found, creating it...`);
                
                // Try to find a suitable container
                let container = dashboardSection.querySelector(canvasInfo.container);
                
                // If no specific container found, find any chart container
                if (!container) {
                    container = dashboardSection.querySelector('.chart-container');
                }
                
                // If still no container found, create one in the dashboard
                if (!container) {
                    console.log(`No container found for '${canvasInfo.id}', creating container...`);
                    container = document.createElement('div');
                    container.className = 'chart-container';
                    
                    // Create a new card for this chart
                    const card = document.createElement('div');
                    card.className = 'card analytics-chart';
                    
                    // Add chart header
                    const header = document.createElement('div');
                    header.className = 'chart-header';
                    header.innerHTML = `<h5><i class="fas fa-chart-line"></i> ${canvasInfo.title}</h5>`;
                    
                    card.appendChild(header);
                    card.appendChild(container);
                    
                    // Find a good spot to insert this card
                    const insertTarget = dashboardSection.querySelector('.dashboard-section');
                    if (insertTarget) {
                        insertTarget.appendChild(card);
                    } else {
                        dashboardSection.appendChild(card);
                    }
                }
                
                // Create the canvas element
                const newCanvas = document.createElement('canvas');
                newCanvas.id = canvasInfo.id;
                container.appendChild(newCanvas);
                
                console.log(`Created canvas '${canvasInfo.id}'`);
            } else {
                console.log(`Canvas element '${canvasInfo.id}' already exists`);
            }
        });
        
        // Once canvases are created, trigger chart initialization
        console.log('Triggering chart initialization...');
        if (typeof window.initializeDashboardCharts === 'function') {
            setTimeout(window.initializeDashboardCharts, 200);
        } else if (window.royaltiesApp && typeof window.royaltiesApp.initializeDashboardCharts === 'function') {
            setTimeout(() => window.royaltiesApp.initializeDashboardCharts(), 200);
        } else if (window.chartManager) {
            console.log('Using chart-fix.js functionality for initialization');
        }
        
        console.log('=== DASHBOARD CANVAS FIX COMPLETE ===');
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fixDashboardCanvases, 500);
        });
    } else {
        // DOM already loaded, run immediately
        setTimeout(fixDashboardCanvases, 500);
    }
})();
