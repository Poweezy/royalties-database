/**
 * Enhanced Notification System
 * Provides toast notifications and system alerts
 * @version 1.0.2
 */

(function() {
    'use strict';
    
    // Create notification system if it doesn't exist
    if (!window.NotificationSystem) {
        window.NotificationSystem = {
            container: null,
            notifications: [],
            
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
                console.log('NotificationSystem: Initialized');
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
