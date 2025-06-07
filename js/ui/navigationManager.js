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

    async loadSectionContent(sectionId) {
        // Get or create section manager
        let manager = this.sectionManagers.get(sectionId);
        
        if (!manager) {
            switch (sectionId) {
                case 'user-management':
                    const { UserManagementManager } = await import('./sectionManagers.js');
                    manager = new UserManagementManager(this.dataManager);
                    break;
                // Add other section managers as needed
            }
            
            if (manager) {
                this.sectionManagers.set(sectionId, manager);
            }
        }
        
        if (manager && manager.loadSection) {
            manager.loadSection();
        }
    }

    loadInitialSection() {
        this.showSection('dashboard');
    }
}

export const navigationManager = new NavigationManager();
