/**
 * Dashboard Chart Canvas Creator
 * Ensures canvas elements needed for charts exist before charts are initialized
 */

(function() {
    'use strict';
    
    console.log('=== CANVAS CREATOR STARTING ===');
    
    // Canvas definitions with their labels and container classes
    const canvasDefinitions = [
        { 
            id: 'revenue-trends-chart',
            title: 'Revenue Trends',
            containerClass: 'chart-container revenue-chart'
        },
        { 
            id: 'revenue-by-entity-chart', 
            title: 'Revenue by Entity',
            containerClass: 'chart-container entity-chart'
        },
        { 
            id: 'production-by-entity-chart', 
            title: 'Production by Entity',
            containerClass: 'chart-container entity-chart'
        },
        { 
            id: 'payment-timeline-chart', 
            title: 'Payment Timeline',
            containerClass: 'chart-container payment-chart'
        },
        { 
            id: 'mineral-performance-chart', 
            title: 'Mineral Performance',
            containerClass: 'chart-container mineral-chart'
        },
        { 
            id: 'forecast-chart', 
            title: 'Revenue Forecast',
            containerClass: 'chart-container forecast-chart'
        }
    ];
    
    // Create and insert canvas elements if they don't exist
    function createCanvasElements() {
        console.log('Checking canvas elements...');
        
        // Find the dashboard section
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection) {
            console.warn('Dashboard section not found, cannot create canvases');
            return;
        }
        
        // Find the chart container in the dashboard
        let chartsContainer = dashboardSection.querySelector('.chart-grid') || 
                             dashboardSection.querySelector('.charts-grid') || 
                             dashboardSection.querySelector('.dashboard-charts');
        
        // If no chart container exists, create one
        if (!chartsContainer) {
            console.log('Creating charts grid container');
            chartsContainer = document.createElement('div');
            chartsContainer.className = 'charts-grid';
            chartsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;';
            
            // Find a good place to insert it in the dashboard
            const insertPoint = dashboardSection.querySelector('.dashboard-section') || 
                               dashboardSection.querySelector('.page-content') || 
                               dashboardSection.querySelector('.section-content');
            
            if (insertPoint) {
                insertPoint.appendChild(chartsContainer);
            } else {
                dashboardSection.appendChild(chartsContainer);
            }
        }
        
        // Create each canvas if needed
        canvasDefinitions.forEach(def => {
            // Check if canvas already exists
            let canvas = document.getElementById(def.id);
            
            if (!canvas) {
                console.log(`Creating missing canvas: ${def.id}`);
                
                // Create chart card container
                const chartCard = document.createElement('div');
                chartCard.className = `chart-card card ${def.containerClass}`;
                chartCard.style.cssText = 'margin-bottom: 20px; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
                
                // Create card header
                const cardHeader = document.createElement('div');
                cardHeader.className = 'card-header';
                cardHeader.style.borderBottom = '1px solid #eee';
                cardHeader.style.marginBottom = '10px';
                cardHeader.style.paddingBottom = '10px';
                
                // Create title
                const title = document.createElement('h3');
                title.textContent = def.title;
                title.style.margin = '0';
                title.style.fontSize = '16px';
                title.style.fontWeight = 'bold';
                
                // Create card body
                const cardBody = document.createElement('div');
                cardBody.className = 'card-body chart-wrapper';
                cardBody.style.cssText = 'position: relative; height: 300px;';
                
                // Create canvas
                canvas = document.createElement('canvas');
                canvas.id = def.id;
                
                // Assemble the elements
                cardHeader.appendChild(title);
                cardBody.appendChild(canvas);
                chartCard.appendChild(cardHeader);
                chartCard.appendChild(cardBody);
                
                // Add to the charts container
                chartsContainer.appendChild(chartCard);
                
                console.log(`Canvas ${def.id} created successfully`);
            } else {
                console.log(`Canvas ${def.id} already exists`);
            }
        });
        
        console.log('Canvas creation completed');
    }
    
    // Watch for dashboard content changes and create canvases when needed
    function observeDashboard() {
        const dashboardSection = document.getElementById('dashboard');
        
        if (!dashboardSection) {
            console.warn('Dashboard section not found, will try again later');
            setTimeout(observeDashboard, 500);
            return;
        }
        
        // Create a mutation observer to watch for content changes
        const observer = new MutationObserver((mutations) => {
            let needsCanvasCheck = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsCanvasCheck = true;
                }
            });
            
            if (needsCanvasCheck) {
                console.log('Dashboard content changed, checking canvases');
                createCanvasElements();
            }
        });
        
        // Start observing
        observer.observe(dashboardSection, { 
            childList: true,
            subtree: true
        });
        
        // Also create canvases right away if the dashboard is already loaded
        createCanvasElements();
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeDashboard);
    } else {
        observeDashboard();
    }
    
    // Expose create function globally for external use
    window.createDashboardCanvases = createCanvasElements;
    
    console.log('=== CANVAS CREATOR LOADED ===');
})();
