/**
 * Mining Royalties Manager - Main Application Module
 */
import { authService } from './services/auth.service.js';
import { dbService } from './services/database.service.js';
import { ChartManager } from './modules/ChartManager.js';
import { FileManager } from './modules/FileManager.js';
import { NavigationManager } from './modules/NavigationManager.js';
import { NotificationManager } from './modules/NotificationManager.js';
import { UserManager } from './modules/UserManager.js';
import { IdleTimer } from './modules/IdleTimer.js';
import { ErrorHandler } from './utils/error-handler.js';

class App {
    constructor() {
        this.state = { currentUser: null };
        this.notificationManager = new NotificationManager();
        this.errorHandler = new ErrorHandler(this.notificationManager);
        this.chartManager = new ChartManager();
        this.fileManager = new FileManager();
        this.navigationManager = new NavigationManager(this.notificationManager);
        this.userManager = new UserManager();
        this.idleTimer = null;

        this.initializeServices();
        this.setupEventListeners();
    }

    async initializeServices() {
        const loadingScreen = document.getElementById('loading-screen');
        try {
            loadingScreen.style.display = 'flex';
            await authService.init();
            await dbService.init();

            if (authService.isAuthenticated) {
                await this.initializeAuthenticatedState();
            } else {
                this.showLogin();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'Application initialization failed.');
        } finally {
            loadingScreen.style.display = 'none';
        }
    }

    async initializeAuthenticatedState() {
        this.state.currentUser = authService.getCurrentUser();
        this.updateUserInfo();
        await this.chartManager.initializeCharts();
        this.#setupIdleTimer();
        this.showDashboard();
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = this.state.currentUser.username;
        }
    }

    setupEventListeners() {
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = new URL(link.href).hash;
                if (sectionId === '#logout') {
                    this.navigationManager.showSection('logout');
                } else {
                    this.navigationManager.showSection(sectionId.substring(1));
                }
            });
        });
        document.getElementById('confirm-logout-btn')?.addEventListener('click', () => this.handleLogout());
    }

    async handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const username = form.username.value;
        const password = form.password.value;
        try {
            await authService.login(username, password);
            await this.initializeAuthenticatedState();
        } catch (error) {
            this.notificationManager.show('Invalid username or password.', 'error');
        }
    }

    handleLogout() {
        if (this.idleTimer) {
            this.idleTimer.stop();
        }
        authService.logout();
    }

    #setupIdleTimer() {
        if (this.idleTimer) {
            this.idleTimer.stop();
        }

        const idleModal = document.getElementById('idle-modal');
        const countdownEl = document.getElementById('idle-countdown');
        let countdownInterval;

        const startCountdown = () => {
            idleModal.style.display = 'flex';
            let count = 10;
            countdownEl.textContent = count;
            countdownInterval = setInterval(() => {
                count--;
                countdownEl.textContent = count;
                if (count <= 0) {
                    clearInterval(countdownInterval);
                    this.handleLogout();
                }
            }, 1000);
        };

        const stopCountdown = () => {
            clearInterval(countdownInterval);
            idleModal.style.display = 'none';
        };

        this.idleTimer = new IdleTimer({
            idleTimeout: 30000, // 30 seconds
            onIdle: startCountdown,
            onActive: stopCountdown,
        });

        this.idleTimer.start();
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        this.navigationManager.showSection('dashboard');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
