/**
 * @module DocumentManagement
 * @description Handles all logic for the Document Management section.
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { authService } from "../services/auth.service.js";
import { Pagination } from "./Pagination.js";

const DocumentManagement = {
  elements: {},
  pagination: null,

  async init() {
    console.log("Initializing Document Management...");
    this.cacheDOMElements();
    this.pagination = new Pagination({
      containerSelector: "#document-management-pagination",
      itemsPerPage: 5,
      onPageChange: (page) => {
        this.renderDocuments(page);
      },
    });
    this.bindEvents();
    await this.seedInitialData();
    await this.renderDocuments();
    console.log("Document Management Initialized.");
  },

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById("document-management-table-body"),
      paginationContainer: document.getElementById(
        "document-management-pagination",
      ),
      uploadBtn: document.getElementById("upload-document-btn"),
      uploadModal: document.getElementById("upload-document-modal"),
      closeModalBtn: document.getElementById("close-upload-document-modal-btn"),
      cancelBtn: document.getElementById("cancel-upload-document-btn"),
      uploadForm: document.getElementById("upload-document-form"),
      fileInput: document.getElementById("document-file"),
      categoryInput: document.getElementById("document-category"),
    };

    if (!this.elements.paginationContainer) {
      this.elements.paginationContainer = document.createElement("div");
      this.elements.paginationContainer.id = "document-management-pagination";
      this.elements.tableBody.parentElement.after(
        this.elements.paginationContainer,
      );
    }
  },

  bindEvents() {
    this.elements.uploadBtn.addEventListener("click", () => this.openModal());
    this.elements.closeModalBtn.addEventListener("click", () =>
      this.closeModal(),
    );
    this.elements.cancelBtn.addEventListener("click", () => this.closeModal());
    this.elements.uploadForm.addEventListener("submit", (e) =>
      this.handleFormSubmit(e),
    );
  },

  openModal() {
    this.elements.uploadForm.reset();
    this.elements.uploadModal.style.display = "block";
  },

  closeModal() {
    this.elements.uploadModal.style.display = "none";
    this.elements.uploadForm.reset();
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    const file = this.elements.fileInput.files[0];
    const category = this.elements.categoryInput.value;

    if (!file || !category) {
      showToast("Please select a file and a category.", "error");
      return;
    }

    // Simulate file upload and storage
    const documentData = {
      id: `doc_${Date.now()}`,
      filename: file.name,
      category: category,
      uploadedBy: authService.getCurrentUser()?.username || "admin",
      uploadDate: new Date().toISOString(),
      size: file.size,
      type: file.type,
    };

    try {
      await dbService.add("documents", documentData);
      await this.renderDocuments(1);
      this.closeModal();
      showToast("Document uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading document:", error);
      showToast("Failed to upload document.", "error");
    }
  },

  async renderDocuments(page = 1) {
    try {
      const documents = await dbService.getAll("documents");
      documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      const startIndex = (page - 1) * this.pagination.itemsPerPage;
      const endIndex = startIndex + this.pagination.itemsPerPage;
      const paginatedDocs = documents.slice(startIndex, endIndex);

      this.elements.tableBody.innerHTML = "";
      if (documents.length === 0) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No documents found.</td></tr>`;
      } else {
        paginatedDocs.forEach((doc) => {
          const row = this.createDocumentRow(doc);
          this.elements.tableBody.appendChild(row);
        });
      }
      this.pagination.render(documents.length, page);
    } catch (error) {
      console.error("Error rendering documents:", error);
      showToast("Failed to load documents.", "error");
    }
  },

  createDocumentRow(doc) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", doc.id);
    const fileSize = (doc.size / 1024).toFixed(2); // in KB

    row.innerHTML = `
      <td><i class="fas fa-file-alt"></i> ${doc.filename}</td>
      <td>${doc.category}</td>
      <td>${doc.uploadedBy}</td>
      <td>${new Date(doc.uploadDate).toLocaleDateString()}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-info download-btn" title="Download Document"><i class="fas fa-download"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" title="Delete Document"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

    row
      .querySelector(".download-btn")
      .addEventListener("click", () => this.handleDownloadDocument(doc.id));
    row
      .querySelector(".delete-btn")
      .addEventListener("click", () => this.handleDeleteDocument(doc.id));
    return row;
  },

  async handleDownloadDocument(docId) {
    try {
      const doc = await dbService.getById("documents", docId);
      if (!doc) {
        showToast("Document not found.", "error");
        return;
      }

      // Simulate file download by creating a text file with the document's metadata
      const fileContent = `
        Document Details
        ----------------
        Filename: ${doc.filename}
        Category: ${doc.category}
        Uploaded By: ${doc.uploadedBy}
        Upload Date: ${new Date(doc.uploadDate).toLocaleString()}
        File Size: ${(doc.size / 1024).toFixed(2)} KB
        File Type: ${doc.type}
      `;

      const blob = new Blob([fileContent.trim()], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.filename.split(".")[0]}_details.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      showToast("Failed to download document.", "error");
    }
  },

  async handleDeleteDocument(docId) {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await dbService.delete("documents", docId);
        await this.renderDocuments(1);
        showToast("Document deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting document:", error);
        showToast("Failed to delete document.", "error");
      }
    }
  },

  async seedInitialData() {
    const documents = await dbService.getAll("documents");
    if (documents.length === 0) {
      const seedData = [
        {
          id: "doc_1",
          filename: "Q2_Report.pdf",
          category: "Compliance Report",
          uploadedBy: "admin",
          uploadDate: new Date("2024-07-28").toISOString(),
          size: 123456,
          type: "application/pdf",
        },
        {
          id: "doc_2",
          filename: "Kwalini_Contract.docx",
          category: "Contract",
          uploadedBy: "j.doe",
          uploadDate: new Date("2024-07-25").toISOString(),
          size: 45678,
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        {
          id: "doc_3",
          filename: "Maloma_Lease.pdf",
          category: "Lease Agreement",
          uploadedBy: "m.smith",
          uploadDate: new Date("2024-07-22").toISOString(),
          size: 98765,
          type: "application/pdf",
        },
        {
          id: "doc_4",
          filename: "Financials_2023.xlsx",
          category: "Financial Statement",
          uploadedBy: "admin",
          uploadDate: new Date("2024-07-20").toISOString(),
          size: 234567,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        {
          id: "doc_5",
          filename: "Site_Inspection_Photos.zip",
          category: "Other",
          uploadedBy: "j.doe",
          uploadDate: new Date("2024-07-18").toISOString(),
          size: 567890,
          type: "application/zip",
        },
        {
          id: "doc_6",
          filename: "EIA_Report_Ngwenya.pdf",
          category: "Compliance Report",
          uploadedBy: "m.smith",
          uploadDate: new Date("2024-07-15").toISOString(),
          size: 345678,
          type: "application/pdf",
        },
        {
          id: "doc_7",
          filename: "Employee_Handbook.pdf",
          category: "Other",
          uploadedBy: "admin",
          uploadDate: new Date("2024-07-10").toISOString(),
          size: 150000,
          type: "application/pdf",
        },
      ];
      for (const doc of seedData) {
        await dbService.add("documents", doc);
      }
    }
  },
};

export default DocumentManagement;
