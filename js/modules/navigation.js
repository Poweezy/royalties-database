export class NavigationManager {
  constructor() {
    this.currentSection = 'dashboard';
  }

  async init() {
    this.setupEventListeners();
    console.log('Navigation manager initialized');
  }

  setupEventListeners() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
        e.preventDefault();
        const link = e.target.closest('.nav-link');
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          const sectionId = href.substring(1);
          this.setActiveSection(sectionId);
        }
      }
    });

    // Handle mobile sidebar toggle
    this.setupMobileSidebar();
  }

  setupMobileSidebar() {
    // Add mobile menu toggle if needed
    if (window.innerWidth <= 768) {
      this.addMobileMenuToggle();
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.addMobileMenuToggle();
      } else {
        this.removeMobileMenuToggle();
      }
    });
  }

  addMobileMenuToggle() {
    // Implementation for mobile menu toggle
    console.log('Mobile menu setup');
  }

  removeMobileMenuToggle() {
    // Implementation for removing mobile menu toggle
    console.log('Mobile menu removed');
  }

  setActiveSection(sectionId) {
    // Update active navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Update current section
    const previousSection = this.currentSection;
    this.currentSection = sectionId;

    // Dispatch section change event
    window.dispatchEvent(new CustomEvent('sectionChanged', {
      detail: { sectionId, previousSection }
    }));

    console.log(`Navigation: ${previousSection} -> ${sectionId}`);
  }

  getCurrentSection() {
    return this.currentSection;
  }
}
