/**
 * Chart Diagnostics Tool
 * 
 * This tool helps diagnose and fix chart rendering issues in the application.
 * Use this script to analyze and repair chart initialization problems.
 * 
 * Version: 1.0.0 (2025-06-25)
 */

(function() {
    console.log('Chart Diagnostics Tool: Starting analysis...');
    
    // Store diagnostics results
    const diagnostics = {
        chartJsAvailable: false,
        chartManagerAvailable: false,
        chartInitializerAvailable: false,
        canvasElements: [],
        activeCharts: [],
        issues: []
    };
    
    /**
     * Run diagnostics on the charting system
     */
    function runDiagnostics() {
        // Check if Chart.js is available
        diagnostics.chartJsAvailable = typeof Chart !== 'undefined';
        if (!diagnostics.chartJsAvailable) {
            diagnostics.issues.push('Chart.js library is not loaded');
        }
        
        // Check if chartManager is available
        diagnostics.chartManagerAvailable = window.chartManager && typeof window.chartManager === 'object';
        if (diagnostics.chartManagerAvailable) {
            diagnostics.chartManagerImplementation = window.chartManager.charts instanceof Map ? 'Modern (Map-based)' : 'Legacy';
            diagnostics.chartCount = window.chartManager.charts instanceof Map ? window.chartManager.charts.size : 'Unknown';
        } else {
            diagnostics.issues.push('Chart manager is not available');
        }
        
        // Check if chart initializer is available
        diagnostics.chartInitializerAvailable = window.CHART_INITIALIZER_LOADED === true;
        if (!diagnostics.chartInitializerAvailable) {
            diagnostics.issues.push('Chart initializer is not loaded');
        }
        
        // Find all canvas elements that might be charts
        const canvases = document.querySelectorAll('canvas[id]');
        diagnostics.canvasElements = Array.from(canvases).map(canvas => ({
            id: canvas.id,
            width: canvas.width,
            height: canvas.height,
            visible: isElementVisible(canvas),
            hasChart: false,
            section: findParentSection(canvas)
        }));
        
        // Check which canvases have active charts
        if (diagnostics.chartManagerAvailable && window.chartManager.charts instanceof Map) {
            diagnostics.activeCharts = Array.from(window.chartManager.charts.entries()).map(([id, chart]) => ({
                id,
                type: chart.config.type,
                data: chart.data.datasets ? {
                    labels: chart.data.labels,
                    datasets: chart.data.datasets.map(ds => ({
                        label: ds.label,
                        dataPoints: ds.data ? ds.data.length : 0
                    }))
                } : 'No datasets available'
            }));
            
            // Update canvas elements with chart status
            diagnostics.canvasElements.forEach(canvas => {
                canvas.hasChart = window.chartManager.charts.has(canvas.id);
                if (!canvas.hasChart && canvas.visible) {
                    diagnostics.issues.push(`Canvas ${canvas.id} is visible but has no chart attached`);
                }
            });
        }
        
        // Check for additional chart-related issues
        checkForAdditionalIssues();
        
        return diagnostics;
    }
    
    /**
     * Check if an element is visible in the DOM
     */
    function isElementVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               parseFloat(style.opacity) > 0 &&
               rect.width > 0 && 
               rect.height > 0;
    }
    
    /**
     * Find the parent section of an element
     */
    function findParentSection(element) {
        let current = element;
        while (current && current.tagName !== 'SECTION' && current !== document.body) {
            current = current.parentElement;
        }
        
        if (current && current.tagName === 'SECTION') {
            return current.id || 'unnamed-section';
        }
        
        return 'not-in-section';
    }
    
    /**
     * Check for additional chart-related issues
     */
    function checkForAdditionalIssues() {
        // Check if chartManager methods exist
        if (diagnostics.chartManagerAvailable) {
            const requiredMethods = ['create', 'destroy', 'destroyAll'];
            const missingMethods = requiredMethods.filter(method => 
                typeof window.chartManager[method] !== 'function');
                
            if (missingMethods.length > 0) {
                diagnostics.issues.push(`Chart manager is missing methods: ${missingMethods.join(', ')}`);
            }
        }
        
        // Check for script conflicts
        if (window.CHART_MANAGER_LOADED && window.SimpleChartManager) {
            diagnostics.issues.push('Multiple chart manager implementations detected (conflict)');
        }
        
        // Check current section for empty chart containers
        const currentSection = window.app && window.app.currentSection;
        if (currentSection) {
            const section = document.getElementById(currentSection);
            if (section) {
                const chartContainers = section.querySelectorAll('.chart-container, .chart-wrapper');
                chartContainers.forEach(container => {
                    if (container.children.length === 0) {
                        diagnostics.issues.push(`Empty chart container found in section ${currentSection}`);
                    } else if (!container.querySelector('canvas')) {
                        diagnostics.issues.push(`Chart container without canvas found in section ${currentSection}`);
                    }
                });
            }
        }
    }
    
    /**
     * Fix common chart issues
     */
    function fixChartIssues() {
        const fixes = [];
        
        // If Chart.js is missing, try to load it
        if (!diagnostics.chartJsAvailable) {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                document.head.appendChild(script);
                fixes.push('Added Chart.js script to the page');
            } catch (error) {
                console.error('Failed to load Chart.js:', error);
            }
        }
        
        // If chart manager is missing, create a fallback
        if (!diagnostics.chartManagerAvailable && diagnostics.chartJsAvailable) {
            window.chartManager = {
                charts: new Map(),
                create: function(canvasId, config) {
                    const canvas = document.getElementById(canvasId);
                    if (!canvas) return null;
                    
                    if (this.charts.has(canvasId)) this.destroy(canvasId);
                    
                    try {
                        const chart = new Chart(canvas, config);
                        this.charts.set(canvasId, chart);
                        return chart;
                    } catch (e) {
                        console.error(`Error creating chart ${canvasId}:`, e);
                        return null;
                    }
                },
                destroy: function(canvasId) {
                    const chart = this.charts.get(canvasId);
                    if (chart) {
                        chart.destroy();
                        this.charts.delete(canvasId);
                    }
                },
                destroyAll: function() {
                    this.charts.forEach(chart => chart.destroy());
                    this.charts.clear();
                }
            };
            fixes.push('Created fallback chart manager');
        }
        
        // Re-initialize visible canvases that don't have charts
        const currentSection = window.app && window.app.currentSection;
        if (currentSection && diagnostics.chartManagerAvailable) {
            diagnostics.canvasElements.forEach(canvas => {
                if (canvas.visible && !canvas.hasChart && canvas.section === currentSection) {
                    // First check if it's a known chart type we can initialize
                    const canvasId = canvas.id;
                    
                    // Try to create a basic chart based on ID naming conventions
                    if (canvasId.includes('revenue')) {
                        createBasicRevenueChart(canvasId);
                        fixes.push(`Created basic revenue chart for ${canvasId}`);
                    } else if (canvasId.includes('production')) {
                        createBasicProductionChart(canvasId);
                        fixes.push(`Created basic production chart for ${canvasId}`);
                    } else if (canvasId.includes('status')) {
                        createBasicStatusChart(canvasId);
                        fixes.push(`Created basic status chart for ${canvasId}`);
                    } else {
                        createBasicChart(canvasId);
                        fixes.push(`Created basic chart for ${canvasId}`);
                    }
                }
            });
        }
        
        return fixes;
    }
    
    /**
     * Create a basic chart of any type
     */
    function createBasicChart(canvasId) {
        if (!window.chartManager || !window.chartManager.create) return;
        
        window.chartManager.create(canvasId, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sample Data',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: 'rgba(26, 54, 93, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    /**
     * Create a basic revenue chart
     */
    function createBasicRevenueChart(canvasId) {
        if (!window.chartManager || !window.chartManager.create) return;
        
        window.chartManager.create(canvasId, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [45000, 52000, 48000, 61000, 55000, 67000],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'E' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create a basic production chart
     */
    function createBasicProductionChart(canvasId) {
        if (!window.chartManager || !window.chartManager.create) return;
        
        window.chartManager.create(canvasId, {
            type: 'doughnut',
            data: {
                labels: ['Mine A', 'Mine B', 'Mine C'],
                datasets: [{
                    data: [300, 200, 100],
                    backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    /**
     * Create a basic status chart
     */
    function createBasicStatusChart(canvasId) {
        if (!window.chartManager || !window.chartManager.create) return;
        
        window.chartManager.create(canvasId, {
            type: 'pie',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{
                    data: [12, 5, 3],
                    backgroundColor: ['#2E7D32', '#e65100', '#c62828']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    /**
     * Display diagnostics results
     */
    function displayDiagnosticsResults() {
        // Run diagnostics
        const results = runDiagnostics();
        
        console.group('Chart Diagnostics Results');
        console.log('Chart.js available:', results.chartJsAvailable);
        console.log('Chart Manager available:', results.chartManagerAvailable);
        if (results.chartManagerAvailable) {
            console.log('Chart Manager implementation:', results.chartManagerImplementation);
            console.log('Active chart count:', results.chartCount);
        }
        console.log('Chart Initializer available:', results.chartInitializerAvailable);
        
        console.group('Canvas Elements');
        results.canvasElements.forEach(canvas => {
            console.log(`${canvas.id} (${canvas.hasChart ? 'has chart' : 'no chart'}):`, 
                        `Size: ${canvas.width}x${canvas.height}`, 
                        `Visible: ${canvas.visible}`,
                        `Section: ${canvas.section}`);
        });
        console.groupEnd();
        
        if (results.activeCharts.length > 0) {
            console.group('Active Charts');
            results.activeCharts.forEach(chart => {
                console.log(`${chart.id} (${chart.type}):`, chart.data);
            });
            console.groupEnd();
        }
        
        if (results.issues.length > 0) {
            console.group('Issues Found');
            results.issues.forEach(issue => console.warn(issue));
            console.groupEnd();
            
            // Offer to fix issues
            const fixIssues = confirm(`${results.issues.length} chart issues detected. Would you like to fix them automatically?`);
            if (fixIssues) {
                const fixes = fixChartIssues();
                
                console.group('Fixes Applied');
                fixes.forEach(fix => console.log(fix));
                console.groupEnd();
                
                alert(`${fixes.length} fixes applied. Check console for details.`);
            }
        } else {
            console.log('No issues found with charts');
            alert('Chart diagnostics complete. No issues found.');
        }
        
        console.groupEnd();
    }
    
    // Run diagnostics automatically and offer to display them
    try {
        setTimeout(() => {
            const results = runDiagnostics();
            if (results.issues.length > 0) {
                const showDetails = confirm(`Chart Diagnostics Tool detected ${results.issues.length} issues. Show detailed report?`);
                if (showDetails) {
                    displayDiagnosticsResults();
                }
            } else {
                console.log('Chart Diagnostics Tool: No issues detected');
            }
        }, 2000); // Allow time for charts to initialize
    } catch (e) {
        console.error('Error running chart diagnostics:', e);
    }
    
    // Make the diagnostics tool available globally
    window.chartDiagnostics = {
        run: runDiagnostics,
        display: displayDiagnosticsResults,
        fix: fixChartIssues
    };
    
    console.log('Chart Diagnostics Tool: Initialized. Use window.chartDiagnostics to access diagnostic functions.');
})();
