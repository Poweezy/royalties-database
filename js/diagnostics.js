/**
 * Diagnostics Tool for Mining Royalties Manager
 * @version 1.2.2
 * @date 2025-06-26
 * @description Provides diagnostic tools to troubleshoot issues with the application
 * @usage Run appDiagnostics.runAll() from the browser console
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
            
            // Check protocol and provide detailed information
            const protocol = window.location.protocol;
            console.log('Protocol:', protocol);
            console.log('Host:', window.location.host);
            
            // File protocol specific checks
            if (protocol === 'file:') {
                console.log('⚠️ Running in file:// protocol mode - LIMITED FUNCTIONALITY');
                console.log('- Fetch API restrictions apply (CORS policy blocks local file access)');
                console.log('- Service Worker is not available in file:// protocol');
                console.log('- Only core components are available via fallback mechanism');
                console.log('- For full functionality, please use a web server');
            } else {
                console.log('✓ Running on web server - FULL FUNCTIONALITY');
                console.log('Service Worker Supported:', 'serviceWorker' in navigator);
            }
            
            console.log('Chart.js Available:', typeof Chart !== 'undefined');
            
            // Additional resources
            if (window.moduleLoader && window.moduleLoader.isFileProtocol) {
                console.log('ModuleLoader is using fallback content for file:// protocol');
            }
            
            console.groupEnd();
        },
          /**
         * Check components availability
         */
        checkComponents: async function() {
            console.group('Component Check');
            
            // Check if we're on file:// protocol
            const isFileProtocol = window.location.protocol === 'file:';
            
            // Components that should be available in file:// protocol via fallbacks
            const fileProtocolComponents = ['sidebar', 'dashboard', 'royalty-records', 'contract-management'];
            
            if (isFileProtocol) {
                console.log('⚠️ Running in file:// protocol mode - Component checks are limited');
                console.log('The following components should be available through fallbacks:');
                fileProtocolComponents.forEach(component => {
                    console.log(`- ${component}: Should be available via fallback`);
                });
                
                // If moduleLoader is available, check its fallbacks
                if (window.moduleLoader && window.moduleLoader.fallbackComponents) {
                    console.log('ModuleLoader fallback components registered:');
                    Object.keys(window.moduleLoader.fallbackComponents).forEach(component => {
                        console.log(`- ${component}: ✓ Fallback available`);
                    });
                }
            } else if (window.checkComponentsAvailability) {
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
                    
                    // Handle file:// protocol fallbacks
                    if (isFileProtocol && fileProtocolComponents.includes(component)) {
                        console.log(`Component ${component}.html: ✓ Available (file:// fallback)`);
                        continue;
                    }
                    
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
                const section = link.getAttribute('data-section') || (link.getAttribute('href') ? link.getAttribute('href').substring(1) : null);
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
                console.log(`  - Content: ${status.hasContent ? `✓ Has content (${sectionElement ? sectionElement.children.length : 0} elements)` : '✗ Empty'}`);
                
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
                orphanedSections: orphanedSections
            };
        },
        
        /**
         * Check charts
         */        checkCharts: function() {
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
         * Check for potential navigation issues
         */
        checkNavigationIssues: function() {
            console.group('Navigation Issues Check');
            
            // Check for location.reload() in script elements
            const scriptElements = document.querySelectorAll('script');
            let potentialIssues = 0;
            
            scriptElements.forEach(script => {
                if (script.textContent.includes('location.reload()')) {
                    console.warn('Found location.reload() in script tag: This can break SPA navigation');
                    potentialIssues++;
                }
            });
            
            // Check audit dashboard specifically
            const auditDashboard = document.getElementById('audit-dashboard');
            if (auditDashboard) {
                const scriptTags = auditDashboard.querySelectorAll('script');
                scriptTags.forEach(script => {
                    if (script.textContent.includes('location.reload()')) {
                        console.error('❌ Found location.reload() in audit-dashboard section: This will break navigation!');
                        potentialIssues++;
                    }
                });
            }
            
            if (potentialIssues === 0) {
                console.log('✓ No obvious navigation issues detected');
            } else {
                console.warn(`Found ${potentialIssues} potential navigation issues`);
            }
            
            console.groupEnd();
            
            return potentialIssues;
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
                return 0;
            }
            
            let fixCount = 0;
            
            // Check each section from sidebar links
            sidebarLinks.forEach(link => {
                const sectionId = link.getAttribute('data-section') || (link.getAttribute('href') ? link.getAttribute('href').substring(1) : null);
                
                // Skip logout or invalid IDs
                if (!sectionId || sectionId === 'logout') return;
                
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
         */
        loadAllSections: async function() {
            console.group('Loading All Sections');
            
            const sections = document.querySelectorAll('main section');
            let loadedCount = 0;
            
            for (const section of sections) {
                const sectionId = section.id;
                
                // Skip logout or empty IDs
                if (!sectionId || sectionId === 'logout') continue;
                
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
                const sectionId = link.getAttribute('data-section') || (link.getAttribute('href') ? link.getAttribute('href').substring(1) : null);
                
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
