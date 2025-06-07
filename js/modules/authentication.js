export class AuthenticationModule {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  async init() {
    console.log('Authentication module initialized');
    // Check for existing session
    this.checkExistingSession();
  }

  checkExistingSession() {
    // Check localStorage for existing session
    const savedSession = localStorage.getItem('mining_app_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (this.isValidSession(session)) {
          this.isAuthenticated = true;
          this.currentUser = session.user;
        }
      } catch (error) {
        console.warn('Invalid session data, clearing...');
        localStorage.removeItem('mining_app_session');
      }
    }
  }

  isValidSession(session) {
    // Check if session is still valid (not expired)
    if (!session.expires || !session.user) return false;
    return new Date(session.expires) > new Date();
  }

  async authenticate(credentials) {
    try {
      // Simulate API call with demo credentials
      const { username, password } = credentials;
      
      // Demo authentication - replace with real API call
      if (this.validateCredentials(username, password)) {
        this.isAuthenticated = true;
        this.currentUser = {
          id: 1,
          username: username,
          name: 'System Administrator',
          role: 'administrator',
          permissions: ['read', 'write', 'admin']
        };

        // Save session
        this.saveSession();
        
        console.log('Authentication successful');
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  validateCredentials(username, password) {
    // Demo credentials - replace with real validation
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'demo', password: 'demo' },
      { username: 'test', password: 'test' }
    ];

    return validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
  }

  saveSession() {
    const session = {
      user: this.currentUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      timestamp: new Date()
    };

    localStorage.setItem('mining_app_session', JSON.stringify(session));
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('mining_app_session');
    
    // Reload page to login screen
    window.location.reload();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasPermission(permission) {
    if (!this.currentUser || !this.currentUser.permissions) return false;
    return this.currentUser.permissions.includes(permission);
  }
}
