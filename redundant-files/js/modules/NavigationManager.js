// This file has been consolidated into app.js for better performance and maintenance
// Navigation functionality is now handled in the main application file

export class NavigationManager {
  constructor() {
    this.currentSection = 'dashboard';
    this.sectionHistory = ['dashboard'];
    this.maxHistoryLength = 10;
  }

  async init() {
    this.setupEventListeners();
    this.setupMobileMenu();
    console.log('Navigation manager initialized');
  }

  setupEventListeners() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
        e.preventDefault();
        const link = e.target.closest('.nav-link');
        const section = link.getAttribute('data-section') || link.getAttribute('href').substring(1);
        this.navigateToSection(section);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.section) {
        this.setActiveSection(e.state.section, false);
      }
    });

    // Mobile menu toggle
    document.addEventListener('click', (e) => {
      if (e.target.matches('.mobile-menu-toggle')) {
        this.toggleMobileMenu();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (sidebar && sidebar.classList.contains('mobile-open') && 
          !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  setupMobileMenu() {
    if (!document.querySelector('.mobile-menu-toggle')) {
      const toggle = document.createElement('button');
      toggle.className = 'mobile-menu-toggle';
      toggle.innerHTML = '☰';
      toggle.setAttribute('aria-label', 'Toggle Menu');
      document.body.appendChild(toggle);
    }
  }

  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  }

  navigateToSection(sectionId) {
    // Add to history
    if (sectionId !== this.currentSection) {
      this.addToHistory(sectionId);
      
      // Update browser history
      const url = new URL(window.location);
      url.hash = sectionId;
      window.history.pushState({ section: sectionId }, '', url);
    }
    
    this.setActiveSection(sectionId);
    this.closeMobileMenu(); // Close mobile menu after navigation
  }

  setActiveSection(sectionId, updateHistory = true) {
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkSection = link.getAttribute('data-section') || link.getAttribute('href').substring(1);
      if (linkSection === sectionId) {
        link.classList.add('active');
      }
    });

    // Update current section
    const previousSection = this.currentSection;
    this.currentSection = sectionId;

    // Dispatch navigation event
    window.dispatchEvent(new CustomEvent('sectionChanged', {
      detail: { 
        sectionId, 
        previousSection,
        timestamp: new Date()
      }
    }));

    console.log(`Navigation: ${previousSection} -> ${sectionId}`);
  }

  addToHistory(sectionId) {
    this.sectionHistory.push(sectionId);
    
    // Limit history length
    if (this.sectionHistory.length > this.maxHistoryLength) {
      this.sectionHistory.shift();
    }
  }

  getCurrentSection() {
    return this.currentSection;
  }

  getSectionHistory() {
    return [...this.sectionHistory];
  }

  goBack() {
    if (this.sectionHistory.length > 1) {
      this.sectionHistory.pop(); // Remove current
      const previousSection = this.sectionHistory[this.sectionHistory.length - 1];
      this.setActiveSection(previousSection);
      return previousSection;
    }
    return null;
  }

  canGoBack() {
    return this.sectionHistory.length > 1;
  }

  // Handle special navigation cases
  handleLogout() {
    // Clear history and navigate to logout
    this.sectionHistory = ['logout'];
    this.setActiveSection('logout');
  }

  // Breadcrumb generation
  generateBreadcrumbs() {
    const sectionNames = {
      'dashboard': 'Dashboard',
      'user-management': 'User Management',
      'royalty-records': 'Royalty Records',
      'contract-management': 'Contract Management',
      'audit-dashboard': 'Audit Dashboard',
      'reporting-analytics': 'Reporting & Analytics',
      'communication': 'Communication',
      'notifications': 'Notifications',
      'compliance': 'Compliance & Regulatory',
      'regulatory-management': 'Regulatory Management',
      'profile': 'My Profile',
      'logout': 'Logout'
    };

    return this.sectionHistory.map(section => ({
      id: section,
      name: sectionNames[section] || section,
      url: `#${section}`
    }));
  }
}
