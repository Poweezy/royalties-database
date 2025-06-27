/**
 * Component Diagnostics System
 * Monitors and reports on component loading and initialization
 * @version 1.0.1
 */

(function() {
    'use strict';
    
    // Create diagnostics system
    window.ComponentDiagnostics = {
        logs: [],
        components: new Map(),
        initialized: false,
        
        // Initialize diagnostics
        init: function() {
            if (this.initialized) return;
            
            this.log('ComponentDiagnostics: System initializing...');
            this.initialized = true;
            
            // Monitor global errors
            window.addEventListener('error', (event) => {
                this.logError('Global Error', event.error || event.message);
            });
            
            // Monitor unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.logError('Unhandled Promise Rejection', event.reason);
            });
            
            this.log('ComponentDiagnostics: System initialized');
        },
        
        // Log a diagnostic message
        log: function(message, level = 'info') {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message
            };
            
            this.logs.push(logEntry);
            console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
            
            // Keep only last 100 logs
            if (this.logs.length > 100) {
                this.logs.shift();
            }
        },
        
        // Log an error
        logError: function(source, error) {
            const message = `${source}: ${error.message || error}`;
            this.log(message, 'error');
            
            // Show notification if available
            if (window.NotificationSystem) {
                window.NotificationSystem.error(`Error in ${source}`, 8000);
            }
        },
        
        // Register a component
        registerComponent: function(name, status = 'loading') {
            this.components.set(name, {
                name,
                status,
                timestamp: Date.now(),
                errors: []
            });
            
            this.log(`Component registered: ${name} (${status})`);
        },
        
        // Update component status
        updateComponentStatus: function(name, status, error = null) {
            const component = this.components.get(name);
            if (component) {
                component.status = status;
                component.lastUpdate = Date.now();
                
                if (error) {
                    component.errors.push({
                        timestamp: Date.now(),
                        error: error.message || error
                    });
                    this.logError(`Component ${name}`, error);
                } else {
                    this.log(`Component ${name}: ${status}`);
                }
            }
        },
        
        // Get system status
        getStatus: function() {
            const componentStatus = {};
            this.components.forEach((component, name) => {
                componentStatus[name] = {
                    status: component.status,
                    hasErrors: component.errors.length > 0,
                    errorCount: component.errors.length
                };
            });
            
            return {
                initialized: this.initialized,
                componentCount: this.components.size,
                components: componentStatus,
                recentLogs: this.logs.slice(-10)
            };
        },
        
        // Generate diagnostic report
        generateReport: function() {
            const status = this.getStatus();
            const report = {
                timestamp: new Date().toISOString(),
                system: status,
                browser: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    readyState: document.readyState
                },
                globals: {
                    hasChart: typeof Chart !== 'undefined',
                    hasNotifications: typeof window.NotificationSystem !== 'undefined',
                    hasChartManager: typeof window.chartManager !== 'undefined'
                }
            };
            
            console.log('=== COMPONENT DIAGNOSTICS REPORT ===');
            console.log(JSON.stringify(report, null, 2));
            console.log('=== END DIAGNOSTICS REPORT ===');
            
            return report;
        }
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.ComponentDiagnostics.init();
        });
    } else {
        window.ComponentDiagnostics.init();
    }
    
    console.log('Component Diagnostics: Loaded');
})();
