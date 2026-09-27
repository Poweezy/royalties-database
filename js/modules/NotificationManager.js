export class NotificationManager {
  constructor() {
    this.notifications = new Set();
    this.timeouts = new Map(); // Track timeouts for cleanup
    this.types = {
      success: {
        bg: "#dcfce7",
        border: "#bbf7d0",
        color: "#166534",
        icon: "fa-check-circle",
      },
      error: {
        bg: "#fef2f2",
        border: "#fecaca",
        color: "#dc2626",
        icon: "fa-times-circle",
      },
      warning: {
        bg: "#fef3c7",
        border: "#fde68a",
        color: "#92400e",
        icon: "fa-exclamation-triangle",
      },
      info: {
        bg: "#dbeafe",
        border: "#93c5fd",
        color: "#1e40af",
        icon: "fa-info-circle",
      },
    };
  }

  show(message, type = "info", duration = 5000) {
    this.clearExisting();

    // Mirror the message into a persistent aria-live region so screen
    // readers announce toasts (dynamically inserted regions alone are missed).
    this.ensureLiveRegion().textContent = message;

    const notification = this.createElement(message, type);
    document.body.appendChild(notification);
    this.notifications.add(notification);

    this.animate(notification, duration);
    return notification;
  }

  /**
   * Ensure a persistent, visually-hidden aria-live region exists (U7).
   * @returns {HTMLElement} The live region element.
   */
  ensureLiveRegion() {
    let region = document.getElementById("aria-live-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "aria-live-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      // Visually hidden but available to screen readers
      region.style.cssText =
        "position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;";
      document.body.appendChild(region);
    }
    return region;
  }

  clearExisting() {
    // Clear all timeouts first
    this.notifications.forEach(notification => {
      const timeoutIds = this.timeouts.get(notification);
      if (timeoutIds) {
        timeoutIds.forEach(id => clearTimeout(id));
        this.timeouts.delete(notification);
      }
    });
    
    document.querySelectorAll(".notification-toast").forEach((n) => n.remove());
    this.notifications.clear();
  }

  createElement(message, type) {
    const config = this.types[type] || this.types.info;
    const notification = document.createElement("div");
    notification.className = `notification-toast notification-${type}`;
    notification.setAttribute("role", "status");

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

    const iconEl = document.createElement("i");
    iconEl.className = `fas ${config.icon}`;
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.style.fontSize = "1.2rem";

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "btn";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close notification");
    closeButton.innerHTML = "×";
    closeButton.style.cssText = `
      background: none; border: none; color: ${config.color};
      cursor: pointer; font-size: 1.2rem; margin-left: auto; opacity: 0.7;
    `;
    closeButton.onclick = () => {
      notification.remove();
      this.notifications.delete(notification);
    };

    notification.appendChild(iconEl);
    notification.appendChild(messageSpan);
    notification.appendChild(closeButton);

    return notification;
  }

  animate(notification, duration) {
    const enterTimeout = setTimeout(() => (notification.style.transform = "translateX(0)"), 100);
    
    const exitTimeout = setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = "translateX(100%)";
        const removeTimeout = setTimeout(() => {
          this.removeNotification(notification);
        }, 300);
        
        // Store the remove timeout too
        const timeoutIds = this.timeouts.get(notification) || [];
        timeoutIds.push(removeTimeout);
        this.timeouts.set(notification, timeoutIds);
      }
    }, duration);

    // Store timeout IDs for cleanup
    this.timeouts.set(notification, [enterTimeout, exitTimeout]);
  }
  
  removeNotification(notification) {
    notification.remove();
    this.notifications.delete(notification);
    
    // Clear associated timeouts
    const timeoutIds = this.timeouts.get(notification);
    if (timeoutIds) {
      timeoutIds.forEach(id => clearTimeout(id));
      this.timeouts.delete(notification);
    }
  }
  
  // Add cleanup method
  destroy() {
    this.clearExisting();
    this.timeouts.clear();
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
