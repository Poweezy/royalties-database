/**
 * Document Manager
 * Consolidates basic and enhanced document management features
 */
import { dbService } from "../services/database.service.js";
import { showToast } from "./NotificationManager.js";
import { security } from "../utils/security.js";
import { auditService } from "../services/audit.service.js";
import { authService } from "../services/auth.service.js";
import { Pagination } from "./Pagination.js";
import { logger } from "../utils/logger.js";

export class DocumentManager {
    constructor() {
        this.elements = {};
        this.pagination = null;
        this.documents = [];
        this.documentTypes = [];
        this.workflows = [];
        this.templates = [];
        this.approvals = [];
        this.auditTrail = [];
        this.initialized = false;
    }

    /**
     * Initialize Document Manager
     */
    async init() {
        if (this.initialized) return;

        logger.debug("Initializing Document Manager...");

        // Load config from enhanced logic
        this.loadDocumentTypes();
        this.loadWorkflows();
        this.loadTemplates();

        this.cacheDOMElements();
        this.pagination = new Pagination({
            containerSelector: "#document-management-pagination",
            itemsPerPage: 10,
            onPageChange: (page) => {
                this.renderDocuments(page);
            },
        });

        if (this.elements.uploadForm) {
            this.bindEvents();
        }

        await this.refreshDocuments();
        this.initialized = true;
        logger.debug("Document Manager Initialized.");
    }

    loadDocumentTypes() {
        this.documentTypes = [
            { id: 'contract', name: 'Mining Contract', category: 'legal', extensions: ['.pdf', '.doc', '.docx'], requiresApproval: true },
            { id: 'license', name: 'Mining License', category: 'regulatory', extensions: ['.pdf', '.jpg', '.png'], requiresApproval: true },
            { id: 'production_report', name: 'Production Report', category: 'operational', extensions: ['.pdf', '.xls', '.xlsx', '.csv'], requiresApproval: false },
            { id: 'environmental', name: 'Environmental Assessment', category: 'compliance', extensions: ['.pdf', '.doc', '.docx'], requiresApproval: true },
            { id: 'financial', name: 'Financial Statement', category: 'financial', extensions: ['.pdf', '.xls', '.xlsx'], requiresApproval: true },
            { id: 'correspondence', name: 'Official Correspondence', category: 'communication', extensions: ['.pdf', '.doc', '.docx'], requiresApproval: false }
        ];
    }

    loadWorkflows() {
        this.workflows = [
            { id: 'standard', name: 'Standard Approval', steps: ['Review', 'Approval'], types: ['contract', 'license', 'environmental'] }
        ];
    }

    loadTemplates() {
        this.templates = [
            { id: 'contract_v1', name: 'Standard Contract v1', type: 'contract' }
        ];
    }

    cacheDOMElements() {
        const ids = [
            "document-management-table-body",
            "document-management-pagination",
            "upload-document-btn",
            "upload-document-modal",
            "close-upload-document-modal-btn",
            "cancel-upload-document-btn",
            "upload-document-form",
            "document-file",
            "document-category"
        ];

        ids.forEach(id => {
            this.elements[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = document.getElementById(id);
        });

        // Fallback if missing some elements in specific views
        if (!this.elements.documentManagementPagination && this.elements.documentManagementTableBody) {
            this.elements.documentManagementPagination = document.createElement("div");
            this.elements.documentManagementPagination.id = "document-management-pagination";
            this.elements.documentManagementTableBody.parentElement.after(this.elements.documentManagementPagination);
        }
    }

    bindEvents() {
        if (this.elements.uploadDocumentBtn) {
            this.elements.uploadDocumentBtn.addEventListener("click", () => this.openModal());
        }
        if (this.elements.closeUploadDocumentModalBtn) {
            this.elements.closeUploadDocumentModalBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.cancelUploadDocumentBtn) {
            this.elements.cancelUploadDocumentBtn.addEventListener("click", () => this.closeModal());
        }
        if (this.elements.uploadDocumentForm) {
            this.elements.uploadDocumentForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
        }
    }

    openModal() {
        this.elements.uploadDocumentForm.reset();
        delete this.elements.uploadDocumentForm.dataset.versionOf;
        const title = this.elements.uploadDocumentModal.querySelector("h4");
        if (title) title.textContent = "Upload Document";
        this.elements.uploadDocumentModal.style.display = "block";
    }

    closeModal() {
        this.elements.uploadDocumentModal.style.display = "none";
        this.elements.uploadDocumentForm.reset();
        delete this.elements.uploadDocumentForm.dataset.versionOf;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const file = this.elements.documentFile.files[0];
        const category = this.elements.documentCategory.value;
        const existingId = this.elements.uploadDocumentForm.dataset.versionOf;

        if (!file || !category) {
            showToast("Please select a file and a category.", "error");
            return;
        }

        try {
            if (existingId) {
                await this.uploadNewVersion(existingId, file);
            } else {
                await this.uploadNewDocument(file, category);
            }

            await this.refreshDocuments();
            this.closeModal();
        } catch (error) {
            logger.error("Error handling document upload", error);
            showToast("Failed to upload document.", "error");
        }
    }

    async uploadNewDocument(file, category) {
        const docType = this.documentTypes.find(t => t.id === category || t.name === category);
        const docData = {
            id: `DOC-${Date.now()}`,
            filename: security.sanitizeInput(file.name),
            category: security.sanitizeInput(category),
            uploadDate: new Date().toISOString(),
            size: file.size,
            type: file.type,
            uploadedBy: authService.getCurrentUser()?.username || "admin",
            status: docType?.requiresApproval ? 'Pending Review' : 'Active',
            version: 1,
            history: []
        };

        await dbService.add("documents", docData);
        await auditService.log('Document Uploaded', 'Data', { id: docData.id, name: docData.filename });
        showToast("Document uploaded successfully!", "success");
    }

    async uploadNewVersion(docId, file) {
        const doc = await dbService.getById("documents", docId);
        if (!doc) throw new Error("Original document not found");

        // Save current version to history
        const versionEntry = {
            version: doc.version,
            filename: doc.filename,
            uploadDate: doc.uploadDate,
            uploadedBy: doc.uploadedBy,
            size: doc.size
        };

        doc.history = doc.history || [];
        doc.history.push(versionEntry);

        // Update main entry with new file data
        doc.version += 1;
        doc.filename = security.sanitizeInput(file.name);
        doc.uploadDate = new Date().toISOString();
        doc.size = file.size;
        doc.type = file.type;
        doc.uploadedBy = authService.getCurrentUser()?.username || "admin";

        await dbService.put("documents", doc);
        await auditService.log('Document Version Updated', 'Data', { id: doc.id, newVersion: doc.version });
        showToast(`Updated to version ${doc.version}!`, "success");
    }

    async refreshDocuments() {
        this.documents = await dbService.getAll("documents");
        this.documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        await this.renderDocuments(1);
    }

    async renderDocuments(page = 1) {
        if (!this.elements.documentManagementTableBody) return;

        const startIndex = (page - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const paginatedDocs = this.documents.slice(startIndex, endIndex);

        this.elements.documentManagementTableBody.innerHTML = "";
        if (this.documents.length === 0) {
            this.elements.documentManagementTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No documents found.</td></tr>`;
        } else {
            paginatedDocs.forEach((doc) => {
                const row = this.createDocumentRow(doc);
                this.elements.documentManagementTableBody.appendChild(row);
            });
        }
        this.pagination.render(this.documents.length, page);
    }

    createDocumentRow(doc) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", doc.id);
        const fileSize = (doc.size / 1024).toFixed(2);

        row.innerHTML = `
      <td>
        <div class="doc-title-cell">
            <i class="fas fa-file-alt"></i> 
            <span>${doc.filename}</span>
            ${doc.version > 1 ? `<span class="version-badge">v${doc.version}</span>` : ''}
        </div>
      </td>
      <td>${doc.category}</td>
      <td>${doc.uploadedBy}</td>
      <td>${new Date(doc.uploadDate).toLocaleDateString()}</td>
      <td><span class="badge ${this.getStatusBadgeClass(doc.status)}">${doc.status || 'Active'}</span></td>
      <td>
        <div class="row-actions">
          <button class="action-btn preview-btn" title="Preview"><i class="fas fa-eye"></i></button>
          <button class="action-btn version-btn" title="Upload New Version"><i class="fas fa-history"></i></button>
          <button class="action-btn download-btn" title="Download"><i class="fas fa-download"></i></button>
          <button class="action-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

        row.querySelector(".preview-btn").addEventListener("click", () => this.handlePreviewDocument(doc.id));
        row.querySelector(".version-btn").addEventListener("click", () => this.handleNewVersion(doc.id));
        row.querySelector(".download-btn").addEventListener("click", () => this.handleDownloadDocument(doc.id));
        row.querySelector(".delete-btn").addEventListener("click", () => this.handleDeleteDocument(doc.id));
        return row;
    }

    handleNewVersion(docId) {
        const title = this.elements.uploadDocumentModal.querySelector("h4");
        if (title) title.textContent = "Upload New Version";
        this.elements.uploadDocumentForm.dataset.versionOf = docId;
        this.elements.uploadDocumentModal.style.display = "block";
    }

    async handlePreviewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        const previewModal = document.createElement("div");
        previewModal.className = "preview-overlay blur-bg";
        previewModal.innerHTML = `
            <div class="preview-container glass">
                <div class="preview-header">
                    <h3>Preview: ${doc.filename}</h3>
                    <button class="close-preview"><i class="fas fa-times"></i></button>
                </div>
                <div class="preview-content">
                    <div class="preview-placeholder">
                        <i class="fas fa-file-pdf fa-4x"></i>
                        <p>Document Preview is active for ${doc.category}</p>
                        <p class="text-muted">Version ${doc.version} - ${ (doc.size/1024).toFixed(2) } KB</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);
        previewModal.querySelector(".close-preview").addEventListener("click", () => previewModal.remove());
    }

    getStatusBadgeClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'pending review': return 'bg-warning text-dark';
            case 'rejected': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    async handleDownloadDocument(docId) {
        try {
            const doc = this.documents.find(d => d.id === docId);
            if (!doc) return;

            const fileContent = `Document Details\nFilename: ${doc.filename}\nUploaded By: ${doc.uploadedBy}`;
            const blob = new Blob([fileContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${doc.filename}_meta.txt`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showToast("Download failed", "error");
        }
    }

    async handleDeleteDocument(docId) {
        if (confirm("Delete this document?")) {
            try {
                await dbService.delete("documents", docId);
                await this.refreshDocuments();
                showToast("Document deleted", "success");
            } catch (error) {
                showToast("Delete failed", "error");
            }
        }
    }
}
