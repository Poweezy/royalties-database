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
    this.paginationControls = {
        info: document.querySelector('#users-pagination .pagination-info'),
        prevBtn: document.getElementById('users-prev'),
        nextBtn: document.getElementById('users-next'),
        pagesContainer: document.getElementById('users-pages'),
    };
  }

  /**
   * Renders the user data into the table body.
   * @param {Array<object>} usersToRender - The array of user objects to render.
   */
  renderUserTable(usersToRender) {
    if (!this.tableBody) {
      console.error('User table body not found!');
      return;
    }

    // Clear existing rows
    this.tableBody.innerHTML = '';

    if (!usersToRender || usersToRender.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">No users match the current filters.</td></tr>`;
      return;
    }

    const rowsHtml = usersToRender.map(user => this.createUserRowHtml(user)).join('');
    this.tableBody.innerHTML = rowsHtml;
  }

  /**
   * Updates the pagination controls based on the current state.
   * @param {object} paginationState - The state of the pagination.
   * @param {number} paginationState.currentPage - The current active page.
   * @param {number} paginationState.totalPages - The total number of pages.
   * @param {number} paginationState.totalUsers - The total number of users in the filtered list.
   */
  updatePaginationControls({ currentPage, totalPages, totalUsers }) {
      if (!this.paginationControls.info) return;

      if (totalUsers === 0) {
          this.paginationControls.info.textContent = 'No users found';
      } else {
          const startUser = (currentPage - 1) * 10 + 1;
          const endUser = Math.min(currentPage * 10, totalUsers);
          this.paginationControls.info.textContent = `Showing ${startUser} to ${endUser} of ${totalUsers} users`;
      }

      this.paginationControls.prevBtn.disabled = currentPage === 1;
      this.paginationControls.nextBtn.disabled = currentPage === totalPages || totalPages === 0;

      // Render page number buttons (simple version)
      this.paginationControls.pagesContainer.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
          const pageBtn = document.createElement('button');
          pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
          pageBtn.textContent = i;
          pageBtn.dataset.page = i;
          this.paginationControls.pagesContainer.appendChild(pageBtn);
      }
  }

  /**
   * Adds a new user to the list.
   * @param {object} userData - The new user's data from the form.
   */
  addUser(userData) {
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
    this.renderUserTable(this.users);
  }

  /**
   * Deletes a user from the list.
   * @param {number} userId - The ID of the user to delete.
   */
  deleteUser(userId) {
    const userIndex = this.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    this.users.splice(userIndex, 1);
    this.renderUserTable(this.users);
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
   * Retrieves a single user by their username.
   * @param {string} username - The username to search for.
   * @returns {object|undefined} The user object or undefined if not found.
   */
  getUserByUsername(username) {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  /**
   * Updates an existing user's data.
   * @param {number} userId - The ID of the user to update.
   * @param {object} updatedData - An object containing the new data for the user.
   */
  updateUser(userId, updatedData) {
    const user = this.getUser(userId);
    if (!user) {
      console.error(`Cannot update user: User with ID ${userId} not found.`);
      return;
    }

    Object.assign(user, updatedData);
  }

  /**
   * Returns a filtered list of users based on the provided criteria.
   * @param {object} filters - An object containing filter criteria.
   * @param {string} filters.search - The search term for username or email.
   * @param {string} filters.role - The role to filter by.
   * @param {string} filters.status - The status to filter by.
   * @returns {Array<object>} A new array of users that match the filters.
   */
  getFilteredUsers({ search = '', role = '', status = '' }) {
    const searchTerm = search.toLowerCase();

    return this.users.filter(user => {
      const matchesSearch = searchTerm === '' ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);

      const matchesRole = role === '' || user.role.toLowerCase() === role;

      const matchesStatus = status === '' || user.status.toLowerCase() === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
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
