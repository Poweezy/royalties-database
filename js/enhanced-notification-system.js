/**
 * Enhanced Notification System
 * Provides toast notifications and system alerts with persistent notification management
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Create notification system if it doesn't exist
    if (!window.NotificationSystem) {
        window.NotificationSystem = {
            container: null,
            notifications: [],
            persistentNotifications: [],
            unreadCount: 0,
            soundEnabled: true,
            animationDuration: 300,
            autoHideDelay: 5000,
            maxToastNotifications: 5,
            
            // Initialize the notification system
            init: function() {
                if (this.container) return; // Already initialized
                
                // Create notification container
                this.container = document.createElement('div');
                this.container.id = 'notification-container';
                this.container.className = 'notification-container enhanced-notifications';
                this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    pointer-events: none;
                `;
                
                document.body.appendChild(this.container);
                
                // Create sound elements for different notification types
                this.createSoundElements();
                
                // Load persistent notifications from localStorage
                this.loadPersistentNotifications();
                
                // Initialize notification count
                this.updateNotificationCount();
                
                // Set up real-time simulation
                this.startRealTimeSimulation();
                
                console.log('NotificationSystem: Enhanced v2.0.0 initialized with advanced features');
            },
            
            // Create sound elements for notifications
            createSoundElements: function() {
                this.sounds = {
                    success: this.createAudioElement('data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBxWJ0/LUgTAIHWm+8+OUQgsYTqPl8bNiGgg5jtT01YI0ChtpvfPnlkUNGkum5fGzYRkJOY7U9NaFNQsaab3z5ZNFD'),
                    error: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBxWJ0/LUgTAIHWm+8+OUQgsYTqPl8bNiGgg5jtT01YI0ChtpvfPnlkUNGkum5fGzYRkJOY7U9NaFNQsaab3z5ZNFD'),
                    warning: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBxWJ0/LUgTAIHWm+8+OUQgsYTqPl8bNiGgg5jtT01YI0ChtpvfPnlkUNGkum5fGzYRkJOY7U9NaFNQsaab3z5ZNFD'),
                    info: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBxWJ0/LUgTAIHWm+8+OUQgsYTqPl8bNiGgg5jtT01YI0ChtpvfPnlkUNGkum5fGzYRkJOY7U9NaFNQsaab3z5ZNFD')
                };
            },
            
            // Create audio element helper
            createAudioElement: function(src) {
                const audio = document.createElement('audio');
                audio.src = src;
                audio.preload = 'auto';
                audio.volume = 0.3;
                return audio;
            },
            
            // Play notification sound
            playSound: function(type) {
                if (!this.soundEnabled || !this.sounds[type]) return;
                
                try {
                    this.sounds[type].currentTime = 0;
                    this.sounds[type].play().catch(e => {
                        // Silently handle audio play errors (e.g., user hasn't interacted with page)
                    });
                } catch (error) {
                    // Silently handle audio errors
                }
            },
            
            // Start real-time notification simulation
            startRealTimeSimulation: function() {
                // Simulate real-time notifications every 30-60 seconds
                setInterval(() => {
                    if (Math.random() < 0.3) { // 30% chance every interval
                        this.simulateRealTimeNotification();
                    }
                }, 45000); // Every 45 seconds
            },
            
            // Simulate real-time notifications
            simulateRealTimeNotification: function() {
                const notifications = [
                    {
                        type: 'info',
                        title: 'System Update',
                        message: 'Mining compliance data has been synchronized',
                        category: 'system'
                    },
                    {
                        type: 'warning',
                        title: 'Payment Reminder',
                        message: 'ROY-2024-007 payment due in 3 days',
                        category: 'payment'
                    },
                    {
                        type: 'success',
                        title: 'Document Approved',
                        message: 'Environmental impact report has been approved',
                        category: 'compliance'
                    },
                    {
                        type: 'info',
                        title: 'Contract Update',
                        message: 'Mbabane Quarry contract terms updated',
                        category: 'contract'
                    }
                ];
                
                const notification = notifications[Math.floor(Math.random() * notifications.length)];
                this.show(notification.type, notification.title, notification.message, {
                    persistent: true,
                    category: notification.category
                });
            },
            
            // Initialize the notification system
            init: function() {
                if (this.container) return; // Already initialized
                
                // Create notification container
                this.container = document.createElement('div');
                this.container.id = 'notification-container';
                this.container.className = 'notification-container';
                this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                `;
                
                document.body.appendChild(this.container);
                
                // Load persistent notifications from localStorage
                this.loadPersistentNotifications();
                
                // Initialize notification count
                this.updateNotificationCount();
                
                console.log('NotificationSystem: Initialized with persistent notification management');
            },
            
            // Load persistent notifications from localStorage
            loadPersistentNotifications: function() {
                try {
                    const stored = localStorage.getItem('persistentNotifications');
                    if (stored) {
                        this.persistentNotifications = JSON.parse(stored);
                        this.calculateUnreadCount();
                        
                        // Clean up old notifications (older than 30 days)
                        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                        this.persistentNotifications = this.persistentNotifications.filter(n => 
                            n.timestamp > thirtyDaysAgo
                        );
                        this.savePersistentNotifications();
                    } else {
                        this.initializeDefaultNotifications();
                    }
                } catch (error) {
                    console.warn('NotificationSystem: Failed to load persistent notifications:', error);
                    this.initializeDefaultNotifications();
                }
            },
            
            // Initialize with default notifications
            initializeDefaultNotifications: function() {
                this.persistentNotifications = [
                    {
                        id: 1,
                        type: 'error',
                        title: 'Critical: Payment Overdue - Mbabane Quarry',
                        message: 'Payment for ROY-2024-004 is 5 days overdue. Immediate action required.',
                        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                        isRead: false,
                        category: 'payment',
                        priority: 'urgent',
                        actions: [
                            { label: 'View Payment', action: 'view-payment', icon: 'fas fa-eye' },
                            { label: 'Send Final Notice', action: 'final-notice', icon: 'fas fa-exclamation-triangle' }
                        ]
                    },
                    {
                        id: 2,
                        type: 'warning',
                        title: 'Contract Renewal Due - Kwalini Mining',
                        message: 'Contract LC-2024-002 expires in 15 days. Schedule renewal meeting.',
                        timestamp: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
                        isRead: false,
                        category: 'contract',
                        priority: 'high',
                        actions: [
                            { label: 'View Contract', action: 'view-contract', icon: 'fas fa-file-contract' },
                            { label: 'Schedule Meeting', action: 'schedule-meeting', icon: 'fas fa-calendar-plus' }
                        ]
                    },
                    {
                        id: 3,
                        type: 'info',
                        title: 'Environmental Report Submitted',
                        message: 'Quarterly environmental impact report received from Sidvokodvo Quarry.',
                        timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
                        isRead: false,
                        category: 'compliance',
                        priority: 'normal',
                        actions: [
                            { label: 'Review Report', action: 'review-report', icon: 'fas fa-search' },
                            { label: 'Download PDF', action: 'download-pdf', icon: 'fas fa-download' }
                        ]
                    },
                    {
                        id: 4,
                        type: 'success',
                        title: 'Payment Processed Successfully',
                        message: 'ROY-2024-005 payment of E150,000 received from Lobamba Stone Works.',
                        timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
                        isRead: true,
                        category: 'payment',
                        priority: 'normal',
                        actions: [
                            { label: 'View Receipt', action: 'view-receipt', icon: 'fas fa-receipt' },
                            { label: 'Send Confirmation', action: 'send-confirmation', icon: 'fas fa-check-circle' }
                        ]
                    },
                    {
                        id: 5,
                        type: 'info',
                        title: 'System Maintenance Scheduled',
                        message: 'Routine system maintenance scheduled for tonight 11 PM - 2 AM.',
                        timestamp: Date.now() - (18 * 60 * 60 * 1000), // 18 hours ago
                        isRead: true,
                        category: 'system',
                        priority: 'normal',
                        actions: [
                            { label: 'View Schedule', action: 'view-schedule', icon: 'fas fa-clock' }
                        ]
                    }
                ];
                this.savePersistentNotifications();
                this.calculateUnreadCount();
            },
            
            // Save persistent notifications to localStorage
            savePersistentNotifications: function() {
                try {
                    localStorage.setItem('persistentNotifications', JSON.stringify(this.persistentNotifications));
                } catch (error) {
                    console.warn('NotificationSystem: Failed to save persistent notifications:', error);
                }
            },
            
            // Calculate unread count
            calculateUnreadCount: function() {
                this.unreadCount = this.persistentNotifications.filter(n => !n.isRead).length;
            },
            
            // Update notification count in sidebar
            updateNotificationCount: function() {
                const countElement = document.getElementById('notification-count');
                if (countElement) {
                    countElement.textContent = this.unreadCount;
                    countElement.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
                    
                    // Add pulse animation for new notifications
                    if (this.unreadCount > 0) {
                        countElement.style.animation = 'pulse 1s ease-in-out 3';
                    }
                } else {
                    // If notification-count element doesn't exist, create it temporarily for diagnostic
                    console.log(`📊 Notification count: ${this.unreadCount} (element not found in DOM)`);
                }
                
                // Update dashboard stats
                this.updateDashboardStats();
            },
            
            updateDashboardStats: function() {
                // Update various stats elements
                const urgentCount = document.getElementById('urgent-count');
                const unreadCountEl = document.getElementById('unread-count');
                const totalTodayEl = document.getElementById('total-today-count');
                
                if (urgentCount) {
                    const urgent = this.persistentNotifications.filter(n => 
                        !n.isRead && n.priority === 'urgent'
                    ).length;
                    urgentCount.textContent = urgent;
                }
                
                if (unreadCountEl) {
                    unreadCountEl.textContent = this.unreadCount;
                }
                
                if (totalTodayEl) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const todayCount = this.persistentNotifications.filter(n => 
                        n.timestamp >= todayStart.getTime()
                    ).length;
                    totalTodayEl.textContent = todayCount;
                }
            },
            
            // Add a persistent notification
            addPersistentNotification: function(type, title, message, category = 'general', priority = 'normal') {
                const notification = {
                    id: Date.now() + Math.random(),
                    type: type,
                    title: title,
                    message: message,
                    timestamp: Date.now(),
                    isRead: false,
                    category: category,
                    priority: priority,
                    actions: this.generateNotificationActions(type, category)
                };
                
                this.persistentNotifications.unshift(notification);
                this.savePersistentNotifications();
                this.calculateUnreadCount();
                this.updateNotificationCount();
                
                // Trigger real-time update for notification center
                this.triggerNotificationCenterUpdate();
                
                // Also show as toast
                this.show(`${title}: ${message}`, type, 5000);
                
                return notification.id;
            },
            
            // Generate contextual actions for notifications
            generateNotificationActions: function(type, category) {
                const actions = [];
                
                switch (category) {
                    case 'payment':
                        actions.push(
                            { label: 'View Payment', action: 'view-payment', icon: 'fas fa-eye' },
                            { label: 'Send Reminder', action: 'send-reminder', icon: 'fas fa-paper-plane' }
                        );
                        break;
                    case 'contract':
                        actions.push(
                            { label: 'View Contract', action: 'view-contract', icon: 'fas fa-file-contract' },
                            { label: 'Schedule Review', action: 'schedule-review', icon: 'fas fa-calendar' }
                        );
                        break;
                    case 'compliance':
                        actions.push(
                            { label: 'View Report', action: 'view-report', icon: 'fas fa-file-alt' },
                            { label: 'Download Certificate', action: 'download-cert', icon: 'fas fa-download' }
                        );
                        break;
                    case 'system':
                        actions.push(
                            { label: 'View Details', action: 'view-details', icon: 'fas fa-info-circle' }
                        );
                        break;
                }
                
                return actions;
            },
            
            // Trigger notification center update
            triggerNotificationCenterUpdate: function() {
                const event = new CustomEvent('notificationUpdate', {
                    detail: {
                        notifications: this.persistentNotifications,
                        unreadCount: this.unreadCount
                    }
                });
                document.dispatchEvent(event);
            },
            
            // Core show method for displaying notifications
            show: function(message, type = 'info', duration, options = {}) {
                if (!this.container) {
                    this.init();
                }
                
                // Generate unique ID
                const id = Date.now() + Math.random();
                
                // Determine duration
                const notificationDuration = duration || this.autoHideDelay;
                
                // Create notification element
                const notification = this.createToastNotification(id, message, type, notificationDuration);
                
                // Add to container
                this.container.appendChild(notification);
                
                // Add to tracking array
                this.notifications.push({
                    id: id,
                    element: notification,
                    type: type,
                    message: message,
                    timestamp: Date.now()
                });
                
                // Play sound
                this.playSound(type);
                
                // Auto-hide if duration is set
                if (notificationDuration > 0) {
                    setTimeout(() => {
                        this.hide(id);
                    }, notificationDuration);
                }
                
                // Add to persistent notifications if specified
                if (options.persistent) {
                    this.addPersistentNotification({
                        type: type,
                        title: options.title || 'Notification',
                        message: message,
                        category: options.category || 'system',
                        priority: options.priority || 'normal',
                        actions: options.actions || []
                    });
                }
                
                // Limit number of toast notifications
                this.limitToastNotifications();
                
                return id;
            },
            
            // Create toast notification element
            createToastNotification: function(id, message, type, duration) {
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.setAttribute('data-id', id);
                notification.style.cssText = `
                    background: var(--notification-${type}-bg, #f8f9fa);
                    border-left: 4px solid var(--notification-${type}-border, #007bff);
                    color: var(--notification-${type}-color, #333);
                    padding: 16px 20px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    position: relative;
                    pointer-events: auto;
                    animation: bounceIn 0.3s ease-out;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                `;
                
                // Set type-specific colors
                const colors = {
                    success: { bg: 'rgba(212, 237, 218, 0.9)', border: '#28a745', color: '#155724' },
                    error: { bg: 'rgba(248, 215, 218, 0.9)', border: '#dc3545', color: '#721c24' },
                    warning: { bg: 'rgba(255, 243, 205, 0.9)', border: '#ffc107', color: '#856404' },
                    info: { bg: 'rgba(209, 236, 241, 0.9)', border: '#17a2b8', color: '#0c5460' }
                };
                
                if (colors[type]) {
                    notification.style.background = colors[type].bg;
                    notification.style.borderLeftColor = colors[type].border;
                    notification.style.color = colors[type].color;
                }
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: inherit;
                    opacity: 0.6;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                closeBtn.onclick = () => this.hide(id);
                
                // Add message
                const messageEl = document.createElement('div');
                messageEl.textContent = message;
                messageEl.style.paddingRight = '30px';
                
                notification.appendChild(messageEl);
                notification.appendChild(closeBtn);
                
                return notification;
            },
            
            // Limit the number of toast notifications
            limitToastNotifications: function() {
                while (this.notifications.length > this.maxToastNotifications) {
                    const oldest = this.notifications.shift();
                    if (oldest && oldest.element && oldest.element.parentNode) {
                        oldest.element.parentNode.removeChild(oldest.element);
                    }
                }
            },

            // Initialize the notification system
            init: function() {
                if (this.container) return; // Already initialized
                
                // Create notification container
                this.container = document.createElement('div');
                this.container.id = 'notification-container';
                this.container.className = 'notification-container';
                this.container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                `;
                
                document.body.appendChild(this.container);
                
                // Load persistent notifications from localStorage
                this.loadPersistentNotifications();
                
                // Initialize notification count
                this.updateNotificationCount();
                
                console.log('NotificationSystem: Initialized with persistent notification management');
            },
            
            // Load persistent notifications from localStorage
            loadPersistentNotifications: function() {
                try {
                    const stored = localStorage.getItem('persistentNotifications');
                    if (stored) {
                        this.persistentNotifications = JSON.parse(stored);
                        this.calculateUnreadCount();
                        
                        // Clean up old notifications (older than 30 days)
                        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                        this.persistentNotifications = this.persistentNotifications.filter(n => 
                            n.timestamp > thirtyDaysAgo
                        );
                        this.savePersistentNotifications();
                    } else {
                        this.initializeDefaultNotifications();
                    }
                } catch (error) {
                    console.warn('NotificationSystem: Failed to load persistent notifications:', error);
                    this.initializeDefaultNotifications();
                }
            },
            
            // Initialize with default notifications
            initializeDefaultNotifications: function() {
                this.persistentNotifications = [
                    {
                        id: 1,
                        type: 'error',
                        title: 'Critical: Payment Overdue - Mbabane Quarry',
                        message: 'Payment for ROY-2024-004 is 5 days overdue. Immediate action required.',
                        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                        isRead: false,
                        category: 'payment',
                        priority: 'urgent',
                        actions: [
                            { label: 'View Payment', action: 'view-payment', icon: 'fas fa-eye' },
                            { label: 'Send Final Notice', action: 'final-notice', icon: 'fas fa-exclamation-triangle' }
                        ]
                    },
                    {
                        id: 2,
                        type: 'warning',
                        title: 'Contract Renewal Due - Kwalini Mining',
                        message: 'Contract LC-2024-002 expires in 15 days. Schedule renewal meeting.',
                        timestamp: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
                        isRead: false,
                        category: 'contract',
                        priority: 'high',
                        actions: [
                            { label: 'View Contract', action: 'view-contract', icon: 'fas fa-file-contract' },
                            { label: 'Schedule Meeting', action: 'schedule-meeting', icon: 'fas fa-calendar-plus' }
                        ]
                    },
                    {
                        id: 3,
                        type: 'info',
                        title: 'Environmental Report Submitted',
                        message: 'Quarterly environmental impact report received from Sidvokodvo Quarry.',
                        timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
                        isRead: false,
                        category: 'compliance',
                        priority: 'normal',
                        actions: [
                            { label: 'Review Report', action: 'review-report', icon: 'fas fa-search' },
                            { label: 'Download PDF', action: 'download-pdf', icon: 'fas fa-download' }
                        ]
                    },
                    {
                        id: 4,
                        type: 'success',
                        title: 'Payment Processed Successfully',
                        message: 'ROY-2024-005 payment of E150,000 received from Lobamba Stone Works.',
                        timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
                        isRead: true,
                        category: 'payment',
                        priority: 'normal',
                        actions: [
                            { label: 'View Receipt', action: 'view-receipt', icon: 'fas fa-receipt' },
                            { label: 'Send Confirmation', action: 'send-confirmation', icon: 'fas fa-check-circle' }
                        ]
                    },
                    {
                        id: 5,
                        type: 'info',
                        title: 'System Maintenance Scheduled',
                        message: 'Routine system maintenance scheduled for tonight 11 PM - 2 AM.',
                        timestamp: Date.now() - (18 * 60 * 60 * 1000), // 18 hours ago
                        isRead: true,
                        category: 'system',
                        priority: 'normal',
                        actions: [
                            { label: 'View Schedule', action: 'view-schedule', icon: 'fas fa-clock' }
                        ]
                    }
                ];
                this.savePersistentNotifications();
                this.calculateUnreadCount();
            },
            
            // Save persistent notifications to localStorage
            savePersistentNotifications: function() {
                try {
                    localStorage.setItem('persistentNotifications', JSON.stringify(this.persistentNotifications));
                } catch (error) {
                    console.warn('NotificationSystem: Failed to save persistent notifications:', error);
                }
            },
            
            // Calculate unread count
            calculateUnreadCount: function() {
                this.unreadCount = this.persistentNotifications.filter(n => !n.isRead).length;
            },
            
            // Update notification count in sidebar
            updateNotificationCount: function() {
                const countElement = document.getElementById('notification-count');
                if (countElement) {
                    countElement.textContent = this.unreadCount;
                    countElement.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
                    
                    // Add pulse animation for new notifications
                    if (this.unreadCount > 0) {
                        countElement.style.animation = 'pulse 1s ease-in-out 3';
                    }
                } else {
                    // If notification-count element doesn't exist, create it temporarily for diagnostic
                    console.log(`📊 Notification count: ${this.unreadCount} (element not found in DOM)`);
                }
                
                // Update dashboard stats
                this.updateDashboardStats();
            },
            
            updateDashboardStats: function() {
                // Update various stats elements
                const urgentCount = document.getElementById('urgent-count');
                const unreadCountEl = document.getElementById('unread-count');
                const totalTodayEl = document.getElementById('total-today-count');
                
                if (urgentCount) {
                    const urgent = this.persistentNotifications.filter(n => 
                        !n.isRead && n.priority === 'urgent'
                    ).length;
                    urgentCount.textContent = urgent;
                }
                
                if (unreadCountEl) {
                    unreadCountEl.textContent = this.unreadCount;
                }
                
                if (totalTodayEl) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const todayCount = this.persistentNotifications.filter(n => 
                        n.timestamp >= todayStart.getTime()
                    ).length;
                    totalTodayEl.textContent = todayCount;
                }
            },
            
            // Add a persistent notification
            addPersistentNotification: function(type, title, message, category = 'general', priority = 'normal') {
                const notification = {
                    id: Date.now() + Math.random(),
                    type: type,
                    title: title,
                    message: message,
                    timestamp: Date.now(),
                    isRead: false,
                    category: category,
                    priority: priority,
                    actions: this.generateNotificationActions(type, category)
                };
                
                this.persistentNotifications.unshift(notification);
                this.savePersistentNotifications();
                this.calculateUnreadCount();
                this.updateNotificationCount();
                
                // Trigger real-time update for notification center
                this.triggerNotificationCenterUpdate();
                
                // Also show as toast
                this.show(`${title}: ${message}`, type, 5000);
                
                return notification.id;
            },
            
            // Generate contextual actions for notifications
            generateNotificationActions: function(type, category) {
                const actions = [];
                
                switch (category) {
                    case 'payment':
                        actions.push(
                            { label: 'View Payment', action: 'view-payment', icon: 'fas fa-eye' },
                            { label: 'Send Reminder', action: 'send-reminder', icon: 'fas fa-paper-plane' }
                        );
                        break;
                    case 'contract':
                        actions.push(
                            { label: 'View Contract', action: 'view-contract', icon: 'fas fa-file-contract' },
                            { label: 'Schedule Review', action: 'schedule-review', icon: 'fas fa-calendar' }
                        );
                        break;
                    case 'compliance':
                        actions.push(
                            { label: 'View Report', action: 'view-report', icon: 'fas fa-file-alt' },
                            { label: 'Download Certificate', action: 'download-cert', icon: 'fas fa-download' }
                        );
                        break;
                    case 'system':
                        actions.push(
                            { label: 'View Details', action: 'view-details', icon: 'fas fa-info-circle' }
                        );
                        break;
                }
                
                return actions;
            },
            
            // Trigger notification center update
            triggerNotificationCenterUpdate: function() {
                const event = new CustomEvent('notificationUpdate', {
                    detail: {
                        notifications: this.persistentNotifications,
                        unreadCount: this.unreadCount
                    }
                });
                document.dispatchEvent(event);
            },
            
            // Enhanced hide method with smooth animations
            hide: function(id) {
                const notificationIndex = this.notifications.findIndex(n => n.id === id);
                if (notificationIndex === -1) return;
                
                const notification = this.notifications[notificationIndex];
                const element = notification.element;
                
                // Animate out
                element.style.transform = 'translateX(100%)';
                element.style.opacity = '0';
                
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                    this.notifications.splice(notificationIndex, 1);
                }, this.animationDuration);
            },
            
            // Clean up excess notifications
            cleanupExcessNotifications: function() {
                while (this.notifications.length > this.maxToastNotifications) {
                    const oldestNotification = this.notifications[0];
                    this.hide(oldestNotification.id);
                }
            },
            
            // Hide all notifications
            hideAll: function() {
                const notificationIds = this.notifications.map(n => n.id);
                notificationIds.forEach(id => this.hide(id));
            },
            
            // Mark notification as read
            markAsRead: function(notificationId) {
                const notification = this.persistentNotifications.find(n => n.id === notificationId);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                }
            },
            
            // Mark all notifications as read
            markAllAsRead: function() {
                let hasChanges = false;
                this.persistentNotifications.forEach(notification => {
                    if (!notification.isRead) {
                        notification.isRead = true;
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                    this.triggerNotificationCenterUpdate();
                }
            },
            
            deleteNotification: function(id) {
                const index = this.persistentNotifications.findIndex(n => n.id === id);
                if (index !== -1) {
                    this.persistentNotifications.splice(index, 1);
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                    this.triggerNotificationCenterUpdate();
                }
            },
            
            // Alias for deleteNotification to match component expectations
            removePersistentNotification: function(id) {
                return this.deleteNotification(id);
            },
            
            // Bulk operations
            bulkMarkAsRead: function(ids) {
                let hasChanges = false;
                ids.forEach(id => {
                    const notification = this.persistentNotifications.find(n => n.id === id);
                    if (notification && !notification.isRead) {
                        notification.isRead = true;
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                    this.triggerNotificationCenterUpdate();
                }
            },
            
            bulkDelete: function(ids) {
                let hasChanges = false;
                ids.forEach(id => {
                    const index = this.persistentNotifications.findIndex(n => n.id === id);
                    if (index !== -1) {
                        this.persistentNotifications.splice(index, 1);
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                    this.triggerNotificationCenterUpdate();
                }
            },
            
            // Filter and search methods
            getPersistentNotifications: function() {
                return this.persistentNotifications || [];
            },
            
            getNotificationsByCategory: function(category) {
                return this.persistentNotifications.filter(n => n.category === category);
            },
            
            getNotificationsByType: function(type) {
                return this.persistentNotifications.filter(n => n.type === type);
            },
            
            getUnreadNotifications: function() {
                return this.persistentNotifications.filter(n => !n.isRead);
            },
            
            searchNotifications: function(query) {
                const lowercaseQuery = query.toLowerCase();
                return this.persistentNotifications.filter(n => 
                    n.title.toLowerCase().includes(lowercaseQuery) ||
                    n.message.toLowerCase().includes(lowercaseQuery)
                );
            },
            
            // Settings and preferences
            toggleSound: function() {
                this.soundEnabled = !this.soundEnabled;
                localStorage.setItem('notificationSoundEnabled', this.soundEnabled);
                return this.soundEnabled;
            },
            
            // Enhanced update methods
            updateNotificationCount: function() {
                const countElement = document.getElementById('notification-count');
                if (countElement) {
                    countElement.textContent = this.unreadCount;
                    countElement.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
                    
                    // Add pulse animation for new notifications
                    if (this.unreadCount > 0) {
                        countElement.style.animation = 'pulse 1s ease-in-out 3';
                    }
                }
                
                // Update dashboard stats
                this.updateDashboardStats();
            },
            
            updateDashboardStats: function() {
                // Update various stats elements
                const urgentCount = document.getElementById('urgent-count');
                const unreadCountEl = document.getElementById('unread-count');
                const totalTodayEl = document.getElementById('total-today-count');
                
                if (urgentCount) {
                    const urgent = this.persistentNotifications.filter(n => 
                        !n.isRead && n.priority === 'urgent'
                    ).length;
                    urgentCount.textContent = urgent;
                }
                
                if (unreadCountEl) {
                    unreadCountEl.textContent = this.unreadCount;
                }
                
                if (totalTodayEl) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const todayCount = this.persistentNotifications.filter(n => 
                        n.timestamp >= todayStart.getTime()
                    ).length;
                    totalTodayEl.textContent = todayCount;
                }
            },
            
            // Convenience methods
            success: function(message, duration) {
                return this.show(message, 'success', duration);
            },
            
            error: function(message, duration) {
                return this.show(message, 'error', duration);
            },
            
            warning: function(message, duration) {
                return this.show(message, 'warning', duration);
            },
            
            info: function(message, duration) {
                return this.show(message, 'info', duration);
            }
        };
        
        // Auto-initialize when DOM is ready
        function initializeNotificationSystem() {
            try {
                window.NotificationSystem.init();
                
                // Make notification system globally accessible as notificationManager
                window.notificationManager = window.NotificationSystem;
                console.log('✅ Enhanced Notification System: notificationManager available globally');
                
                // Force immediate availability
                window.dispatchEvent(new CustomEvent('notificationSystemReady', {
                    detail: { manager: window.notificationManager }
                }));
            } catch (error) {
                console.error('❌ Failed to initialize notification system:', error);
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeNotificationSystem);
        } else {
            initializeNotificationSystem();
        }
        
        // Also ensure immediate availability for diagnostic tools
        setTimeout(() => {
            if (!window.notificationManager && window.NotificationSystem) {
                window.notificationManager = window.NotificationSystem;
                console.log('✅ Enhanced Notification System: Backup initialization completed');
            }
        }, 100);
        
        console.log('Enhanced Notification System: Loaded');
    }
    
    // Add CSS animations if not already present
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                0% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes progressShrink {
                0% { transform: scaleX(1); }
                100% { transform: scaleX(0); }
            }
            
            .notification-container.enhanced-notifications {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .enhanced-toast {
                cursor: pointer;
                user-select: none;
            }
            
            .enhanced-toast:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
            }
            
            .priority-urgent {
                border-left: 4px solid #dc2626 !important;
            }
            
            .priority-high {
                border-left: 4px solid #f59e0b !important;
            }
        `;
        document.head.appendChild(style);
    }
})();
