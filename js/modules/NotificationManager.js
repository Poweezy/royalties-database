export class NotificationManager {
  constructor() {
    this.notifications = new Set();
    this.types = {
      success: {
        bg: "#dcfce7",
        border: "#bbf7d0",
        color: "#166534",
        icon: "✅",
      },
      error: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", icon: "❌" },
      warning: {
        bg: "#fef3c7",
        border: "#fde68a",
        color: "#92400e",
        icon: "⚠️",
      },
      info: { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af", icon: "ℹ️" },
    };
  }

  show(message, type = "info", duration = 5000) {
    this.clearExisting();

    const notification = this.createElement(message, type);
    document.body.appendChild(notification);
    this.notifications.add(notification);

    this.animate(notification, duration);
    return notification;
  }

  clearExisting() {
    document.querySelectorAll(".notification-toast").forEach((n) => n.remove());
    this.notifications.clear();
  }

  createElement(message, type) {
    const config = this.types[type] || this.types.info;
    const notification = document.createElement("div");
    notification.className = `notification-toast notification-${type}`;

    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${config.bg}; color: ${config.color};
      padding: 1rem 1.5rem; border-radius: 8px;
      border: 1px solid ${config.border};
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 400px; display: flex; align-items: center;
      gap: 0.75rem; font-weight: 500;
      transform: translateX(100%); transition: transform 0.3s ease;
    `;

    const iconSpan = document.createElement("span");
    iconSpan.style.fontSize = "1.2rem";
    iconSpan.textContent = config.icon;

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.cssText = `
      background: none; border: none; color: ${config.color};
      cursor: pointer; font-size: 1.2rem; margin-left: auto; opacity: 0.7;
    `;
    closeButton.onclick = () => {
      notification.remove();
      this.notifications.delete(notification);
    };

    notification.appendChild(iconSpan);
    notification.appendChild(messageSpan);
    notification.appendChild(closeButton);

    return notification;
  }

  animate(notification, duration) {
    setTimeout(() => (notification.style.transform = "translateX(0)"), 100);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
          notification.remove();
          this.notifications.delete(notification);
        }, 300);
      }
    }, duration);
  }

  success(message, duration) {
    return this.show(message, "success", duration);
  }
  error(message, duration) {
    return this.show(message, "error", duration);
  }
  warning(message, duration) {
    return this.show(message, "warning", duration);
  }
  info(message, duration) {
    return this.show(message, "info", duration);
  }

  destroy() {
    this.clearExisting();
    this.notifications.clear();
  }
}

// Create and export a singleton instance
export const notificationManager = new NotificationManager();

// Export standalone functions for convenience, which use the singleton
export const showToast = (message, type = "info", duration = 5000) => {
  return notificationManager.show(message, type, duration);
};

export const showNotification = (message, type = "info", duration = 5000) => {
  return notificationManager.show(message, type, duration);
};
