/**
 * Component Initializer
 * Handles initialization of all application components
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    window.ComponentInitializer = {
        initialized: false,
        components: [],
        
        // Initialize all components
        init: function() {
            if (this.initialized) return;
            
            console.log('ComponentInitializer: Starting component initialization...');
            this.initialized = true;
            
            // Register diagnostics if available
            if (window.ComponentDiagnostics) {
                window.ComponentDiagnostics.registerComponent('ComponentInitializer', 'initializing');
            }
            
            // Initialize components in order
            this.initializeNotifications();
            this.initializeChartSystem();
            this.initializeDashboard();
            this.initializeNavigation();
            this.initializeEventHandlers();
            
            console.log('ComponentInitializer: All components initialized');
            
            if (window.ComponentDiagnostics) {
                window.ComponentDiagnostics.updateComponentStatus('ComponentInitializer', 'completed');
            }
        },
        
        // Initialize notifications
        initializeNotifications: function() {
            if (window.NotificationSystem) {
                window.NotificationSystem.init();
                console.log('ComponentInitializer: Notifications initialized');
            }
        },
        
        // Initialize chart system
        initializeChartSystem: function() {
            try {
                // Ensure chart manager exists
                if (!window.chartManager) {
                    window.chartManager = {
                        charts: new Map(),
                        isChartJsLoaded: typeof Chart !== 'undefined',
                        
                        createChart: function(canvasId, config) {
                            if (!this.isChartJsLoaded) {
                                console.warn('Chart.js not loaded, cannot create chart');
                                return null;
                            }
                            
                            const canvas = document.getElementById(canvasId);
                            if (!canvas) {
                                console.warn(`Canvas element '${canvasId}' not found`);
                                return null;
                            }
                            
                            try {
                                const chart = new Chart(canvas, config);
                                this.charts.set(canvasId, chart);
                                console.log(`Chart created: ${canvasId}`);
                                return chart;
                            } catch (error) {
                                console.error(`Error creating chart '${canvasId}':`, error);
                                return null;
                            }
                        },
                        
                        destroyChart: function(canvasId) {
                            const chart = this.charts.get(canvasId);
                            if (chart) {
                                chart.destroy();
                                this.charts.delete(canvasId);
                                console.log(`Chart destroyed: ${canvasId}`);
                            }
                        }
                    };
                }
                
                console.log('ComponentInitializer: Chart system initialized');
            } catch (error) {
                console.error('ComponentInitializer: Error initializing chart system:', error);
            }
        },
        
        // Initialize dashboard
        initializeDashboard: function() {
            if (window.Dashboard && typeof window.Dashboard.initialize === 'function') {
                try {
                    window.Dashboard.initialize();
                    console.log('ComponentInitializer: Dashboard initialized');
                } catch (error) {
                    console.error('ComponentInitializer: Error initializing dashboard:', error);
                }
            }
        },
        
        // Initialize navigation
        initializeNavigation: function() {
            try {
                // Ensure navigation handlers are set up
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    if (!link.hasEventListener) {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            const targetSection = this.getAttribute('data-section');
                            if (targetSection && window.app && window.app.showSection) {
                                window.app.showSection(targetSection);
                            }
                        });
                        link.hasEventListener = true;
                    }
                });
                
                console.log('ComponentInitializer: Navigation initialized');
            } catch (error) {
                console.error('ComponentInitializer: Error initializing navigation:', error);
            }
        },
        
        // Initialize global event handlers
        initializeEventHandlers: function() {
            try {
                // Handle window resize for charts
                let resizeTimeout;
                window.addEventListener('resize', function() {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function() {
                        if (window.chartManager && window.chartManager.charts) {
                            window.chartManager.charts.forEach(chart => {
                                if (chart && typeof chart.resize === 'function') {
                                    chart.resize();
                                }
                            });
                        }
                    }, 250);
                });
                
                console.log('ComponentInitializer: Event handlers initialized');
            } catch (error) {
                console.error('ComponentInitializer: Error initializing event handlers:', error);
            }
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Wait a bit for other scripts to load
            setTimeout(function() {
                window.ComponentInitializer.init();
            }, 100);
        });
    } else {
        setTimeout(function() {
            window.ComponentInitializer.init();
        }, 100);
    }
    
    console.log('Component Initializer: Loaded');
})();
