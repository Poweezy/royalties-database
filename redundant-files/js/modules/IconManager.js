export class IconManager {
  constructor() {
    this.iconMap = {
      'dashboard': '📊',
      'users': '👥',
      'records': '💰',
      'contracts': '📋',
      'audit': '🛡️',
      'reports': '📊',
      'settings': '⚙️',
      'logout': '🚪'
    };
  }

  async init() {
    try {
      this.suppressExtensionErrors();
      this.addStyles();
      this.replaceIcons();
      this.addMobileMenuToggle();
      this.observeChanges();
      
      // Delayed replacements for dynamic content
      setTimeout(() => this.replaceIcons(), 500);
      setTimeout(() => this.replaceIcons(), 1000);
      setTimeout(() => this.replaceIcons(), 2000);
    } catch (error) {
      console.warn('Icon manager initialization failed:', error);
    }
  }

  suppressExtensionErrors() {
    // Suppress font awesome and extension errors
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ').toLowerCase();
      if (!message.includes('fontawesome') && !message.includes('extension')) {
        originalError.apply(console, args);
      }
    };
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .emoji-icon {
        font-style: normal;
        font-size: 1.2em;
        margin-right: 0.5rem;
      }
      .mobile-menu-toggle {
        display: none;
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1001;
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 50%;
        cursor: pointer;
      }
      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);
  }

  replaceIcons() {
    // Replace FontAwesome icons with emojis as fallback
    const icons = document.querySelectorAll('i[class*="fa-"]');
    icons.forEach(icon => {
      const classes = icon.className;
      let emoji = '📄'; // Default emoji
      
      if (classes.includes('fa-tachometer') || classes.includes('fa-dashboard')) emoji = '📊';
      else if (classes.includes('fa-users') || classes.includes('fa-user')) emoji = '👥';
      else if (classes.includes('fa-dollar') || classes.includes('fa-money')) emoji = '💰';
      else if (classes.includes('fa-file') || classes.includes('fa-contract')) emoji = '📋';
      else if (classes.includes('fa-shield') || classes.includes('fa-security')) emoji = '🛡️';
      else if (classes.includes('fa-chart') || classes.includes('fa-analytics')) emoji = '📈';
      else if (classes.includes('fa-cog') || classes.includes('fa-settings')) emoji = '⚙️';
      else if (classes.includes('fa-sign-out') || classes.includes('fa-logout')) emoji = '🚪';
      else if (classes.includes('fa-plus')) emoji = '➕';
      else if (classes.includes('fa-edit')) emoji = '✏️';
      else if (classes.includes('fa-trash')) emoji = '🗑️';
      else if (classes.includes('fa-eye')) emoji = '👁️';
      else if (classes.includes('fa-download')) emoji = '⬇️';
      
      if (!icon.textContent.trim()) {
        icon.textContent = emoji;
        icon.className = 'emoji-icon';
      }
    });
  }

  addMobileMenuToggle() {
    if (document.getElementById('mobile-menu-toggle')) return;
    
    const toggle = document.createElement('button');
    toggle.id = 'mobile-menu-toggle';
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '☰';
    toggle.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
      }
    });
    document.body.appendChild(toggle);
  }

  observeChanges() {
    const observer = new MutationObserver(() => {
      this.replaceIcons();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}