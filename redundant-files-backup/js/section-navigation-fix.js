/**
 * Section Navigation Fix
 * 
 * This script fixes navigation issues between different sections,
 * especially after visiting the audit dashboard.
 * 
 * Version: 1.2.0 (2025-06-22)
 */

(function() {
    // Script loading guard to prevent duplicate initialization
    if (window.SECTION_NAVIGATION_FIX_LOADED) {
        console.log('Section Navigation Fix: Already loaded, skipping initialization');
        return;
    }
    
    window.SECTION_NAVIGATION_FIX_LOADED = true;
    console.log('Section Navigation Fix: Initializing...');
    
    // Store original navigation function if it exists
    const originalShowSection = window.app && window.app.showSection;
    
    /**
     * Enhanced section navigation function
     * This replaces the original showSection function with improved error handling
     * and proper cleanup when leaving sections like audit-dashboard
     */
    if (window.app) {
        window.app.showSection = function(sectionId) {
            console.log(`Navigation: ${window.app.currentSection || 'unknown'} -> ${sectionId}`);
            
            // Clean up resources when leaving audit dashboard
            if (window.app.currentSection === 'audit-dashboard') {
                console.log('Leaving audit dashboard - cleaning up resources');
                
                // Remove any event listeners or intervals that might be causing issues
                if (window.auditDashboardIntervals) {
                    window.auditDashboardIntervals.forEach(interval => clearInterval(interval));
                    window.auditDashboardIntervals = [];
                    console.log('Audit dashboard intervals cleared');
                }
                
                // Reset any global state that audit dashboard might have set
                if (window.auditDashboardController && typeof window.auditDashboardController.cleanup === 'function') {
                    window.auditDashboardController.cleanup();
                    console.log('Audit dashboard controller cleanup performed');
                }
            }
            
            // Call original function if it existed
            if (typeof originalShowSection === 'function') {
                try {
                    const result = originalShowSection.call(window.app, sectionId);
                    
                    // After original navigation is complete, ensure section is initialized
                    setTimeout(() => {
                        const sectionElement = document.getElementById(sectionId);
                        if (sectionElement && (sectionElement.children.length === 0 || sectionElement.innerHTML.trim() === '')) {
                            console.log(`Section ${sectionId} appears empty after navigation, reinitializing...`);
                            if (typeof window.app.initializeSectionContent === 'function') {
                                window.app.initializeSectionContent(sectionId);
                            } else if (typeof window.app.initializeSectionComponent === 'function') {
                                window.app.initializeSectionComponent(sectionId);
                            } else {
                                console.warn(`No initialization method found for section: ${sectionId}`);
                            }
                        }
                    }, 300);
                    
                    return result;
                } catch (error) {
                    console.error(`Error during section navigation to ${sectionId}:`, error);
                    // Fallback implementation if original fails
                }
            }
            
            // Fallback implementation if original doesn't exist or failed
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                section.style.display = section.id === sectionId ? 'block' : 'none';
            });
            
            window.app.currentSection = sectionId;
            
            // Load content for this section if needed
            if (typeof window.app.loadSectionContent === 'function') {
                window.app.loadSectionContent(sectionId);
            }
        };
    }
    
    /**
     * Ensure that all components are properly initialized during section transitions
     */
    function ensureSectionInitialization() {
        // Add compatibility function if missing
        if (window.app && !window.app.initializeSectionContent && window.app.initializeSectionComponent) {
            window.app.initializeSectionContent = function(sectionId) {
                console.log(`initializeSectionContent called for ${sectionId} - delegating to initializeSectionComponent`);
                this.initializeSectionComponent(sectionId);
            };
            console.log('Added missing initializeSectionContent compatibility function');
        }
        
        // Check for blank sections and initialize them
        const currentSection = window.app && window.app.currentSection;
        if (currentSection) {
            const sectionElement = document.getElementById(currentSection);
            if (sectionElement && (sectionElement.children.length === 0 || sectionElement.innerHTML.trim() === '')) {
                console.log(`Current section "${currentSection}" appears empty, initializing...`);
                if (window.app && typeof window.app.initializeSectionContent === 'function') {
                    window.app.initializeSectionContent(currentSection);
                }
            }
        }
    }
    
    // Apply initialization check after a short delay
    setTimeout(ensureSectionInitialization, 500);
    
    console.log('Section Navigation Fix: Initialized successfully');
})();
