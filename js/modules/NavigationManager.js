export class NavigationManager {
  constructor(notificationManager) {
    this.currentSection = 'dashboard';
    this.notificationManager = notificationManager;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const link = event.target.closest('.sidebar nav a');
    if (link) {
      event.preventDefault();
      const href = link.getAttribute('href');
      
      if (href?.startsWith('#')) {
        const sectionId = href.substring(1);
        this.showSection(sectionId);
        this.closeMobileSidebar();
      }
    }
  }

  showSection(sectionId) {
    if (sectionId === this.currentSection) return;

    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      this.scrollToTop();
      this.updateActiveNavigation(sectionId);
      this.currentSection = sectionId;
      
      // Trigger section-specific initialization
      this.onSectionChange(sectionId);
    } else {
      this.notificationManager.error(`Section "${sectionId}" not found`);
    }
  }

  updateActiveNavigation(sectionId) {
    document.querySelectorAll('.sidebar nav a').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.sidebar nav a[href="#${sectionId}"]`);
    activeLink?.classList.add('active');
  }

  scrollToTop() {
    document.querySelector('.main-content')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  closeMobileSidebar() {
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar')?.classList.remove('active');
    }
  }

  onSectionChange(sectionId) {
    // Override in subclasses or use event system
    window.dispatchEvent(new CustomEvent('sectionChanged', { 
      detail: { sectionId, previousSection: this.currentSection } 
    }));
  }

  getCurrentSection() {
    return this.currentSection;
  }
}
