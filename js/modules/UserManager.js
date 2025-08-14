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
   * Renders the list of users into the user management table.
   */
  renderUsers() {
    if (!this.tableBody) {
      console.error('User table body not found!');
      return;
    }

    // Clear existing rows
    this.tableBody.innerHTML = '';

    if (this.users.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">No users found.</td></tr>`;
      return;
    }

    const rowsHtml = this.users.map(user => this.createUserRowHtml(user)).join('');
    this.tableBody.innerHTML = rowsHtml;
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

    return `
      <tr>
        <td><input type="checkbox" name="user-select" value="${user.id}"></td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${roleClass}">${user.role}</span></td>
        <td>${user.department}</td>
        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
        <td>${user.lastLogin}</td>
        <td>${user.created}</td>
        <td>${twoFactorIcon}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-info btn-sm" title="Edit user" data-user-id="${user.id}">
              <i class="fas fa-edit" aria-label="Edit icon"></i>
            </button>
            <button class="btn btn-warning btn-sm" title="Reset password" data-user-id="${user.id}">
              <i class="fas fa-key" aria-label="Reset password icon"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete user" data-user-id="${user.id}">
              <i class="fas fa-trash" aria-label="Delete icon"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}
