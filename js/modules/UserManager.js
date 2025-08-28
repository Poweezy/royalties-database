import { Pagination } from './Pagination.js';

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
      { id: 1, username: 'admin', email: 'admin@government.sz', role: 'Administrator', department: 'Administration', status: 'Active', lastLogin: '2024-02-15 09:15', created: '2024-01-01', twoFactorEnabled: true },
      { id: 2, username: 'j.doe', email: 'john.doe@government.sz', role: 'Editor', department: 'Operations', status: 'Active', lastLogin: '2024-02-14 16:30', created: '2024-01-15', twoFactorEnabled: false },
      { id: 3, username: 'm.smith', email: 'mary.smith@government.sz', role: 'Auditor', department: 'Audit & Compliance', status: 'Inactive', lastLogin: '2024-02-10 14:22', created: '2024-02-01', twoFactorEnabled: true },
      { id: 4, username: 's.jones', email: 'sue.jones@government.sz', role: 'Finance Officer', department: 'Finance', status: 'Active', lastLogin: '2024-02-15 11:05', created: '2024-01-20', twoFactorEnabled: true },
      { id: 5, username: 'p.dlamini', email: 'pete.dlamini@government.sz', role: 'Viewer', department: 'Operations', status: 'Active', lastLogin: '2024-02-13 10:00', created: '2024-01-25', twoFactorEnabled: false },
      { id: 6, username: 'l.gomez', email: 'lisa.gomez@government.sz', role: 'Editor', department: 'Legal Affairs', status: 'Inactive', lastLogin: '2024-02-01 18:30', created: '2024-02-01', twoFactorEnabled: true },
      { id: 7, username: 't.brown', email: 'tom.brown@government.sz', role: 'Administrator', department: 'Administration', status: 'Active', lastLogin: '2024-02-15 09:00', created: '2023-12-15', twoFactorEnabled: true },
      { id: 8, username: 'a.white', email: 'anna.white@government.sz', role: 'Auditor', department: 'Audit & Compliance', status: 'Active', lastLogin: '2024-02-14 13:00', created: '2024-01-18', twoFactorEnabled: false },
      { id: 9, username: 'c.green', email: 'chris.green@government.sz', role: 'Finance Officer', department: 'Finance', status: 'Locked', lastLogin: '2024-02-12 09:00', created: '2024-01-22', twoFactorEnabled: false },
      { id: 10, username: 'b.king', email: 'brian.king@government.sz', role: 'Viewer', department: 'Operations', status: 'Active', lastLogin: '2024-02-15 14:00', created: '2024-01-30', twoFactorEnabled: true },
      { id: 11, username: 'e.clark', email: 'emily.clark@government.sz', role: 'Editor', department: 'Operations', status: 'Expired', lastLogin: '2023-11-15 10:00', created: '2023-10-01', twoFactorEnabled: true },
    ];
    this.tableBody = document.getElementById('users-table-tbody');
    this.filteredUsers = [...this.users]; // Keep a separate list of users after filtering

    this.pagination = new Pagination({
        containerSelector: '#users-pagination',
        itemsPerPage: 5, // Let's use a smaller number for demonstration
        onPageChange: (page) => {
            this.renderUsers(this.filteredUsers, page);
        }
    });

    this.sortColumn = 'username'; // Default sort column
    this.sortDirection = 'asc';   // Default sort direction
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
      users = users.filter(user =>
        user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.role.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by role
    if (role) {
      users = users.filter(user => user.role.toLowerCase() === role.toLowerCase());
    }

    // Filter by status
    if (status) {
      users = users.filter(user => user.status.toLowerCase() === status.toLowerCase());
    }

    this.filteredUsers = users;
    this.renderUsers(this.filteredUsers, 1); // Go back to the first page after filtering
  }

  renderUsers(usersToRender, page = 1) {
    const userList = usersToRender || this.users;
    this.filteredUsers = userList; // Update the filtered list

    if (!this.tableBody) {
      console.error('User table body not found!');
      return;
    }

    // Clear existing rows
    this.tableBody.innerHTML = '';

    // Paginate the data
    const startIndex = (page - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedUsers = userList.slice(startIndex, endIndex);

    if (userList.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">No users found.</td></tr>`;
    } else {
        paginatedUsers.forEach(user => {
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
    return this.users.some(user => user.username.toLowerCase() === username.toLowerCase() && user.id !== userIdToExclude);
  }

  /**
   * Checks if an email is already taken, excluding a specific user ID.
   * @param {string} email - The email to check.
   * @param {number|null} userIdToExclude - The ID of the user to exclude (used when editing).
   * @returns {boolean} - True if the email is taken, otherwise false.
   */
  isEmailTaken(email, userIdToExclude = null) {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== userIdToExclude);
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
    this.renderUsers(this.users, 1);
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
    this.renderUsers(this.users, 1);
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
    this.renderUsers(this.filteredUsers); // Re-render the currently filtered and paginated view
  }

  /**
   * Sorts the user list by a given column and toggles the direction.
   * @param {string} columnKey - The key of the user object to sort by.
   */
  sortUsers(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      const valA = a[columnKey];
      const valB = b[columnKey];

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
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
    this.users = this.users.filter(user => !userIds.includes(user.id));
    this.filteredUsers = this.filteredUsers.filter(user => !userIds.includes(user.id));
    this.renderUsers(this.filteredUsers, 1);
  }

  /**
   * Updates the status for multiple users.
   * @param {number[]} userIds - An array of user IDs to update.
   * @param {string} status - The new status to set.
   */
  bulkUpdateUserStatus(userIds, status) {
    this.users.forEach(user => {
      if (userIds.includes(user.id)) {
        user.status = status;
      }
    });
    // Also update the filtered list to reflect changes immediately
    this.filteredUsers.forEach(user => {
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
