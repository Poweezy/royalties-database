export class NotificationCenter {
    constructor() {
        this.notifications = [
            {
                id: 1,
                icon: 'fas fa-exclamation-circle',
                iconColor: 'critical',
                title: 'Critical: Payment Overdue - Maloma Colliery',
                time: '2 hours ago',
                message: 'Maloma Colliery payment is 15 days overdue. Total outstanding: E 145,750.00',
                read: false,
                category: 'critical'
            },
            {
                id: 2,
                icon: 'fas fa-shield-alt',
                iconColor: 'critical',
                title: 'Security Alert: Multiple Failed Login Attempts',
                time: '4 hours ago',
                message: 'Detected 5 failed login attempts from IP 203.0.113.45 in the last hour',
                read: false,
                category: 'critical'
            },
            {
                id: 3,
                icon: 'fas fa-calendar-check',
                iconColor: 'info',
                title: 'Reminder: Monthly Report Due Tomorrow',
                time: '6 hours ago',
                message: 'February 2024 royalty report submission deadline is tomorrow at 5:00 PM',
                read: false,
                category: 'compliance'
            },
            {
                id: 4,
                icon: 'fas fa-check-circle',
                iconColor: 'success',
                title: 'Payment Received - Kwalini Quarry',
                time: '1 day ago',
                message: 'Received royalty payment of E 45,200.00 from Kwalini Quarry for January 2024',
                read: true,
                category: 'payments'
            },
            {
                id: 5,
                icon: 'fas fa-user-plus',
                iconColor: 'info',
                title: 'New User Account Created',
                time: '2 days ago',
                message: "User account 'm.smith' created successfully with Auditor role",
                read: true,
                category: 'users'
            }
        ];

        this.container = document.getElementById('notifications-list');
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'} ${n.category}" data-id="${n.id}">
              <div class="notification-icon ${n.iconColor}">
                <i class="${n.icon}" aria-label="${n.category} icon"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h5>${n.title}</h5>
                  <span class="notification-time">${n.time}</span>
                </div>
                <p>${n.message}</p>
                <div class="notification-actions">
                  <button class="btn btn-sm btn-primary">View Details</button>
                  ${!n.read ? '<button class="btn btn-sm btn-secondary mark-read-btn">Mark Read</button>' : ''}
                </div>
              </div>
            </div>
        `).join('');

        this.updateCounts();
    }

    updateCounts() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const totalCount = this.notifications.length;
        const criticalCount = this.notifications.filter(n => n.category === 'critical').length;
        const paymentsCount = this.notifications.filter(n => n.category === 'payments').length;
        const complianceCount = this.notifications.filter(n => n.category === 'compliance').length;

        document.querySelector('.filter-btn[data-filter="all"]').textContent = `All (${totalCount})`;
        document.querySelector('.filter-btn[data-filter="unread"]').textContent = `Unread (${unreadCount})`;
        document.querySelector('.filter-btn[data-filter="critical"]').textContent = `Critical (${criticalCount})`;
        document.querySelector('.filter-btn[data-filter="payments"]').textContent = `Payments (${paymentsCount})`;
        document.querySelector('.filter-btn[data-filter="compliance"]').textContent = `Compliance (${complianceCount})`;

        const navBadge = document.querySelector('nav a[href="#notifications"] .notification-badge');
        if (navBadge) {
            navBadge.textContent = unreadCount;
        }
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.render();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.render();
    }

    filter(category) {
        const items = this.container.querySelectorAll('.notification-item');
        items.forEach(item => {
            if (category === 'all' || item.classList.contains(category)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}
