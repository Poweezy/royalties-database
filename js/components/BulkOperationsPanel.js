/**
 * Bulk Operations Panel Component
 * Provides UI for bulk user operations
 */

export class BulkOperationsPanel {
  constructor(userManager) {
    this.userManager = userManager;
    this.selectedUsers = new Set();
    this.createBulkOperationsHTML();
    this.setupEventListeners();
  }

  /**
   * Create bulk operations HTML
   */
  createBulkOperationsHTML() {
    const existingContainer = document.getElementById("bulk-operations-panel-container");
    if (existingContainer) {
      existingContainer.innerHTML = this.getBulkOperationsHTML();
    }
  }

  /**
   * Get bulk operations HTML
   */
  getBulkOperationsHTML() {
    return `
            <div class="bulk-operations-panel" id="bulk-operations-panel" style="display: none;">
                <div class="bulk-operations-header">
                    <h5><i class="fas fa-tasks"></i> Bulk Operations</h5>
                    <span class="selected-count" id="selected-count">0 users selected</span>
                    <button class="btn btn-sm btn-secondary" id="clear-selection">
                        <i class="fas fa-times"></i> Clear
                    </button>
                </div>

                <div class="bulk-operations-content">
                    <!-- Status Operations -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-toggle-on"></i> Change Status</h6>
                        <div class="status-change-controls">
                            <select class="form-control form-control-sm" id="bulk-action-status">
                                <option value="">Select Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Locked">Locked</option>
                            </select>
                            <button class="btn btn-primary btn-sm" id="bulk-apply-status-change">
                                <i class="fas fa-check"></i> Apply
                            </button>
                        </div>
                    </div>

                    <!-- Role Operations -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-user-tag"></i> Role Assignment</h6>
                        <div class="role-assignment-controls">
                            <select class="form-control form-control-sm" id="bulk-role-select">
                                <option value="">Select Role</option>
                                <option value="Administrator">Administrator</option>
                                <option value="Editor">Editor</option>
                                <option value="Auditor">Auditor</option>
                                <option value="Finance Officer">Finance Officer</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                            <button class="btn btn-primary btn-sm" id="bulk-assign-role">
                                <i class="fas fa-user-plus"></i> Assign
                            </button>
                        </div>
                    </div>

                    <!-- Permission Templates -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-key"></i> Permission Templates</h6>
                        <div class="permission-template-controls">
                            <select class="form-control form-control-sm" id="bulk-permission-template">
                                <option value="">Select Template</option>
                                <option value="Department Manager">Department Manager</option>
                                <option value="Data Entry Clerk">Data Entry Clerk</option>
                                <option value="Financial Analyst">Financial Analyst</option>
                                <option value="Compliance Officer">Compliance Officer</option>
                            </select>
                            <button class="btn btn-info btn-sm" id="bulk-apply-template">
                                <i class="fas fa-stamp"></i> Apply
                            </button>
                        </div>
                    </div>

                    <!-- Communication -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-envelope"></i> Communication</h6>
                        <div class="btn-group">
                            <button class="btn btn-info btn-sm" id="bulk-email">
                                <i class="fas fa-envelope"></i> Send Email
                            </button>
                            <button class="btn btn-warning btn-sm" id="bulk-notify">
                                <i class="fas fa-bell"></i> Send Notification
                            </button>
                        </div>
                    </div>

                    <!-- Data Operations -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-database"></i> Data Operations</h6>
                        <div class="btn-group">
                            <button class="btn btn-success btn-sm" id="bulk-export">
                                <i class="fas fa-download"></i> Export Selected
                            </button>
                            <button class="btn btn-secondary btn-sm" id="bulk-import">
                                <i class="fas fa-upload"></i> Import Users
                            </button>
                            <button class="btn btn-danger btn-sm" id="bulk-delete-users">
                                <i class="fas fa-trash"></i> Delete Selected
                            </button>
                        </div>
                    </div>

                    <!-- Security Operations -->
                    <div class="bulk-operation-group">
                        <h6><i class="fas fa-shield-alt"></i> Security Operations</h6>
                        <div class="btn-group">
                            <button class="btn btn-warning btn-sm" id="bulk-force-password-change">
                                <i class="fas fa-key"></i> Force Password Change
                            </button>
                            <button class="btn btn-info btn-sm" id="bulk-enable-2fa">
                                <i class="fas fa-shield-alt"></i> Enable 2FA
                            </button>
                            <button class="btn btn-secondary btn-sm" id="bulk-unlock">
                                <i class="fas fa-unlock"></i> Unlock Accounts
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bulk-operations-footer">
                    <div class="bulk-operation-progress" style="display: none;">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">Processing...</span>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.addEventListener("click", (e) => {
      switch (e.target.id) {
        case "clear-selection":
          this.clearSelection();
          break;
        case "bulk-assign-role":
          this.bulkAssignRole();
          break;
        case "bulk-apply-template":
          this.bulkApplyTemplate();
          break;
        case "bulk-email":
          this.bulkEmail();
          break;
        case "bulk-notify":
          this.bulkNotify();
          break;
        case "bulk-export":
          this.bulkExport();
          break;
        case "bulk-import":
          this.bulkImport();
          break;
        case "bulk-force-password-change":
          this.bulkForcePasswordChange();
          break;
        case "bulk-enable-2fa":
          this.bulkEnable2FA();
          break;
        case "bulk-unlock":
          this.bulkUnlock();
          break;
      }
    });
  }

  /**
   * Update selection
   */
  updateSelection(selectedUsers) {
    this.selectedUsers = selectedUsers;
    const panel = document.getElementById("bulk-operations-panel");
    const countElement = document.getElementById("selected-count");

    if (selectedUsers.size > 0) {
      panel.style.display = "block";
      countElement.textContent = `${selectedUsers.size} users selected`;
    } else {
      panel.style.display = "none";
    }
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.userManager.clearSelection();
  }


  /**
   * Bulk assign role
   */
  async bulkAssignRole() {
    const roleSelect = document.getElementById("bulk-role-select");
    const roleId = roleSelect.value;

    if (!roleId) {
      alert("Please select a role");
      return;
    }

    if (!this.confirmAction(`assign role "${roleId}" to`)) return;

    await this.executeWithProgress(async () => {
      await this.userManager.bulkAssignRole(roleId);
    });
  }

  /**
   * Bulk apply permission template
   */
  async bulkApplyTemplate() {
    const templateSelect = document.getElementById("bulk-permission-template");
    const templateId = templateSelect.value;

    if (!templateId) {
      alert("Please select a permission template");
      return;
    }

    if (!this.confirmAction(`apply template "${templateId}" to`)) return;

    await this.executeWithProgress(async () => {
      const userIds = Array.from(this.selectedUsers);
      for (const userId of userIds) {
        await permissionService.applyPermissionTemplate(userId, templateId);
      }
    });
  }

  /**
   * Bulk email
   */
  async bulkEmail() {
    await this.userManager.bulkEmailUsers();
  }

  /**
   * Bulk notify
   */
  async bulkNotify() {
    this.showBulkNotificationModal();
  }

  /**
   * Bulk export
   */
  async bulkExport() {
    await this.userManager.bulkExportUsers();
  }

  /**
   * Bulk import
   */
  async bulkImport() {
    await this.userManager.bulkImportUsers();
  }


  /**
   * Bulk force password change
   */
  async bulkForcePasswordChange() {
    if (!this.confirmAction("force password change for")) return;

    await this.executeWithProgress(async () => {
      const userIds = Array.from(this.selectedUsers);
      for (const userId of userIds) {
        await this.userManager.updateUser(userId, {
          forcePasswordChange: true,
        });
      }
    });
  }

  /**
   * Bulk enable 2FA
   */
  async bulkEnable2FA() {
    if (!this.confirmAction("enable 2FA for")) return;

    await this.executeWithProgress(async () => {
      const userIds = Array.from(this.selectedUsers);
      for (const userId of userIds) {
        await this.userManager.updateUser(userId, { twoFactorEnabled: true });
      }
    });
  }

  /**
   * Bulk unlock accounts
   */
  async bulkUnlock() {
    if (!this.confirmAction("unlock")) return;

    await this.executeWithProgress(async () => {
      const userIds = Array.from(this.selectedUsers);
      await this.userManager.bulkUpdateUserStatus(userIds, "Active");
    });
  }

  /**
   * Confirm action with user
   */
  confirmAction(action, dangerous = false) {
    const count = this.selectedUsers.size;
    const message = `Are you sure you want to ${action} ${count} user${count > 1 ? "s" : ""}?`;

    if (dangerous) {
      return confirm(`${message}\n\nThis action cannot be undone!`);
    }

    return confirm(message);
  }

  /**
   * Execute action with progress indication
   */
  async executeWithProgress(action) {
    const progressContainer = document.querySelector(
      ".bulk-operation-progress",
    );
    const progressBar = progressContainer.querySelector(".progress-bar");
    const progressText = progressContainer.querySelector(".progress-text");

    try {
      progressContainer.style.display = "block";
      progressBar.style.width = "0%";
      progressText.textContent = "Processing...";

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 90) progress = 90;
        progressBar.style.width = `${progress}%`;
      }, 100);

      await action();

      clearInterval(interval);
      progressBar.style.width = "100%";
      progressText.textContent = "Complete!";

      setTimeout(() => {
        progressContainer.style.display = "none";
      }, 1000);
    } catch (error) {
      progressContainer.style.display = "none";
      console.error("Bulk operation failed:", error);
      alert("Operation failed. Please try again.");
    }
  }

  /**
   * Show bulk notification modal
   */
  showBulkNotificationModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Send Bulk Notification</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="notification-type">Notification Type</label>
                        <select id="notification-type" class="form-control">
                            <option value="info">Information</option>
                            <option value="warning">Warning</option>
                            <option value="success">Success</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="notification-title">Title</label>
                        <input type="text" id="notification-title" class="form-control" placeholder="Notification title">
                    </div>
                    <div class="form-group">
                        <label for="notification-message">Message</label>
                        <textarea id="notification-message" class="form-control" rows="5" placeholder="Notification message"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Recipients (${this.selectedUsers.size} users selected)</label>
                        <div class="recipient-preview">
                            <small class="text-muted">Notification will be sent to all selected users</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="this.sendBulkNotification()">Send Notification</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    modal.style.display = "block";

    // Setup modal event listeners
    modal
      .querySelector(".close")
      .addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Send bulk notification
   */
  async sendBulkNotification() {
    try {
      const type = document.getElementById("notification-type").value;
      const title = document.getElementById("notification-title").value;
      const message = document.getElementById("notification-message").value;

      if (!title || !message) {
        alert("Please fill in both title and message");
        return;
      }

      // Simulate sending notifications
      console.log("Sending bulk notification:", {
        type,
        title,
        message,
        recipients: this.selectedUsers,
      });

      // Close modal
      document.querySelector(".modal").remove();

      this.userManager.showNotification(
        `Notification sent to ${this.selectedUsers.size} users`,
        "success",
      );
      this.clearSelection();
    } catch (error) {
      console.error("Failed to send bulk notification:", error);
      alert("Failed to send notification. Please try again.");
    }
  }
}
