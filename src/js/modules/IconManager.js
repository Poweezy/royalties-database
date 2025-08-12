export class IconManager {
  constructor() {
    this.iconMap = new Map([
      ['fa-home', '🏠'], ['fa-user', '👤'], ['fa-users', '👥'],
      ['fa-file-invoice', '📄'], ['fa-file-contract', '📋'],
      ['fa-shield-alt', '🛡️'], ['fa-chart-bar', '📊'],
      ['fa-envelope', '✉️'], ['fa-bell', '🔔'],
      ['fa-check-circle', '✅'], ['fa-sign-out-alt', '🚪'],
      ['fa-lock', '🔒'], ['fa-eye', '👁️'], ['fa-clock', '🕐'],
      ['fa-filter', '🔽'], ['fa-gavel', '⚖️']
    ]);
    
    this.init();
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
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ').toLowerCase();
      if (!this.shouldSuppressMessage(message)) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args) => {
      const message = args.join(' ').toLowerCase();
      if (!this.shouldSuppressMessage(message)) {
        originalWarn.apply(console, args);
      }
    };

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event);
    });

    window.addEventListener('error', (event) => {
      this.handleError(event);
    });
  }

  shouldSuppressMessage(message) {
    const suppressPatterns = [
      'fontawesome', 'extension', 'chrome-extension', 'intervention',
      'listener indicated', 'message channel', 'runtime'
    ];
    return suppressPatterns.some(pattern => message.includes(pattern));
  }

  handleError(event) {
    const errorMessage = event.reason?.message || event.message || '';
    if (this.shouldSuppressMessage(errorMessage.toLowerCase())) {
      event.preventDefault();
      return false;
    }
  }

  replaceIcons() {
    const elements = document.querySelectorAll('[class*="fa-"]');
    elements.forEach(element => {
      this.replaceElementIcon(element);
    });
  }

  replaceElementIcon(element) {
    const classList = Array.from(element.classList);
    let iconReplaced = false;
    
    for (const className of classList) {
      if (this.iconMap.has(className)) {
        this.applyIcon(element, this.iconMap.get(className));
        iconReplaced = true;
        break;
      }
    }
    
    if (!iconReplaced && classList.some(c => c.startsWith('fa-'))) {
      this.applyIcon(element, '📋');
    }
  }

  applyIcon(element, icon) {
    // Remove FontAwesome classes
    const classesToRemove = [];
    element.classList.forEach(cls => {
      if (cls.startsWith('fa')) {
        classesToRemove.push(cls);
      }
    });
    
    classesToRemove.forEach(cls => {
      element.classList.remove(cls);
    });
    
    // Add emoji icon if element is empty or minimal content
    if (!element.textContent.trim() || element.textContent.trim().length <= 2) {
      element.textContent = icon;
      element.classList.add('emoji-icon');
    }
  }

  addMobileMenuToggle() {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '☰';
    toggle.setAttribute('aria-label', 'Toggle Menu');
    
    toggle.onclick = () => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('active');
      }
    };
    
    document.body.appendChild(toggle);
  }

  addStyles() {
    if (document.querySelector('#modern-icon-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modern-icon-styles';
    style.textContent = `
      .emoji-icon {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
        font-style: normal !important;
        font-weight: normal !important;
        display: inline-block;
        width: 1em;
        height: 1em;
        text-align: center;
        vertical-align: middle;
      }

      .mobile-menu-toggle {
        display: none;
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1001;
        background: #1a365d;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.75rem;
        cursor: pointer;
        font-size: 1.2rem;
        width: 48px;
        height: 48px;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .mobile-menu-toggle { 
          display: flex !important; 
        }
        .sidebar { 
          transform: translateX(-100%); 
          transition: transform 0.3s ease; 
        }
        .sidebar.active { 
          transform: translateX(0); 
        }
      }
    `;
    document.head.appendChild(style);
  }

  observeChanges() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver((mutations) => {
      let shouldReplace = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && this.hasFontAwesomeClasses(node)) {
              shouldReplace = true;
            }
          });
        }
      });
      
      if (shouldReplace) {
        setTimeout(() => this.replaceIcons(), 50);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  hasFontAwesomeClasses(node) {
    if (!node.classList) return false;
    return Array.from(node.classList).some(c => c.startsWith('fa-'));
  }

  destroy() {
    const style = document.querySelector('#modern-icon-styles');
    if (style) {
      style.remove();
    }
    
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
      toggle.remove();
    }
  }
}