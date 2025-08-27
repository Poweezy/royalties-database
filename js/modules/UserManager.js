/**
 * UserManager Module
 *
 * This module encapsulates all logic for managing users, including
 * fetching, rendering, adding, updating, and deleting users.
 */
export class UserManager {
  constructor() {
    // In a real application, this would be fetched from a server.
    // For now, we use a static array based on the original HTML.
    this.users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@government.sz',
        role: 'Administrator',
        department: 'Administration',
        status: 'Active',
        lastLogin: '2024-02-15 09:15',
        created: '2024-01-01',
        twoFactorEnabled: true,
      },
      {
        id: 2,
        username: 'j.doe',
        email: 'john.doe@government.sz',
        role: 'Editor',
        department: 'Operations',
        status: 'Active',
        lastLogin: '2024-02-14 16:30',
        created: '2024-01-15',
        twoFactorEnabled: false,
      },
      {
        id: 3,
        username: 'm.smith',
        email: 'mary.smith@government.sz',
        role: 'Auditor',
        department: 'Audit & Compliance',
        status: 'Inactive',
        lastLogin: '2024-02-10 14:22',
        created: '2024-02-01',
        twoFactorEnabled: true,
      },
    ];
    this.tableBody = document.getElementById('users-table-tbody');
  }

  /**
   * Filters and renders the list of users based on the provided criteria.
   * @param {object} filters - The filter criteria.
   * @param {string} filters.searchTerm - The text to search for.
   * @param {string} filters.role - The role to filter by.
   * @param {string} filters.status - The status to filter by.
   */
  filterUsers(filters) {
    let filteredUsers = this.users;
    const { searchTerm, role, status } = filters;

    // Filter by search term (username, email, role)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.role.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by role
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role.toLowerCase() === role.toLowerCase());
    }

    // Filter by status
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status.toLowerCase() === status.toLowerCase());
    }

    this.renderUsers(filteredUsers);
  }

  renderUsers(usersToRender) {
    const users = usersToRender || this.users;
    if (!this.tableBody) {
      console.error('User table body not found!');
      return;
    }

    // Clear existing rows
    this.tableBody.innerHTML = '';

    if (users.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">No users found.</td></tr>`;
      return;
    }

    users.forEach(user => {
      const row = this.tableBody.insertRow();
      row.innerHTML = this.createUserRowHtml(user);
    });
  }

  /**
   * Adds a new user to the list and re-renders the table.
   * @param {object} userData - The new user's data from the form.
   */
  addUser(userData) {
    // Generate a new ID (in a real app, this would come from the backend)
    const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
      id: newId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      status: 'Active', // Default status
      lastLogin: 'Never',
      created: new Date().toISOString().split('T')[0], // Today's date
      twoFactorEnabled: userData.forcePasswordChange || false, // Example logic
    };

    this.users.push(newUser);
    this.renderUsers();
  }

  /**
   * Deletes a user from the list and re-renders the table.
   * @param {number} userId - The ID of the user to delete.
   */
  deleteUser(userId) {
    const userIndex = this.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    this.users.splice(userIndex, 1);
    this.renderUsers();
  }

  /**
   * Retrieves a single user by their ID.
   * @param {number} userId - The ID of the user to retrieve.
   * @returns {object|undefined} The user object or undefined if not found.
   */
  getUser(userId) {
    return this.users.find(user => user.id === userId);
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
    this.renderUsers();
  }

  /**
   * Deletes multiple users from the list.
   * @param {number[]} userIds - An array of user IDs to delete.
   */
  bulkDeleteUsers(userIds) {
    this.users = this.users.filter(user => !userIds.includes(user.id));
    this.renderUsers();
  }

  /**
   * Generates the HTML for a single user row.
   * @param {object} user - The user object.
   * @returns {string} The HTML string for the table row.
   */
  createUserRowHtml(user) {
    const roleClass = user.role.toLowerCase().replace(' ', '-');
    const statusClass = user.status.toLowerCase();
    const twoFactorIcon = user.twoFactorEnabled
      ? '<i class="fas fa-check-circle text-success" title="2FA Enabled" aria-label="2FA Enabled"></i>'
      : '<i class="fas fa-times-circle text-danger" title="2FA Disabled" aria-label="2FA Disabled"></i>';

    const lastLoginDate = user.lastLogin === 'Never' ? 'Never' : user.lastLogin.split(' ')[0];
    const createdDate = user.created.split('T')[0];

    return `
        <td><input type="checkbox" name="user-select" value="${user.id}"></td>
        <td data-label="Username">${user.username}</td>
        <td data-label="Email">${user.email}</td>
        <td data-label="Role"><span class="role-badge ${roleClass}">${user.role}</span></td>
        <td data-label="Department">${user.department}</td>
        <td data-label="Status"><span class="status-badge ${statusClass}">${user.status}</span></td>
        <td data-label="Last Login">${lastLoginDate}</td>
        <td data-label="Created">${createdDate}</td>
        <td data-label="2FA">${twoFactorIcon}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-info btn-sm" title="Edit user" data-user-id="${user.id}" aria-label="Edit user ${user.username}">
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
    const rows = this.tableBody.querySelectorAll('tr');
    if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan="10"]'))) {
        alert('No users to export.');
        return;
    }

    const headers = ['Username', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Created', '2FA Enabled'];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    rows.forEach(row => {
        const username = row.querySelector('[data-label="Username"]').textContent;
        const email = row.querySelector('[data-label="Email"]').textContent;
        const role = row.querySelector('[data-label="Role"]').textContent;
        const department = row.querySelector('[data-label="Department"]').textContent;
        const status = row.querySelector('[data-label="Status"]').textContent;
        const lastLogin = row.querySelector('[data-label="Last Login"]').textContent;
        const created = row.querySelector('[data-label="Created"]').textContent;
        const twoFactor = row.querySelector('[data-label="2FA"] i').classList.contains('fa-check-circle');

        const csvRow = [username, email, role, department, status, lastLogin, created, twoFactor].join(",");
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
}
