/**
 * Enhanced Notification System
 * Provides toast notifications and system alerts with persistent notification management
 * @version 1.0.3
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
                    } else {
                        // Initialize with some default notifications
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
                        type: 'warning',
                        title: 'Payment Overdue - Mbabane Quarry',
                        message: 'Payment for ROY-2024-004 is 5 days overdue',
                        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                        isRead: false,
                        category: 'payment'
                    },
                    {
                        id: 2,
                        type: 'info',
                        title: 'Contract Renewal Due',
                        message: 'Contract LC-2024-002 expires in 30 days',
                        timestamp: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
                        isRead: false,
                        category: 'contract'
                    },
                    {
                        id: 3,
                        type: 'success',
                        title: 'Payment Received',
                        message: 'Kwalini Quarry payment processed successfully',
                        timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
                        isRead: true,
                        category: 'payment'
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
                    countElement.style.display = this.unreadCount > 0 ? 'inline' : 'none';
                }
                
                // Update notification summary if visible
                this.updateNotificationSummary();
            },
            
            // Update notification summary in notifications page
            updateNotificationSummary: function() {
                const unreadCountEl = document.querySelector('.stat-number.text-warning');
                const totalTodayEl = document.querySelector('.stat-number.text-success');
                
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
            addPersistentNotification: function(type, title, message, category = 'general') {
                const notification = {
                    id: Date.now(),
                    type: type,
                    title: title,
                    message: message,
                    timestamp: Date.now(),
                    isRead: false,
                    category: category
                };
                
                this.persistentNotifications.unshift(notification);
                this.savePersistentNotifications();
                this.calculateUnreadCount();
                this.updateNotificationCount();
                
                // Also show as toast
                this.show(`${title}: ${message}`, type, 5000);
                
                return notification;
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
                this.persistentNotifications.forEach(n => n.isRead = true);
                this.savePersistentNotifications();
                this.calculateUnreadCount();
                this.updateNotificationCount();
                this.show('All notifications marked as read', 'success', 3000);
            },
            
            // Get persistent notifications
            getPersistentNotifications: function() {
                return [...this.persistentNotifications];
            },
            
            // Get unread notifications
            getUnreadNotifications: function() {
                return this.persistentNotifications.filter(n => !n.isRead);
            },
            
            // Remove persistent notification
            removePersistentNotification: function(notificationId) {
                const index = this.persistentNotifications.findIndex(n => n.id === notificationId);
                if (index > -1) {
                    this.persistentNotifications.splice(index, 1);
                    this.savePersistentNotifications();
                    this.calculateUnreadCount();
                    this.updateNotificationCount();
                }
            },
            
            // Show a notification
            show: function(message, type = 'info', duration = 5000) {
                this.init(); // Ensure initialized
                
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.style.cssText = `
                    background: ${this.getBackgroundColor(type)};
                    color: white;
                    padding: 12px 16px;
                    margin-bottom: 10px;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                `;
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span>${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: none; border: none; color: inherit; 
                            cursor: pointer; margin-left: 12px; font-size: 16px;
                        ">&times;</button>
                    </div>
                `;
                
                this.container.appendChild(notification);
                this.notifications.push(notification);
                
                // Animate in
                setTimeout(() => {
                    notification.style.transform = 'translateX(0)';
                }, 10);
                
                // Auto-remove after duration
                if (duration > 0) {
                    setTimeout(() => {
                        this.remove(notification);
                    }, duration);
                }
                
                return notification;
            },
            
            // Remove a notification
            remove: function(notification) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    const index = this.notifications.indexOf(notification);
                    if (index > -1) {
                        this.notifications.splice(index, 1);
                    }
                }, 300);
            },
            
            // Get background color for notification type
            getBackgroundColor: function(type) {
                const colors = {
                    'success': '#10b981',
                    'error': '#ef4444',
                    'warning': '#f59e0b',
                    'info': '#3b82f6'
                };
                return colors[type] || colors.info;
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                window.NotificationSystem.init();
                
                // Make notification system globally accessible as notificationManager
                window.notificationManager = window.NotificationSystem;
                console.log('✅ Enhanced Notification System: notificationManager available globally');
            });
        } else {
            window.NotificationSystem.init();
            
            // Make notification system globally accessible as notificationManager
            window.notificationManager = window.NotificationSystem;
            console.log('✅ Enhanced Notification System: notificationManager available globally');
        }
        
        console.log('Enhanced Notification System: Loaded');
    }
})();
