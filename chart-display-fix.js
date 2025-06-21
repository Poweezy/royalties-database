/**
 * Chart Display Fix Script
 * 
 * This script ensures charts are properly displayed and initialized
 * after navigation between sections, especially when coming from the audit dashboard.
 * 
 * Version: 1.0.0 (2025-06-25)
 */

(function() {
    // Script loading guard to prevent duplicate initialization
    if (window.CHART_DISPLAY_FIX_LOADED) {
        console.log('Chart Display Fix: Already loaded, skipping initialization');
        return;
    }
    
    window.CHART_DISPLAY_FIX_LOADED = true;
    console.log('Chart Display Fix: Initializing...');
    
    // Ensure global chart manager is available
    function ensureChartManager() {
        if (window.chartManager) {
            console.log('Chart manager found:', typeof window.chartManager);
            return true;
        }
        
        // If chart manager doesn't exist but Chart.js is available, create a fallback
        if (typeof Chart !== 'undefined') {
            console.warn('Creating fallback chart manager');
            
            window.chartManager = {
                charts: new Map(),
                create: function(canvasId, config) {
                    console.log(`Creating fallback chart: ${canvasId}`);
                    const canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        console.error(`Canvas not found: ${canvasId}`);
                        return null;
                    }
                    
                    if (this.charts.has(canvasId)) {
                        this.destroy(canvasId);
                    }
                    
                    const chart = new Chart(canvas, config);
                    this.charts.set(canvasId, chart);
                    return chart;
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
            
            return true;
        }
        
        console.error('Chart.js is not available - charts cannot be initialized');
        return false;
    }
    
    // Initialize charts on a section
    function initializeSectionCharts(sectionId) {
        if (!ensureChartManager()) return;
        
        console.log(`Initializing charts for section: ${sectionId}`);
        
        // Use section-specific chart initialization functions if available
        switch(sectionId) {
            case 'dashboard':
                if (window.chartInitializer && typeof window.chartInitializer.initializeDashboardCharts === 'function') {
                    window.chartInitializer.initializeDashboardCharts();
                } else if (typeof initializeDashboardCharts === 'function') {
                    initializeDashboardCharts();
                } else if (window.app && typeof window.app.initializeDashboardCharts === 'function') {
                    window.app.initializeDashboardCharts();
                } else {
                    reinitializeDefaultCharts(sectionId);
                }
                break;
                
            case 'audit-dashboard':
                if (window.app && typeof window.app.initializeAuditCharts === 'function') {
                    window.app.initializeAuditCharts();
                } else {
                    reinitializeDefaultCharts(sectionId);
                }
                break;
                
            case 'reporting-analytics':
                if (window.app && typeof window.app.initializeReportingCharts === 'function') {
                    window.app.initializeReportingCharts();
                } else {
                    reinitializeDefaultCharts(sectionId);
                }
                break;
                
            default:
                // For other sections, search for canvas elements and initialize them
                reinitializeDefaultCharts(sectionId);
        }
    }
    
    // Reinitialize all charts found in a section
    function reinitializeDefaultCharts(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        console.log(`Searching for charts in section: ${sectionId}`);
        const canvases = section.querySelectorAll('canvas[id]');
        
        if (canvases.length > 0) {
            console.log(`Found ${canvases.length} chart canvas elements in ${sectionId}`);
            
            // First destroy any existing charts in this section to prevent duplicates
            canvases.forEach(canvas => {
                const canvasId = canvas.id;
                if (window.chartManager && window.chartManager.charts && window.chartManager.charts.has(canvasId)) {
                    window.chartManager.destroy(canvasId);
                    console.log(`Destroyed existing chart: ${canvasId}`);
                }
            });
            
            // Use the chart initializer to rebuild the charts
            if (window.chartInitializer && typeof window.chartInitializer.initializeDashboardCharts === 'function') {
                console.log('Using chart initializer to rebuild charts');
                window.chartInitializer.initializeDashboardCharts();
            } else if (typeof initializeDashboardCharts === 'function') {
                console.log('Using global initializeDashboardCharts function');
                initializeDashboardCharts();
            } else {
                console.warn('No chart initializer found - charts may not display correctly');
            }
        } else {
            console.log(`No chart canvas elements found in section: ${sectionId}`);
        }
    }
    
    // Function to handle section navigation and ensure charts are initialized
    function handleSectionNavigation(sectionId) {
        if (window.chartManager && window.chartManager.destroyAll) {
            // Clean up existing charts before navigation to prevent memory leaks and duplication
            window.chartManager.destroyAll();
            console.log('Cleaned up all existing charts before navigation');
        }
        
        // Wait for the section to be fully loaded before initializing charts
        setTimeout(() => {
            initializeSectionCharts(sectionId);
            
            // Ensure chart controls are working
            setupChartControls(sectionId);
        }, 500);
    }
    
    // Function to set up chart control buttons
    function setupChartControls(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const chartButtons = section.querySelectorAll('.chart-btn');
        if (chartButtons.length === 0) return;
        
        console.log(`Setting up ${chartButtons.length} chart control buttons in ${sectionId}`);
        
        chartButtons.forEach(btn => {
            // Remove old event listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add new event listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const chartId = this.dataset.chartId;
                const chartType = this.dataset.chartType;
                
                if (!chartId || !chartType) return;
                
                // Update active state
                this.parentElement.querySelectorAll('.chart-btn').forEach(b => 
                    b.classList.remove('active'));
                this.classList.add('active');
                
                // Update the chart if available
                if (window.chartManager && window.chartManager.updateChartType) {
                    window.chartManager.updateChartType(chartId, chartType);
                    console.log(`Updated chart ${chartId} to type ${chartType}`);
                } else if (window.chartManager && window.chartManager.charts && window.chartManager.charts.has(chartId)) {
                    // Fallback for chart type switching if updateChartType isn't available
                    const chart = window.chartManager.charts.get(chartId);
                    if (chart) {
                        // Store original data
                        const data = chart.data;
                        
                        // Destroy and recreate with new type
                        window.chartManager.destroy(chartId);
                        
                        const canvas = document.getElementById(chartId);
                        if (canvas) {
                            const newChart = new Chart(canvas, {
                                type: chartType === 'area' ? 'line' : chartType,
                                data: data,
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' }}
                                }
                            });
                            
                            // If it's an area chart (which is actually a line chart with fill)
                            if (chartType === 'area' && newChart.data.datasets) {
                                newChart.data.datasets.forEach(dataset => {
                                    dataset.fill = true;
                                    if (!dataset.backgroundColor || dataset.backgroundColor === 'transparent') {
                                        const borderColor = dataset.borderColor || '#1a365d';
                                        dataset.backgroundColor = borderColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
                                    }
                                });
                                newChart.update();
                            }
                            
                            window.chartManager.charts.set(chartId, newChart);
                            console.log(`Recreated chart ${chartId} as ${chartType}`);
                        }
                    }
                }
                
                // Show notification if notification manager is available
                if (window.notificationManager && window.notificationManager.show) {
                    window.notificationManager.show(`Switched to ${chartType} view`, 'info');
                }
            });
        });
    }
    
    // Hook into section navigation events
    function setupNavigationHooks() {
        if (window.app && window.app.showSection) {
            const originalShowSection = window.app.showSection;
            
            window.app.showSection = function(sectionId) {
                // Call the original function
                const result = originalShowSection.call(this, sectionId);
                
                // Handle chart initialization
                handleSectionNavigation(sectionId);
                
                return result;
            };
            
            console.log('Navigation hook installed for chart initialization');
        }
    }
    
    // Create a MutationObserver to detect when sections become visible
    function setupVisibilityObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const section = mutation.target;
                    
                    // Check if this is a section and it's now visible
                    if (section.tagName === 'SECTION' && 
                        window.getComputedStyle(section).display !== 'none') {
                        
                        const sectionId = section.id;
                        console.log(`Section ${sectionId} became visible - checking charts`);
                        
                        // Initialize charts in this section
                        setTimeout(() => initializeSectionCharts(sectionId), 300);
                    }
                }
            });
        });
        
        // Observe all sections for style changes (which indicate visibility changes)
        document.querySelectorAll('main section').forEach(section => {
            observer.observe(section, { attributes: true, attributeFilter: ['style'] });
        });
        
        console.log('Visibility observer set up for chart initialization');
    }
    
    // Listen for events that might indicate navigation
    function setupEventListeners() {
        // Listen for the custom sectionReinitialized event from fix-blank-sections.js
        document.addEventListener('sectionReinitialized', function(e) {
            if (e.detail && e.detail.sectionId) {
                console.log(`Section ${e.detail.sectionId} was reinitialized - checking charts`);
                
                // Give the section time to fully initialize before setting up charts
                setTimeout(() => {
                    initializeSectionCharts(e.detail.sectionId);
                    setupChartControls(e.detail.sectionId);
                }, 500);
            }
        });
        
        // Listen for checkAllSections event
        document.addEventListener('checkAllSections', function() {
            console.log('Checking charts in all sections');
            const currentSection = window.app && window.app.currentSection;
            if (currentSection) {
                initializeSectionCharts(currentSection);
                setupChartControls(currentSection);
            }
        });
    }
    
    // Initialize current section's charts
    function initializeCurrentSectionCharts() {
        const currentSection = window.app && window.app.currentSection;
        if (currentSection) {
            console.log(`Initializing charts in current section: ${currentSection}`);
            
            // Add a delay to ensure the section is fully loaded
            setTimeout(() => {
                initializeSectionCharts(currentSection);
                setupChartControls(currentSection);
            }, 700);
        }
    }
    
    // ======= Initialize the fix =======
    
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Will attempt to load it dynamically.');
        
        // Try to load Chart.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            console.log('Chart.js loaded dynamically');
            init();
        };
        script.onerror = function() {
            console.error('Failed to load Chart.js dynamically');
        };
        document.head.appendChild(script);
    } else {
        init();
    }
    
    function init() {
        // Set up chart manager
        ensureChartManager();
        
        // Set up navigation hooks
        setupNavigationHooks();
        
        // Set up visibility observer
        setupVisibilityObserver();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize charts in the current section
        initializeCurrentSectionCharts();
        
        console.log('Chart Display Fix: Initialized successfully');
    }
    
})();
