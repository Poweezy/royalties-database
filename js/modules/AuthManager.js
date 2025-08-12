/**
 * Auth Manager Module
 * Handles authentication-related functionality
 */
export class AuthManager {
  constructor() {
    this.loginForm = document.getElementById('login-form');
    this.loginSection = document.getElementById('login-section');
    this.appContainer = document.getElementById('app-container');
    this.loadingScreen = document.getElementById('loading-screen');
    this.init();
  }

  init() {
    this.setupLoginForm();
    this.setupPasswordToggle();
    this.showLoginScreen();
  }

  setupLoginForm() {
    this.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  setupPasswordToggle() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = e.target.closest('.input-group').querySelector('input');
        const icon = e.target.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
      });
    });
  }

  showLoginScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'none';
    }
    if (this.loginSection) {
      this.loginSection.style.display = 'block';
    }
  }

  async handleLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    if (!this.validateLoginForm(username, password)) {
      return;
    }

    try {
      // Show loading screen during authentication
      if (this.loadingScreen) {
        this.loadingScreen.style.display = 'flex';
      }

      // Simulate API call for authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Hide login section and show main app
      if (this.loginSection) {
        this.loginSection.style.display = 'none';
      }
      if (this.appContainer) {
        this.appContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Show error message to user
    } finally {
      if (this.loadingScreen) {
        this.loadingScreen.style.display = 'none';
      }
    }
  }

  validateLoginForm(username, password) {
    let isValid = true;
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    if (!username) {
      if (usernameError) {
        usernameError.style.display = 'block';
      }
      isValid = false;
    } else if (usernameError) {
      usernameError.style.display = 'none';
    }

    if (!password) {
      if (passwordError) {
        passwordError.style.display = 'block';
      }
      isValid = false;
    } else if (passwordError) {
      passwordError.style.display = 'none';
    }

    return isValid;
  }

  static getInstance() {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }
}
