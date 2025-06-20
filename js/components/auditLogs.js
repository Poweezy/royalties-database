export class AuditLogsManager {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.currentPage = 1;
        this.entriesPerPage = 25;
        this.filteredEntries = [];
        this.allEntries = [];
        this.sortColumn = 'timestamp';
        this.sortDirection = 'desc';
        this.autoRefreshInterval = null;
        this.realTimeInterval = null;
        this.realTimeMode = false;
        this.initialized = false;
        this.eventListeners = new Map();
        
        // Register cleanup handler
        this.registerCleanupHandler();
    }

    registerCleanupHandler() {
        // Listen for section changes to clean up
        const sectionChangeHandler = (e) => {
            if (e.detail.sectionId !== 'audit-dashboard') {
                this.cleanup();
            }
        };
        document.addEventListener('sectionChange', sectionChangeHandler);
        this.eventListeners.set('sectionChange', sectionChangeHandler);

        // Listen for explicit cleanup calls
        const cleanupHandler = () => this.cleanup();
        document.addEventListener('sectionCleanup', cleanupHandler);
        this.eventListeners.set('sectionCleanup', cleanupHandler);
    }

    cleanup() {
        // Stop all intervals
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }

        // Remove all event listeners
        this.removeEventListeners();
        
        console.log('Audit Logs Manager cleaned up');
        this.initialized = false;
    }

    removeEventListeners() {
        // Clean up registered event listeners
        this.eventListeners.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });
        
        // Clean up element-specific listeners
        const elements = [
            'real-time-toggle', 
            'export-audit-log-btn', 
            'security-report-btn',
            'toggle-filters',
            'apply-audit-filters',
            'clear-audit-filters',
            'refresh-audit-log',
            'auto-refresh-toggle',
            'select-all-audit'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
    }

    async loadSection() {
        const section = document.getElementById('audit-dashboard');
        if (!section) return;

        try {
            const template = await this.loadTemplate();
            if (template) {
                section.innerHTML = template;
            }
            
            await this.initializeComponent();
        } catch (error) {
            console.error('Error loading audit logs section:', error);
            this.loadFallbackContent(section);
        }
    }

    async loadTemplate() {
        try {
            const response = await fetch('components/audit-logs.html');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.log('Template fetch failed, using embedded content');
        }
        return null;
    }

    async initializeComponent() {
        if (this.initialized) {
            console.log('Audit logs already initialized, refreshing data');
            this.refreshAuditLog();
            return;
        }
        
        this.loadAuditData();
        this.updateMetrics();
        this.populateAuditTable();
        this.setupEventListeners();
        this.setupFilters();
        this.setupPagination();
        
        this.initialized = true;
        console.log('Audit Logs component initialized');
    }

    loadAuditData() {
        // Load existing audit data and add more comprehensive entries
        this.allEntries = [
            ...this.dataManager.getAuditLog(),
            ...this.generateAdditionalAuditEntries()
        ];
        
        // Sort by timestamp (newest first)
        this.allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.filteredEntries = [...this.allEntries];
    }

    generateAdditionalAuditEntries() {
        const additionalEntries = [
            {
                id: 6,
                timestamp: '2024-02-10 10:30:45',
                user: 'admin',
                action: 'Export Records',
                target: 'Royalty Records',
                ipAddress: '192.168.1.100',
                status: 'Success',
                severity: 'Info',
                details: 'Exported 15 royalty records to Excel format',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123'
            },
            {
                id: 7,
                timestamp: '2024-02-10 08:45:12',
                user: 'editor',
                action: 'Modify Record',
                target: 'ROY-2024-003',
                ipAddress: '192.168.1.105',
                status: 'Success',
                severity: 'Medium',
                details: 'Updated payment status from Pending to Paid for Ngwenya Mine',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_def456'
            },
            {
                id: 8,
                timestamp: '2024-02-09 16:20:33',
                user: 'unknown',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '203.45.67.89',
                status: 'Failed',
                severity: 'High',
                details: 'Multiple failed login attempts detected from external IP',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: null
            },
            {
                id: 9,
                timestamp: '2024-02-09 15:15:20',
                user: 'admin',
                action: 'System Change',
                target: 'User Permissions',
                ipAddress: '192.168.1.100',
                status: 'Success',
                severity: 'High',
                details: 'Modified system-wide permission settings for audit compliance',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123'
            },
            {
                id: 10,
                timestamp: '2024-02-09 14:45:18',
                user: 'viewer',
                action: 'Data Access',
                target: 'Contract Details',
                ipAddress: '192.168.1.108',
                status: 'Success',
                severity: 'Low',
                details: 'Accessed contract MC-2024-001 for review purposes',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_ghi789'
            },
            {
                id: 11,
                timestamp: '2024-02-09 13:30:45',
                user: 'editor',
                action: 'Create Record',
                target: 'ROY-2024-007',
                ipAddress: '192.168.1.105',
                status: 'Success',
                severity: 'Info',
                details: 'Created new royalty record for Kwalini Quarry - E 22,500',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_def456'
            },
            {
                id: 12,
                timestamp: '2024-02-09 12:15:30',
                user: 'admin',
                action: 'Backup Operation',
                target: 'Database',
                ipAddress: '192.168.1.100',
                status: 'Success',
                severity: 'Info',
                details: 'Automated daily database backup completed successfully',
                userAgent: 'System/Automated',
                sessionId: 'system_backup'
            },
            {
                id: 13,
                timestamp: '2024-02-08 17:45:22',
                user: 'admin',
                action: 'Generate Report',
                target: 'Monthly Report',
                ipAddress: '192.168.1.100',
                status: 'Success',
                severity: 'Info',
                details: 'Generated monthly compliance report for January 2024',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_abc123'
            },
            {
                id: 14,
                timestamp: '2024-02-08 16:30:15',
                user: 'viewer',
                action: 'Failed Login',
                target: 'System',
                ipAddress: '192.168.1.108',
                status: 'Failed',
                severity: 'Medium',
                details: 'Login failed - account temporarily locked after 3 attempts',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: null
            },
            {
                id: 15,
                timestamp: '2024-02-08 15:20:10',
                user: 'editor',
                action: 'Logout',
                target: 'System',
                ipAddress: '192.168.1.105',
                status: 'Success',
                severity: 'Info',
                details: 'User logged out after 4 hours 30 minutes session',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                sessionId: 'sess_def456'
            }
        ];

        // Add entries to the data manager
        additionalEntries.forEach(entry => {
            this.dataManager.auditLog.push(entry);
        });

        return additionalEntries;
    }

    updateMetrics() {
        const totalActivities = this.allEntries.length;
        const securityEvents = this.allEntries.filter(entry => 
            entry.severity === 'High' || entry.severity === 'Critical' || entry.status === 'Failed'
        ).length;
        const failedAttempts = this.allEntries.filter(entry => 
            entry.action === 'Failed Login'
        ).length;

        this.updateElement('total-activities', totalActivities);
        this.updateElement('security-events', securityEvents);
        this.updateElement('failed-attempts', failedAttempts);
        this.updateElement('last-update', new Date().toLocaleTimeString());

        // Update security trend
        const securityTrend = document.getElementById('security-trend');
        if (securityTrend) {
            if (securityEvents === 0) {
                securityTrend.innerHTML = '<i class="fas fa-shield-check"></i> No critical alerts';
                securityTrend.className = 'trend-positive';
            } else if (securityEvents <= 2) {
                securityTrend.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Minor security events';
                securityTrend.className = 'trend-warning';
            } else {
                securityTrend.innerHTML = '<i class="fas fa-shield-virus"></i> Multiple security events';
                securityTrend.className = 'trend-negative';
            }
        }

        // Update failed attempts trend
        const failedTrend = document.getElementById('failed-trend');
        if (failedTrend) {
            if (failedAttempts === 0) {
                failedTrend.innerHTML = '<i class="fas fa-check-circle text-success"></i> No recent failures';
            } else if (failedAttempts <= 2) {
                failedTrend.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i> Some failed attempts';
            } else {
                failedTrend.innerHTML = '<i class="fas fa-ban text-danger"></i> Multiple failures detected';
            }
        }
    }

    populateAuditTable() {
        const tbody = document.getElementById('audit-log-tbody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.entriesPerPage;
        const endIndex = startIndex + this.entriesPerPage;
        const pageEntries = this.filteredEntries.slice(startIndex, endIndex);

        tbody.innerHTML = pageEntries.map(entry => `
            <tr data-entry-id="${entry.id}" class="audit-entry-row">
                <td><input type="checkbox" value="${entry.id}"></td>
                <td>
                    <div class="timestamp-cell">
                        <strong>${this.formatDate(entry.timestamp)}</strong>
                        <small>${this.formatTime(entry.timestamp)}</small>
                    </div>
                </td>
                <td>
                    <div class="user-cell">
                        <i class="fas fa-user"></i>
                        <span class="user-name">${entry.user}</span>
                    </div>
                </td>
                <td>
                    <span class="action-badge ${this.getActionClass(entry.action)}">
                        <i class="fas fa-${this.getActionIcon(entry.action)}"></i>
                        ${entry.action}
                    </span>
                </td>
                <td>
                    <span class="target-info">${entry.target}</span>
                </td>
                <td>
                    <div class="ip-cell">
                        <i class="fas fa-network-wired"></i>
                        <span class="ip-address">${entry.ipAddress}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${entry.status.toLowerCase()}">
                        <i class="fas fa-${this.getStatusIcon(entry.status)}"></i>
                        ${entry.status}
                    </span>
                </td>
                <td>
                    <span class="severity-badge ${entry.severity?.toLowerCase() || 'info'}">
                        <i class="fas fa-${this.getSeverityIcon(entry.severity)}"></i>
                        ${entry.severity || 'Info'}
                    </span>
                </td>
                <td>
                    <div class="details-cell" title="${entry.details}">
                        ${this.truncateText(entry.details, 50)}
                    </div>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-secondary" onclick="auditActions.viewDetails(${entry.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="auditActions.investigate(${entry.id})" title="Investigate">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="auditActions.flag(${entry.id})" title="Flag Entry">
                            <i class="fas fa-flag"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePaginationInfo();
    }

    setupEventListeners() {
        // Real-time toggle
        const realTimeToggle = document.getElementById('real-time-toggle');
        if (realTimeToggle) {
            realTimeToggle.addEventListener('click', () => {
                this.toggleRealTimeMode();
            });
        }

        // Export audit log
        const exportBtn = document.getElementById('export-audit-log-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAuditLog();
            });
        }

        // Security report
        const securityReportBtn = document.getElementById('security-report-btn');
        if (securityReportBtn) {
            securityReportBtn.addEventListener('click', () => {
                this.generateSecurityReport();
            });
        }

        // Filter toggle
        const toggleFilters = document.getElementById('toggle-filters');
        if (toggleFilters) {
            toggleFilters.addEventListener('click', () => {
                this.toggleFilters();
            });
        }

        // Apply filters
        const applyFilters = document.getElementById('apply-audit-filters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clear-audit-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Refresh log
        const refreshBtn = document.getElementById('refresh-audit-log');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAuditLog();
            });
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }

        // Table sorting
        const sortableHeaders = document.querySelectorAll('#audit-log-table th[sortable]');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortTable(column);
            });
        });

        // Select all checkbox
        const selectAll = document.getElementById('select-all-audit');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.selectAllEntries(e.target.checked);
            });
        }

        // Modal close handlers
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });
    }

    setupFilters() {
        // Populate user filter
        const userFilter = document.getElementById('filter-user');
        if (userFilter) {
            const users = [...new Set(this.allEntries.map(entry => entry.user))];
            users.forEach(user => {
                if (user !== 'admin' && user !== 'editor' && user !== 'viewer') {
                    const option = document.createElement('option');
                    option.value = user;
                    option.textContent = user;
                    userFilter.appendChild(option);
                }
            });
        }

        // Real-time filter updates
        const filterInputs = document.querySelectorAll('#audit-filters select, #audit-filters input');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (document.getElementById('auto-apply-filters')?.checked) {
                    this.applyFilters();
                }
            });
        });
    }

    setupPagination() {
        const prevBtn = document.getElementById('audit-prev-page');
        const nextBtn = document.getElementById('audit-next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.populateAuditTable();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredEntries.length / this.entriesPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.populateAuditTable();
                }
            });
        }
    }

    // Action methods
    toggleRealTimeMode() {
        this.realTimeMode = !this.realTimeMode;
        const button = document.getElementById('real-time-toggle');
        const feed = document.getElementById('realtime-feed');

        if (!button || !feed) return;

        if (this.realTimeMode) {
            button.innerHTML = '<i class="fas fa-pause"></i> Real-time Monitoring';
            button.classList.add('btn-success');
            button.classList.remove('btn-info');
            feed.style.display = 'block';
            this.startRealTimeMonitoring();
            this.notificationManager.show('Real-time monitoring enabled', 'success');
        } else {
            button.innerHTML = '<i class="fas fa-play"></i> Real-time Monitoring';
            button.classList.add('btn-info');
            button.classList.remove('btn-success');
            feed.style.display = 'none';
            this.stopRealTimeMonitoring();
            this.notificationManager.show('Real-time monitoring disabled', 'info');
        }
    }

    startRealTimeMonitoring() {
        // Simulate real-time activity
        this.realTimeInterval = setInterval(() => {
            this.simulateNewActivity();
        }, 10000); // New activity every 10 seconds
    }

    stopRealTimeMonitoring() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
        }
    }

    simulateNewActivity() {
        const currentUser = this.dataManager.getCurrentUser?.() || { username: 'system' };
        const activities = [
            'Data Access', 'View Record', 'Generate Report', 'System Check', 'File Access'
        ];
        const targets = [
            'Dashboard', 'User Management', 'Royalty Records', 'Contracts', 'Settings'
        ];

        const newActivity = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: currentUser.username,
            action: activities[Math.floor(Math.random() * activities.length)],
            target: targets[Math.floor(Math.random() * targets.length)],
            ipAddress: '192.168.1.100',
            status: 'Success',
            severity: 'Info',
            details: 'Real-time activity simulation'
        };

        this.addRealtimeActivity(newActivity);
    }

    addRealtimeActivity(activity) {
        const feed = document.getElementById('realtime-activity-list');
        if (!feed) return;

        const activityElement = document.createElement('div');
        activityElement.className = 'realtime-activity-item';
        activityElement.innerHTML = `
            <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            <div class="activity-content">
                <strong>${activity.user}</strong> ${activity.action.toLowerCase()} ${activity.target}
                <span class="status-badge ${activity.status.toLowerCase()}">${activity.status}</span>
            </div>
        `;

        feed.insertBefore(activityElement, feed.firstChild);

        // Keep only last 10 activities
        while (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }

        // Animate new entry
        activityElement.style.opacity = '0';
        activityElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            activityElement.style.transition = 'all 0.3s ease';
            activityElement.style.opacity = '1';
            activityElement.style.transform = 'translateY(0)';
        }, 100);
    }

    toggleFilters() {
        const filtersSection = document.getElementById('audit-filters');
        const toggleBtn = document.getElementById('toggle-filters');
        
        if (filtersSection.style.display === 'none') {
            filtersSection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Filters';
        } else {
            filtersSection.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Filters';
        }
    }

    applyFilters() {
        const filters = {
            user: document.getElementById('filter-user')?.value || '',
            action: document.getElementById('filter-action')?.value || '',
            status: document.getElementById('filter-status')?.value || '',
            dateRange: document.getElementById('filter-date-range')?.value || '',
            ipAddress: document.getElementById('filter-ip')?.value || '',
            severity: document.getElementById('filter-severity')?.value || '',
            search: document.getElementById('filter-search')?.value || ''
        };

        this.filteredEntries = this.allEntries.filter(entry => {
            // User filter
            if (filters.user && entry.user !== filters.user) return false;
            
            // Action filter
            if (filters.action && entry.action !== filters.action) return false;
            
            // Status filter
            if (filters.status && entry.status !== filters.status) return false;
            
            // IP Address filter
            if (filters.ipAddress && !entry.ipAddress.includes(filters.ipAddress)) return false;
            
            // Severity filter
            if (filters.severity && entry.severity !== filters.severity) return false;
            
            // Search filter
            if (filters.search && !entry.details.toLowerCase().includes(filters.search.toLowerCase())) return false;
            
            // Date range filter
            if (filters.dateRange && !this.isWithinDateRange(entry.timestamp, filters.dateRange)) return false;
            
            return true;
        });

        this.currentPage = 1; // Reset to first page
        this.populateAuditTable();
        this.notificationManager.show(`Filters applied. Found ${this.filteredEntries.length} entries.`, 'info');
    }

    clearFilters() {
        // Clear all filter inputs
        document.getElementById('filter-user').value = '';
        document.getElementById('filter-action').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-date-range').value = '';
        document.getElementById('filter-ip').value = '';
        document.getElementById('filter-severity').value = '';
        document.getElementById('filter-search').value = '';

        // Reset filtered entries
        this.filteredEntries = [...this.allEntries];
        this.currentPage = 1;
        this.populateAuditTable();
        this.notificationManager.show('Filters cleared', 'info');
    }

    exportAuditLog() {
        this.notificationManager.show('Preparing audit log export...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show(`Successfully exported ${this.filteredEntries.length} audit entries to CSV`, 'success');
            
            // Add audit entry for export
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Export Audit Log',
                target: 'Audit Logs',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: `Exported ${this.filteredEntries.length} audit log entries`
            });
        }, 2000);
    }

    generateSecurityReport() {
        this.notificationManager.show('Generating comprehensive security report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Security report generated successfully', 'success');
            
            // Add audit entry for security report
            this.dataManager.addAuditEntry({
                user: 'currentUser',
                action: 'Generate Security Report',
                target: 'Security Audit',
                ipAddress: '192.168.1.100',
                status: 'Success',
                details: 'Generated comprehensive security and compliance report'
            });
        }, 3000);
    }

    filterAuditLogs(filters) {
        let logs = this.dataManager.getAuditLog();

        if (filters.user) {
            logs = logs.filter(log => log.user.toLowerCase().includes(filters.user.toLowerCase()));
        }

        if (filters.action) {
            logs = logs.filter(log => log.action.toLowerCase().includes(filters.action.toLowerCase()));
        }

        if (filters.severity) {
            logs = logs.filter(log => log.severity === filters.severity);
        }

        if (filters.dateFrom) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo));
        }

        return logs;
    }

    // Utility methods
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-GB');
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-GB');
    }

    getActionClass(action) {
        const classMap = {
            'Login': 'login',
            'Logout': 'logout',
            'Create User': 'create',
            'Modify User': 'modify',
            'Delete User': 'delete',
            'Data Access': 'access',
            'Failed Login': 'failed',
            'System Change': 'system',
            'Export Records': 'export',
            'Generate Report': 'report',
            'Backup Operation': 'backup'
        };
        return classMap[action] || 'default';
    }

    getActionIcon(action) {
        const iconMap = {
            'Login': 'sign-in-alt',
            'Logout': 'sign-out-alt',
            'Create User': 'user-plus',
            'Modify User': 'user-edit',
            'Delete User': 'user-minus',
            'Data Access': 'eye',
            'Failed Login': 'exclamation-triangle',
            'System Change': 'cogs',
            'Export Records': 'file-export',
            'Generate Report': 'chart-bar',
            'Backup Operation': 'hdd'
        };
        return iconMap[action] || 'circle';
    }

    getStatusIcon(status) {
        const iconMap = {
            'Success': 'check-circle',
            'Failed': 'times-circle',
            'Warning': 'exclamation-triangle',
            'Info': 'info-circle'
        };
        return iconMap[status] || 'circle';
    }

    getSeverityIcon(severity) {
        const iconMap = {
            'Critical': 'exclamation-circle',
            'High': 'exclamation-triangle',
            'Medium': 'exclamation',
            'Low': 'info-circle',
            'Info': 'info'
        };
        return iconMap[severity] || 'info';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    isWithinDateRange(timestamp, range) {
        const date = new Date(timestamp);
        const today = new Date();
        
        switch (range) {
            case 'today':
                return date.toDateString() === today.toDateString();
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return date.toDateString() === yesterday.toDateString();
            case 'last-7-days':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
            case 'last-30-days':
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                return date >= monthAgo;
            default:
                return true;
        }
    }

    updatePaginationInfo() {
        const totalEntries = this.filteredEntries.length;
        const startIndex = (this.currentPage - 1) * this.entriesPerPage + 1;
        const endIndex = Math.min(startIndex + this.entriesPerPage - 1, totalEntries);

        this.updateElement('audit-showing-start', startIndex);
        this.updateElement('audit-showing-end', endIndex);
        this.updateElement('audit-total-entries', totalEntries);

        // Update pagination buttons
        const prevBtn = document.getElementById('audit-prev-page');
        const nextBtn = document.getElementById('audit-next-page');
        const totalPages = Math.ceil(totalEntries / this.entriesPerPage);

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    selectAllEntries(checked) {
        const checkboxes = document.querySelectorAll('#audit-log-tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    closeModal() {
        const modal = document.getElementById('audit-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredEntries.sort((a, b) => {
            let aValue = a[column];
            let bValue = b[column];

            if (column === 'timestamp') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.populateAuditTable();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        // Clear all sort indicators
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.innerHTML = '';
        });

        // Set current sort indicator
        const currentHeader = document.querySelector(`[data-sort="${this.sortColumn}"] .sort-indicator`);
        if (currentHeader) {
            currentHeader.innerHTML = this.sortDirection === 'asc' ? 
                '<i class="fas fa-sort-up"></i>' : 
                '<i class="fas fa-sort-down"></i>';
        }
    }

    refreshAuditLog() {
        this.loadAuditData();
        this.updateMetrics();
        this.populateAuditTable();
        this.notificationManager.show('Audit log refreshed', 'success');
    }

    toggleAutoRefresh() {
        const button = document.getElementById('auto-refresh-toggle');
        
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
            button.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-refresh: OFF';
            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
        } else {
            this.autoRefreshInterval = setInterval(() => {
                this.refreshAuditLog();
            }, 30000); // Refresh every 30 seconds
            button.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-refresh: ON';
            button.classList.remove('btn-secondary');
            button.classList.add('btn-success');
        }
    }
}

// Audit Actions Handler
export class AuditActions {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
    }

    viewDetails(entryId) {
        // Implementation for viewing detailed audit entry
        this.notificationManager.show(`Viewing details for audit entry ${entryId}`, 'info');
    }

    investigate(entryId) {
        // Implementation for investigating audit entry
        this.notificationManager.show(`Starting investigation for entry ${entryId}`, 'warning');
    }

    flag(entryId) {
        // Implementation for flagging audit entry
        this.notificationManager.show(`Entry ${entryId} has been flagged for review`, 'warning');
    }

    viewLoginAttempts() {
        this.notificationManager.show('Filtering to show login attempts only', 'info');
    }

    viewUserActivity() {
        this.notificationManager.show('Showing user activity overview', 'info');
    }

    viewDataAccess() {
        this.notificationManager.show('Filtering to show data access events', 'info');
    }

    viewSystemChanges() {
        this.notificationManager.show('Showing system configuration changes', 'info');
    }

    viewFailedOperations() {
        this.notificationManager.show('Filtering to show failed operations only', 'warning');
    }

    generateComplianceReport() {
        this.notificationManager.show('Generating compliance audit report...', 'info');
        
        setTimeout(() => {
            this.notificationManager.show('Compliance report generated successfully', 'success');
        }, 2000);
    }
}
