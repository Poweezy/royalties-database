/**
 * Dashboard Canvas Creator
 * @version 1.0.0
 * @date 2025-07-06
 * @description Ensures all required chart canvases exist before chart initialization
 */

(function() {
    'use strict';
    
    console.log('Dashboard Canvas Creator: Initializing...');
    
    // Define required chart canvases
    const REQUIRED_CANVASES = [
        {
            id: 'revenue-trends-chart',
            fallbackIds: [],
            containerSelector: '.chart-container, .dashboard-chart-container, #dashboard'
        },
        {
            id: 'revenue-by-entity-chart',
            fallbackIds: ['production-by-entity-chart'],
            containerSelector: '.chart-container, .dashboard-chart-container, #dashboard'
        },
        {
            id: 'payment-timeline-chart',
            fallbackIds: [],
            containerSelector: '.chart-container, .dashboard-chart-container, #dashboard'
        },
        {
            id: 'forecast-chart',
            fallbackIds: [],
            containerSelector: '.chart-container, .dashboard-chart-container, #dashboard'
        },
        {
            id: 'mineral-performance-chart',
            fallbackIds: [],
            containerSelector: '.chart-container, .dashboard-chart-container, #dashboard'
        }
    ];
    
    // Create all required canvases
    function createAllRequiredCanvases() {
        console.log('Dashboard Canvas Creator: Creating required canvas elements...');
        
        let createdCanvases = 0;
        let foundCanvases = 0;
        
        REQUIRED_CANVASES.forEach(function(canvasInfo) {
            // Check if canvas already exists
            if (document.getElementById(canvasInfo.id)) {
                console.log(`Dashboard Canvas Creator: Canvas '${canvasInfo.id}' already exists`);
                foundCanvases++;
                return;
            }
            
            // Check fallback IDs
            let canvasExists = false;
            for (let i = 0; i < canvasInfo.fallbackIds.length; i++) {
                if (document.getElementById(canvasInfo.fallbackIds[i])) {
                    console.log(`Dashboard Canvas Creator: Fallback canvas '${canvasInfo.fallbackIds[i]}' exists for '${canvasInfo.id}'`);
                    foundCanvases++;
                    canvasExists = true;
                    break;
                }
            }
            
            if (canvasExists) {
                return;
            }
            
            // Create canvas if not found
            console.log(`Dashboard Canvas Creator: Creating canvas '${canvasInfo.id}'...`);
            
            // Find suitable container
            const containerSelector = canvasInfo.containerSelector;
            const container = document.querySelector(containerSelector);
            
            if (!container) {
                console.error(`Dashboard Canvas Creator: No suitable container found for '${canvasInfo.id}' using selector '${containerSelector}'`);
                return;
            }
            
            // Create chart container div if needed
            let chartContainer;
            if (container.id === 'dashboard') {
                // Create a chart container inside the dashboard
                chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                chartContainer.innerHTML = `<h3 class="chart-header">${canvasInfo.id.replace(/-/g, ' ').replace(/chart$/, '')}</h3>`;
                container.appendChild(chartContainer);
            } else {
                chartContainer = container;
            }
            
            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.id = canvasInfo.id;
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.maxHeight = '300px';
            
            // Add canvas to container
            chartContainer.appendChild(canvas);
            createdCanvases++;
            
            console.log(`Dashboard Canvas Creator: Canvas '${canvasInfo.id}' created and added to DOM`);
        });
        
        console.log(`Dashboard Canvas Creator: Found ${foundCanvases} existing canvases, created ${createdCanvases} new canvases`);
        return createdCanvases + foundCanvases;
    }
    
    // Call immediately and also after DOM content loaded
    createAllRequiredCanvases();
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Dashboard Canvas Creator: DOM loaded, creating canvases if needed...');
        createAllRequiredCanvases();
    });
    
    // Set up dashboard section content observer
    function observeDashboard() {
        console.log('Dashboard Canvas Creator: Setting up dashboard observer...');
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // Check if dashboard or a dashboard component was added
                        if (node.id === 'dashboard' || 
                            (node.nodeType === Node.ELEMENT_NODE && node.querySelector && 
                             (node.querySelector('#dashboard') || node.querySelector('.chart-container')))) {
                            console.log('Dashboard Canvas Creator: Dashboard content added, creating canvases...');
                            
                            // Small delay to ensure DOM is updated
                            setTimeout(function() {
                                const canvasCount = createAllRequiredCanvases();
                                
                                // Trigger chart initialization if needed
                                if (canvasCount > 0 && window.initializeAllCharts) {
                                    console.log('Dashboard Canvas Creator: Triggering chart initialization...');
                                    setTimeout(window.initializeAllCharts, 100);
                                }
                            }, 100);
                        }
                    }
                }
            });
        });
        
        // Observe the entire document body for dashboard/chart container additions
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Set up observer after DOM content loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeDashboard);
    } else {
        observeDashboard();
    }
    
    // Create canvases on window load as well
    window.addEventListener('load', function() {
        console.log('Dashboard Canvas Creator: Window loaded, creating canvases...');
        const count = createAllRequiredCanvases();
        
        if (count > 0 && window.initializeAllCharts) {
            console.log('Dashboard Canvas Creator: Triggering chart initialization after window load...');
            setTimeout(window.initializeAllCharts, 200);
        }
    });
    
    // Register as a global utility
    window.createAllDashboardCanvases = createAllRequiredCanvases;
})();
