// Authentication Module - Handles login, logout, and user session management

export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.validCredentials = [
            { username: 'admin', password: 'admin123', role: 'Administrator' },
            { username: 'editor', password: 'editor123', role: 'Editor' },
            { username: 'viewer', password: 'viewer123', role: 'Viewer' }
        ];
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.querySelector('.password-toggle');
        
        // Password toggle
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
        
        // Form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = usernameInput?.value?.trim() || '';
                const password = passwordInput?.value?.trim() || '';
                
                if (!username || !password) {
                    this.showValidationErrors();
                    return;
                }
                
                this.authenticateUser(username, password);
            });
        }
        
        // Enter key support
        [usernameInput, passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        loginForm.dispatchEvent(new Event('submit'));
                    }
                });
            }
        });
    }

    showValidationErrors() {
        const usernameError = document.getElementById('username-error');
        const passwordError = document.getElementById('password-error');
        
        if (usernameError) usernameError.style.display = 'block';
        if (passwordError) passwordError.style.display = 'block';
        
        setTimeout(() => {
            if (usernameError) usernameError.style.display = 'none';
            if (passwordError) passwordError.style.display = 'none';
        }, 3000);
    }

    authenticateUser(username, password) {
        const user = this.validCredentials.find(cred => 
            cred.username === username && cred.password === password
        );
        
        if (user) {
            this.currentUser = {
                username: user.username,
                role: user.role,
                department: user.role === 'Administrator' ? 'Management' : 
                          user.role === 'Editor' ? 'Finance' : 'Audit',
                lastLogin: new Date().toISOString()
            };
            
            // Dispatch custom event for successful login
            document.dispatchEvent(new CustomEvent('userAuthenticated', {
                detail: { user: this.currentUser, username }
            }));
            
            return true;
        } else {
            // Dispatch custom event for failed login
            document.dispatchEvent(new CustomEvent('authenticationFailed', {
                detail: { username }
            }));
            
            return false;
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            const currentUser = this.currentUser;
            this.currentUser = null;
            
            // Dispatch logout event
            document.dispatchEvent(new CustomEvent('userLoggedOut', {
                detail: { user: currentUser }
            }));
            
            return true;
        }
        return false;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }
}
