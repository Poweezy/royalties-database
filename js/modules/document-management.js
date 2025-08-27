/**
 * @module DocumentManagement
 * @description Handles all logic for the Document Management section.
 */
import { dbService } from '../services/database.service.js';
import { showToast } from './NotificationManager.js';
import { authService } from '../services/auth.service.js';

const DocumentManagement = {
  elements: {},

  async init() {
    console.log('Initializing Document Management...');
    this.cacheDOMElements();
    this.bindEvents();
    await this.renderDocuments();
    console.log('Document Management Initialized.');
  },

  cacheDOMElements() {
    this.elements = {
      tableBody: document.getElementById('document-management-table-body'),
      uploadBtn: document.getElementById('upload-document-btn'),
      uploadModal: document.getElementById('upload-document-modal'),
      closeModalBtn: document.getElementById('close-upload-document-modal-btn'),
      cancelBtn: document.getElementById('cancel-upload-document-btn'),
      uploadForm: document.getElementById('upload-document-form'),
      fileInput: document.getElementById('document-file'),
      categoryInput: document.getElementById('document-category'),
    };
  },

  bindEvents() {
    this.elements.uploadBtn.addEventListener('click', () => this.openModal());
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
    this.elements.uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
  },

  openModal() {
    this.elements.uploadForm.reset();
    this.elements.uploadModal.style.display = 'block';
  },

  closeModal() {
    this.elements.uploadModal.style.display = 'none';
    this.elements.uploadForm.reset();
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    const file = this.elements.fileInput.files[0];
    const category = this.elements.categoryInput.value;

    if (!file || !category) {
      showToast('Please select a file and a category.', 'error');
      return;
    }

    // Simulate file upload and storage
    const documentData = {
      id: `doc_${Date.now()}`,
      filename: file.name,
      category: category,
      uploadedBy: authService.getCurrentUser()?.username || 'admin',
      uploadDate: new Date().toISOString(),
      size: file.size,
      type: file.type,
    };

    try {
      await dbService.add('documents', documentData);
      await this.renderDocuments();
      this.closeModal();
      showToast('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast('Failed to upload document.', 'error');
    }
  },

  async renderDocuments() {
    try {
      const documents = await dbService.getAll('documents');
      this.elements.tableBody.innerHTML = '';
      if (documents.length === 0) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No documents found.</td></tr>`;
        return;
      }
      documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      documents.forEach(doc => {
        const row = this.createDocumentRow(doc);
        this.elements.tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error rendering documents:', error);
      showToast('Failed to load documents.', 'error');
    }
  },

  createDocumentRow(doc) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', doc.id);
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

    row.querySelector('.download-btn').addEventListener('click', () => this.handleDownloadDocument(doc.id));
    row.querySelector('.delete-btn').addEventListener('click', () => this.handleDeleteDocument(doc.id));
    return row;
  },

  async handleDownloadDocument(docId) {
    try {
      const doc = await dbService.getById('documents', docId);
      if (!doc) {
        showToast('Document not found.', 'error');
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

      const blob = new Blob([fileContent.trim()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.filename.split('.')[0]}_details.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading document:', error);
      showToast('Failed to download document.', 'error');
    }
  },

  async handleDeleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await dbService.delete('documents', docId);
        await this.renderDocuments();
        showToast('Document deleted successfully.', 'success');
      } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Failed to delete document.', 'error');
      }
    }
  }
};

export default DocumentManagement;
