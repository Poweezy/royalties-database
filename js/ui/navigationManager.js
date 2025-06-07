// Navigation Manager Module

export class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.sections = new Map();
    }

    initialize() {
        this.setupNavigation();
        this.setupMobileSidebar();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (href === '#logout') {
                    this.handleLogout();
                    return;
                }
                
                const sectionId = href.substring(1);
                this.showSection(sectionId);
            });
        });
    }

    setupMobileSidebar() {
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
            
            // Trigger section load event
            this.onSectionChange(sectionId);
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

    onSectionChange(sectionId) {
        // Event for other modules to listen to
        document.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { sectionId }
        }));
    }

    getCurrentSection() {
        return this.currentSection;
    }

    handleLogout() {
        document.dispatchEvent(new CustomEvent('logoutRequested'));
    }
}

export const navigationManager = new NavigationManager();
