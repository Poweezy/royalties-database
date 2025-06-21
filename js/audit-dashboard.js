(function() {
    // Initialize event listeners when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        setupBackupButton();
        setupFilterHandlers();
        setupCustomDateRangeHandlers();
        setupPaginationHandlers();
        setupComplianceScoreHandler();
        setupExportFunctionality();
        updateAuditMetrics();
    });

    function setupBackupButton() {
        const backupBtn = document.getElementById('backup-now-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', function() {
                if (window.notificationManager) {
                    window.notificationManager.show('Backup process initiated...', 'info');
                    // Simulate backup process
                    setTimeout(() => {
                        window.notificationManager.show('Backup completed successfully', 'success');
                        // Update the backup timestamp
                        const backupNotification = document.querySelector('.backup-notification');
                        if (backupNotification) {
                            const now = new Date();
                            const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
                            backupNotification.innerHTML = `Last backup: ${formattedDate} <button id="backup-now-btn" class="btn btn-sm btn-primary">Backup Now</button>`;
                            setupBackupButton(); // Reattach event listener to new button
                        }
                    }, 2000);
                }
            });
        }
    }

    function setupFilterHandlers() {
        const dateRangeSelect = document.getElementById('audit-date-range');
        const applyFiltersBtn = document.getElementById('apply-audit-filters');
        const resetFiltersBtn = document.getElementById('reset-audit-filters');
        
        if (dateRangeSelect) {
            dateRangeSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    document.getElementById('custom-date-range-container').style.display = 'block';
                } else {
                    document.getElementById('custom-date-range-container').style.display = 'none';
                }
            });
        }
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                const dateRange = document.getElementById('audit-date-range')?.value || 'week';
                const userFilter = document.getElementById('audit-user-filter')?.value || 'all';
                const actionFilter = document.getElementById('audit-action-filter')?.value || 'all';
                
                if (window.notificationManager) {
                    window.notificationManager.show(`Applying filters: ${dateRange}, ${userFilter}, ${actionFilter}`, 'info');
                }
                updateAuditEvents(dateRange, userFilter, actionFilter);
            });
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', function() {
                const dateRange = document.getElementById('audit-date-range');
                const userFilter = document.getElementById('audit-user-filter');
                const actionFilter = document.getElementById('audit-action-filter');
                
                if (dateRange) dateRange.value = 'week';
                if (userFilter) userFilter.value = 'all';
                if (actionFilter) actionFilter.value = 'all';
                
                if (window.notificationManager) {
                    window.notificationManager.show('Audit filters reset', 'info');
                }
                updateAuditEvents('week', 'all', 'all');
            });
        }
    }

    function setupCustomDateRangeHandlers() {
        const applyCustomDateBtn = document.getElementById('apply-custom-date');
        const cancelCustomDateBtn = document.getElementById('cancel-custom-date');
        
        if (applyCustomDateBtn) {
            applyCustomDateBtn.addEventListener('click', function() {
                const startDate = document.getElementById('custom-date-start').value;
                const endDate = document.getElementById('custom-date-end').value;
                
                if (!startDate || !endDate) {
                    if (window.notificationManager) {
                        window.notificationManager.show('Please select both start and end dates', 'error');
                    } else {
                        alert('Please select both start and end dates');
                    }
                    return;
                }
                
                if (window.notificationManager) {
                    window.notificationManager.show(`Applying custom date range: ${startDate} - ${endDate}`, 'info');
                }
                updateAuditEvents('custom', document.getElementById('audit-user-filter').value, document.getElementById('audit-action-filter').value, startDate, endDate);
            });
        }
        
        if (cancelCustomDateBtn) {
            cancelCustomDateBtn.addEventListener('click', function() {
                document.getElementById('custom-date-range-container').style.display = 'none';
                document.getElementById('audit-date-range').value = 'week';
            });
        }
    }

    function setupPaginationHandlers() {
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageSizeSelect = document.getElementById('page-size');
        let currentPage = 1;
        const totalPages = 10; // This would be dynamically determined based on total records
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    updatePagination();
                    // In a real implementation, you would fetch the previous page of records here
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                    // In a real implementation, you would fetch the next page of records here
                }
            });
        }
        
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function() {
                // In a real implementation, you would update the page size and refetch records here
                if (window.notificationManager) {
                    window.notificationManager.show(`Page size changed to ${pageSizeSelect.value} records`, 'info');
                }
            });
        }
        
        function updatePagination() {
            document.getElementById('page-indicator').textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
        }
    }

    function setupComplianceScoreHandler() {
        const complianceScore = document.getElementById('compliance-score-bar');
        const complianceIssues = document.getElementById('compliance-issues');
        
        if (complianceScore && complianceIssues) {
            complianceScore.parentElement.addEventListener('click', function() {
                if (complianceIssues.style.display === 'none') {
                    complianceIssues.style.display = 'block';
                } else {
                    complianceIssues.style.display = 'none';
                }
            });
        }
        
        const viewReportBtn = document.getElementById('view-compliance-report');
        if (viewReportBtn) {
            viewReportBtn.addEventListener('click', function() {
                if (window.notificationManager) {
                    window.notificationManager.show('Opening compliance report...', 'info');
                }
                // In a real implementation, you would open the full compliance report here
            });
        }
    }

    function setupExportFunctionality() {
        const exportBtn = document.getElementById('export-audit-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                // Show export format options
                const formatOptions = ['CSV', 'PDF', 'Excel'];
                const selectedFormat = prompt(`Choose export format: ${formatOptions.join(', ')}`, 'CSV');
                if (selectedFormat && formatOptions.map(f => f.toLowerCase()).includes(selectedFormat.toLowerCase())) {
                    exportAuditData(selectedFormat);
                }
            });
        }
    }

    function updateAuditMetrics() {
        // Update metrics with real or simulated data
        const metrics = {
            'active-users-24h': Math.floor(Math.random() * 20) + 10,
            'login-attempts': Math.floor(Math.random() * 50) + 30,
            'data-access-events': Math.floor(Math.random() * 200) + 100,
            'security-alerts': Math.floor(Math.random() * 5) + 1
        };
        
        Object.entries(metrics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    function updateAuditEvents(dateRange, userFilter, actionFilter, startDate = null, endDate = null) {
        const tableBody = document.getElementById('audit-events-table');
        if (tableBody) {
            // Add loading state
            tableBody.innerHTML = 'Loading audit events...';
            
            // In a real implementation, you would fetch filtered data from the server
            // For now, we'll simulate loading delay and use placeholder data
            setTimeout(() => {
                // Reset pagination when filters change
                document.getElementById('prev-page').disabled = true;
                document.getElementById('page-indicator').textContent = 'Page 1 of 10';
                document.getElementById('next-page').disabled = false;
                
                if (window.notificationManager) {
                    window.notificationManager.show('Audit events updated', 'success');
                }
                
                // For demonstration, just reload the page to restore the original data
                // In a real app, you would render the filtered data here
                location.reload();
            }, 1000);
        }
    }

    // Expose audit dashboard functions to global scope
    window.auditDashboard = {
        runSecurityScan: function() {
            if (window.notificationManager) {
                window.notificationManager.show('Running comprehensive security scan...', 'info');
                setTimeout(() => {
                    window.notificationManager.show('Security scan completed - 2 issues found', 'warning');
                }, 3000);
            }
        },
        
        refreshAuditEvents: function() {
            if (window.notificationManager) {
                window.notificationManager.show('Refreshing audit events...', 'info');
            }
        },
        
        viewAuditDetails: function(eventId) {
            if (window.notificationManager) {
                window.notificationManager.show(`Viewing details for audit event ${eventId}`, 'info');
            }
        },
        
        investigateFailedLogin: function(eventId) {
            if (window.notificationManager) {
                window.notificationManager.show(`Investigating failed login attempt ${eventId}`, 'warning');
            }
        },
        
        blockIpAddress: function(ip) {
            if (confirm(`Are you sure you want to block IP address ${ip}?`)) {
                if (window.notificationManager) {
                    window.notificationManager.show(`IP address ${ip} has been blocked`, 'success');
                }
            }
        },
        
        investigateIp: function(ip) {
            if (window.notificationManager) {
                window.notificationManager.show(`Opening investigation for IP ${ip}`, 'info');
            }
        },
        
        contactUser: function(username) {
            if (window.notificationManager) {
                window.notificationManager.show(`Contacting user ${username}...`, 'info');
            }
        },
        
        reviewUserActivity: function(username) {
            if (window.notificationManager) {
                window.notificationManager.show(`Reviewing activity for user ${username}`, 'info');
            }
        },
        
        reviewExport: function(username, exportId) {
            if (window.notificationManager) {
                window.notificationManager.show(`Reviewing export ${exportId} by ${username}`, 'info');
            }
        },
        
        acknowledgeAllAlerts: function() {
            if (confirm('Are you sure you want to acknowledge all security alerts?')) {
                if (window.notificationManager) {
                    window.notificationManager.show('All security alerts acknowledged', 'success');
                }
            }
        },
        
        exportAuditData: function(format) {
            if (window.notificationManager) {
                window.notificationManager.show(`Exporting audit data in ${format} format...`, 'info');
            }
            setTimeout(() => {
                if (window.notificationManager) {
                    window.notificationManager.show(`Audit data exported successfully as ${format}`, 'success');
                }
                // In a real implementation, you would trigger the actual download here
            }, 1500);
        }
    };
})();
