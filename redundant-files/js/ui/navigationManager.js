// Navigation Manager Module

export class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.sectionManagers = new Map();
    }

    initialize(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
        this.loadInitialSection();
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.closest('.nav-link');
                const href = link.getAttribute('href');
                
                if (href === '#logout') {
                    document.dispatchEvent(new CustomEvent('logoutRequested'));
                    return;
                }
                
                const sectionId = href.substring(1);
                this.showSection(sectionId);
            }
        });

        // Handle section change events
        document.addEventListener('sectionChange', (e) => {
            this.showSection(e.detail.sectionId);
        });

        // Mobile sidebar toggle
        this.setupMobileSidebar();
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => section.style.display = 'none');
        
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

    async loadSectionContent(sectionId) {
        const manager = this.getSectionManager(sectionId);
        if (manager && typeof manager.loadSection === 'function') {
            await manager.loadSection();
        } else {
            this.loadGenericSection(sectionId);
        }
    }

    getSectionManager(sectionId) {
        return this.sectionManagers.get(sectionId);
    }

    registerSectionManager(sectionId, manager) {
        this.sectionManagers.set(sectionId, manager);
    }

    loadGenericSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sectionNames = {
            'audit-dashboard': 'Audit Dashboard',
            'reporting-analytics': 'Reporting & Analytics',
            'communication': 'Communication',
            'notifications': 'Notifications',
            'compliance': 'Compliance & Regulatory',
            'regulatory-management': 'Regulatory Management',
            'profile': 'Profile'
        };
        
        const sectionName = sectionNames[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ');
        
        section.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>${sectionName}</h1>
                    <p>This section is under development</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>Content for ${sectionName} will be implemented here.</p>
                </div>
            </div>
        `;
    }

    loadInitialSection() {
        this.showSection('dashboard');
    }

    setupMobileSidebar() {
        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('active');
            });
        }
    }
}

export const navigationManager = new NavigationManager();
