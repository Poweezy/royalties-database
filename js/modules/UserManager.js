import { Pagination } from "./Pagination.js";
import { userSecurityService } from "../services/user-security.service.js";
import { permissionService } from "../services/permission.service.js";
import { dbService } from "../services/database.service.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { security } from "../utils/security.js";
import { BulkOperationsPanel } from "../components/BulkOperationsPanel.js";
import { UserProfileModal } from "../components/UserProfileModal.js";
import { AuditLogManager } from "./AuditLogManager.js";

/**
 * Enhanced UserManager Module
 *
 * This module encapsulates all logic for managing users, including
 * fetching, rendering, adding, updating, and deleting users.
 * Enhanced with advanced security, permissions, and bulk operations.
 */
export class UserManager {
  constructor() {
    // In a real application, this would be fetched from a server.
    // For now, we use a static array based on the original HTML.
    this.users = [
      {
        id: 1,
        username: "admin",
        email: "admin@government.sz",
        role: "Administrator",
        department: "Administration",
        status: "Active",
        lastLogin: "2024-02-15 09:15",
        created: "2024-01-01",
        twoFactorEnabled: true,
      },
      {
        id: 2,
        username: "j.doe",
        email: "john.doe@government.sz",
        role: "Editor",
        department: "Operations",
        status: "Active",
        lastLogin: "2024-02-14 16:30",
        created: "2024-01-15",
        twoFactorEnabled: false,
      },
      {
        id: 3,
        username: "m.smith",
        email: "mary.smith@government.sz",
        role: "Auditor",
        department: "Audit & Compliance",
        status: "Inactive",
        lastLogin: "2024-02-10 14:22",
        created: "2024-02-01",
        twoFactorEnabled: true,
      },
      {
        id: 4,
        username: "s.jones",
        email: "sue.jones@government.sz",
        role: "Finance Officer",
        department: "Finance",
        status: "Active",
        lastLogin: "2024-02-15 11:05",
        created: "2024-01-20",
        twoFactorEnabled: true,
      },
      {
        id: 5,
        username: "p.dlamini",
        email: "pete.dlamini@government.sz",
        role: "Viewer",
        department: "Operations",
        status: "Active",
        lastLogin: "2024-02-13 10:00",
        created: "2024-01-25",
        twoFactorEnabled: false,
      },
      {
        id: 6,
        username: "l.gomez",
        email: "lisa.gomez@government.sz",
        role: "Editor",
        department: "Legal Affairs",
        status: "Inactive",
        lastLogin: "2024-02-01 18:30",
        created: "2024-02-01",
        twoFactorEnabled: true,
      },
      {
        id: 7,
        username: "t.brown",
        email: "tom.brown@government.sz",
        role: "Administrator",
        department: "Administration",
        status: "Active",
        lastLogin: "2024-02-15 09:00",
        created: "2023-12-15",
        twoFactorEnabled: true,
      },
      {
        id: 8,
        username: "a.white",
        email: "anna.white@government.sz",
        role: "Auditor",
        department: "Audit & Compliance",
        status: "Active",
        lastLogin: "2024-02-14 13:00",
        created: "2024-01-18",
        twoFactorEnabled: false,
      },
      {
        id: 9,
        username: "c.green",
        email: "chris.green@government.sz",
        role: "Finance Officer",
        department: "Finance",
        status: "Locked",
        lastLogin: "2024-02-12 09:00",
        created: "2024-01-22",
        twoFactorEnabled: false,
      },
      {
        id: 10,
        username: "b.king",
        email: "brian.king@government.sz",
        role: "Viewer",
        department: "Operations",
        status: "Active",
        lastLogin: "2024-02-15 14:00",
        created: "2024-01-30",
        twoFactorEnabled: true,
      },
      {
        id: 11,
        username: "e.clark",
        email: "emily.clark@government.sz",
        role: "Editor",
        department: "Operations",
        status: "Expired",
        lastLogin: "2023-11-15 10:00",
        created: "2023-10-01",
        twoFactorEnabled: true,
      },
    ];
    this.tableBody = document.getElementById("users-table-tbody");
    this.filteredUsers = [...this.users]; // Keep a separate list of users after filtering

    this.pagination = new Pagination({
      containerSelector: "#users-pagination",
      itemsPerPage: 5, // Let's use a smaller number for demonstration
      onPageChange: (page) => {
        this.renderUsers(this.filteredUsers, page);
      },
    });

    this.sortColumn = "username"; // Default sort column
    this.sortDirection = "asc"; // Default sort direction

    // Enhanced features
    this.selectedUsers = new Set();
    this.bulkOperationMode = false;
    this.userProfiles = new Map();
    this.passwordPolicies = new Map();
    this.onboardingTemplates = new Map();

    this.bulkOperationsPanel = new BulkOperationsPanel(this);
    this.userProfileModal = new UserProfileModal(this);
    this.auditLogManager = new AuditLogManager();
    this.securityService = userSecurityService;
    this.permissionService = permissionService;
  }

  /**
   * Initialize enhanced user management features
   */
  async initializeEnhancedFeatures() {
    try {
      await userSecurityService.init();
      this.setupEventListeners();
      await this.loadPasswordPolicies();
      this.initializeOnboardingTemplates();
      await this.syncWithDatabase();

      // From EnhancedUserManager
      await this.setupAdvancedSecurity();
      await this.initializeUserAnalytics();
      await this.setupRoleBasedAccess();
      this.setupUserActivityMonitoring();
    } catch (error) {
      new ErrorHandler().handleError(
        error,
        "Failed to initialize enhanced features",
      );
    }
  }

  async setupAdvancedSecurity() {
    // Enhanced security features
    await this.securityService.initializeSecurityPolicies({
      passwordPolicy: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        passwordHistory: 5,
      },
      loginAttempts: {
        maxAttempts: 5,
        lockoutDuration: 15, // minutes
        resetAfter: 24, // hours
      },
      sessionPolicy: {
        duration: 30, // minutes
        extendOnActivity: true,
        maxConcurrentSessions: 3,
      },
    });
  }

  async initializeUserAnalytics() {
    // Setup user analytics and reporting
    this.analyticsEnabled = true;
    await this.auditLogManager.initialize({
      trackUserActions: true,
      trackSecurityEvents: true,
      retentionPeriod: 90, // days
    });
  }

  async setupRoleBasedAccess() {
    // RBAC is initialized in the PermissionService constructor
  }

  setupUserActivityMonitoring() {
    // Real-time user activity monitoring
    this.activityMonitor = {
      trackLoginPatterns: true,
      trackFeatureUsage: true,
      anomalyDetection: true,
    };
  }

  // Enhanced user operations
  async bulkUpdateUsers(userIds, updates) {
    const transaction = await dbService.startTransaction(["users", "auditLog"]);
    try {
      for (const userId of userIds) {
        await this.updateUser(userId, updates);
        await this.auditLogManager.logUserUpdate(userId, updates);
      }
      await transaction.commit();
      return { success: true, message: "Bulk update completed successfully" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Bulk update failed: ${error.message}`);
    }
  }

  /**
   * Sync user data with database
   */
  async syncWithDatabase() {
    try {
      const dbUsers = await dbService.getAll("users");
      if (dbUsers.length > 0) {
        this.users = dbUsers;
      } else {
        // Migrate initial users to database
        for (const user of this.users) {
          await dbService.add("users", user);
        }
      }
    } catch (error) {
      new ErrorHandler().handleError(error, "Failed to sync with database");
    }
  }

  /**
   * Setup event listeners for enhanced features
   */
  setupEventListeners() {
    // Bulk selection
    document.addEventListener("change", (e) => {
      if (e.target.name === "user-select") {
        this.handleUserSelection(e.target);
      } else if (e.target.id === "select-all-users") {
        this.handleSelectAll(e.target);
      }
    });

    // Bulk operations and other actions
    document.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      const userId = target.dataset.userId;

      if (target.id === "bulk-activate-users") {
        this.bulkActivateUsers();
      } else if (target.id === "bulk-deactivate-users") {
        this.bulkDeactivateUsers();
      } else if (target.id === "bulk-email-users") {
        this.bulkEmailUsers();
      } else if (target.id === "bulk-export-users") {
        this.bulkExportUsers();
      } else if (target.id === "bulk-import-users") {
        this.bulkImportUsers();
      }
    });

    // Add user form submission
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
      addUserForm.addEventListener('submit', (event) => this.validateAndAddNewUser(event));
    }

    const viewAuditBtn = document.getElementById("view-audit-btn");
    if (viewAuditBtn) {
        viewAuditBtn.addEventListener("click", () => {
            const auditLogSection = document.querySelector(".user-form-container:has(#audit-log-table)");
            if (auditLogSection) {
                auditLogSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
  }

  async loadPasswordPolicies() {
    try {
      let policies = await dbService.getAll("passwordPolicies");
      if (policies.length === 0) {
        // If no policies exist, create default ones
        const defaultPolicies = [
          { name: 'default', minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: true, maxAge: 90, preventReuse: 5 },
          { name: 'strict', minLength: 12, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: true, maxAge: 60, preventReuse: 10 },
          { name: 'relaxed', minLength: 6, requireUppercase: false, requireLowercase: true, requireNumbers: true, requireSymbols: false, maxAge: 120, preventReuse: 3 },
        ];

        for (const policy of defaultPolicies) {
          await dbService.add("passwordPolicies", policy);
        }
        policies = await dbService.getAll("passwordPolicies");
      }

      this.passwordPolicies.clear();
      policies.forEach(policy => {
        this.passwordPolicies.set(policy.name, policy);
      });

    } catch (error) {
      ErrorHandler.handle(error, "Failed to load password policies");
    }
  }

  getPasswordPolicies() {
    return this.passwordPolicies;
  }

  async savePasswordPolicy(policy) {
    try {
      const id = await dbService.put("passwordPolicies", policy);
      policy.id = id;
      this.passwordPolicies.set(policy.name, policy);
      return policy;
    } catch (error) {
      ErrorHandler.handle(error, "Failed to save password policy");
      throw error;
    }
  }

  async deletePasswordPolicy(policyId) {
    try {
      const policy = await dbService.getById("passwordPolicies", policyId);
      if (policy) {
        await dbService.delete("passwordPolicies", policyId);
        this.passwordPolicies.delete(policy.name);
      }
    } catch (error) {
      ErrorHandler.handle(error, "Failed to delete password policy");
      throw error;
    }
  }

  /**
   * Initialize onboarding templates
   */
  initializeOnboardingTemplates() {
    const templates = {
      standard: {
        name: "Standard Onboarding",
        steps: [
          { id: "welcome", name: "Welcome Message", required: true },
          { id: "profile", name: "Complete Profile", required: true },
          { id: "security", name: "Security Setup", required: true },
          { id: "training", name: "System Training", required: false },
        ],
      },
      admin: {
        name: "Administrator Onboarding",
        steps: [
          { id: "welcome", name: "Welcome Message", required: true },
          { id: "profile", name: "Complete Profile", required: true },
          { id: "security", name: "Security Setup", required: true },
          { id: "permissions", name: "Permission Review", required: true },
          { id: "training", name: "Admin Training", required: true },
        ],
      },
    };

    Object.entries(templates).forEach(([id, template]) => {
      this.onboardingTemplates.set(id, template);
    });
  }

  /**
   * Filters and renders the list of users based on the provided criteria.
   * @param {object} filters - The filter criteria.
   * @param {string} filters.searchTerm - The text to search for.
   * @param {string} filters.role - The role to filter by.
   * @param {string} filters.status - The status to filter by.
   */
  filterUsers(filters) {
    let users = this.users;
    const { searchTerm, role, status } = filters;

    // Filter by search term (username, email, role)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      users = users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.role.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    // Filter by role
    if (role) {
      users = users.filter(
        (user) => user.role.toLowerCase() === role.toLowerCase(),
      );
    }

    // Filter by status
    if (status) {
      users = users.filter(
        (user) => user.status.toLowerCase() === status.toLowerCase(),
      );
    }

    this.filteredUsers = users;
    this.renderUsers(this.filteredUsers, 1); // Go back to the first page after filtering
  }

  renderUsers(usersToRender, page = 1) {
    const userList = usersToRender || this.users;
    this.filteredUsers = userList; // Update the filtered list

    if (!this.tableBody) {
      console.error("User table body not found!");
      return;
    }

    // Clear existing rows
    this.tableBody.innerHTML = "";

    // Paginate the data
    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedUsers = userList.slice(startIndex, endIndex);

    if (userList.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">No users found.</td></tr>`;
    } else {
      paginatedUsers.forEach((user) => {
        const row = this.tableBody.insertRow();
        row.innerHTML = this.createUserRowHtml(user);
      });
    }

    // Render the pagination controls
    this.pagination.render(userList.length, page);
  }

  /**
   * Checks if a username is already taken, excluding a specific user ID.
   * @param {string} username - The username to check.
   * @param {number|null} userIdToExclude - The ID of the user to exclude (used when editing).
   * @returns {boolean} - True if the username is taken, otherwise false.
   */
  isUsernameTaken(username, userIdToExclude = null) {
    return this.users.some(
      (user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.id !== userIdToExclude,
    );
  }

  /**
   * Checks if an email is already taken, excluding a specific user ID.
   * @param {string} email - The email to check.
   * @param {number|null} userIdToExclude - The ID of the user to exclude (used when editing).
   * @returns {boolean} - True if the email is taken, otherwise false.
   */
  isEmailTaken(email, userIdToExclude = null) {
    return this.users.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== userIdToExclude,
    );
  }

  /**
   * Validates form data and adds a new user.
   * @param {Event} event - The form submission event.
   */
  async validateAndAddNewUser(event) {
    event.preventDefault();
    const form = event.target;
    const userData = Object.fromEntries(new FormData(form).entries());
    const password = userData["new-password"];
    const confirmPassword = userData["confirm-password"];

    // --- Validation ---
    const validationErrors = [];

    // Required fields
    if (!userData.username || !userData.email || !userData.role || !userData.department || !password) {
      validationErrors.push("All fields are required.");
    }

    // Username and Email uniqueness
    if (this.isUsernameTaken(userData.username)) {
      validationErrors.push("Username is already taken.");
    }
    if (this.isEmailTaken(userData.email)) {
      validationErrors.push("Email is already registered.");
    }

    // Password confirmation
    if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match.");
    }

    // Password policy
    const passwordPolicyResult = await this.validatePasswordPolicy(password, userData.username);
    if (!passwordPolicyResult.valid) {
      validationErrors.push(...passwordPolicyResult.errors);
    }

    const errorContainer = document.getElementById('add-user-errors');
    errorContainer.innerHTML = '';

    if (validationErrors.length > 0) {
        errorContainer.innerHTML = validationErrors.map(error => `<li>${error}</li>`).join('');
        errorContainer.style.display = 'block';
        return;
    }

    errorContainer.style.display = 'none';
    this.addUser(userData);
    form.reset();
    // Optionally close a modal if the form is in one
  }

  /**
   * Adds a new user to the list and re-renders the table.
   * @param {object} userData - The new user's data from the form.
   */
  async addUser(userData) {
    // Generate a new ID (in a real app, this would come from the backend)
    const newId =
      this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;

    const newUser = {
      id: newId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      status: "Active", // Default status
      lastLogin: "Never",
      created: new Date().toISOString().split("T")[0], // Today's date
      twoFactorEnabled: userData.forcePasswordChange || false, // Example logic
    };

    this.users.push(newUser);
    await dbService.add("users", newUser);
    this.renderUsers(this.users, 1);
    this.showNotification("User added successfully", "success");
  }

  /**
   * Deletes a user from the list and re-renders the table.
   * @param {number} userId - The ID of the user to delete.
   */
  deleteUser(userId) {
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    this.users.splice(userIndex, 1);
    this.renderUsers(this.users, 1);
  }

  /**
   * Retrieves a single user by their ID.
   * @param {number} userId - The ID of the user to retrieve.
   * @returns {object|undefined} The user object or undefined if not found.
   */
  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  /**
   * Updates an existing user's data and re-renders the table.
   * @param {number} userId - The ID of the user to update.
   * @param {object} updatedData - An object containing the new data for the user.
   */
  updateUser(userId, updatedData) {
    const user = this.getUser(userId);
    if (!user) {
      console.error(`Cannot update user: User with ID ${userId} not found.`);
      return;
    }

    // Merge the updated data into the existing user object
    Object.assign(user, updatedData);
    this.renderUsers(this.filteredUsers); // Re-render the currently filtered and paginated view
  }


  /**
   * Sorts the user list by a given column and toggles the direction.
   * @param {string} columnKey - The key of the user object to sort by.
   */
  sortUsers(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = "asc";
    }

    this.filteredUsers.sort((a, b) => {
      const valA = a[columnKey];
      const valB = b[columnKey];

      if (valA < valB) {
        return this.sortDirection === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    this.renderUsers(this.filteredUsers, 1); // Re-render from page 1
  }

  /**
   * Deletes multiple users from the list.
   * @param {number[]} userIds - An array of user IDs to delete.
   */
  bulkDeleteUsers(userIds) {
    this.users = this.users.filter((user) => !userIds.includes(user.id));
    this.filteredUsers = this.filteredUsers.filter(
      (user) => !userIds.includes(user.id),
    );
    this.renderUsers(this.filteredUsers, 1);
  }

  /**
   * Updates the status for multiple users.
   * @param {number[]} userIds - An array of user IDs to update.
   * @param {string} status - The new status to set.
   */
  bulkUpdateUserStatus(userIds, status) {
    this.users.forEach((user) => {
      if (userIds.includes(user.id)) {
        user.status = status;
      }
    });
    // Also update the filtered list to reflect changes immediately
    this.filteredUsers.forEach((user) => {
      if (userIds.includes(user.id)) {
        user.status = status;
      }
    });
    this.renderUsers(this.filteredUsers);
  }

  /**
   * Generates the HTML for a single user row.
   * @param {object} user - The user object.
   * @returns {string} The HTML string for the table row.
   */
  createUserRowHtml(user) {
    const roleClass = user.role.toLowerCase().replace(" ", "-");
    const statusClass = user.status.toLowerCase();
    const twoFactorIcon = user.twoFactorEnabled
      ? '<i class="fas fa-check-circle text-success" title="2FA Enabled" aria-label="2FA Enabled"></i>'
      : '<i class="fas fa-times-circle text-danger" title="2FA Disabled" aria-label="2FA Disabled"></i>';

    const lastLoginDate =
      user.lastLogin === "Never" ? "Never" : user.lastLogin.split(" ")[0];
    const createdDate = user.created.split("T")[0];

    return `
        <td><input type="checkbox" name="user-select" value="${user.id}"></td>
        <td data-label="Username">${security.escapeHtml(user.username)}</td>
        <td data-label="Email">${security.escapeHtml(user.email)}</td>
        <td data-label="Role"><span class="role-badge ${roleClass}">${security.escapeHtml(user.role)}</span></td>
        <td data-label="Department">${security.escapeHtml(user.department)}</td>
        <td data-label="Status"><span class="status-badge ${statusClass}">${security.escapeHtml(user.status)}</span></td>
        <td data-label="Last Login">${security.escapeHtml(lastLoginDate)}</td>
        <td data-label="Created">${security.escapeHtml(createdDate)}</td>
        <td data-label="2FA">${twoFactorIcon}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-info btn-sm user-profile-btn" title="View profile" data-user-id="${user.id}" aria-label="View profile for ${user.username}">
              <i class="fas fa-user" aria-hidden="true"></i>
            </button>
            <button class="btn btn-primary btn-sm" title="Edit user" data-user-id="${user.id}" aria-label="Edit user ${user.username}">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
            <button class="btn btn-warning btn-sm" title="Reset password" data-user-id="${user.id}" aria-label="Reset password for user ${user.username}">
              <i class="fas fa-key" aria-hidden="true"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete user" data-user-id="${user.id}" aria-label="Delete user ${user.username}">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
    `;
  }

  /**
   * Exports the currently displayed users to a CSV file.
   */
  exportUsers() {
    const rows = this.tableBody.querySelectorAll("tr");
    if (
      rows.length === 0 ||
      (rows.length === 1 && rows[0].querySelector('td[colspan="10"]'))
    ) {
      alert("No users to export.");
      return;
    }

    const headers = [
      "Username",
      "Email",
      "Role",
      "Department",
      "Status",
      "Last Login",
      "Created",
      "2FA Enabled",
    ];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    rows.forEach((row) => {
      const username = row.querySelector('[data-label="Username"]').textContent;
      const email = row.querySelector('[data-label="Email"]').textContent;
      const role = row.querySelector('[data-label="Role"]').textContent;
      const department = row.querySelector(
        '[data-label="Department"]',
      ).textContent;
      const status = row.querySelector('[data-label="Status"]').textContent;
      const lastLogin = row.querySelector(
        '[data-label="Last Login"]',
      ).textContent;
      const created = row.querySelector('[data-label="Created"]').textContent;
      const twoFactor = row
        .querySelector('[data-label="2FA"] i')
        .classList.contains("fa-check-circle");

      const csvRow = [
        username,
        email,
        role,
        department,
        status,
        lastLogin,
        created,
        twoFactor,
      ].join(",");
      csvContent += csvRow + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===== ENHANCED BULK OPERATIONS =====

  /**
   * Handle individual user selection
   */
  handleUserSelection(checkbox) {
    const userId = parseInt(checkbox.value);

    if (checkbox.checked) {
      this.selectedUsers.add(userId);
    } else {
      this.selectedUsers.delete(userId);
    }

    this.updateBulkOperationsUI();
  }

  /**
   * Handle select all users
   */
  handleSelectAll(checkbox) {
    const userCheckboxes = document.querySelectorAll(
      'input[name="user-select"]',
    );

    if (checkbox.checked) {
      userCheckboxes.forEach((cb) => {
        cb.checked = true;
        this.selectedUsers.add(parseInt(cb.value));
      });
    } else {
      userCheckboxes.forEach((cb) => {
        cb.checked = false;
        this.selectedUsers.delete(parseInt(cb.value));
      });
    }

    this.updateBulkOperationsUI();
  }

  /**
   * Update bulk operations UI
   */
  updateBulkOperationsUI() {
    const bulkContainer = document.getElementById("bulk-actions-container");
    const selectAllCheckbox = document.getElementById("select-all-users");

    if (this.selectedUsers.size > 0) {
      bulkContainer.style.display = "flex";
      this.bulkOperationMode = true;
    } else {
      bulkContainer.style.display = "none";
      this.bulkOperationMode = false;
    }

    // Update select all checkbox state
    const totalUsers = document.querySelectorAll(
      'input[name="user-select"]',
    ).length;
    if (this.selectedUsers.size === totalUsers && totalUsers > 0) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else if (this.selectedUsers.size > 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
  }

  /**
   * Bulk activate users
   */
  async bulkActivateUsers() {
    if (this.selectedUsers.size === 0) return;

    try {
      const userIds = Array.from(this.selectedUsers);
      await this.bulkUpdateUserStatus(userIds, "Active");

      // Log audit event
      await userSecurityService.logSecurityEvent("bulk_activate", "system", {
        userIds,
        count: userIds.length,
      });

      this.clearSelection();
      this.showNotification(
        `Successfully activated ${userIds.length} users`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to activate users");
      this.showNotification("Failed to activate selected users", "error");
    }
  }

  /**
   * Bulk deactivate users
   */
  async bulkDeactivateUsers() {
    if (this.selectedUsers.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to deactivate ${this.selectedUsers.size} users?`,
      )
    ) {
      return;
    }

    try {
      const userIds = Array.from(this.selectedUsers);
      await this.bulkUpdateUserStatus(userIds, "Inactive");

      // Log audit event
      await userSecurityService.logSecurityEvent("bulk_deactivate", "system", {
        userIds,
        count: userIds.length,
      });

      this.clearSelection();
      this.showNotification(
        `Successfully deactivated ${userIds.length} users`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to deactivate users");
      this.showNotification("Failed to deactivate selected users", "error");
    }
  }

  /**
   * Bulk role assignment
   */
  async bulkAssignRole(roleId) {
    if (this.selectedUsers.size === 0) return;

    try {
      const userIds = Array.from(this.selectedUsers);

      for (const userId of userIds) {
        await permissionService.assignRoleToUser(userId, roleId);

        // Update local data
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.role = roleId;
          user.roleAssignedAt = new Date().toISOString();
          await dbService.put("users", user);
        }
      }

      // Log audit event
      await userSecurityService.logSecurityEvent(
        "bulk_role_assignment",
        "system",
        {
          userIds,
          roleId,
          count: userIds.length,
        },
      );

      this.clearSelection();
      this.renderUsers(this.filteredUsers);
      this.showNotification(
        `Successfully assigned role to ${userIds.length} users`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to assign roles");
      this.showNotification(
        "Failed to assign roles to selected users",
        "error",
      );
    }
  }

  /**
   * Bulk email users
   */
  async bulkEmailUsers() {
    if (this.selectedUsers.size === 0) return;

    this.showBulkEmailModal();
  }

  /**
   * Show bulk email modal
   */
  showBulkEmailModal() {
    const modal = this.createBulkEmailModal();
    document.body.appendChild(modal);
    modal.style.display = "block";
  }

  /**
   * Create bulk email modal
   */
  createBulkEmailModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Send Bulk Email</h3>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="bulk-email-subject">Subject</label>
            <input type="text" id="bulk-email-subject" class="form-control" placeholder="Email subject">
          </div>
          <div class="form-group">
            <label for="bulk-email-message">Message</label>
            <textarea id="bulk-email-message" class="form-control" rows="10" placeholder="Email message"></textarea>
          </div>
          <div class="form-group">
            <label>Recipients (${this.selectedUsers.size} users selected)</label>
            <div class="recipient-list">
              ${this.getSelectedUsersEmails()
                .map(
                  (email) =>
                    `<span class="recipient-tag">${security.escapeHtml(email)}</span>`,
                )
                .join("")}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="userManager.sendBulkEmail()">Send Email</button>
        </div>
      </div>
    `;

    // Close modal on click outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close modal on X click
    modal.querySelector(".close").addEventListener("click", () => {
      modal.remove();
    });

    return modal;
  }

  /**
   * Get selected users' email addresses
   */
  getSelectedUsersEmails() {
    return this.users
      .filter((user) => this.selectedUsers.has(user.id))
      .map((user) => user.email);
  }

  /**
   * Send bulk email (simulation)
   */
  async sendBulkEmail() {
    try {
      const subject = document.getElementById("bulk-email-subject").value;
      const message = document.getElementById("bulk-email-message").value;

      if (!subject || !message) {
        alert("Please fill in both subject and message");
        return;
      }

      const recipients = this.getSelectedUsersEmails();

      // Simulate email sending

      // Log audit event
      await userSecurityService.logSecurityEvent("bulk_email", "system", {
        subject,
        recipientCount: recipients.length,
        userIds: Array.from(this.selectedUsers),
      });

      // Close modal
      document.querySelector(".modal").remove();

      this.clearSelection();
      this.showNotification(
        `Email sent to ${recipients.length} users`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to send bulk email");
      this.showNotification("Failed to send bulk email", "error");
    }
  }

  /**
   * Bulk export selected users
   */
  async bulkExportUsers() {
    if (this.selectedUsers.size === 0) return;

    try {
      const selectedUserData = this.users.filter((user) =>
        this.selectedUsers.has(user.id),
      );

      const headers = [
        "Username",
        "Email",
        "Role",
        "Department",
        "Status",
        "Last Login",
        "Created",
        "2FA Enabled",
      ];
      let csvContent =
        "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

      selectedUserData.forEach((user) => {
        const csvRow = [
          user.username,
          user.email,
          user.role,
          user.department,
          user.status,
          user.lastLogin,
          user.created.split("T")[0],
          user.twoFactorEnabled,
        ].join(",");
        csvContent += csvRow + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `selected_users_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.clearSelection();
      this.showNotification(
        `Exported ${selectedUserData.length} users`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to export users");
      this.showNotification("Failed to export selected users", "error");
    }
  }

  /**
   * Bulk import users
   */
  async bulkImportUsers() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await this.readFileAsText(file);
        const users = this.parseCSV(text);
        await this.importUsers(users);
      } catch (error) {
        ErrorHandler.handle(error, "Failed to import users");
        this.showNotification("Failed to import users", "error");
      }
    });

    input.click();
  }

  /**
   * Read file as text
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV text into user objects
   */
  parseCSV(text) {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const user = {};

      headers.forEach((header, index) => {
        user[header.toLowerCase().replace(" ", "_")] = values[index];
      });

      users.push(user);
    }

    return users;
  }

  /**
   * Import users from parsed CSV data
   */
  async importUsers(importedUsers) {
    try {
      let imported = 0;
      let skipped = 0;

      for (const userData of importedUsers) {
        // Validate required fields
        if (!userData.username || !userData.email) {
          skipped++;
          continue;
        }

        // Check for duplicates
        if (
          this.isUsernameTaken(userData.username) ||
          this.isEmailTaken(userData.email)
        ) {
          skipped++;
          continue;
        }

        // Create new user
        const newUser = {
          id: Math.max(...this.users.map((u) => u.id)) + 1 + imported,
          username: userData.username,
          email: userData.email,
          role: userData.role || "Viewer",
          department: userData.department || "General",
          status: userData.status || "Active",
          lastLogin: "Never",
          created: new Date().toISOString(),
          twoFactorEnabled: userData.two_factor_enabled === "true" || false,
          imported: true,
          importedAt: new Date().toISOString(),
        };

        this.users.push(newUser);
        await dbService.add("users", newUser);
        imported++;
      }

      // Log audit event
      await userSecurityService.logSecurityEvent("bulk_import", "system", {
        imported,
        skipped,
        total: importedUsers.length,
      });

      this.renderUsers(this.users, 1);
      this.showNotification(
        `Imported ${imported} users, skipped ${skipped}`,
        "success",
      );
    } catch (error) {
      ErrorHandler.handle(error, "Failed to import users");
      throw error;
    }
  }

  /**
   * Clear user selection
   */
  clearSelection() {
    this.selectedUsers.clear();
    document.querySelectorAll('input[name="user-select"]').forEach((cb) => {
      cb.checked = false;
    });
    document.getElementById("select-all-users").checked = false;
    this.updateBulkOperationsUI();
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // ===== USER PROFILE MANAGEMENT =====

  /**
   * Get user profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await dbService.getById("users", userId);
      if (!user) return null;

      const profile = this.userProfiles.get(userId) || {};
      const activity = await userSecurityService.getUserActivity(user.username);

      return {
        ...user,
        profile,
        activity,
        permissions: await permissionService.getUserPermissions(userId),
      };
    } catch (error) {
      ErrorHandler.handle(error, "Failed to get user profile");
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const user = await dbService.getById("users", userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Update user record
      Object.assign(user, profileData);
      user.modifiedAt = new Date().toISOString();

      await dbService.put("users", user);

      // Update local data
      const localUser = this.users.find((u) => u.id === userId);
      if (localUser) {
        Object.assign(localUser, profileData);
      }

      // Log audit event
      await userSecurityService.logSecurityEvent(
        "profile_update",
        user.username,
        {
          userId,
          changes: Object.keys(profileData),
        },
      );

      this.renderUsers(this.filteredUsers);
      return true;
    } catch (error) {
      ErrorHandler.handle(error, "Failed to update user profile");
      throw error;
    }
  }

  /**
   * Get user onboarding status
   */
  getUserOnboardingStatus(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;

    const template = this.onboardingTemplates.get(
      user.onboardingTemplate || "standard",
    );
    const completedSteps = user.onboardingSteps || [];

    return {
      template,
      completed: completedSteps,
      progress: (completedSteps.length / template.steps.length) * 100,
      isComplete: template.steps.every(
        (step) => !step.required || completedSteps.includes(step.id),
      ),
    };
  }

  /**
   * Update onboarding progress
   */
  async updateOnboardingProgress(userId, stepId, completed = true) {
    try {
      const user = this.users.find((u) => u.id === userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      if (!user.onboardingSteps) {
        user.onboardingSteps = [];
      }

      if (completed && !user.onboardingSteps.includes(stepId)) {
        user.onboardingSteps.push(stepId);
      } else if (!completed) {
        user.onboardingSteps = user.onboardingSteps.filter((s) => s !== stepId);
      }

      await dbService.put("users", user);

      // Log audit event
      await userSecurityService.logSecurityEvent(
        "onboarding_progress",
        user.username,
        {
          userId,
          stepId,
          completed,
        },
      );

      return this.getUserOnboardingStatus(userId);
    } catch (error) {
      ErrorHandler.handle(error, "Failed to update onboarding progress");
      throw error;
    }
  }

  // ===== PASSWORD POLICY ENFORCEMENT =====

  /**
   * Validate password against policy
   */
  async validatePasswordPolicy(password, username, policyName = "default") {
    try {
      return await userSecurityService.validatePassword(password, username);
    } catch (error) {
      ErrorHandler.handle(error, "Failed to validate password policy");
      return { valid: false, errors: ["Password validation failed"] };
    }
  }

  /**
   * Check if password change is required
   */
  async isPasswordChangeRequired(userId) {
    try {
      const user = await dbService.getById("users", userId);
      if (!user) return false;

      // Check if force password change is set
      if (user.forcePasswordChange) return true;

      // Check password age
      const passwordAge = user.passwordChangedAt
        ? Date.now() - new Date(user.passwordChangedAt).getTime()
        : Date.now() - new Date(user.created).getTime();

      const policy = this.passwordPolicies.get(
        user.passwordPolicy || "default",
      );
      const maxAge = policy.maxAge * 24 * 60 * 60 * 1000; // Convert days to milliseconds

      return passwordAge > maxAge;
    } catch (error) {
      ErrorHandler.handle(error, "Failed to check password change requirement");
      return false;
    }
  }

  // ===== USER ACTIVITY MONITORING =====

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId, days = 30) {
    try {
      const user = this.users.find((u) => u.id === userId);
      if (!user) return null;

      return await userSecurityService.getUserActivity(user.username, days);
    } catch (error) {
      ErrorHandler.handle(error, "Failed to get user activity summary");
      return null;
    }
  }

  /**
   * Track user login
   */
  async trackUserLogin(username, ipAddress, userAgent, successful = true) {
    try {
      if (successful) {
        return await userSecurityService.trackSuccessfulLogin(
          username,
          ipAddress,
          userAgent,
        );
      } else {
        return await userSecurityService.trackFailedLogin(
          username,
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      ErrorHandler.handle(error, "Failed to track user login");
    }
  }
}
