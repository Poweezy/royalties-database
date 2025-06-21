/**
 * Fix Blank Sections
 * 
 * This script addresses issues where sections may remain blank after navigating
 * from the audit dashboard or other sections due to initialization failures.
 * 
 * Version: 1.2.0 (2025-06-22)
 */

(function() {
    // Script loading guard to prevent duplicate initialization
    if (window.BLANK_SECTIONS_FIX_APPLIED) {
        console.log('Blank Sections Fix: Already applied, skipping');
        return;
    }
    window.BLANK_SECTIONS_FIX_APPLIED = true;
    
    console.log('Blank Sections Fix: Initializing...');
    
    // Ensure the compatibility function exists
    if (window.app && !window.app.initializeSectionContent && window.app.initializeSectionComponent) {
        console.log('Adding missing initializeSectionContent compatibility function');
        window.app.initializeSectionContent = function(sectionId) {
            console.log(`initializeSectionContent called for ${sectionId} - delegating to initializeSectionComponent`);
            this.initializeSectionComponent(sectionId);
        };
    }
    
    // Function to check if a section is empty or appears uninitialized
    function isSectionEmpty(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) return false;
        
        // If completely empty, definitely needs initialization
        if (sectionElement.children.length === 0 || sectionElement.innerHTML.trim() === '') {
            return true;
        }
        
        // Check if section is empty or has minimal content
        const contentText = sectionElement.innerText.trim();
        const hasMinimalContent = contentText.length < 50;
        
        // Check for expected elements based on section type
        let hasExpectedElements = false;
        
        switch (sectionId) {
            case 'dashboard':
                hasExpectedElements = sectionElement.querySelector('.dashboard-stats, .dashboard-cards, .dashboard-container') !== null;
                break;
            case 'royalty-records':
                hasExpectedElements = sectionElement.querySelector('.royalty-records-table, .royalty-table') !== null;
                break;
            case 'audit-dashboard':
                hasExpectedElements = sectionElement.querySelector('#audit-events-table, .audit-table') !== null;
                break;
            default:
                // For other sections, check for common elements
                hasExpectedElements = sectionElement.querySelectorAll('.card, .container, table, .section-container').length > 0;
        }
        
        return hasMinimalContent || !hasExpectedElements;
    }
    
    // Function to reinitialize a section
    function reinitializeSection(sectionId) {
        console.log(`Attempting to reinitialize section: ${sectionId}`);
        
        if (window.app) {
            // Try loading content first if it's completely empty
            const sectionElement = document.getElementById(sectionId);
            if (sectionElement && (sectionElement.children.length === 0 || sectionElement.innerHTML.trim() === '')) {
                if (typeof window.app.loadSectionContent === 'function') {
                    console.log(`Loading content for empty section: ${sectionId}`);
                    try {
                        window.app.loadSectionContent(sectionId);
                        // After loading content, we should still try to initialize it
                        setTimeout(() => initializeLoadedSection(sectionId), 300);
                        return;
                    } catch (error) {
                        console.error(`Error loading section content: ${error.message}`);
                    }
                }
            }
            
            // If we couldn't load content or section isn't completely empty, initialize
            initializeLoadedSection(sectionId);
        } else {
            console.warn("App object not available, cannot reinitialize section");
        }
    }
    
    // Function to initialize a loaded section
    function initializeLoadedSection(sectionId) {
        // Try different initialization methods
        if (typeof window.app.initializeSectionComponent === 'function') {
            console.log(`Reinitializing ${sectionId} with initializeSectionComponent`);
            window.app.initializeSectionComponent(sectionId);
        } else if (typeof window.app.initializeSectionContent === 'function') {
            console.log(`Reinitializing ${sectionId} with initializeSectionContent`);
            window.app.initializeSectionContent(sectionId);
        } else {
            console.warn(`No initialization method found for section: ${sectionId}`);
        }
        
        // Special handling for specific sections
        switch (sectionId) {
            case 'dashboard':
                if (typeof window.app.initializeDashboard === 'function') {
                    window.app.initializeDashboard();
                }
                break;
            case 'audit-dashboard':
                if (typeof window.app.initializeAuditDashboard === 'function') {
                    window.app.initializeAuditDashboard();
                }
                break;
        }
        
        // Dispatch a custom event that sections were reinitialized
        document.dispatchEvent(new CustomEvent('sectionReinitialized', { 
            detail: { sectionId } 
        }));
    }
    
    // Observer to monitor section changes
    function setupSectionObserver() {
        // Delay slightly to ensure DOM is fully updated
        setTimeout(() => {
            const currentSection = window.app && window.app.currentSection;
            if (!currentSection) return;
            
            console.log(`Checking if section "${currentSection}" needs reinitialization`);
            
            if (isSectionEmpty(currentSection)) {
                console.log(`Section "${currentSection}" appears empty or uninitialized, reinitializing...`);
                reinitializeSection(currentSection);
            } else {
                console.log(`Section "${currentSection}" appears to be properly initialized`);
            }
        }, 500);
    }
    
    // Hook into navigation events if not already hooked
    if (window.app && window.app.showSection && !window.sectionNavigationFixApplied) {
        // Store original function
        const originalShowSection = window.app.showSection;
        
        // Override showSection to include our fix
        window.app.showSection = function(sectionId) {
            // Call original function
            const result = originalShowSection.call(this, sectionId);
            
            // Setup observer to check new section after navigation completes
            setTimeout(() => setupSectionObserver(), 300);
            
            return result;
        };
        
        window.sectionNavigationFixApplied = true;
        console.log('Navigation hook installed for section initialization');
        
        // Check current section immediately
        setupSectionObserver();
    }
    
    // Check all sections
    function checkAllSections() {
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            const sectionId = section.id;
            if (isSectionEmpty(sectionId)) {
                console.log(`Found empty section: ${sectionId}, initializing...`);
                reinitializeSection(sectionId);
            }
        });
    }
    
    // Event listeners for manual section checks
    document.addEventListener('sectionLoaded', function(e) {
        if (e.detail && e.detail.sectionId) {
            console.log(`Received sectionLoaded event for ${e.detail.sectionId}`);
            setupSectionObserver();
        }
    });
    
    document.addEventListener('checkAllSections', function() {
        console.log('Received checkAllSections event, checking all sections');
        checkAllSections();
    });
    
    // Run a check of all sections after a delay
    setTimeout(checkAllSections, 1000);
    
    console.log('Blank Sections Fix: Initialized successfully');
})();
