// Status Badge Component
export class StatusBadge {
    static create(status, type = 'status') {
        const badge = document.createElement('span');
        badge.className = this.getBadgeClass(status, type);
        badge.textContent = status;
        badge.setAttribute('data-status', status.toLowerCase());
        badge.setAttribute('data-type', type);
        
        // Add icon if configured
        const icon = this.getStatusIcon(status, type);
        if (icon) {
            badge.innerHTML = `<i class="fas fa-${icon}"></i> ${status}`;
        }
        
        return badge;
    }

    static getBadgeClass(status, type) {
        const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
        return `${type}-badge ${normalizedStatus}`;
    }

    static getStatusIcon(status, type) {
        const iconMaps = {
            status: {
                'active': 'check-circle',
                'inactive': 'times-circle',
                'pending': 'clock',
                'expired': 'calendar-times',
                'locked': 'lock',
                'suspended': 'pause-circle'
            },
            payment: {
                'paid': 'check',
                'pending': 'clock',
                'overdue': 'exclamation-triangle',
                'cancelled': 'ban',
                'processing': 'spinner'
            },
            priority: {
                'high': 'arrow-up',
                'medium': 'minus',
                'low': 'arrow-down',
                'urgent': 'fire',
                'critical': 'exclamation-triangle'
            },
            role: {
                'administrator': 'crown',
                'editor': 'edit',
                'viewer': 'eye',
                'auditor': 'search',
                'finance': 'calculator'
            }
        };
        
        const iconMap = iconMaps[type] || iconMaps.status;
        return iconMap[status.toLowerCase()];
    }

    static createWithTooltip(status, type = 'status', tooltipText = '') {
        const badge = this.create(status, type);
        
        if (tooltipText) {
            badge.setAttribute('title', tooltipText);
            badge.classList.add('has-tooltip');
        }
        
        return badge;
    }

    static createAnimated(status, type = 'status', animation = 'pulse') {
        const badge = this.create(status, type);
        badge.classList.add(`animate-${animation}`);
        return badge;
    }

    // Bulk create badges for table rows
    static createForTable(data, statusField, typeField = null) {
        return data.map(item => {
            const status = item[statusField];
            const type = typeField ? item[typeField] : 'status';
            return this.create(status, type);
        });
    }

    // Update existing badge
    static update(badge, newStatus, newType = null) {
        const type = newType || badge.getAttribute('data-type') || 'status';
        
        badge.className = this.getBadgeClass(newStatus, type);
        badge.setAttribute('data-status', newStatus.toLowerCase());
        badge.textContent = newStatus;
        
        const icon = this.getStatusIcon(newStatus, type);
        if (icon) {
            badge.innerHTML = `<i class="fas fa-${icon}"></i> ${newStatus}`;
        }
    }

    // Add required CSS styles
    static addStyles() {
        if (document.getElementById('status-badge-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'status-badge-styles';
        styles.textContent = `
            .status-badge, .payment-badge, .priority-badge, .role-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.025em;
                white-space: nowrap;
            }
            
            /* Status badges */
            .status-badge.active {
                background-color: #dcfce7;
                color: #166534;
            }
            
            .status-badge.inactive {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .status-badge.pending {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            .status-badge.expired {
                background-color: #fee2e2;
                color: #dc2626;
            }
            
            .status-badge.locked {
                background-color: #fde68a;
                color: #d97706;
            }
            
            .status-badge.suspended {
                background-color: #e5e7eb;
                color: #6b7280;
            }
            
            /* Payment badges */
            .payment-badge.paid {
                background-color: #dcfce7;
                color: #166534;
            }
            
            .payment-badge.pending {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            .payment-badge.overdue {
                background-color: #fee2e2;
                color: #dc2626;
            }
            
            .payment-badge.cancelled {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .payment-badge.processing {
                background-color: #dbeafe;
                color: #1d4ed8;
            }
            
            /* Priority badges */
            .priority-badge.high {
                background-color: #fed7d7;
                color: #c53030;
            }
            
            .priority-badge.medium {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            .priority-badge.low {
                background-color: #e6fffa;
                color: #285e61;
            }
            
            .priority-badge.urgent {
                background-color: #fed7d7;
                color: #c53030;
                animation: pulse 2s infinite;
            }
            
            .priority-badge.critical {
                background-color: #fed7d7;
                color: #c53030;
                animation: blink 1s infinite;
            }
            
            /* Role badges */
            .role-badge.administrator {
                background-color: #f3e8ff;
                color: #7c3aed;
            }
            
            .role-badge.editor {
                background-color: #dbeafe;
                color: #1d4ed8;
            }
            
            .role-badge.viewer {
                background-color: #f0f9ff;
                color: #0369a1;
            }
            
            .role-badge.auditor {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            .role-badge.finance {
                background-color: #dcfce7;
                color: #166534;
            }
            
            /* Animations */
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            .animate-bounce {
                animation: bounce 1s infinite;
            }
            
            .animate-fade {
                animation: fade 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                50% { transform: none; animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
            
            @keyframes fade {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.5; }
            }
            
            /* Tooltip support */
            .has-tooltip {
                position: relative;
                cursor: help;
            }
            
            .has-tooltip:hover::after {
                content: attr(title);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: #1f2937;
                color: white;
                padding: 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                white-space: nowrap;
                z-index: 1000;
            }
            
            .has-tooltip:hover::before {
                content: '';
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(1px);
                border: 4px solid transparent;
                border-top-color: #1f2937;
                z-index: 1000;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Auto-add styles when module is imported
StatusBadge.addStyles();
