/**
 * Dashboard Chart Canvas Creator
 * This script ensures all necessary chart canvases exist
 * @version 1.0.0
 * @date 2025-07-04
 */

(function() {
    'use strict';
    
    console.log('=== DASHBOARD CHART CANVAS CREATOR RUNNING ===');
    
    // Required chart canvases for the dashboard
    const requiredChartCanvases = [
        { id: 'revenue-trends-chart', title: 'Revenue Trends' },
        { id: 'production-by-entity-chart', title: 'Production by Entity', aliases: ['revenue-by-entity-chart'] },
        { id: 'status-distribution-chart', title: 'Payment Status Distribution' },
        { id: 'payment-timeline-chart', title: 'Payment Timeline' }
    ];
    
    // Listen for the dashboard content to be loaded
    function waitForDashboard() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            console.warn('Dashboard element not found, will retry');
            setTimeout(waitForDashboard, 500);
            return;
        }
        
        // Check if the dashboard content has been loaded
        if (dashboard.querySelector('.dashboard-container')) {
            console.log('Dashboard content detected, checking for chart containers');
            ensureChartCanvases();
        } else {
            // Wait for dashboard content to be loaded
            const observer = new MutationObserver(function(mutations) {
                if (dashboard.querySelector('.dashboard-container')) {
                    console.log('Dashboard content loaded, adding chart containers');
                    observer.disconnect();
                    ensureChartCanvases();
                }
            });
            
            observer.observe(dashboard, { childList: true, subtree: true });
            
            // Fallback in case mutation observer fails
            setTimeout(function() {
                observer.disconnect();
                ensureChartCanvases();
            }, 5000);
        }
    }
    
    // Ensure all required chart canvases exist
    function ensureChartCanvases() {
        console.log('Checking for required chart canvases');
        
        // Find potential container for charts
        const dashboardContainer = document.querySelector('.dashboard-charts') || 
                                   document.querySelector('.chart-container') ||
                                   document.querySelector('.dashboard-metrics');
        
        if (!dashboardContainer) {
            console.error('No suitable dashboard chart container found, creating one');
            createDashboardChartsContainer();
            return;
        }
        
        // Create each required canvas if it doesn't exist
        requiredChartCanvases.forEach(chartInfo => {
            let canvas = document.getElementById(chartInfo.id);
            
            // Check aliases if primary ID not found
            if (!canvas && chartInfo.aliases && chartInfo.aliases.length > 0) {
                for (let alias of chartInfo.aliases) {
                    const aliasCanvas = document.getElementById(alias);
                    if (aliasCanvas) {
                        console.log(`Found canvas with alias ${alias} instead of ${chartInfo.id}`);
                        // Create the canonical ID as well
                        createChartCanvas(chartInfo.id, chartInfo.title, dashboardContainer);
                        break;
                    }
                }
            }
            
            // Create the canvas if it still doesn't exist
            if (!canvas) {
                createChartCanvas(chartInfo.id, chartInfo.title, dashboardContainer);
            }
        });
    }
    
    // Create a new dashboard charts container
    function createDashboardChartsContainer() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            console.error('Dashboard element not found, cannot create charts container');
            return;
        }
        
        // Create dashboard content if it doesn't exist
        let dashboardContainer = dashboard.querySelector('.dashboard-container');
        if (!dashboardContainer) {
            dashboardContainer = document.createElement('div');
            dashboardContainer.className = 'dashboard-container';
            dashboard.appendChild(dashboardContainer);
        }
        
        // Create dashboard row
        const dashboardRow = document.createElement('div');
        dashboardRow.className = 'dashboard-row';
        dashboardContainer.appendChild(dashboardRow);
        
        // Create dashboard charts container
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'dashboard-charts';
        dashboardRow.appendChild(chartsContainer);
        
        console.log('Created new dashboard charts container');
        
        // Now create all required canvases
        requiredChartCanvases.forEach(chartInfo => {
            createChartCanvas(chartInfo.id, chartInfo.title, chartsContainer);
        });
    }
    
    // Create a chart canvas with given ID
    function createChartCanvas(id, title, container) {
        console.log(`Creating chart canvas: ${id}`);
        
        // Create chart wrapper
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-wrapper';
        chartWrapper.style.cssText = 'position: relative; height: 300px; width: 100%; margin-bottom: 20px;';
        
        // Add title
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = title;
        chartTitle.className = 'chart-title';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.style.cssText = 'width: 100%; height: 250px;';
        
        // Add to DOM
        chartWrapper.appendChild(chartTitle);
        chartWrapper.appendChild(canvas);
        container.appendChild(chartWrapper);
        
        console.log(`Created canvas with ID: ${id}`);
    }
    
    // Start the process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDashboard);
    } else {
        waitForDashboard();
    }
    
    // Also run after a delay to catch late-loading cases
    setTimeout(waitForDashboard, 1000);
    setTimeout(waitForDashboard, 3000);
    
})();
