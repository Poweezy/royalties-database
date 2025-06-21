/**
 * Component Loading Test Script
 * 
 * This script helps verify that the component loading fix is working correctly
 * by adding diagnostic information and testing navigation sequences.
 */

(function() {
    console.log('Component Loading Test: Starting tests');
    
    // Create diagnostic panel
    function createDiagnosticPanel() {
        // Check if panel already exists
        if (document.getElementById('component-diagnostic-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'component-diagnostic-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            width: 350px;
            height: auto;
            max-height: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 10000;
            border-top-left-radius: 8px;
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Component Loading Diagnostics</strong>
                <button id="close-diagnostic" style="background: none; border: none; color: #fff; cursor: pointer;">×</button>
            </div>
            <div id="component-status"></div>
            <div id="chart-status"></div>
            <div style="margin-top: 10px;">
                <button id="test-navigation" style="background: #1a365d; border: none; color: #fff; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Test Navigation</button>
                <button id="clear-logs" style="background: #666; border: none; color: #fff; padding: 5px 10px; border-radius: 4px; margin-left: 5px; cursor: pointer;">Clear Logs</button>
            </div>
            <div id="diagnostic-logs" style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Add event listeners
        document.getElementById('close-diagnostic').addEventListener('click', function() {
            panel.style.display = 'none';
        });
        
        document.getElementById('test-navigation').addEventListener('click', function() {
            runNavigationTest();
        });
        
        document.getElementById('clear-logs').addEventListener('click', function() {
            document.getElementById('diagnostic-logs').innerHTML = '';
        });
        
        // Log function
        window.logDiagnostic = function(message, type = 'info') {
            const logs = document.getElementById('diagnostic-logs');
            const entry = document.createElement('div');
            entry.style.cssText = `
                padding: 3px 0;
                border-bottom: 1px solid #333;
                color: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#69db7c' : '#fff'};
            `;
            
            entry.textContent = message;
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        };
        
        // Initialize component status display
        updateComponentStatus();
    }
    
    // Update component status display
    function updateComponentStatus() {
        const componentStatus = document.getElementById('component-status');
        if (!componentStatus) return;
        
        // Get all sections
        const sections = document.querySelectorAll('main section[id]');
        let statusHTML = '<strong>Components:</strong><br>';
        
        sections.forEach(section => {
            const sectionId = section.id;
            const hasContent = section.children.length > 0 && section.innerHTML.trim() !== '';
            const hasFallback = section.querySelector('.section-fallback, .chart-fallback, .alert-warning, .alert-info');
            
            let status;
            if (!hasContent) {
                status = '🔴 Empty';
            } else if (hasFallback) {
                status = '🟠 Fallback';
            } else {
                status = '🟢 Loaded';
            }
            
            statusHTML += `${sectionId}: ${status}<br>`;
        });
        
        componentStatus.innerHTML = statusHTML;
    }
    
    // Update chart status display
    function updateChartStatus() {
        const chartStatus = document.getElementById('chart-status');
        if (!chartStatus) return;
        
        // Get all canvases
        const canvases = document.querySelectorAll('canvas[id]');
        let statusHTML = '<strong>Charts:</strong><br>';
        
        if (canvases.length === 0) {
            statusHTML += 'No charts found<br>';
        } else {
            canvases.forEach(canvas => {
                const canvasId = canvas.id;
                let status = '⚪ Unknown';
                
                // Check if chart instance exists
                if (window.chartManager && window.chartManager.charts) {
                    if (window.chartManager.charts instanceof Map && window.chartManager.charts.has(canvasId)) {
                        status = '🟢 Initialized';
                    } else if (window.chartManager.charts[canvasId]) {
                        status = '🟢 Initialized';
                    }
                } else if (canvas.chart) {
                    status = '🟢 Initialized';
                }
                
                statusHTML += `${canvasId}: ${status}<br>`;
            });
        }
        
        chartStatus.innerHTML = statusHTML;
    }
    
    // Run navigation test
    function runNavigationTest() {
        logDiagnostic('Starting navigation test sequence...', 'info');
        
        const sections = ['dashboard', 'royalty-records', 'audit-dashboard', 'contract-management'];
        let currentIndex = 0;
        
        // Navigate through sections with delay
        function navigateNext() {
            if (currentIndex >= sections.length) {
                logDiagnostic('Navigation test completed', 'success');
                return;
            }
            
            const sectionId = sections[currentIndex];
            logDiagnostic(`Navigating to: ${sectionId}`, 'info');
            
            // Attempt navigation using all possible methods
            if (window.app && window.app.navigateToSection) {
                window.app.navigateToSection(sectionId);
            } else {
                // Try to find sidebar link and click it
                const link = document.querySelector(`a[data-section="${sectionId}"], a[href="#${sectionId}"]`);
                if (link) {
                    link.click();
                } else {
                    // Direct approach
                    document.querySelectorAll('main section').forEach(section => {
                        section.style.display = section.id === sectionId ? 'block' : 'none';
                    });
                    
                    // Fire events
                    document.dispatchEvent(new CustomEvent('sectionChanged', {
                        detail: { sectionId, previousSection: sections[currentIndex > 0 ? currentIndex - 1 : 0] }
                    }));
                }
            }
            
            // Wait and check component status
            setTimeout(() => {
                updateComponentStatus();
                updateChartStatus();
                
                // Check for empty sections or fallbacks
                const section = document.getElementById(sectionId);
                if (!section) {
                    logDiagnostic(`Section ${sectionId} not found in DOM`, 'error');
                } else {
                    const hasContent = section.children.length > 0 && section.innerHTML.trim() !== '';
                    const hasFallback = section.querySelector('.section-fallback, .chart-fallback, .alert-warning, .alert-info');
                    
                    if (!hasContent) {
                        logDiagnostic(`Section ${sectionId} appears empty`, 'error');
                    } else if (hasFallback) {
                        logDiagnostic(`Section ${sectionId} showing fallback content`, 'error');
                    } else {
                        logDiagnostic(`Section ${sectionId} loaded successfully`, 'success');
                    }
                    
                    // Check for charts
                    const charts = section.querySelectorAll('canvas[id]');
                    if (charts.length > 0) {
                        logDiagnostic(`Found ${charts.length} charts in ${sectionId}`, 'info');
                    }
                }
                
                // Continue to next section
                currentIndex++;
                setTimeout(navigateNext, 1500);
            }, 1000);
        }
        
        // Start navigation
        navigateNext();
    }
    
    // Initialize
    function init() {
        // Create diagnostic panel
        setTimeout(() => {
            createDiagnosticPanel();
            updateComponentStatus();
            updateChartStatus();
            
            // Add status update on navigation
            document.addEventListener('sectionChanged', function() {
                setTimeout(() => {
                    updateComponentStatus();
                    updateChartStatus();
                }, 1000);
            });
            
            // Add status update on component loaded
            document.addEventListener('componentLoaded', function(event) {
                if (event.detail) {
                    logDiagnostic(`Component ${event.detail.componentId} ${event.detail.success ? 'loaded' : 'failed'}`, 
                                 event.detail.success ? 'success' : 'error');
                }
                
                setTimeout(() => {
                    updateComponentStatus();
                    updateChartStatus();
                }, 500);
            });
        }, 2000);
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
