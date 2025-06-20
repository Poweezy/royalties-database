/**
 * Diagnostics Tool for Mining Royalties Manager
 * v1.2.0 - 2023-06-26
 */
(function() {
    'use strict';
    
    // Create global diagnostics object
    window.appDiagnostics = {
        /**
         * Run all diagnostics
         */
        runAll: function() {
            this.checkEnvironment();
            this.checkComponents();
            this.checkCharts();
            this.checkScripts();
            this.checkSections();
        },
        
        /**
         * Check environment
         */
        checkEnvironment: function() {
            console.group('Environment Check');
            
            console.log('Protocol:', window.location.protocol);
            console.log('Host:', window.location.host);
            console.log('Service Worker Supported:', 'serviceWorker' in navigator);
            console.log('Chart.js Available:', typeof Chart !== 'undefined');
            
            console.groupEnd();
        },
        
        /**
         * Check components availability
         */
        checkComponents: async function() {
            console.group('Component Check');
            
            if (window.checkComponentsAvailability) {
                console.log('Using checkComponentsAvailability...');
                await window.checkComponentsAvailability();
            } else {
                console.log('checkComponentsAvailability not available, using manual check...');
                
                const components = [
                    'sidebar', 'dashboard', 'user-management', 'royalty-records',
                    'contract-management', 'audit-dashboard', 'reporting-analytics',
                    'communication', 'notifications', 'compliance', 'regulatory-management', 'profile'
                ];
                
                const componentPaths = ['components', 'html/components'];
                
                for (const component of components) {
                    let isAvailable = false;
                    let foundPath = '';
                    
                    for (const path of componentPaths) {
                        try {
                            const response = await fetch(`${path}/${component}.html?v=${Date.now()}`);
                            if (response.ok) {
                                isAvailable = true;
                                foundPath = path;
                                break;
                            }
                        } catch (error) {
                            // Continue to next path
                        }
                    }
                    
                    if (isAvailable) {
                        console.log(`Component ${component}.html: ✓ Available (in ${foundPath})`);
                    } else {
                        console.log(`Component ${component}.html: ✗ Not found in any path`);
                    }
                }
            }
            
            console.groupEnd();
        },
        
        /**
         * Check if all sections from sidebar are available and properly configured in DOM
         */
        checkSections: function() {
            console.group('Section Diagnostics');
            
            // Get all section IDs from navigation links
            const navLinks = document.querySelectorAll('.sidebar a.nav-link');
            const sectionIds = Array.from(navLinks).map(link => {
                const section = link.getAttribute('data-section') || link.getAttribute('href')?.substring(1);
                return {
                    id: section,
                    text: link.textContent.trim(),
                    link: link
                };
            }).filter(item => item.id && item.id !== 'logout');
            
            console.log(`Found ${sectionIds.length} sections in navigation:`);
            
            // Check each section
            sectionIds.forEach(section => {
                const sectionElement = document.getElementById(section.id);
                const status = {
                    exists: !!sectionElement,
                    visible: sectionElement ? window.getComputedStyle(sectionElement).display !== 'none' : false,
                    hasContent: sectionElement ? sectionElement.children.length > 0 : false
                };
                
                console.log(`Section "${section.text}" (${section.id}):`);
                console.log(`  - DOM element: ${status.exists ? '✓ Exists' : '✗ Missing'}`);
                console.log(`  - Visibility: ${status.visible ? '✓ Visible' : '✗ Hidden'}`);
                console.log(`  - Content: ${status.hasContent ? `✓ Has content (${sectionElement?.children.length} elements)` : '✗ Empty'}`);
                
                if (!status.exists) {
                    console.warn(`  ⚠️ Section ${section.id} is missing in the DOM but exists in navigation!`);
                }
            });
            
            // Check for sections in DOM that are not in navigation
            const allSections = document.querySelectorAll('main section');
            const allSectionIds = Array.from(allSections).map(s => s.id);
            const navigationSectionIds = sectionIds.map(s => s.id);
            
            const orphanedSections = allSectionIds.filter(id => !navigationSectionIds.includes(id));
            if (orphanedSections.length) {
                console.warn(`Orphaned sections (in DOM but not in navigation): ${orphanedSections.join(', ')}`);
            }
            
            console.groupEnd();
            
            return {
                sectionsInNavigation: sectionIds.length,
                sectionsInDOM: allSections.length,
                orphanedSections
            };
        },
        
        /**
         * Check charts
         */
        checkCharts: function() {
            console.group('Charts Check');
            
            const canvasElements = document.querySelectorAll('canvas[id]');
            console.log(`Found ${canvasElements.length} canvas elements`);
            
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js is available');
            } else {
                console.warn('Chart.js is not available');
            }
            
            if (typeof window.chartManager !== 'undefined') {
                console.log('ChartManager is available');
            } else {
                console.warn('ChartManager is not available');
            }
            
            console.groupEnd();
        },
        
        /**
         * Check scripts
         */
        checkScripts: function() {
            console.group('Scripts Check');
            
            const scripts = document.querySelectorAll('script');
            console.log(`Total scripts loaded: ${scripts.length}`);
            
            const scriptSources = Array.from(scripts)
                .filter(script => script.src)
                .map(script => {
                    const url = new URL(script.src);
                    return url.pathname.split('/').pop();
                });
            
            console.log('Loaded script files:', scriptSources);
            
            console.groupEnd();
        },
        
        /**
         * Analyze and fix sections
         */
        fixSections: function() {
            console.group('Section Repair');
            
            const sidebarLinks = document.querySelectorAll('.sidebar a.nav-link');
            const mainContent = document.querySelector('main.main-content');
            
            if (!mainContent) {
                console.error('Main content container not found!');
                console.groupEnd();
                return;
            }
            
            let fixCount = 0;
            
            // Check each section from sidebar links
            sidebarLinks.forEach(link => {
                const sectionId = link.getAttribute('data-section') || link.getAttribute('href')?.substring(1);
                
                // Skip logout
                if (sectionId === 'logout') return;
                
                const sectionElement = document.getElementById(sectionId);
                
                // If section doesn't exist, create it
                if (!sectionElement) {
                    console.log(`Creating missing section: ${sectionId}`);
                    const newSection = document.createElement('section');
                    newSection.id = sectionId;
                    newSection.style.display = 'none';
                    mainContent.appendChild(newSection);
                    fixCount++;
                }
            });
            
            console.log(`Repairs completed. Fixed ${fixCount} issues.`);
            console.groupEnd();
            
            // Refresh diagnostics
            this.checkSections();
            
            return fixCount;
        },
          /**
         * Load content for all sections
         */        loadAllSections: async function() {
            console.group('Loading All Sections');
            
            const sections = document.querySelectorAll('main section');
            let loadedCount = 0;
            
            for (const section of sections) {
                const sectionId = section.id;
                
                // Skip logout
                if (sectionId === 'logout') continue;
                
                try {
                    // Try to load content from component file
                    const componentPaths = ['components', 'html/components'];
                    let loaded = false;
                    
                    for (const path of componentPaths) {
                        try {
                            const response = await fetch(`${path}/${sectionId}.html?v=${Date.now()}`);
                            if (response.ok) {
                                const html = await response.text();
                                section.innerHTML = html;
                                loadedCount++;
                                console.log(`Loaded ${sectionId} from ${path}/${sectionId}.html`);
                                loaded = true;
                                break;
                            }
                        } catch (error) {
                            // Continue to next path
                        }
                    }
                    
                    if (!loaded) {
                        console.warn(`Could not load content for section ${sectionId}`);
                    }
                } catch (error) {
                    console.error(`Error loading section ${sectionId}:`, error);
                }
            }
            
            console.log(`Loaded ${loadedCount}/${sections.length} sections`);
            console.groupEnd();
            return loadedCount;
        },

        /**
         * Check sidebar links and validate they point to existing sections
         */
        validateSidebarLinks: function() {
            console.group('Sidebar Links Validation');
            
            const sidebarLinks = document.querySelectorAll('.sidebar a.nav-link');
            let validCount = 0;
            let invalidCount = 0;
            
            sidebarLinks.forEach(link => {
                const sectionId = link.getAttribute('data-section') || link.getAttribute('href')?.substring(1);
                
                if (!sectionId) {
                    console.warn(`Link has no section ID or href: ${link.textContent.trim()}`);
                    invalidCount++;
                    return;
                }
                
                if (sectionId === 'logout') {
                    console.log(`Logout link: ✓ Valid`);
                    validCount++;
                    return;
                }
                
                const sectionElement = document.getElementById(sectionId);
                if (sectionElement) {
                    console.log(`Link to ${sectionId}: ✓ Valid`);
                    validCount++;
                } else {
                    console.warn(`Link to ${sectionId}: ✗ Invalid - section does not exist`);
                    invalidCount++;
                    
                    // Mark link as disabled
                    if (!link.classList.contains('disabled')) {
                        link.classList.add('disabled');
                        link.setAttribute('title', 'This section is not available');
                    }
                }
            });
            
            console.log(`Validation complete: ${validCount} valid, ${invalidCount} invalid links`);
            console.groupEnd();
            
            return { validCount, invalidCount };
        },
        
        /**
         * Fix missing references to scripts
         */
        fixScriptReferences: function() {
            console.group('Script References Check');
            
            const requiredScripts = [
                { src: 'js/chart-manager.js', id: 'chart-manager-script' },
                { src: 'js/component-initializer.js', id: 'component-initializer-script' },
                { src: 'js/sidebar-manager.js', id: 'sidebar-manager-script' }
            ];
            
            let fixCount = 0;
            
            requiredScripts.forEach(scriptInfo => {
                const exists = document.querySelector(`script[src="${scriptInfo.src}"], script#${scriptInfo.id}`);
                
                if (!exists) {
                    console.log(`Missing script: ${scriptInfo.src}, adding it now...`);
                    const script = document.createElement('script');
                    script.src = scriptInfo.src;
                    script.id = scriptInfo.id;
                    script.defer = true;
                    script.setAttribute('data-added-by', 'diagnostics');
                    
                    document.head.appendChild(script);
                    fixCount++;
                }
            });
            
            if (fixCount > 0) {
                console.log(`Added ${fixCount} missing script references`);
            } else {
                console.log('All required scripts are present');
            }
            
            console.groupEnd();
            return fixCount;
        },
        
        /**
         * Run a full diagnostic and attempt to fix issues automatically
         */
        runDiagnosticsAndFix: async function() {
            console.group('Full Diagnostics & Auto-Fix');
            
            console.log('Running initial diagnostics...');
            this.runAll();
            
            console.log('Attempting to fix sections...');
            const sectionFixCount = this.fixSections();
            
            console.log('Validating sidebar links...');
            const { validCount, invalidCount } = this.validateSidebarLinks();
            
            console.log('Checking script references...');
            const scriptFixCount = this.fixScriptReferences();
            
            console.log('Diagnostics and fixes complete:');
            console.log(`- Section fixes: ${sectionFixCount}`);
            console.log(`- Valid sidebar links: ${validCount}`);
            console.log(`- Invalid sidebar links: ${invalidCount}`);
            console.log(`- Script reference fixes: ${scriptFixCount}`);
            
            console.groupEnd();
            
            return {
                sectionFixCount,
                validLinks: validCount,
                invalidLinks: invalidCount,
                scriptFixCount
            };
        }
    };
    
    // Create a global shortcut for diagnostics
    window.runDiagnostics = function() {
        window.appDiagnostics.runAll();
    };
    
    // Auto-run diagnostics on load if requested via URL
    if (window.location.search.includes('diagnostics=true')) {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Auto-running diagnostics (triggered by URL parameter)');
            window.appDiagnostics.runAll();
        });
    }
    
    console.log('Diagnostics module loaded and ready');
})();
