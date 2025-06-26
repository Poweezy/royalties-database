/**
 * Emergency Chart Loader
 * Forces charts to render when dashboard loads
 * @version 1.0.0
 * @date 2025-07-01
 */

(function() {
    'use strict';

    console.log('=== EMERGENCY CHART LOADER INITIALIZING ===');
    
    // Create canvases directly if they're missing
    function createCanvasElements() {
        const dashboardSection = document.querySelector('#dashboard');
        if (!dashboardSection) {
            console.log('Dashboard section not found, will retry...');
            setTimeout(createCanvasElements, 1000);
            return;
        }
        
        // Canvas elements that should exist
        const canvasIds = [
            'revenue-trends-chart',
            'revenue-by-entity-chart', 
            'production-by-entity-chart',
            'payment-timeline-chart',
            'forecast-chart',
            'mineral-performance-chart'
        ];
        
        // Create container sections if needed
        const chartContainer = dashboardSection.querySelector('.chart-container') || 
                             dashboardSection.querySelector('.dashboard-charts');
        
        if (!chartContainer) {
            console.log('No chart container found, creating one...');
            const newContainer = document.createElement('div');
            newContainer.className = 'chart-container dashboard-row';
            dashboardSection.appendChild(newContainer);
            
            // Create 3 card sections for charts
            for (let i = 0; i < 3; i++) {
                const chartCard = document.createElement('div');
                chartCard.className = 'chart-card';
                newContainer.appendChild(chartCard);
            }
        }
        
        // Find all chart containers
        const chartCards = dashboardSection.querySelectorAll('.chart-card, .chart-container > div');
        
        // Create missing canvas elements
        let cardIndex = 0;
        canvasIds.forEach(canvasId => {
            if (!document.getElementById(canvasId)) {
                console.log(`Creating missing canvas: ${canvasId}`);
                
                // Find a container for this canvas
                const container = chartCards[cardIndex % chartCards.length];
                cardIndex++;
                
                // Create the canvas
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                canvas.width = 300;
                canvas.height = 200;
                
                // Add a title
                const title = document.createElement('h4');
                title.textContent = canvasId.replace(/-/g, ' ').replace('chart', '').trim();
                title.style.textAlign = 'center';
                
                // Add to container
                container.appendChild(title);
                container.appendChild(canvas);
            }
        });
    }
    
    // Force chart rendering after a small delay
    function forceRenderCharts() {
        if (typeof window.chartManager === 'undefined') {
            console.error('ChartManager not available, cannot render charts!');
            return;
        }
        
        // Sample data for charts
        const sampleData = {
            'Diamond Mining Corp': 150,
            'Gold Rush Ltd': 85, 
            'Copper Valley Mining': 2500,
            'Rock Aggregates': 350,
            'Mountain Iron': 1220
        };
        
        // Revenue trends chart
        if (document.getElementById('revenue-trends-chart')) {
            console.log('Rendering revenue-trends-chart...');
            window.chartManager.createRevenueChart('revenue-trends-chart');
        }
        
        // Entity/Production charts (try both IDs)
        if (document.getElementById('revenue-by-entity-chart')) {
            console.log('Rendering revenue-by-entity-chart...');
            try {
                if (window.chartManager.createProductionChart) {
                    window.chartManager.createProductionChart('revenue-by-entity-chart', sampleData);
                } else if (window.chartManager.createEntityChart) {
                    window.chartManager.createEntityChart('revenue-by-entity-chart', sampleData);
                }
            } catch (err) {
                console.error('Error rendering revenue-by-entity-chart:', err);
            }
        }
        
        if (document.getElementById('production-by-entity-chart')) {
            console.log('Rendering production-by-entity-chart...');
            try {
                if (window.chartManager.createProductionChart) {
                    window.chartManager.createProductionChart('production-by-entity-chart', sampleData);
                } else if (window.chartManager.createEntityChart) {
                    window.chartManager.createEntityChart('production-by-entity-chart', sampleData);
                }
            } catch (err) {
                console.error('Error rendering production-by-entity-chart:', err);
            }
        }
    }
    
    // Initialize after DOM is loaded
    function init() {
        createCanvasElements();
        setTimeout(forceRenderCharts, 1500);
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 1000);
        });
    } else {
        // DOM already loaded, run after a delay
        setTimeout(init, 1000);
    }
    
    // Also listen for dashboard section display changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'dashboard' && 
                mutation.attributeName === 'style' &&
                mutation.target.style.display !== 'none') {
                console.log('Dashboard section displayed, initializing charts...');
                setTimeout(init, 500);
            }
        });
    });
    
    // Start observing dashboard section
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        observer.observe(dashboard, { attributes: true });
    }
    
    console.log('=== EMERGENCY CHART LOADER INITIALIZED ===');
})();
