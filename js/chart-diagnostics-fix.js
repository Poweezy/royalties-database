/**
 * Chart Diagnostics & Auto-Recovery Tool
 * 
 * This script monitors chart elements and automatically attempts to recover
 * charts that fail to render properly after navigation or DOM updates.
 * 
 * Version: 1.0.0 (2025-07-01)
 */

(function() {
    // Script loading guard to prevent duplicate initialization
    if (window.CHART_DIAGNOSTICS_LOADED) {
        console.log('Chart Diagnostics Tool: Already loaded, skipping');
        return;
    }
    
    window.CHART_DIAGNOSTICS_LOADED = true;
    console.log('Chart Diagnostics Tool: Initializing...');
    
    // Configuration
    const config = {
        debug: true,
        monitorInterval: 2000,
        recoveryDelay: 500,
        maxRecoveryAttempts: 3,
        canvasSelector: 'canvas[id]',
        chartContainerSelector: '.chart-container'
    };
    
    // State tracking
    const state = {
        recoveryAttempts: {},
        chartRegistry: new Map(),
        observers: []
    };
    
    /**
     * Log messages with prefix for easier debugging
     */
    function log(message) {
        if (config.debug) {
            console.log(`[ChartDiagnostics] ${message}`);
        }
    }
    
    /**
     * Monitor for chart elements and check their status
     */
    function startChartMonitoring() {
        log('Starting chart monitoring');
        
        // Initial check for charts
        checkAndRecoverCharts();
        
        // Create observers to watch for DOM changes
        setupChartObservers();
        
        // Setup periodic checks
        setInterval(checkAndRecoverCharts, config.monitorInterval);
        
        // Listen to component loading events
        document.addEventListener('componentLoaded', function(event) {
            if (event.detail && event.detail.componentId) {
                log(`Component loaded: ${event.detail.componentId}, checking for charts`);
                
                // Give a short delay to allow DOM to update
                setTimeout(() => {
                    checkAndRecoverCharts();
                }, config.recoveryDelay);
            }
        });
        
        // Listen for navigation events
        document.addEventListener('sectionChanged', function(event) {
            if (event.detail && event.detail.sectionId) {
                log(`Section changed to: ${event.detail.sectionId}, will check charts`);
                
                // Reset recovery attempts for the new section
                state.recoveryAttempts = {};
                
                // Give a short delay to allow DOM to update
                setTimeout(() => {
                    checkAndRecoverCharts();
                }, config.recoveryDelay * 2);
            }
        });
    }
    
    /**
     * Setup observers to watch for chart containers and canvas elements
     */
    function setupChartObservers() {
        // Disconnect existing observers
        state.observers.forEach(observer => observer.disconnect());
        state.observers = [];
        
        // Create a mutation observer to watch for changes
        const observer = new MutationObserver(function(mutations) {
            let chartElementsChanged = false;
            
            for (const mutation of mutations) {
                // Check if any added nodes contain chart elements
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const hasCanvas = node.querySelector(config.canvasSelector);
                            const isChartContainer = node.matches(config.chartContainerSelector) || 
                                                    node.querySelector(config.chartContainerSelector);
                            
                            if (hasCanvas || isChartContainer) {
                                chartElementsChanged = true;
                                break;
                            }
                        }
                    }
                }
                
                // No need to continue checking if we already found chart elements
                if (chartElementsChanged) break;
            }
            
            // If chart elements were changed, check and recover charts
            if (chartElementsChanged) {
                log('Chart-related DOM changes detected, checking charts');
                
                // Small delay to allow DOM to stabilize
                setTimeout(() => {
                    checkAndRecoverCharts();
                }, config.recoveryDelay);
            }
        });
        
        // Start observing the document body for chart-related changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Save the observer reference
        state.observers.push(observer);
        
        log('Chart observers setup complete');
    }
    
    /**
     * Check for and recover problematic charts
     */
    function checkAndRecoverCharts() {
        const canvasElements = document.querySelectorAll(config.canvasSelector);
        
        if (canvasElements.length === 0) {
            log('No canvas elements found to monitor');
            return;
        }
        
        log(`Checking ${canvasElements.length} canvas elements for chart issues`);
        
        canvasElements.forEach(canvas => {
            const canvasId = canvas.id;
            if (!canvasId) return;
            
            // Check if this canvas already has a chart instance
            const hasChartInstance = checkChartInstance(canvasId);
            
            // If no chart instance is found but this is a chart canvas, try to recover
            if (!hasChartInstance && isLikelyChartCanvas(canvas)) {
                const recoveryAttempts = state.recoveryAttempts[canvasId] || 0;
                
                if (recoveryAttempts < config.maxRecoveryAttempts) {
                    log(`Canvas ${canvasId} appears to be a chart without an instance, attempting recovery (attempt ${recoveryAttempts + 1})`);
                    state.recoveryAttempts[canvasId] = recoveryAttempts + 1;
                    
                    // Try to recover the chart
                    recoverChart(canvasId, canvas);
                } else if (recoveryAttempts === config.maxRecoveryAttempts) {
                    log(`Max recovery attempts reached for ${canvasId}, applying fallback`);
                    state.recoveryAttempts[canvasId]++;
                    
                    // Apply fallback content
                    applyChartFallback(canvasId, canvas);
                }
            }
        });
    }
    
    /**
     * Check if a canvas has an associated chart instance
     */
    function checkChartInstance(canvasId) {
        // First check if chartManager is being used
        if (window.chartManager && window.chartManager.charts) {
            if (window.chartManager.charts instanceof Map) {
                if (window.chartManager.charts.has(canvasId)) {
                    return true;
                }
            } else if (window.chartManager.charts[canvasId]) {
                return true;
            }
        }
        
        // Then check if Chart.js stores directly on canvas
        const canvas = document.getElementById(canvasId);
        if (canvas && canvas.chart) {
            return true;
        }
        
        // Finally check our own registry
        return state.chartRegistry.has(canvasId);
    }
    
    /**
     * Determine if a canvas is likely meant to be a chart
     */
    function isLikelyChartCanvas(canvas) {
        // Check if canvas is inside a chart container
        if (canvas.closest('.chart-container, .chart-card, .chart-wrapper')) {
            return true;
        }
        
        // Check if canvas has chart-related classes or ID
        if (canvas.id.includes('chart') || 
            canvas.id.includes('Chart') ||
            canvas.classList.contains('chart')) {
            return true;
        }
        
        // Check if canvas has Chart.js data attributes
        for (const attr of canvas.attributes) {
            if (attr.name.startsWith('data-chart')) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Attempt to recover a chart
     */
    function recoverChart(canvasId, canvas) {
        // Check which chart initialization approach to use
        
        // First try section-specific initialization
        const sectionId = findSectionId(canvas);
        if (sectionId) {
            log(`Canvas ${canvasId} belongs to section ${sectionId}`);
            
            // Try specialized chart initializers
            if (sectionId === 'dashboard' && typeof window.initializeDashboardCharts === 'function') {
                window.initializeDashboardCharts();
                return;
            } else if (sectionId === 'audit-dashboard' && typeof window.initializeAuditCharts === 'function') {
                window.initializeAuditCharts();
                return;
            } else if (sectionId === 'reporting-analytics' && typeof window.initializeReportingCharts === 'function') {
                window.initializeReportingCharts();
                return;
            }
            
            // Try app's chart initializers if section-specific ones aren't available
            if (window.app) {
                if (sectionId === 'dashboard' && typeof window.app.initializeDashboardCharts === 'function') {
                    window.app.initializeDashboardCharts();
                    return;
                } else if (sectionId === 'audit-dashboard' && typeof window.app.initializeAuditCharts === 'function') {
                    window.app.initializeAuditCharts();
                    return;
                } else if (sectionId === 'reporting-analytics' && typeof window.app.initializeReportingCharts === 'function') {
                    window.app.initializeReportingCharts();
                    return;
                }
            }
            
            // Try chart initializer manager
            if (window.chartInitializer) {
                if (sectionId === 'dashboard' && typeof window.chartInitializer.initializeDashboardCharts === 'function') {
                    window.chartInitializer.initializeDashboardCharts();
                    return;
                } else if (sectionId === 'audit-dashboard' && typeof window.chartInitializer.initializeAuditCharts === 'function') {
                    window.chartInitializer.initializeAuditCharts();
                    return;
                } else if (sectionId === 'reporting-analytics' && typeof window.chartInitializer.initializeReportingCharts === 'function') {
                    window.chartInitializer.initializeReportingCharts();
                    return;
                }
            }
        }
        
        // If specific initializers didn't work, try a generic chart
        createGenericChart(canvasId, canvas);
    }
    
    /**
     * Find the section ID that contains a canvas
     */
    function findSectionId(canvas) {
        let currentElement = canvas;
        
        // Traverse up the DOM to find the containing section
        while (currentElement && currentElement !== document.body) {
            if (currentElement.tagName.toLowerCase() === 'section' && currentElement.id) {
                return currentElement.id;
            }
            currentElement = currentElement.parentElement;
        }
        
        return null;
    }
    
    /**
     * Create a generic chart for a canvas
     */
    function createGenericChart(canvasId, canvas) {
        if (!window.Chart) {
            log('Chart.js not available, cannot create generic chart');
            applyChartFallback(canvasId, canvas);
            return;
        }
        
        try {
            // Clear any existing chart
            state.chartRegistry.delete(canvasId);
            
            // Determine chart type from canvas id
            let chartType = 'line';
            if (canvasId.includes('pie') || canvasId.includes('Pie')) {
                chartType = 'pie';
            } else if (canvasId.includes('bar') || canvasId.includes('Bar')) {
                chartType = 'bar';
            } else if (canvasId.includes('doughnut') || canvasId.includes('Doughnut')) {
                chartType = 'doughnut';
            }
            
            // Create appropriate chart configuration
            let config;
            switch (chartType) {
                case 'pie':
                case 'doughnut':
                    config = {
                        type: chartType,
                        data: {
                            labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
                            datasets: [{
                                data: [12, 19, 8, 5],
                                backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2', '#7db3e6']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }
                    };
                    break;
                
                case 'bar':
                    config = {
                        type: chartType,
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Dataset 1',
                                data: [12, 19, 3, 5, 2, 3],
                                backgroundColor: '#1a365d'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    };
                    break;
                
                default: // Line chart
                    config = {
                        type: 'line',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Dataset 1',
                                data: [12, 19, 3, 5, 2, 3],
                                borderColor: '#1a365d',
                                backgroundColor: 'rgba(26, 54, 93, 0.1)',
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    };
            }
            
            // Create the chart
            const chart = new Chart(canvas, config);
            
            // Store the chart in our registry
            state.chartRegistry.set(canvasId, chart);
            
            log(`Generic ${chartType} chart created for ${canvasId}`);
        } catch (error) {
            console.error(`Failed to create generic chart for ${canvasId}:`, error);
            applyChartFallback(canvasId, canvas);
        }
    }
    
    /**
     * Apply a fallback for charts that cannot be recovered
     */
    function applyChartFallback(canvasId, canvas) {
        // If SimpleChartManager is available, use its fallback
        if (window.app && window.app.chartManager && typeof window.app.chartManager.showFallbackChart === 'function') {
            window.app.chartManager.showFallbackChart(canvasId);
            return;
        }
        
        // Otherwise create our own fallback
        const container = canvas.parentNode;
        if (container) {
            container.innerHTML = `
                <div class="chart-fallback" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: #64748b;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 2px dashed #cbd5e0;
                ">
                    <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Chart visualization will be available soon</p>
                    <button class="btn btn-sm btn-secondary retry-chart-btn" data-chart="${canvasId}">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = container.querySelector('.retry-chart-btn');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    // Reset recovery attempts for this chart
                    state.recoveryAttempts[canvasId] = 0;
                    
                    // Replace fallback with canvas
                    container.innerHTML = `<canvas id="${canvasId}"></canvas>`;
                    
                    // Try to recover in the next cycle
                    setTimeout(() => {
                        checkAndRecoverCharts();
                    }, 100);
                });
            }
        }
    }
    
    // Wait for page load
    function init() {
        log('Initializing Chart Diagnostics Tool');
        
        // Wait a short delay to allow other scripts to initialize
        setTimeout(() => {
            startChartMonitoring();
        }, 1000);
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
