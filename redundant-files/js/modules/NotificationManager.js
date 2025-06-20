/**
 * NotificationManager Module
 * Handles all application notifications and alerts
 */
export class NotificationManager {
  constructor() {
    this.notifications = [
      {
        id: 1,
        title: 'Payment Overdue',
        message: 'Maloma Colliery payment is 15 days overdue',
        type: 'critical',
        category: 'payment',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        actions: ['Take Action', 'Dismiss']
      },
      {
        id: 2,
        title: 'Contract Renewal Due',
        message: "Pigg's Peak Quarry license expires in 60 days",
        type: 'high',
        category: 'compliance',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        actions: ['Start Renewal', 'Remind Later']
      },
      {
        id: 3,
        title: 'Compliance Review Completed',
        message: 'Environmental compliance review for Ngwenya Mine completed',
        type: 'info',
        category: 'compliance',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        actions: []
      }
    ];
    this.nextId = 4;
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
  }

  async init() {
    console.log('NotificationManager: Initializing...');
    this.createNotificationContainer();
    console.log('NotificationManager: Initialized successfully');
  }

  createNotificationContainer() {
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }
  }

  show(message, type = 'info', duration = this.defaultDuration) {
    const notification = this.createNotification(message, type, duration);
    this.addNotification(notification);
    return notification.id;
  }

  createNotification(message, type, duration) {
    const id = 'notification-' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    const notification = {
      id,
      message,
      type,
      duration,
      element: this.createNotificationElement(id, message, type),
      timeout: null
    };

    if (duration > 0) {
      notification.timeout = setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return notification;
  }

  createNotificationElement(id, message, type) {
    const element = document.createElement('div');
    element.id = id;
    element.className = `notification notification-${type}`;
    
    const icon = this.getIcon(type);
    
    element.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${icon}"></i>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close" aria-label="Close notification">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add styles
    element.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: ${this.getBackgroundColor(type)};
      color: ${this.getTextColor(type)};
      border-left: 4px solid ${this.getBorderColor(type)};
      animation: slideIn 0.3s ease-out;
    `;

    // Add close functionality
    const closeBtn = element.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(id));
    
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      margin-left: 12px;
      opacity: 0.7;
    `;

    return element;
  }

  getIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || icons.info;
  }

  getBackgroundColor(type) {
    const colors = {
      success: '#d4edda',
      error: '#f8d7da',
      warning: '#fff3cd',
      info: '#d1ecf1'
    };
    return colors[type] || colors.info;
  }

  getTextColor(type) {
    const colors = {
      success: '#155724',
      error: '#721c24',
      warning: '#856404',
      info: '#0c5460'
    };
    return colors[type] || colors.info;
  }

  getBorderColor(type) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colors[type] || colors.info;
  }

  addNotification(notification) {
    // Remove oldest notification if at max capacity
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.removeElement(oldest);
    }

    this.notifications.push(notification);
    
    const container = document.getElementById('notification-container');
    if (container) {
      container.appendChild(notification.element);
    }
  }

  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      this.removeElement(notification);
      this.notifications.splice(index, 1);
    }
  }

  removeElement(notification) {
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }
    
    if (notification.element && notification.element.parentNode) {
      notification.element.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
      }, 300);
    }
  }

  clear() {
    this.notifications.forEach(notification => {
      this.removeElement(notification);
    });
    this.notifications = [];
  }

  // Convenience methods
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  getAllNotifications() {
    return this.notifications.sort((a, b) => b.createdAt - a.createdAt);
  }

  getUnreadNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  getNotificationsByCategory(category) {
    return this.notifications.filter(n => n.category === category);
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === parseInt(id));
    if (notification) {
      notification.isRead = true;
      return notification;
    }
    return null;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    return this.notifications;
  }

  deleteNotification(id) {
    const index = this.notifications.findIndex(n => n.id === parseInt(id));
    if (index !== -1) {
      return this.notifications.splice(index, 1)[0];
    }
    return null;
  }

  createNotification(data) {
    const notification = {
      id: this.nextId++,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      category: data.category || 'general',
      isRead: false,
      createdAt: new Date(),
      actions: data.actions || []
    };
    
    this.notifications.unshift(notification);
    return notification;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  filterNotifications(filters) {
    let filtered = this.notifications;
    
    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }
    
    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }
    
    if (filters.status === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filters.status === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }
}

// Add CSS animations if not already present
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .notification-close:hover {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}
