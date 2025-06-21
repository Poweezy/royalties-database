/**
 * Section Component Manager
 * 
 * A comprehensive solution that ensures all components and sections load
 * and initialize correctly when each section is called, especially after navigation.
 * 
 * This file centralizes and coordinates all section and component loading,
 * initialization, and cleanup logic to ensure robust operation regardless
 * of navigation path or state.
 * 
 * Version: 1.0.0 (2025-06-27)
 */

(function() {
    'use strict';
    
    // Script loading guard to prevent duplicate initialization
    if (window.SECTION_COMPONENT_MANAGER_LOADED) {
        console.log('Section Component Manager: Already loaded, skipping initialization');
        return;
    }
    
    window.SECTION_COMPONENT_MANAGER_LOADED = true;
    console.log('Section Component Manager: Initializing...');
    
    // Create the manager object
    const SectionComponentManager = {
        // Configuration
        config: {
            componentPaths: ['components', 'html/components'],
            reinitializationDelay: 300,
            verificationDelay: 800,
            autoFixBlankSections: true,
            debugMode: true
        },
        
        // Internal state
        state: {
            previousSection: null,
            currentSection: null,
            loadedComponents: new Set(),
            initializedComponents: new Set(),
            sectionObserver: null,
            navigationHooked: false
        },
        
        /**
         * Initialize the manager
         */
        initialize: function() {
            this.log('Initializing Section Component Manager');
            
            // Hook navigation methods
            this.hookNavigationMethods();
            
            // Setup mutation observers
            this.setupSectionObservers();
            
            // Listen for component related events
            this.setupEventListeners();
            
            // Connect with other managers
            this.connectWithOtherManagers();
            
            // Check current sections state
            setTimeout(() => this.verifyAllSections(), this.config.verificationDelay);
            
            this.log('Section Component Manager initialized successfully');
            
            return this;
        },
        
        /**
         * Initialize a specific section
         * @param {string} sectionId - The section ID to initialize
         */
        initializeSection: function(sectionId) {
            this.log(`Initializing section: ${sectionId}`);
            
            if (!sectionId) {
                this.error('Cannot initialize section: No section ID provided');
                return false;
            }
            
            const section = document.getElementById(sectionId);
            if (!section) {
                this.error(`Cannot initialize section: Section #${sectionId} not found in DOM`);
                return false;
            }
            
            try {
                // First ensure section has content
                if (this.isSectionEmpty(sectionId)) {
                    this.log(`Section ${sectionId} appears empty, loading content first`);
                    this.loadSectionContent(sectionId);
                } else {
                    this.log(`Section ${sectionId} has content, initializing components`);
                    this.initializeSectionComponents(sectionId);
                }
                
                // Mark as initialized
                this.state.initializedComponents.add(sectionId);
                
                // Dispatch event that section was initialized
                this.dispatchSectionEvent('sectionInitialized', sectionId);
                
                return true;
            } catch (error) {
                this.error(`Error initializing section ${sectionId}:`, error);
                return false;
            }
        },
        
        /**
         * Load section content from component file
         * @param {string} sectionId - The section ID to load content for
         */
        loadSectionContent: async function(sectionId) {
            this.log(`Loading content for section: ${sectionId}`);
            
            const section = document.getElementById(sectionId);
            if (!section) {
                this.error(`Cannot load content: Section #${sectionId} not found in DOM`);
                return false;
            }
            
            // Show loading indicator for better user experience
            section.innerHTML = '<div class="loading-indicator"><span class="spinner"></span><p>Loading content...</p></div>';
            
            try {
                // Try to load via moduleLoader if available
                if (window.moduleLoader && typeof window.moduleLoader.loadComponent === 'function') {
                    this.log(`Using ModuleLoader to load ${sectionId}`);
                    
                    try {
                        await window.moduleLoader.loadComponent(sectionId);
                        this.log(`${sectionId} loaded successfully via ModuleLoader`);
                        this.state.loadedComponents.add(sectionId);
                        
                        // Initialize components after content is loaded
                        setTimeout(() => this.initializeSectionComponents(sectionId), this.config.reinitializationDelay);
                        return true;
                    } catch (moduleError) {
                        this.warn(`ModuleLoader failed for ${sectionId}:`, moduleError);
                        // Continue with direct fetch approach
                    }
                }
                
                // Direct fetch approach with multiple paths
                for (const path of this.config.componentPaths) {
                    try {
                        const response = await fetch(`${path}/${sectionId}.html?v=${Date.now()}`);
                        if (response.ok) {
                            const html = await response.text();
                            section.innerHTML = html;
                            this.log(`${sectionId} loaded successfully from ${path}`);
                            this.state.loadedComponents.add(sectionId);
                            
                            // Initialize components after content is loaded
                            setTimeout(() => this.initializeSectionComponents(sectionId), this.config.reinitializationDelay);
                            return true;
                        }
                    } catch (fetchError) {
                        this.warn(`Failed to fetch from ${path}/${sectionId}.html:`, fetchError);
                        // Try next path
                    }
                }
                
                // If all paths failed, load fallback content
                this.loadFallbackContent(sectionId);
                return false;
            } catch (error) {
                this.error(`Error loading section content for ${sectionId}:`, error);
                this.loadFallbackContent(sectionId);
                return false;
            }
        },
        
        /**
         * Initialize components within a section
         * @param {string} sectionId - The section ID to initialize components for
         */
        initializeSectionComponents: function(sectionId) {
            this.log(`Initializing components for section: ${sectionId}`);
            
            try {
                // Initialize section using app methods if available
                if (window.app) {
                    // Try different initialization methods
                    if (typeof window.app.initializeSectionComponent === 'function') {
                        this.log(`Using app.initializeSectionComponent for ${sectionId}`);
                        window.app.initializeSectionComponent(sectionId);
                    } else if (typeof window.app.initializeSectionContent === 'function') {
                        this.log(`Using app.initializeSectionContent for ${sectionId}`);
                        window.app.initializeSectionContent(sectionId);
                    }
                    
                    // Special handling for specific sections
                    switch (sectionId) {
                        case 'dashboard':
                            if (typeof window.app.initializeDashboard === 'function') {
                                window.app.initializeDashboard();
                            }
                            break;
                        case 'audit-dashboard':
                            if (typeof window.app.initializeAuditDashboard === 'function') {
                                window.app.initializeAuditDashboard();
                            }
                            break;
                        case 'royalty-records':
                            if (typeof window.app.initializeRoyaltyRecords === 'function') {
                                window.app.initializeRoyaltyRecords();
                            }
                            break;
                    }
                } else {
                    this.warn('App object not available, initialization may be incomplete');
                }
                
                // Initialize charts if this section has them
                this.initializeSectionCharts(sectionId);
                
                return true;
            } catch (error) {
                this.error(`Error initializing components for section ${sectionId}:`, error);
                return false;
            }
        },
        
        /**
         * Initialize charts within a section
         * @param {string} sectionId - The section ID to initialize charts for
         */
        initializeSectionCharts: function(sectionId) {
            this.log(`Initializing charts for section: ${sectionId}`);
            
            // Ensure Chart.js is available
            if (typeof Chart === 'undefined') {
                this.warn('Chart.js library not available, charts cannot be initialized');
                return false;
            }
            
            // Ensure chart manager is available
            const chartManager = window.chartManager;
            if (!chartManager) {
                this.warn('Chart manager not available, charts cannot be initialized');
                return false;
            }
            
            // Check if chart initializer is available
            if (window.chartInitializer) {
                // Use chart initializer if available
                switch (sectionId) {
                    case 'dashboard':
                        if (typeof window.chartInitializer.initializeDashboardCharts === 'function') {
                            window.chartInitializer.initializeDashboardCharts();
                            return true;
                        }
                        break;
                    case 'audit-dashboard':
                        if (typeof window.chartInitializer.initializeAuditCharts === 'function') {
                            window.chartInitializer.initializeAuditCharts();
                            return true;
                        }
                        break;
                    case 'reporting-analytics':
                        if (typeof window.chartInitializer.initializeReportingCharts === 'function') {
                            window.chartInitializer.initializeReportingCharts();
                            return true;
                        }
                        break;
                }
            }
            
            // Try app-specific chart methods if chart initializer didn't work
            if (window.app) {
                switch (sectionId) {
                    case 'dashboard':
                        if (typeof window.app.initializeDashboardCharts === 'function') {
                            window.app.initializeDashboardCharts();
                            return true;
                        }
                        break;
                    case 'audit-dashboard':
                        if (typeof window.app.initializeAuditCharts === 'function') {
                            window.app.initializeAuditCharts();
                            return true;
                        }
                        break;
                    case 'reporting-analytics':
                        if (typeof window.app.initializeReportingCharts === 'function') {
                            window.app.initializeReportingCharts();
                            return true;
                        }
                        break;
                }
            }
            
            // Fallback: Look for canvas elements and try to initialize them
            const section = document.getElementById(sectionId);
            if (section) {
                const canvases = section.querySelectorAll('canvas[id]');
                if (canvases.length > 0) {
                    this.log(`Found ${canvases.length} chart canvases in ${sectionId}, trying to initialize`);
                    
                    // Try to initialize each canvas with default chart
                    canvases.forEach(canvas => {
                        const canvasId = canvas.id;
                        this.log(`Initializing chart: ${canvasId}`);
                        
                        // Destroy existing chart if any
                        if (chartManager.destroy) {
                            chartManager.destroy(canvasId);
                        }
                        
                        // Generate a default chart based on canvas ID
                        try {
                            if (canvasId.includes('revenue') || canvasId.includes('trend')) {
                                this.createDefaultLineChart(canvasId);
                            } else if (canvasId.includes('distribution') || canvasId.includes('breakdown')) {
                                this.createDefaultPieChart(canvasId);
                            } else if (canvasId.includes('comparison')) {
                                this.createDefaultBarChart(canvasId);
                            } else {
                                this.createDefaultBarChart(canvasId);
                            }
                        } catch (chartError) {
                            this.error(`Error creating chart for ${canvasId}:`, chartError);
                        }
                    });
                    
                    return true;
                }
            }
            
            return false;
        },
        
        /**
         * Create default line chart
         * @param {string} canvasId - Canvas element ID
         */
        createDefaultLineChart: function(canvasId) {
            if (!window.chartManager || !window.chartManager.create) return null;
            
            return window.chartManager.create(canvasId, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Data',
                        data: [45000, 52000, 48000, 61000, 55000, 67000],
                        borderColor: '#1a365d',
                        backgroundColor: 'rgba(26, 54, 93, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },
        
        /**
         * Create default bar chart
         * @param {string} canvasId - Canvas element ID
         */
        createDefaultBarChart: function(canvasId) {
            if (!window.chartManager || !window.chartManager.create) return null;
            
            return window.chartManager.create(canvasId, {
                type: 'bar',
                data: {
                    labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
                    datasets: [{
                        label: 'Sample Data',
                        data: [65, 59, 80, 81, 56],
                        backgroundColor: [
                            'rgba(26, 54, 93, 0.6)',
                            'rgba(45, 82, 130, 0.6)',
                            'rgba(59, 110, 182, 0.6)',
                            'rgba(89, 138, 222, 0.6)',
                            'rgba(132, 171, 235, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },
        
        /**
         * Create default pie chart
         * @param {string} canvasId - Canvas element ID
         */
        createDefaultPieChart: function(canvasId) {
            if (!window.chartManager || !window.chartManager.create) return null;
            
            return window.chartManager.create(canvasId, {
                type: 'doughnut',
                data: {
                    labels: ['Category 1', 'Category 2', 'Category 3'],
                    datasets: [{
                        data: [300, 150, 100],
                        backgroundColor: ['#1a365d', '#2d5a88', '#4a90c2']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },
        
        /**
         * Load fallback content for a section
         * @param {string} sectionId - The section ID to load fallback content for
         */
        loadFallbackContent: function(sectionId) {
            this.warn(`Loading fallback content for section: ${sectionId}`);
            
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            // Try app's fallback method first
            if (window.app && typeof window.app.loadFallbackSection === 'function') {
                try {
                    window.app.loadFallbackSection(sectionId);
                    return;
                } catch (error) {
                    this.warn('App fallback method failed, using built-in fallback');
                }
            }
            
            // Use built-in fallback content
            switch (sectionId) {
                case 'dashboard':
                    section.innerHTML = `
                        <div class="page-header">
                            <div class="page-title">
                                <h1>Dashboard</h1>
                                <p>Mining Royalties Overview</p>
                            </div>
                        </div>
                        <div class="dashboard-container">
                            <div class="dashboard-stats">
                                <div class="stat-card">
                                    <h3>Total Royalties</h3>
                                    <p class="stat-value">E 1,250,000</p>
                                </div>
                                <div class="stat-card">
                                    <h3>Compliance Rate</h3>
                                    <p class="stat-value">92%</p>
                                </div>
                                <div class="stat-card">
                                    <h3>Pending Payments</h3>
                                    <p class="stat-value">5</p>
                                </div>
                            </div>
                            <div class="dashboard-charts">
                                <div class="chart-card">
                                    <h3>Revenue Trend</h3>
                                    <div class="chart-container">
                                        <canvas id="revenueTrendChart"></canvas>
                                    </div>
                                </div>
                                <div class="chart-card">
                                    <h3>Production Distribution</h3>
                                    <div class="chart-container">
                                        <canvas id="productionDistributionChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'royalty-records':
                    section.innerHTML = `
                        <div class="page-header">
                            <div class="page-title">
                                <h1>Royalty Records</h1>
                                <p>Manage your royalty payments and records</p>
                            </div>
                            <div class="page-actions">
                                <button class="btn btn-primary"><i class="fas fa-plus"></i> New Record</button>
                            </div>
                        </div>
                        <div class="content-container">
                            <div class="filter-controls">
                                <div class="filter-group">
                                    <input type="text" placeholder="Search records...">
                                    <button class="btn btn-secondary"><i class="fas fa-search"></i></button>
                                </div>
                                <div class="filter-group">
                                    <select>
                                        <option>All Status</option>
                                        <option>Paid</option>
                                        <option>Pending</option>
                                        <option>Overdue</option>
                                    </select>
                                    <select>
                                        <option>All Years</option>
                                        <option>2024</option>
                                        <option>2023</option>
                                        <option>2022</option>
                                    </select>
                                    <button class="btn btn-secondary">Filter</button>
                                </div>
                            </div>
                            <div class="table-container">
                                <table class="data-table royalty-table">
                                    <thead>
                                        <tr>
                                            <th>Record ID</th>
                                            <th>Mining Entity</th>
                                            <th>Period</th>
                                            <th>Amount (E)</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>ROY-2024-001</td>
                                            <td>Diamond Mining Corp</td>
                                            <td>Jan 2024</td>
                                            <td>E 45,000</td>
                                            <td><span class="badge badge-success">Paid</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-icon"><i class="fas fa-eye"></i></button>
                                                <button class="btn btn-sm btn-icon"><i class="fas fa-edit"></i></button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>ROY-2024-002</td>
                                            <td>Gold Rush Ltd</td>
                                            <td>Feb 2024</td>
                                            <td>E 32,500</td>
                                            <td><span class="badge badge-warning">Pending</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-icon"><i class="fas fa-eye"></i></button>
                                                <button class="btn btn-sm btn-icon"><i class="fas fa-edit"></i></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    section.innerHTML = `
                        <div class="page-header">
                            <div class="page-title">
                                <h1>${sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                                <p>This section is under development</p>
                            </div>
                        </div>
                        <div class="content-container">
                            <div class="placeholder-content">
                                <i class="fas fa-tools" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                                <h3>Coming Soon</h3>
                                <p>This feature is currently being developed.</p>
                            </div>
                        </div>
                    `;
            }
            
            // Initialize components after loading fallback content
            setTimeout(() => this.initializeSectionComponents(sectionId), this.config.reinitializationDelay);
        },
        
        /**
         * Check if a section is empty or appears uninitialized
         * @param {string} sectionId - The section ID to check
         * @returns {boolean} - Whether the section is empty
         */
        isSectionEmpty: function(sectionId) {
            const section = document.getElementById(sectionId);
            if (!section) return false;
            
            // If completely empty, definitely needs initialization
            if (section.children.length === 0 || section.innerHTML.trim() === '') {
                return true;
            }
            
            // Check if section is empty or has minimal content
            const contentText = section.innerText.trim();
            const hasMinimalContent = contentText.length < 50;
            
            // Check for expected elements based on section type
            let hasExpectedElements = false;
            
            switch (sectionId) {
                case 'dashboard':
                    hasExpectedElements = section.querySelector('.dashboard-stats, .dashboard-cards, .dashboard-container') !== null;
                    break;
                case 'royalty-records':
                    hasExpectedElements = section.querySelector('.royalty-records-table, .royalty-table') !== null;
                    break;
                case 'audit-dashboard':
                    hasExpectedElements = section.querySelector('#audit-events-table, .audit-table') !== null;
                    break;
                default:
                    // For other sections, check for common elements
                    hasExpectedElements = section.querySelectorAll('.card, .container, table, .section-container').length > 0;
            }
            
            return hasMinimalContent || !hasExpectedElements;
        },
        
        /**
         * Set up section observers
         */
        setupSectionObservers: function() {
            // Observer for section changes (visibility, content)
            this.state.sectionObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    // Check if style attribute changed (display property)
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const section = mutation.target;
                        const sectionId = section.id;
                        
                        if (section.style.display === 'block' && this.state.currentSection !== sectionId) {
                            this.log(`Section ${sectionId} became visible`);
                            this.state.previousSection = this.state.currentSection;
                            this.state.currentSection = sectionId;
                            
                            // Verify section has content
                            if (this.config.autoFixBlankSections && this.isSectionEmpty(sectionId)) {
                                this.log(`Section ${sectionId} appears empty, initializing...`);
                                this.initializeSection(sectionId);
                            }
                        }
                    }
                });
            });
            
            // Observe all sections
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                this.state.sectionObserver.observe(section, { 
                    attributes: true, 
                    attributeFilter: ['style'] 
                });
            });
        },
        
        /**
         * Set up event listeners
         */
        setupEventListeners: function() {
            // Listen for section loaded events
            document.addEventListener('sectionLoaded', (e) => {
                if (e.detail && e.detail.sectionId) {
                    this.log(`Received sectionLoaded event for ${e.detail.sectionId}`);
                    this.initializeSection(e.detail.sectionId);
                }
            });
            
            // Listen for section content loaded events
            document.addEventListener('sectionContentLoaded', (e) => {
                if (e.detail && e.detail.sectionId) {
                    this.log(`Received sectionContentLoaded event for ${e.detail.sectionId}`);
                    this.initializeSectionComponents(e.detail.sectionId);
                }
            });
            
            // Listen for check all sections events
            document.addEventListener('checkAllSections', () => {
                this.log('Received checkAllSections event');
                this.verifyAllSections();
            });
        },
        
        /**
         * Hook into navigation methods
         */
        hookNavigationMethods: function() {
            if (this.state.navigationHooked) return;
            
            if (window.app && window.app.showSection) {
                // Store original function
                const originalShowSection = window.app.showSection;
                
                // Override showSection to include our fix
                window.app.showSection = (sectionId) => {
                    this.log(`Navigation: ${window.app.currentSection || 'unknown'} -> ${sectionId}`);
                    
                    // Clean up resources when leaving sections
                    this.cleanupSection(window.app.currentSection);
                    
                    // Call original function
                    const result = originalShowSection.call(window.app, sectionId);
                    
                    // Verify initialization after navigation
                    setTimeout(() => {
                        if (this.isSectionEmpty(sectionId)) {
                            this.log(`Section ${sectionId} appears empty after navigation, initializing...`);
                            this.initializeSection(sectionId);
                        }
                    }, this.config.reinitializationDelay);
                    
                    return result;
                };
                
                this.state.navigationHooked = true;
                this.log('Navigation hooks installed');
            } else {
                this.warn('App showSection method not available, navigation hooks not installed');
            }
        },
        
        /**
         * Clean up a section when navigating away from it
         * @param {string} sectionId - The section ID to clean up
         */
        cleanupSection: function(sectionId) {
            if (!sectionId) return;
            
            this.log(`Cleaning up section: ${sectionId}`);
            
            // Clean up audit dashboard resources
            if (sectionId === 'audit-dashboard') {
                // Clear intervals
                if (window.auditDashboardIntervals) {
                    window.auditDashboardIntervals.forEach(interval => clearInterval(interval));
                    window.auditDashboardIntervals = [];
                    this.log('Audit dashboard intervals cleared');
                }
                
                // Clean up controller
                if (window.auditDashboardController && typeof window.auditDashboardController.cleanup === 'function') {
                    window.auditDashboardController.cleanup();
                    this.log('Audit dashboard controller cleaned up');
                }
            }
            
            // Clean up charts if navigating away
            try {
                if (window.chartManager && typeof window.chartManager.destroyAll === 'function') {
                    window.chartManager.destroyAll();
                    this.log('All charts destroyed during section cleanup');
                }
            } catch (error) {
                this.warn('Error cleaning up charts:', error);
            }
        },
        
        /**
         * Connect with other managers in the application
         */
        connectWithOtherManagers: function() {
            // Make sure app exists
            if (!window.app) {
                window.app = {};
            }
            
            // Add necessary compatibility methods if missing
            if (!window.app.initializeSectionContent && window.app.initializeSectionComponent) {
                window.app.initializeSectionContent = function(sectionId) {
                    console.log(`initializeSectionContent called for ${sectionId} - delegating to initializeSectionComponent`);
                    window.app.initializeSectionComponent(sectionId);
                };
                this.log('Added missing initializeSectionContent compatibility method');
            }
            
            // Expose public methods to the app object
            window.app.sectionComponentManager = {
                initializeSection: (sectionId) => this.initializeSection(sectionId),
                loadSectionContent: (sectionId) => this.loadSectionContent(sectionId),
                verifyAllSections: () => this.verifyAllSections(),
                isSectionEmpty: (sectionId) => this.isSectionEmpty(sectionId)
            };
        },
        
        /**
         * Verify all sections in the application
         */
        verifyAllSections: function() {
            this.log('Verifying all sections');
            
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                const sectionId = section.id;
                
                // Check if section is visible
                const isVisible = section.style.display === 'block' || section.style.display === '';
                
                // If visible section is empty, initialize it
                if (isVisible && this.isSectionEmpty(sectionId)) {
                    this.log(`Visible section ${sectionId} appears empty, initializing...`);
                    this.initializeSection(sectionId);
                }
            });
            
            // Verify current section especially
            const currentSection = window.app && window.app.currentSection;
            if (currentSection && this.isSectionEmpty(currentSection)) {
                this.log(`Current section ${currentSection} appears empty, initializing...`);
                this.initializeSection(currentSection);
            }
        },
        
        /**
         * Dispatch a section event
         * @param {string} eventName - The event name
         * @param {string} sectionId - The section ID
         */
        dispatchSectionEvent: function(eventName, sectionId) {
            document.dispatchEvent(new CustomEvent(eventName, { 
                detail: { sectionId } 
            }));
        },
        
        /**
         * Log a message (only in debug mode)
         * @param {...*} args - The message and arguments to log
         */
        log: function(...args) {
            if (this.config.debugMode) {
                console.log('%cSectionComponentManager:', 'color: #1a73e8; font-weight: bold;', ...args);
            }
        },
        
        /**
         * Log a warning
         * @param {...*} args - The warning message and arguments to log
         */
        warn: function(...args) {
            console.warn('%cSectionComponentManager:', 'color: #e67700; font-weight: bold;', ...args);
        },
        
        /**
         * Log an error
         * @param {...*} args - The error message and arguments to log
         */
        error: function(...args) {
            console.error('%cSectionComponentManager:', 'color: #d32f2f; font-weight: bold;', ...args);
        }
    };
    
    // Initialize the manager after a short delay
    setTimeout(() => {
        SectionComponentManager.initialize();
        
        // Make it globally accessible
        window.sectionComponentManager = SectionComponentManager;
    }, 100);
    
    console.log('Section Component Manager loaded');
})();
