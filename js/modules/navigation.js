export class NavigationManager {
  constructor() {
    this.currentSection = 'dashboard';
    this.sectionManagers = new Map();
  }

  async init() {
    this.setupEventListeners();
    this.loadInitialSection();
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

    this.setupMobileSidebar();
  }

  setActiveSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(section => {
      section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      this.currentSection = sectionId;
      this.updateNavigationState(sectionId);
      this.loadSectionContent(sectionId);
    }
  }

  updateNavigationState(activeSection) {
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeSection}`) {
        link.classList.add('active');
      }
    });
  }

  loadSectionContent(sectionId) {
    // Dispatch custom event for section loading
    document.dispatchEvent(new CustomEvent('sectionChange', {
      detail: { sectionId, timestamp: Date.now() }
    }));
  }

  loadInitialSection() {
    this.setActiveSection('dashboard');
  }

  setupMobileSidebar() {
    // Mobile menu toggle functionality
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    if (window.innerWidth <= 768) {
      this.addMobileMenuToggle(toggleBtn);
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.addMobileMenuToggle(toggleBtn);
      } else {
        this.removeMobileMenuToggle(toggleBtn);
      }
    });
  }

  addMobileMenuToggle(toggle) {
    const header = document.querySelector('.page-header');
    if (header && !header.querySelector('.mobile-menu-toggle')) {
      header.appendChild(toggle);
      toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
      });
    }
  }

  removeMobileMenuToggle(toggle) {
    if (toggle.parentElement) {
      toggle.parentElement.removeChild(toggle);
    }
  }

  getCurrentSection() {
    return this.currentSection;
  }
}
