// Extracted from royalties.html inline script (D2 inline-script extraction).
// Legacy glue script: classic script on purpose (same parse-time execution
// order as the original inline block) — see APPLICATION_REVIEW.md.

// Enhanced Communication Hub Functionality
    document.addEventListener("DOMContentLoaded", function () {
      // Communication form handling
      const composeBtn = document.getElementById("compose-message-btn");
      const composeContainer = document.getElementById(
        "compose-message-container",
      );
      const composeForm = document.getElementById("compose-message-form");

      if (composeBtn && composeContainer) {
        composeBtn.addEventListener("click", () => {
          composeContainer.style.display =
            composeContainer.style.display === "none" ? "block" : "none";
        });
      }

      if (composeForm) {
        composeForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const recipients =
            document.getElementById("message-recipients")?.value;
          const subject = document.getElementById("message-subject")?.value;
          const content = document.getElementById("message-content")?.value;

          if (recipients && subject && content) {
            // U6: recipients is a comma/semicolon-separated string — count
            // entries, not characters.
            const recipientCount = recipients
              .split(/[,;]+/)
              .map((entry) => entry.trim())
              .filter(Boolean).length;
            showNotification(
              "Message sent successfully to " +
              recipientCount +
              " recipient" + (recipientCount === 1 ? "" : "s"),
              "success",
            );
            composeForm.reset();
            composeContainer.style.display = "none";
          } else {
            showNotification("Please fill in all required fields", "error");
          }
        });
      }

      // Notification management
      const markAllReadBtn = document.getElementById("mark-all-read-btn");
      if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", function () {
          document
            .querySelectorAll(".notification-item.unread")
            .forEach((item) => {
              item.classList.remove("unread");
              item.classList.add("read");
            });
          showNotification("All notifications marked as read", "success");
          updateNotificationCount();
        });
      }

      // Compliance checking
      const runComplianceBtn = document.getElementById(
        "run-compliance-check-btn",
      );
      if (runComplianceBtn) {
        runComplianceBtn.addEventListener("click", function () {
          this.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Running Check...';
          this.disabled = true;

          setTimeout(() => {
            // U3: this is a placeholder simulation — label it honestly so
            // users are not misled into thinking real checks ran.
            showNotification(
              "Demo: compliance check simulated — no checks were performed.",
              "info",
            );
            this.innerHTML =
              '<i class="fas fa-check-double"></i> Run Compliance Check';
            this.disabled = false;
            updateComplianceMetrics();
          }, 3000);
        });
      }

      // Update notification count
      function updateNotificationCount() {
        const unreadCount = document.querySelectorAll(
          ".notification-item.unread",
        ).length;
        const countBadge = document.querySelector(
          'nav a[href="#notifications"] span',
        );
        if (countBadge) {
          countBadge.textContent = unreadCount;
        }
      }

      // Update compliance metrics
      // U3: demo placeholder — hardcoded values kept so the panel renders,
      // pending wiring to ComplianceManager (see APPLICATION_REVIEW.md).
      function updateComplianceMetrics() {
        const overallCompliance = document.getElementById(
          "overall-compliance-rate",
        );
        const upcomingDeadlines = document.getElementById(
          "upcoming-deadlines-count",
        );

        if (overallCompliance) {
          overallCompliance.textContent = "98%";
        }
        if (upcomingDeadlines) {
          upcomingDeadlines.textContent = "3";
        }
      }

      // Enhanced notification actions
      document.addEventListener("click", function (e) {
        if (
          e.target.closest(".btn") &&
          e.target.closest(".notification-actions")
        ) {
          const btn = e.target.closest(".btn");
          const notificationItem = btn.closest(".notification-item");

          if (btn.textContent.includes("Mark Read")) {
            notificationItem.classList.remove("unread");
            notificationItem.classList.add("read");
            showNotification("Notification marked as read", "info");
            updateNotificationCount();
          } else if (btn.textContent.includes("View Details")) {
            showNotification("Opening detailed view...", "info");
          } else if (btn.textContent.includes("Send Reminder")) {
            showNotification("Reminder sent successfully", "success");
          }
        }

        // Filter buttons for notifications
        if (e.target.classList.contains("filter-btn")) {
          document
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          const filter = e.target.dataset.filter;
          const notifications =
            document.querySelectorAll(".notification-item");

          notifications.forEach((notification) => {
            if (filter === "all") {
              notification.style.display = "flex";
            } else if (
              filter === "unread" &&
              notification.classList.contains("unread")
            ) {
              notification.style.display = "flex";
            } else if (
              filter === "critical" &&
              notification.classList.contains("critical")
            ) {
              notification.style.display = "flex";
            } else if (notification.style.display !== "none") {
              notification.style.display = filter === "all" ? "flex" : "none";
            }
          });
        }
      });

      // Initialize notification count
      updateNotificationCount();

      // Tab functionality for compliance section
      document.addEventListener("click", function (e) {
        if (e.target.matches(".tab-btn[data-tab]")) {
          const targetTab = e.target.dataset.tab;

          // Remove active class from all tabs and content
          document
            .querySelectorAll(".tab-btn")
            .forEach((btn) => btn.classList.remove("active"));
          document
            .querySelectorAll(".tab-content")
            .forEach((content) => content.classList.remove("active"));

          // Add active class to clicked tab and corresponding content
          e.target.classList.add("active");
          const targetContent = document.querySelector(targetTab);
          if (targetContent) {
            targetContent.classList.add("active");
          }
        }
      });
    });

    // Global notification function (if not already defined)
    if (typeof showNotification === "undefined") {
      function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 10000;
          background: ${type === "success" ? "#dcfce7" : type === "error" ? "#fef2f2" : type === "warning" ? "#fef3c7" : "#dbeafe"};
          color: ${type === "success" ? "#166534" : type === "error" ? "#dc2626" : type === "warning" ? "#92400e" : "#1e40af"};
          padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px;
          display: flex; align-items: center; gap: 0.75rem; font-weight: 500;
        `;

        // H1/CSP: build the notification via DOM APIs — textContent sink for the
        // message (no innerHTML interpolation) and addEventListener instead of
        // an inline event handler (required for hash-based CSP).
        const iconSpan = document.createElement("span");
        iconSpan.innerHTML = type === "success" ? "?" : type === "error" ? "?" : type === "warning" ? "??" : "??";
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Close notification");
        closeButton.style.cssText =
          "background: none; border: none; cursor: pointer; margin-left: auto;";
        closeButton.textContent = "�";
        closeButton.addEventListener("click", () => notification.remove());
        notification.append(iconSpan, messageSpan, closeButton);

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    }
  
