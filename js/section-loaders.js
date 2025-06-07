// Section-specific loading utilities
export class SectionLoader {
    static async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`Template loading failed for ${templatePath}:`, error);
            return null;
        }
    }

    static createFallbackContent(sectionId) {
        const sectionNames = {
            'dashboard': 'Dashboard',
            'user-management': 'User Management',
            'royalty-records': 'Royalty Records',
            'contract-management': 'Contract Management'
        };

        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>${sectionNames[sectionId] || 'Section'}</h1>
                    <p>Content loading...</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <p>This section is being loaded...</p>
                </div>
            </div>
        `;
    }
}
