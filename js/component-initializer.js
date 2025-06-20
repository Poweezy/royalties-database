/**
 * Component Initialization Script
 * v1.1.0 - 2025-06-25
 * 
 * This script ensures all components are properly loaded and initialized
 */
(function() {
    'use strict';
    
    // Wait for document to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Component initializer running...');
        
        // Ensure moduleLoader is available
        if (!window.moduleLoader) {
            console.error('ModuleLoader is not available!');
            return;
        }
        
        // Initialize module loader if not already done
        if (!window.moduleLoader.initialized) {
            window.moduleLoader.initialize();
        }
        
        // Preload critical components for better performance
        preloadCriticalComponents();
        
        // Validate sidebar sections
        validateSidebarSections();
        
        console.log('Component initializer completed!');
    });
      // Preload the most commonly used components
    function preloadCriticalComponents() {
        if (!window.moduleLoader || !window.moduleLoader.preloadComponent) {            
            console.warn('Cannot preload components - ModuleLoader not properly initialized');
            
            // Try to initialize the moduleLoader
            if (window.moduleLoader) {
                window.moduleLoader.initialize();
                console.log('Initialized ModuleLoader after detecting it was not initialized');
            }
            
            return;
        }
        
        // Check if we're in file:// protocol
        const isFileProtocol = window.location.protocol === 'file:';
        
        // Adjust components based on protocol
        let criticalComponents = ['sidebar', 'dashboard'];
        
        // Add more components for file:// protocol to ensure they're loaded
        if (isFileProtocol) {
            criticalComponents = ['sidebar', 'dashboard', 'royalty-records', 'contract-management'];
            console.log('Using extended component list for file:// protocol');
            
            // Special handling for file:// protocol - create any missing sections
            if (window.moduleLoader.createFileProtocolSections) {
                window.moduleLoader.createFileProtocolSections();
            }
        }
        
        criticalComponents.forEach(componentId => {
            window.moduleLoader.preloadComponent(componentId)
                .then(result => {
                    if (result.success) {
                        console.log(`Preloaded component: ${componentId}${result.fromFallback ? ' (from fallback)' : ''}`);
                    } else {
                        console.warn(`Failed to preload component: ${componentId}`);
                    }
                })
                .catch(error => {
                    console.error(`Error preloading component ${componentId}:`, error);
                });
        });
    }
      // Check if sidebar sections have corresponding DOM elements and component files
    async function validateSidebarSections() {
        // Wait longer for sidebar to load (1500ms instead of 500ms)
        setTimeout(async () => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) {
                console.error('Sidebar element not found!');
                return;
            }
            
            // Get all section links in the sidebar
            const navLinks = sidebar.querySelectorAll('a.nav-link');
            if (!navLinks || navLinks.length === 0) {
                console.warn('No navigation links found in sidebar - they may not have loaded yet');
                
                // Try to manually reload sidebar if window.app is available
                if (window.app && typeof window.app.loadSidebar === 'function') {
                    try {
                        await window.app.loadSidebar();
                        console.log('Manually reloaded sidebar');
                        
                        // Check again after reload
                        const reloadedLinks = sidebar.querySelectorAll('a.nav-link');
                        if (reloadedLinks && reloadedLinks.length > 0) {
                            console.log(`Found ${reloadedLinks.length} navigation links after reload`);
                        } else {
                            console.warn('Still no navigation links after reload');
                        }
                    } catch (error) {
                        console.error('Failed to reload sidebar:', error);
                    }
                }
                return;
            }
            
            console.log(`Found ${navLinks.length} navigation links in sidebar`);
            
            // Check each section
            for (const link of navLinks) {
                const sectionId = link.getAttribute('data-section') || link.getAttribute('href')?.substring(1);
                
                // Skip logout link
                if (sectionId === 'logout') continue;
                
                // Check if section exists in DOM
                const sectionEl = document.getElementById(sectionId);
                if (!sectionEl) {
                    console.warn(`Section #${sectionId} not found in DOM but exists in sidebar`);
                    link.classList.add('nav-link-disabled');
                    link.setAttribute('title', 'Section not available');
                    continue;
                }
                
                // Check if component exists
                const componentPaths = ['components', 'html/components'];
                let componentExists = false;
                
                for (const path of componentPaths) {
                    try {
                        const response = await fetch(`${path}/${sectionId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            componentExists = true;
                            break;
                        }
                    } catch (error) {
                        // Try next path
                    }
                }
                
                if (!componentExists) {
                    console.warn(`Component for section #${sectionId} not found`);
                    link.classList.add('nav-link-warning');
                    link.setAttribute('title', 'Component may not be available');
                }
            }
        }, 1500);
    }
})();
