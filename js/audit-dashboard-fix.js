/**
 * Audit Dashboard Fix
 * 
 * This script specifically addresses the navigation issues
 * with the audit dashboard component.
 */

(function() {
    'use strict';
    
    console.log('Audit Dashboard Fix - Initializing...');
    
    // Track when audit dashboard is loaded
    document.addEventListener('DOMContentLoaded', function() {
        setupAuditDashboardFix();
    });
    
    // Setup event listeners for loading the audit dashboard
    function setupAuditDashboardFix() {
        // Listen for navigation to audit-dashboard section
        document.addEventListener('sectionChange', function(event) {
            if (event && event.detail && event.detail.sectionId === 'audit-dashboard') {
                console.log('Audit dashboard section detected, applying fixes');
                applyAuditDashboardFixes();
            }
        });
        
        // Fix immediately if we're already on the audit dashboard
        if (window.royaltiesApp && window.royaltiesApp.currentSection === 'audit-dashboard') {
            console.log('Audit dashboard already active, applying fixes immediately');
            applyAuditDashboardFixes();
        }
    }
    
    // Apply all fixes to the audit dashboard
    function applyAuditDashboardFixes() {
        fixUpdateAuditEvents();
        setupCleanupHandlers();
        trackTimers();
    }
    
    // Fix the updateAuditEvents function that breaks navigation
    function fixUpdateAuditEvents() {
        // First check if the problematic function exists
        if (typeof window.updateAuditEvents === 'function') {
            console.log('Fixing updateAuditEvents function');
            
            // Store the original function for reference
            const originalUpdateAuditEvents = window.updateAuditEvents;
            
            // Replace with fixed version that doesn't use location.reload()
            window.updateAuditEvents = function(dateRange, userFilter, actionFilter, startDate = null, endDate = null) {
                const tableBody = document.getElementById('audit-events-table');
                if (tableBody) {
                    // Add loading state
                    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading audit events...</td></tr>';
                    
                    // Simulate loading delay
                    setTimeout(() => {
                        // Reset pagination when filters change
                        if (document.getElementById('prev-page')) {
                            document.getElementById('prev-page').disabled = true;
                        }
                        
                        if (document.getElementById('page-indicator')) {
                            document.getElementById('page-indicator').textContent = 'Page 1 of 10';
                        }
                        
                        if (document.getElementById('next-page')) {
                            document.getElementById('next-page').disabled = false;
                        }
                        
                        if (window.notificationManager) {
                            window.notificationManager.show('Audit events updated', 'success');
                        }
                        
                        // Load the audit data without reloading the page
                        loadSampleAuditData(tableBody);
                    }, 1000);
                }
            };
        }
    }
    
    // Setup handlers to clean up resources when leaving the section
    function setupCleanupHandlers() {
        document.addEventListener('sectionChange', function(e) {
            if (e && e.detail && e.detail.previousSection === 'audit-dashboard') {
                console.log('Cleaning up audit dashboard resources...');
                
                // Clean up any timers
                if (window._auditDashboardTimers) {
                    window._auditDashboardTimers.forEach(timerId => clearTimeout(timerId));
                    window._auditDashboardTimers = [];
                }
            }
        });
    }
    
    // Track timers created in the audit dashboard section
    function trackTimers() {
        // Initialize tracking array
        window._auditDashboardTimers = window._auditDashboardTimers || [];
        
        // Store original setTimeout
        const originalSetTimeout = window.setTimeout;
        
        // Override setTimeout to track timers
        window.setTimeout = function(callback, delay) {
            const timerId = originalSetTimeout(callback, delay);
            
            // Only track timers in the audit dashboard section
            if (window.royaltiesApp && window.royaltiesApp.currentSection === 'audit-dashboard') {
                window._auditDashboardTimers.push(timerId);
            }
            
            return timerId;
        };
    }
    
    // Helper function to load sample audit data
    function loadSampleAuditData(tableBody) {
        if (!tableBody) return;
        
        const sampleData = [
            { timestamp: '2024-02-10 15:45:32', user: 'admin', action: 'Login', target: 'System', ip: '192.168.1.100', status: 'Success' },
            { timestamp: '2024-02-10 16:12:45', user: 'editor', action: 'Create Record', target: 'Royalty Payment #1045', ip: '192.168.1.120', status: 'Success' },
            { timestamp: '2024-02-10 16:45:18', user: 'unknown', action: 'Login', target: 'System', ip: '203.45.67.89', status: 'Failed' },
            { timestamp: '2024-02-10 17:02:51', user: 'admin', action: 'Update Settings', target: 'System Configuration', ip: '192.168.1.100', status: 'Success' },
            { timestamp: '2024-02-10 17:30:24', user: 'viewer', action: 'View Report', target: 'Monthly Summary', ip: '192.168.1.130', status: 'Success' }
        ];
        
        tableBody.innerHTML = '';
        
        sampleData.forEach((event, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${event.timestamp}</td>
                <td>${event.user}</td>
                <td>${event.action}</td>
                <td>${event.target}</td>
                <td>${event.ip}</td>
                <td><span class="status-badge ${event.status.toLowerCase()}">${event.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewAuditDetails(${index + 1})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${event.status === 'Failed' ? 
                    `<button class="btn btn-sm btn-warning" onclick="investigateFailedLogin(${index + 1})">
                        <i class="fas fa-search"></i>
                    </button>` : ''}
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    console.log('Audit Dashboard Fix - Ready');
})();