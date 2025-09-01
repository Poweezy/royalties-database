/**
 * @module Pagination
 * @description A reusable pagination component.
 */
export class Pagination {
  /**
   * @param {object} options - The options for the pagination component.
   * @param {string} options.containerSelector - The selector for the container where pagination controls will be rendered.
   * @param {number} options.itemsPerPage - The number of items to display per page.
   * @param {function} options.onPageChange - The callback function to execute when the page changes. It receives the new page number as an argument.
   */
  constructor({ containerSelector, itemsPerPage = 10, onPageChange }) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(
        `Pagination container with selector "${containerSelector}" not found.`,
      );
    }
    this.itemsPerPage = itemsPerPage;
    this.onPageChange = onPageChange;
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
  }

  /**
   * Renders the pagination controls.
   * @param {number} totalItems - The total number of items to paginate.
   * @param {number} [currentPage=1] - The page to set as the current active page.
   */
  render(totalItems, currentPage = 1) {
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage =
      currentPage > this.totalPages
        ? this.totalPages
        : currentPage < 1
          ? 1
          : currentPage;

    if (this.totalPages <= 1) {
      this.container.innerHTML = ""; // No need for pagination if there's only one page or less
      return;
    }

    this.container.innerHTML = this.generateHtml();
    this.bindEvents();
  }

  /**
   * Generates the HTML for the pagination controls.
   * @returns {string} The generated HTML string.
   */
  generateHtml() {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalItems,
    );

    const prevDisabled = this.currentPage === 1 ? "disabled" : "";
    const nextDisabled = this.currentPage === this.totalPages ? "disabled" : "";

    return `
      <div class="pagination-info">
        Showing <span>${startItem}</span> to <span>${endItem}</span> of <span>${this.totalItems}</span> items
      </div>
      <div class="pagination-controls">
        <button class="btn btn-sm btn-secondary" id="pagination-prev" ${prevDisabled}>
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span class="pagination-pages">
          ${this.generatePageButtons()}
        </span>
        <button class="btn btn-sm btn-secondary" id="pagination-next" ${nextDisabled}>
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;
  }

  /**
   * Generates the HTML for the page number buttons.
   * @returns {string} The generated HTML string for the page buttons.
   */
  generatePageButtons() {
    // This logic creates page buttons with ellipses (...) for large numbers of pages.
    const buttons = [];
    const maxButtons = 5; // Max number of page buttons to show
    const delta = 2;

    if (this.totalPages <= maxButtons) {
      for (let i = 1; i <= this.totalPages; i++) {
        buttons.push(this.createPageButton(i));
      }
    } else {
      // Always show first page
      buttons.push(this.createPageButton(1));

      // Ellipsis logic
      if (this.currentPage > delta + 1) {
        buttons.push('<span class="page-ellipsis">...</span>');
      }

      const start = Math.max(2, this.currentPage - delta);
      const end = Math.min(this.totalPages - 1, this.currentPage + delta);

      for (let i = start; i <= end; i++) {
        buttons.push(this.createPageButton(i));
      }

      if (this.currentPage < this.totalPages - delta) {
        buttons.push('<span class="page-ellipsis">...</span>');
      }

      // Always show last page
      buttons.push(this.createPageButton(this.totalPages));
    }

    return buttons.join("");
  }

  /**
   * Creates a single page button HTML element.
   * @param {number} page - The page number for the button.
   * @returns {string} The HTML string for a single button.
   */
  createPageButton(page) {
    const activeClass = page === this.currentPage ? "active" : "";
    return `<button class="page-btn ${activeClass}" data-page="${page}">${page}</button>`;
  }

  /**
   * Binds event listeners to the pagination controls.
   */
  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const target = e.target;
      if (target.id === "pagination-prev" && this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      } else if (
        target.id === "pagination-next" &&
        this.currentPage < this.totalPages
      ) {
        this.goToPage(this.currentPage + 1);
      } else if (target.classList.contains("page-btn")) {
        const page = parseInt(target.dataset.page, 10);
        if (page !== this.currentPage) {
          this.goToPage(page);
        }
      }
    });
  }

  /**
   * Navigates to a specific page and triggers the onPageChange callback.
   * @param {number} page - The page number to navigate to.
   */
  goToPage(page) {
    this.currentPage = page;
    this.render(this.totalItems, this.currentPage);
    if (this.onPageChange) {
      this.onPageChange(this.currentPage);
    }
  }
}
