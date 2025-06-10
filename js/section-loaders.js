// Section-specific loading utilities
export class SectionLoader {
    static async loadTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (response.ok) {
                return await response.text();
            }
            console.warn(`Template not found: ${templatePath}`);
            return null;
        } catch (error) {
            console.error(`Error loading template ${templatePath}:`, error);
            return null;
        }
    }

    static async loadComponent(componentPath) {
        try {
            const response = await fetch(componentPath);
            if (response.ok) {
                return await response.text();
            }
            console.warn(`Component not found: ${componentPath}`);
            return null;
        } catch (error) {
            console.error(`Error loading component ${componentPath}:`, error);
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
        
        const sectionName = sectionNames[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('-', ' ');
        
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>${sectionName}</h1>
                    <p>Loading ${sectionName.toLowerCase()} content...</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading content...</p>
                    </div>
                </div>
            </div>
        `;
    }

    static async loadSectionContent(sectionId, container) {
        const template = await this.loadTemplate(`templates/${sectionId}.html`);
        
        if (template && container) {
            container.innerHTML = template;
            return true;
        } else if (container) {
            container.innerHTML = this.createFallbackContent(sectionId);
            return false;
        }
        
        return false;
    }
}
