// Global error handler to catch extension-related errors
window.addEventListener('error', function(e) {
    // Ignore extension-related errors
    if (e.message && e.message.includes('Extension context invalidated') ||
        e.message && e.message.includes('message channel closed') ||
        e.message && e.message.includes('listener indicated an asynchronous response')) {
        console.warn('Browser extension error ignored:', e.message);
        return true;
    }
    
    console.error('Application error:', e.error || e.message);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && typeof e.reason === 'string' && 
        (e.reason.includes('Extension context') || e.reason.includes('message channel'))) {
        console.warn('Browser extension promise rejection ignored:', e.reason);
        e.preventDefault();
        return;
    }
    
    console.error('Unhandled promise rejection:', e.reason);
});

// Global variables
let royaltyRecords = [];
let users = [];
let currentUser = null;
let charts = {};
let isLoggedIn = false;

// Show only loading screen initially
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (loginSection) loginSection.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
}

// Show only login page after loading
function showLoginPage() {
    const loadingScreen = document.getElementById('loading-screen');
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (loginSection) loginSection.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    
    console.log('Login page displayed');
}

// Handle initialization errors
function handleInitializationError() {
    try {
        console.log('Handling initialization error - showing login page');
        showLoginPage();
    } catch (error) {
        console.error('Critical error in fallback initialization:', error);
        // Last resort fallback
        const loginSection = document.getElementById('login-section');
        if (loginSection) loginSection.style.display = 'flex';
    }
}

// Initialize the application - show only login
function initializeApp() {
    console.log('Initializing Mining Royalties Manager...');
    
    // Only show login page
    showLoginPage();
    
    // Setup only login-related event listeners
    setupLoginListeners();
    
    console.log('Application initialized - Login page ready');
}

// Setup only login event listeners
function setupLoginListeners() {
    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Password toggle
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePasswordVisibility);
    }

    console.log('Login event listeners setup complete');
}

// Handle login - validate and show app only after successful login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Clear previous validation errors
    hideValidationErrors();
    
    // Basic validation
    if (!username || !password) {
        showValidationErrors();
        return;
    }
    
    // Simple authentication check (in real app, this would be server-side)
    if (authenticateUser(username, password)) {
        // Successful login
        currentUser = { name: username, role: 'admin' };
        isLoggedIn = true;
        
        // Now load the full application
        loadFullApplication();
        
        console.log('User logged in successfully:', currentUser);
    } else {
        // Failed login
        showLoginError();
    }
}

// Simple authentication function
function authenticateUser(username, password) {
    // Simple demo authentication - replace with real authentication
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' },
        { username: 'demo', password: 'demo' }
    ];
    
    return validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
}

// Load full application after successful login
function loadFullApplication() {
    const loginSection = document.getElementById('login-section');
    const appContainer = document.getElementById('app-container');
    
    // Hide login, show app
    if (loginSection) loginSection.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    
    // Now setup all other features
    loadSampleData();
    setupNavigationListeners();
    setupButtonListeners();
    setupTabListeners();
    initializeDashboard();
    updateUserDisplay();
    
    console.log('Full application loaded successfully');
}

// Load sample data (only after login)
function loadSampleData() {
    royaltyRecords = [
        {
            id: 1,
            entity: 'Kwalini Quarry',
            mineral: 'Granite',
            volume: 1500,
            tariff: 15.00,
            royalties: 22500.00,
            date: '2024-01-15',
            status: 'Paid'
        },
        {
            id: 2,
            entity: 'Mbabane Quarry',
            mineral: 'Sand',
            volume: 2000,
            tariff: 12.50,
            royalties: 25000.00,
            date: '2024-01-20',
            status: 'Pending'
        }
    ];

    console.log('Sample data loaded');
}

// Setup navigation (only after login)
function setupNavigationListeners() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isLoggedIn) {
                console.warn('Access denied - user not logged in');
                return;
            }
            
            const targetId = this.getAttribute('href').substring(1);
            
            if (targetId === 'logout') {
                handleLogout();
                return;
            }
            
            showSection(targetId);
            
            // Update active nav item
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });
}

// Show section (only if logged in)
function showSection(sectionId) {
    if (!isLoggedIn) {
        console.warn('Access denied - user not logged in');
        return;
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Initialize dashboard (only after login)
function initializeDashboard() {
    if (!isLoggedIn) return;
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Update dashboard metrics
    updateDashboardMetrics();
    
    // Initialize charts
    initializeCharts();
    
    console.log('Dashboard initialized');
}

// Initialize charts
function initializeCharts() {
    // Revenue Trends Chart
    const revenueCtx = document.getElementById('revenue-trends-chart');
    if (revenueCtx) {
        charts.revenueTrends = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (E)',
                    data: [45000, 52000, 48000, 61000, 55000, 67000],
                    borderColor: '#1a365d',
                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'E' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Production by Entity Chart
    const productionCtx = document.getElementById('production-by-entity-chart');
    if (productionCtx) {
        charts.productionByEntity = new Chart(productionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery'],
                datasets: [{
                    data: [1500, 2000, 1200, 800],
                    backgroundColor: [
                        '#1a365d',
                        '#2c5282',
                        '#3182ce',
                        '#4299e1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Update dashboard metrics
function updateDashboardMetrics() {
    // Update total royalties
    const totalRoyalties = royaltyRecords.reduce((sum, record) => sum + record.royalties, 0);
    const totalRoyaltiesElement = document.getElementById('total-royalties');
    if (totalRoyaltiesElement) {
        totalRoyaltiesElement.textContent = `E${totalRoyalties.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    }
    
    // Update active entities
    const activeEntities = new Set(royaltyRecords.map(record => record.entity)).size;
    const activeEntitiesElement = document.getElementById('active-entities');
    if (activeEntitiesElement) {
        activeEntitiesElement.textContent = activeEntities.toString();
    }
    
    // Update compliance rate
    const paidRecords = royaltyRecords.filter(record => record.status === 'Paid').length;
    const complianceRate = royaltyRecords.length > 0 ? Math.round((paidRecords / royaltyRecords.length) * 100) : 0;
    const complianceRateElement = document.getElementById('compliance-rate');
    if (complianceRateElement) {
        complianceRateElement.textContent = `${complianceRate}%`;
    }
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${complianceRate}%`;
    }
    
    // Update pending approvals
    const pendingRecords = royaltyRecords.filter(record => record.status === 'Pending').length;
    const pendingApprovalsElement = document.getElementById('pending-approvals');
    if (pendingApprovalsElement) {
        pendingApprovalsElement.textContent = pendingRecords.toString();
    }
    
    // Update royalty table
    updateRoyaltyTable();
}

// Update user display
function updateUserDisplay() {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name;
    }
}

// Enhanced button setup with debugging
function setupButtonListeners() {
    if (!isLoggedIn) {
        console.log('User not logged in, skipping button setup');
        return;
    }
    
    console.log('Setting up all button listeners...');
    
    // Dashboard buttons
    setupDashboardButtons();
    
    // Form buttons
    setupFormButtons();
    
    // Export/Report buttons  
    setupReportButtons();
    
    // Filter buttons
    setupFilterButtons();
    
    // Chart control buttons
    setupChartButtons();
    
    console.log('All button listeners setup complete');
}

// Setup chart control buttons with improved error handling
function setupChartButtons() {
    console.log('Setting up chart buttons...');
    
    const chartButtons = document.querySelectorAll('.chart-btn');
    console.log(`Found ${chartButtons.length} chart buttons`);
    
    chartButtons.forEach((button, index) => {
        console.log(`Setting up chart button ${index + 1}:`, button.textContent);
        
        // Remove any existing listeners
        button.replaceWith(button.cloneNode(true));
        
        // Get the fresh reference
        const freshButton = document.querySelectorAll('.chart-btn')[index];
        
        freshButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Chart button clicked:', this.textContent);
            console.log('Button data attributes:', this.dataset);
            
            // Remove active class from siblings
            const siblings = this.parentElement.querySelectorAll('.chart-btn');
            siblings.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Handle chart type change
            const chartType = this.dataset.chartType || this.textContent.toLowerCase();
            const chartId = this.dataset.chartId || 'revenue-trends-chart';
            
            console.log(`Changing chart type: ${chartType}, Chart ID: ${chartId}`);
            handleChartTypeChange(chartType, chartId);
        });
        
        console.log(`Chart button ${index + 1} setup complete`);
    });
    
    console.log('Chart buttons setup complete');
}

// Improved chart type handling
function handleChartTypeChange(chartType, chartId) {
    console.log(`Chart type change requested: ${chartType} for ${chartId}`);
    
    if (chartId === 'revenue-trends-chart' && charts.revenueTrends) {
        try {
            console.log('Updating revenue trends chart...');
            
            // Destroy and recreate chart for better compatibility
            charts.revenueTrends.destroy();
            
            const ctx = document.getElementById('revenue-trends-chart');
            if (!ctx) {
                console.error('Chart canvas not found');
                return;
            }
            
            let config = {
                type: chartType === 'area' ? 'line' : chartType,
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue (E)',
                        data: [45000, 52000, 48000, 61000, 55000, 67000],
                        borderColor: '#1a365d',
                        backgroundColor: chartType === 'area' ? 'rgba(26, 54, 93, 0.3)' : 
                                      chartType === 'bar' ? '#1a365d' : 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4,
                        fill: chartType === 'area'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'E' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            };
            
            charts.revenueTrends = new Chart(ctx, config);
            
            showNotification(`Chart updated to ${chartType} view`, 'success');
            console.log(`Chart successfully updated to ${chartType}`);
            
        } catch (error) {
            console.error('Error updating chart:', error);
            showNotification(`Error updating chart: ${error.message}`, 'error');
        }
    } else {
        console.log(`Chart ${chartId} not found or not initialized`);
        showNotification(`Chart type changed to ${chartType}`, 'info');
    }
}

// Setup dashboard specific buttons
function setupDashboardButtons() {
    // Admin button
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            alert('Admin panel access - Feature coming soon!');
        });
    }
    
    // Notifications count button
    const notificationsBtn = document.getElementById('notifications-count');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function() {
            showSection('notifications');
            updateActiveNavigation('notifications');
        });
    }
}

// Show validation errors
function showValidationErrors() {
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username && usernameError) {
        usernameError.style.display = 'block';
        usernameError.textContent = 'Username is required';
    }
    
    if (!password && passwordError) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Password is required';
    }
}

// Hide validation errors
function hideValidationErrors() {
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    
    if (usernameError) usernameError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';
    
    // Hide login error
    const loginError = document.querySelector('.login-error');
    if (loginError) loginError.remove();
}

// Show login error
function showLoginError() {
    // Remove existing error
    const existingError = document.querySelector('.login-error');
    if (existingError) existingError.remove();
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error validation-error';
    errorDiv.style.display = 'block';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginTop = '1rem';
    errorDiv.textContent = 'Invalid username or password. Please try again.';
    
    // Add to login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.appendChild(errorDiv);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Initialize the application with proper error handling
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Mining Royalties Manager - Starting up...');
        
        // Add Font Awesome if not present
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // Show loading screen first
        showLoadingScreen();
        
        // Initialize after a brief delay to show loading animation
        setTimeout(() => {
            try {
                initializeApp();
            } catch (error) {
                console.error('Error during app initialization:', error);
                handleInitializationError();
            }
        }, 2000);
    } catch (error) {
        console.error('Error during DOMContentLoaded:', error);
        handleInitializationError();
    }
});

// Placeholder functions for missing button handlers (add full implementations)
function setupFormButtons() { console.log('Form buttons setup'); }
function setupReportButtons() { console.log('Report buttons setup'); }
function setupFilterButtons() { console.log('Filter buttons setup'); }
function setupTabListeners() { console.log('Tab listeners setup'); }
function updateActiveNavigation() { console.log('Navigation updated'); }
function updateRoyaltyTable() { console.log('Royalty table updated'); }
function handleLogout() { 
    isLoggedIn = false;
    currentUser = null;
    showLoginPage();
    console.log('User logged out'); 
}

// Show notification function
function showNotification(message, type = 'info') {
    console.log(`Notification: ${message} (${type})`);
    // Add actual notification display here
}

console.log('Mining Royalties Manager with enhanced button handling loaded');