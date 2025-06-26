/**
 * Dashboard Chart Navigation Reinitializer
 * Automatically reinitializes charts when dashboard is navigated to
 * @version 1.0.0
 * @date 2025-07-04
 */

(function() {
    'use strict';
    
    console.log('=== DASHBOARD CHART NAVIGATION REINITIALIZER LOADED ===');
    
    // Track whether we're currently on the dashboard
    let isDashboardActive = false;
    
    // Function to reinitialize charts
    function reinitializeDashboardCharts() {
        console.log('Reinitializing dashboard charts after navigation');
        
        if (!window.chartManager) {
            console.error('ChartManager not found, cannot reinitialize charts');
            return;
        }
        
        // Try various chart initialization methods
        if (typeof window.chartManager.createDashboardCharts === 'function') {
            console.log('Using createDashboardCharts method');
            window.chartManager.createDashboardCharts();
            
        } else {
            console.log('Using individual chart creation methods');
            
            // Check for entity/production chart (with alias support)
            const entityCanvas = document.getElementById('production-by-entity-chart') || 
                                document.getElementById('revenue-by-entity-chart');
            if (entityCanvas) {
                if (typeof window.chartManager.createProductionChart === 'function') {
                    window.chartManager.createProductionChart(entityCanvas.id);
                } else if (typeof window.chartManager.createEntityChart === 'function') {
                    window.chartManager.createEntityChart(entityCanvas.id);
                }
            } else {
                console.warn('No entity/production chart canvas found');
            }
            
            // Check for revenue trends chart
            const revenueCanvas = document.getElementById('revenue-trends-chart');
            if (revenueCanvas) {
                if (typeof window.chartManager.createRevenueChart === 'function') {
                    window.chartManager.createRevenueChart('revenue-trends-chart');
                }
            } else {
                console.warn('No revenue trends chart canvas found');
            }
            
            // Check for status distribution chart
            const statusCanvas = document.getElementById('status-distribution-chart');
            if (statusCanvas) {
                if (typeof window.chartManager.createStatusChart === 'function') {
                    window.chartManager.createStatusChart('status-distribution-chart');
                }
            }
        }
    }
    
    // Observe DOM changes to detect navigation
    function setupNavigationObserver() {
        // Get all section elements
        const sections = document.querySelectorAll('main.main-content > section');
        if (!sections.length) {
            console.warn('No sections found for navigation observer');
            return;
        }
        
        console.log(`Setting up navigation observer for ${sections.length} sections`);
        
        // Find the dashboard section
        const dashboardSection = document.getElementById('dashboard');
        
        // Setup mutation observer
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const target = mutation.target;
                    const isVisible = target.style.display !== 'none';
                    
                    // If dashboard became visible and wasn't previously visible
                    if (target === dashboardSection && isVisible && !isDashboardActive) {
                        console.log('Dashboard section is now visible - reinitializing charts');
                        isDashboardActive = true;
                        
                        // Wait a brief moment for the DOM to update fully
                        setTimeout(reinitializeDashboardCharts, 200);
                    } else if (target === dashboardSection && !isVisible && isDashboardActive) {
                        // Dashboard was hidden
                        isDashboardActive = false;
                    }
                }
            });
        });
        
        // Observe all section elements for style changes
        sections.forEach(section => {
            observer.observe(section, { attributes: true, attributeFilter: ['style'] });
        });
        
        // Set initial state
        if (dashboardSection && dashboardSection.style.display !== 'none') {
            isDashboardActive = true;
            
            // Try to initialize charts after a slight delay
            setTimeout(reinitializeDashboardCharts, 1000);
        }
    }
    
    // Also listen for click events on navigation links
    function setupNavigationLinkListeners() {
        // Wait for sidebar links to be added
        setTimeout(function() {
            const dashboardLink = document.querySelector('a[data-section="dashboard"]');
            
            if (dashboardLink) {
                console.log('Found dashboard navigation link, adding event listener');
                
                dashboardLink.addEventListener('click', function() {
                    console.log('Dashboard link clicked, scheduling chart reinitialization');
                    
                    // Allow time for the section to become visible
                    setTimeout(function() {
                        const dashboard = document.getElementById('dashboard');
                        if (dashboard && dashboard.style.display !== 'none') {
                            reinitializeDashboardCharts();
                        }
                    }, 300);
                });
            } else {
                console.warn('Dashboard navigation link not found');
            }
        }, 2000);
    }
    
    // Wait for DOM content loaded to setup observers
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupNavigationObserver();
            setupNavigationLinkListeners();
        });
    } else {
        // DOM already loaded
        setupNavigationObserver();
        setupNavigationLinkListeners();
    }
    
})();
