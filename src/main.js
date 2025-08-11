// Import styles
import './royalties.css';

// Import libraries
import 'chart.js';
import 'xlsx';

// Import main application logic
import './js/app.js';

// Import and register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/js/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Global functions that were in inline scripts
window.togglePassword = function(inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) {
            console.warn(`Password input with ID '${inputId}' not found`);
            return;
        }

        const container = input.parentElement;
        const button = container?.querySelector('.password-toggle-btn');
        const icon = button?.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.className = 'fas fa-eye-slash';
                button.setAttribute('aria-label', 'Hide password');
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.className = 'fas fa-eye';
                button.setAttribute('aria-label', 'Show password');
            }
        }
    } catch (error) {
        console.error('Error toggling password visibility:', error);
    }
}
