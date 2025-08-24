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
        this.userManager.renderUsers();
        await this.renderRoyaltyRecords();
        await this.renderContracts();
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
        // Login/Logout
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('confirm-logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Main Navigation
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

        // Royalty Records Form
        const royaltyFormContainer = document.getElementById('add-royalty-form-container');
        document.getElementById('add-royalty-btn')?.addEventListener('click', () => {
            royaltyFormContainer.classList.add('form-visible');
        });
        document.getElementById('cancel-add-royalty')?.addEventListener('click', () => {
            royaltyFormContainer.classList.remove('form-visible');
        });
        document.getElementById('save-royalty-btn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const entity = document.getElementById('entity').value;
            const mineral = document.getElementById('mineral').value;
            const volume = document.getElementById('volume').value;
            const tariff = document.getElementById('tariff').value;
            const paymentDate = document.getElementById('payment-date').value;

            if (entity && mineral && volume && tariff && paymentDate) {
                await dbService.add('royalties', { entity, mineral, volume, tariff, paymentDate });
                await this.renderRoyaltyRecords();
                royaltyFormContainer.classList.remove('form-visible');
                document.getElementById('add-royalty-form').reset();
            } else {
                this.notificationManager.show('Please fill in all fields.', 'error');
            }
        });

        // Contract Management Form
        const contractFormContainer = document.getElementById('add-contract-form-container');
        document.getElementById('add-contract-btn')?.addEventListener('click', () => {
            contractFormContainer.classList.add('form-visible');
        });
        document.getElementById('cancel-add-contract')?.addEventListener('click', () => {
            contractFormContainer.classList.remove('form-visible');
        });
        document.querySelector('#add-contract-form button[name="Save Contract"]')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const entity = document.getElementById('contract-entity').value;
            const partyName = document.getElementById('party-name').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const royaltyRate = document.getElementById('royalty-rate').value;
            const status = document.getElementById('contract-status').value;

            if (entity && partyName && startDate && endDate && royaltyRate && status) {
                await dbService.add('contracts', { entity, partyName, startDate, endDate, royaltyRate, status });
                await this.renderContracts();
                contractFormContainer.classList.remove('form-visible');
                document.getElementById('add-contract-form').reset();
            } else {
                this.notificationManager.show('Please fill in all fields.', 'error');
            }
        });

        // User Management Form
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.userManager.showAddUserForm());
        document.getElementById('create-user-btn')?.addEventListener('click', (e) => this.userManager.handleSaveUser(e));
        document.getElementById('cancel-add-user')?.addEventListener('click', () => this.userManager.hideAddUserForm());

        // User Management table actions
        const userTableBody = document.getElementById('user-table')?.querySelector('tbody');
        userTableBody?.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const userId = parseInt(target.dataset.userId, 10);
            if (target.title === 'Edit user') {
                const user = this.userManager.getUser(userId);
                if (user) {
                    document.getElementById('new-username').value = user.username;
                    document.getElementById('new-email').value = user.email;
                    document.getElementById('new-user-role').value = user.role;
                    document.getElementById('new-department').value = user.department;
                    this.userManager.editingUserId = userId; // Set the editing user id
                    this.userManager.showAddUserForm();
                }
            } else if (target.title === 'Delete user') {
                this.userManager.deleteUser(userId);
            }
        });
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

    async renderRoyaltyRecords() {
        const royaltyTableBody = document.getElementById('royalty-table').querySelector('tbody');
        if (!royaltyTableBody) {
            console.error('Royalty table body not found!');
            return;
        }

        const records = await dbService.getAll('royalties');

        royaltyTableBody.innerHTML = '';

        if (records.length === 0) {
            royaltyTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No royalty records found.</td></tr>';
            return;
        }

        const rowsHtml = records.map(record => `
            <tr>
                <td>${record.id}</td>
                <td>${record.entity}</td>
                <td>${record.mineral}</td>
                <td>${record.paymentDate}</td>
                <td>${record.volume * record.tariff}</td>
                <td>Paid</td>
                <td>
                    <button class="btn btn-info btn-sm">View</button>
                </td>
            </tr>
        `).join('');

        royaltyTableBody.innerHTML = rowsHtml;
    }

    async renderContracts() {
        const contractTableBody = document.getElementById('contract-table').querySelector('tbody');
        if (!contractTableBody) {
            console.error('Contract table body not found!');
            return;
        }

        const contracts = await dbService.getAll('contracts');

        contractTableBody.innerHTML = '';

        if (contracts.length === 0) {
            contractTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No contracts found.</td></tr>';
            return;
        }

        const rowsHtml = contracts.map(contract => `
            <tr>
                <td>${contract.id}</td>
                <td>${contract.entity}</td>
                <td>${contract.partyName}</td>
                <td>${contract.startDate}</td>
                <td>${contract.endDate}</td>
                <td>E${parseFloat(contract.royaltyRate).toFixed(2)}</td>
                <td>${contract.status}</td>
                <td>
                    <button class="btn btn-info btn-sm">View</button>
                </td>
            </tr>
        `).join('');

        contractTableBody.innerHTML = rowsHtml;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
