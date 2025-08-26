// js/modules/document-management.js
import { showNotification } from './NotificationManager.js';

// Mock data for documents
let mockDocuments = [
    { id: 1, name: 'Lease_Agreement_Kwalini.pdf', type: 'Lease Agreement', date: '2024-01-01' },
    { id: 2, name: 'Environmental_Impact_Assessment.pdf', type: 'Report', date: '2024-02-15' },
    { id: 3, name: 'Production_Report_Jan2024.xlsx', type: 'Production Data', date: '2024-02-05' },
];

function renderDocuments() {
    const tableBody = document.querySelector('#document-management-table-body');
    if (!tableBody) {
        // Silently return if the element isn't on the page
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows

    mockDocuments.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.name}</td>
            <td>${doc.type}</td>
            <td>${doc.date}</td>
            <td>
                <button class="btn btn-sm btn-info view-doc-btn" data-doc-id="${doc.id}">View</button>
                <button class="btn btn-sm btn-secondary download-doc-btn" data-doc-id="${doc.id}">Download</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

export function initializeDocumentManagement() {
    // Check if we are on a page that needs this module
    const tableBody = document.querySelector('#document-management-table-body');
    if (!tableBody) {
        return;
    }

    console.log('Document Management module initialized');

    renderDocuments();

    const uploadModal = document.getElementById('upload-document-modal');
    const openModalBtn = document.getElementById('upload-document-btn');
    const closeModalBtn = document.getElementById('close-upload-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-upload-btn');
    const uploadForm = document.getElementById('upload-document-form');

    // These elements are essential, so if they don't exist, we shouldn't proceed.
    if (!uploadModal || !openModalBtn || !closeModalBtn || !cancelModalBtn || !uploadForm) {
        console.error('One or more modal elements for document management not found.');
        return;
    }

    const openModal = () => uploadModal.style.display = 'block';
    const closeModal = () => {
        uploadModal.style.display = 'none';
        uploadForm.reset();
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === uploadModal) {
            closeModal();
        }
    });

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const docNameInput = document.getElementById('document-name');
        const docTypeInput = document.getElementById('document-type');

        if (docNameInput.value && docTypeInput.value) {
            const newDocument = {
                id: mockDocuments.length > 0 ? Math.max(...mockDocuments.map(d => d.id)) + 1 : 1,
                name: docNameInput.value,
                type: docTypeInput.value,
                date: new Date().toISOString().split('T')[0],
            };

            mockDocuments.push(newDocument);
            renderDocuments();
            closeModal();
            showNotification(`Document '${newDocument.name}' uploaded successfully.`, 'success');
        }
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const docId = target.dataset.docId;
        if (!docId) return;

        const documentData = mockDocuments.find(d => d.id == docId);
        if (!documentData) return;

        if (target.classList.contains('view-doc-btn')) {
            alert(`Viewing Document:\n\nID: ${documentData.id}\nName: ${documentData.name}\nType: ${documentData.type}\nDate: ${documentData.date}`);
        }

        if (target.classList.contains('download-doc-btn')) {
            showNotification(`Download started for ${documentData.name}...`, 'info');
        }
    });
}
