// This file is deprecated - navigation functionality moved to navigationManager.js
// Keeping for backward compatibility during transition

export class NavigationModule {
    constructor() {
        console.warn('NavigationModule is deprecated. Use NavigationManager instead.');
        this.currentSection = 'dashboard';
    }

    initialize() {
        console.warn('Use NavigationManager for new implementations');
        // Minimal backward compatibility
        this.setupNavigation();
        this.showSection('dashboard');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (href === '#logout') {
                    document.dispatchEvent(new CustomEvent('logoutRequested'));
                    return;
                }
                
                const sectionId = href.substring(1);
                this.showSection(sectionId);
            });
        });
        
        // Mobile sidebar toggle
        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('active');
            });
        }
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            
            // Update navigation active state
            this.updateNavigationState(sectionId);
            
            // Load section content
            this.loadSectionContent(sectionId);
        }
    }

    updateNavigationState(activeSection) {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }

    loadSectionContent(sectionId) {
        // Dispatch event for section loading
        document.dispatchEvent(new CustomEvent('sectionLoading', {
            detail: { sectionId }
        }));

        switch (sectionId) {
            case 'dashboard':
                document.dispatchEvent(new CustomEvent('loadDashboard'));
                break;
            case 'user-management':
                document.dispatchEvent(new CustomEvent('loadUserManagement'));
                break;
            case 'royalty-records':
                document.dispatchEvent(new CustomEvent('loadRoyaltyRecords'));
                break;
            case 'contract-management':
                document.dispatchEvent(new CustomEvent('loadContractManagement'));
                break;
            case 'audit-dashboard':
                document.dispatchEvent(new CustomEvent('loadAuditDashboard'));
                break;
            case 'reporting-analytics':
                document.dispatchEvent(new CustomEvent('loadReportingAnalytics'));
                break;
            default:
                this.loadGenericSection(sectionId);
        }
    }

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ')}</h1>
                    <p>This section is under development</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Content for ${sectionId} section will be implemented here.</p>
                </div>
            </div>
        `;
    }

    getCurrentSection() {
        return this.currentSection;
    }

    registerSectionLoader(sectionId, loaderFunction) {
        this.sectionLoaders.set(sectionId, loaderFunction);
    }
}
