/**
 * Sidebar Manager for Mining Royalties Manager
 * v1.0.0 - 2025-06-25
 * 
 * This script ensures the sidebar is properly loaded and all section links are valid
 */
(function() {
    'use strict';
    
    class SidebarManager {
        constructor() {
            this.sidebarElement = document.getElementById('sidebar');
            this.componentPaths = ['components', 'html/components'];
            this.validSections = [];
            this.initialized = false;
        }
        
        /**
         * Initialize the sidebar manager
         */
        async initialize() {
            if (this.initialized) return;
            
            console.log('SidebarManager: Initializing...');
            await this.validateAvailableComponents();
            this.updateSidebarLinks();
            this.setupEventHandlers();
            this.initialized = true;
            
            console.log('SidebarManager: Initialization complete');
        }
        
        /**
         * Check which section components actually exist
         */
        async validateAvailableComponents() {
            console.log('SidebarManager: Validating available components...');
            
            // Define all possible sections
            const allSections = [
                'dashboard', 'user-management', 'royalty-records', 'contract-management', 
                'audit-dashboard', 'reporting-analytics', 'communication', 'notifications',
                'compliance', 'regulatory-management', 'profile'
            ];
            
            // Check each section for component availability
            for (const section of allSections) {
                let isAvailable = false;
                
                // Check in DOM first
                const sectionElement = document.getElementById(section);
                if (!sectionElement) {
                    console.warn(`SidebarManager: Section #${section} not found in DOM`);
                    continue;
                }
                
                // Check component files
                for (const path of this.componentPaths) {
                    try {
                        const response = await fetch(`${path}/${section}.html?v=${Date.now()}`);
                        if (response.ok) {
                            isAvailable = true;
                            console.log(`SidebarManager: Component ${section}.html found in ${path}`);
                            break;
                        }
                    } catch (error) {
                        // Continue to next path
                    }
                }
                
                if (isAvailable) {
                    this.validSections.push(section);
                } else {
                    console.warn(`SidebarManager: Component for ${section} not found in any path`);
                }
            }
            
            console.log(`SidebarManager: Found ${this.validSections.length} valid sections:`, this.validSections);
        }
        
        /**
         * Update sidebar links based on component availability
         */
        updateSidebarLinks() {
            if (!this.sidebarElement) return;
            
            const links = this.sidebarElement.querySelectorAll('a.nav-link');
            if (!links || links.length === 0) return;
            
            // Process each link
            links.forEach(link => {
                const section = link.getAttribute('data-section');
                if (!section || section === 'logout') return;
                
                if (!this.validSections.includes(section)) {
                    link.classList.add('nav-link-disabled');
                    link.setAttribute('title', 'Section not available');
                    link.addEventListener('click', this.handleDisabledLink);
                }
            });
        }
        
        /**
         * Handle clicks on disabled links
         */
        handleDisabledLink(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const section = this.getAttribute('data-section');
            console.log(`SidebarManager: Attempted to access disabled section ${section}`);
            
            if (window.app && window.app.notificationManager) {
                window.app.notificationManager.show(`The ${section.replace('-', ' ')} section is not available`, 'warning');
            }
        }
        
        /**
         * Setup event handlers
         */
        setupEventHandlers() {
            // Add any additional event handlers here
        }
    }
    
    // Create and initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarManager = new SidebarManager();
          // Wait longer for the sidebar to load
        setTimeout(() => {
            window.sidebarManager.initialize();
        }, 2000);
    });
})();
