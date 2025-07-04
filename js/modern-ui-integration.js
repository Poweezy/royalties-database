/**
 * Modern UI Integration Script
 * 
 * This script ensures smooth integration between the modern semantic search
 * and existing components, providing seamless UI/UX across the application
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Modern UI Integration starting...');

    // Wait for all modern modules to load
    setTimeout(() => {
        initializeModernIntegration();
    }, 500);
});

function initializeModernIntegration() {
    try {
        // 1. Initialize modern theme awareness across components
        initializeThemeAwareness();
        
        // 2. Upgrade existing search boxes to modern style
        upgradeExistingSearchBoxes();
        
        // 3. Integrate semantic search with component navigation
        integrateSemanticSearchNavigation();
        
        // 4. Apply modern micro-interactions
        applyModernMicroInteractions();
        
        // 5. Setup modern accessibility enhancements
        setupModernAccessibility();
        
        console.log('✅ Modern UI Integration completed successfully');
        
        // Show success notification
        if (window.notificationManager) {
            window.notificationManager.show('Modern UI system activated! 🎨', 'success', {
                duration: 3000,
                showCloseButton: true
            });
        }
        
    } catch (error) {
        console.error('❌ Modern UI Integration error:', error);
        
        if (window.notificationManager) {
            window.notificationManager.show('Some modern UI features may not be available', 'warning');
        }
    }
}

function initializeThemeAwareness() {
    // Listen for theme changes and update components accordingly
    window.addEventListener('themeChanged', function(event) {
        const theme = event.detail.theme;
        console.log(`🎨 Theme changed to: ${theme}`);
        
        // Update all modern components
        updateComponentThemes(theme);
        
        // Update semantic search theme
        if (window.modernSemanticSearch) {
            window.modernSemanticSearch.updateThemeClasses();
        }
    });
    
    // Apply initial theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateComponentThemes(currentTheme);
}

function updateComponentThemes(theme) {
    const isDark = theme === 'dark';
    
    // Update glass cards
    document.querySelectorAll('.glass-card').forEach(card => {
        card.classList.toggle('dark-theme', isDark);
    });
    
    // Update modern buttons
    document.querySelectorAll('.btn-modern').forEach(btn => {
        btn.classList.toggle('dark-theme', isDark);
    });
    
    // Update modern inputs
    document.querySelectorAll('.input-modern, .search-input-modern').forEach(input => {
        input.classList.toggle('dark-theme', isDark);
    });
}

function upgradeExistingSearchBoxes() {
    // Find existing search boxes and enhance them
    const searchBoxes = document.querySelectorAll('.search-box:not(.search-box-modern)');
    
    searchBoxes.forEach(box => {
        // Add modern classes
        box.classList.add('search-box-modern');
        
        const input = box.querySelector('input');
        if (input) {
            input.classList.add('search-input-modern');
            
            // Add modern interaction effects
            addSearchBoxEffects(input);
        }
        
        const icon = box.querySelector('i');
        if (icon) {
            icon.classList.add('search-icon-modern');
        }
    });
    
    console.log(`✅ Upgraded ${searchBoxes.length} search boxes to modern style`);
}

function addSearchBoxEffects(input) {
    // Add focus effects
    input.addEventListener('focus', function() {
        this.closest('.search-box-modern')?.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.closest('.search-box-modern')?.classList.remove('focused');
    });
    
    // Add typing effects
    let typingTimer;
    input.addEventListener('input', function() {
        const container = this.closest('.search-box-modern');
        if (!container) return;
        
        container.classList.add('typing');
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            container.classList.remove('typing');
        }, 500);
    });
}

function integrateSemanticSearchNavigation() {
    if (!window.modernSemanticSearch) {
        console.warn('⚠️ Modern Semantic Search not available for integration');
        return;
    }
    
    // Override result selection to integrate with existing navigation
    const originalHandleResultSelection = window.modernSemanticSearch.handleResultSelection;
    
    window.modernSemanticSearch.handleResultSelection = function(result) {
        console.log('🔍 Navigating to search result:', result);
        
        // Use existing navigation manager if available
        if (window.navigationManager && typeof window.navigationManager.navigateTo === 'function') {
            window.navigationManager.navigateTo(result.category);
        }
        // Fallback to royalties app navigation
        else if (window.royaltiesApp && typeof window.royaltiesApp.showSection === 'function') {
            window.royaltiesApp.showSection(result.category);
        }
        // Fallback to hash navigation
        else {
            window.location.hash = result.category;
        }
        
        // Show navigation feedback
        if (window.notificationManager) {
            window.notificationManager.show(`Opening ${result.title}...`, 'info', {
                duration: 2000
            });
        }
        
        // Call original handler for cleanup
        originalHandleResultSelection.call(this, result);
    };
    
    // Add search data from existing components
    addComponentDataToSearch();
    
    console.log('✅ Semantic search integrated with navigation system');
}

function addComponentDataToSearch() {
    if (!window.modernSemanticSearch) return;
    
    // Add sample data that represents real application data
    const searchData = {
        notifications: [
            {
                id: 'notif-payment-1',
                title: 'Payment Received - Maloma Colliery',
                description: 'Quarterly royalty payment of E2,450,000 received',
                content: 'Payment received for Q1 2025 iron ore extraction royalties',
                date: new Date('2025-01-15'),
                priority: 'high',
                category: 'payment'
            },
            {
                id: 'notif-compliance-1',
                title: 'Environmental Compliance Audit Due',
                description: 'Annual environmental audit for Bomvu Ridge Mine',
                content: 'Environmental compliance audit must be completed by March 31, 2025',
                date: new Date('2025-01-10'),
                priority: 'critical',
                category: 'compliance'
            }
        ],
        records: [
            {
                id: 'record-rr-001',
                title: 'RR-2025-001 - Ngwenya Mine Iron Ore',
                description: 'Monthly royalty calculation for January 2025',
                content: '45,000 tons extracted at E150/ton base rate with 3.5% royalty',
                date: new Date('2025-01-20'),
                entity: 'Ngwenya Mine',
                mineral: 'Iron Ore'
            },
            {
                id: 'record-rr-002',
                title: 'RR-2025-002 - Mahamba Coal Extraction',
                description: 'Coal royalty record for Mahamba Gorge operations',
                content: 'Monthly coal extraction royalties calculated at market rates',
                date: new Date('2025-01-18'),
                entity: 'Mahamba Gorge',
                mineral: 'Coal'
            }
        ],
        contracts: [
            {
                id: 'contract-a15',
                title: 'CONT-2024-A15 - Bulembu Mining Lease',
                description: '25-year mining lease agreement',
                content: 'Comprehensive mining lease with 3.5% royalty rate on gross revenue',
                date: new Date('2024-06-15'),
                entity: 'Bulembu Asbestos Mine',
                contractType: 'Mining Lease'
            }
        ],
        compliance: [
            {
                id: 'compliance-eia-1',
                title: 'Environmental Impact Assessment - Mahamba Expansion',
                description: 'EIA report for expansion project',
                content: 'Comprehensive environmental assessment covering water, air, and land impact',
                date: new Date('2025-01-05'),
                status: 'pending'
            }
        ],
        users: [
            {
                id: 'user-admin',
                title: 'System Administrator Account',
                description: 'Primary admin user with full system access',
                content: 'Administrative user account with comprehensive system privileges',
                date: new Date('2024-01-01'),
                role: 'Administrator'
            }
        ]
    };
    
    // Add all data to search index
    Object.entries(searchData).forEach(([category, items]) => {
        window.modernSemanticSearch.addSearchData(category, items);
    });
    
    console.log('✅ Component data added to semantic search index');
}

function applyModernMicroInteractions() {
    // Add modern hover effects to buttons
    document.querySelectorAll('.btn:not(.btn-modern)').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add modern focus effects to form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        if (!input.classList.contains('input-modern')) {
            input.addEventListener('focus', function() {
                this.style.borderColor = 'var(--ui-primary)';
                this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            });
        }
    });
    
    // Add modern card hover effects
    document.querySelectorAll('.card:not(.glass-card)').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    console.log('✅ Modern micro-interactions applied');
}

function setupModernAccessibility() {
    // Ensure all interactive elements have proper ARIA labels
    document.querySelectorAll('button, [role="button"]').forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.getAttribute('title')) {
            const text = btn.textContent.trim() || btn.querySelector('i')?.className || 'Button';
            btn.setAttribute('aria-label', text);
        }
    });
    
    // Add keyboard navigation support for modern components
    document.addEventListener('keydown', function(e) {
        // Escape key to close dropdowns/modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.dropdown.show, .modal.show').forEach(element => {
                element.classList.remove('show');
            });
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            // Add visible focus indicator for keyboard users
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    console.log('✅ Modern accessibility enhancements applied');
}

// Add modern styles for keyboard navigation
const modernA11yStyles = document.createElement('style');
modernA11yStyles.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid var(--ui-primary) !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
    }
    
    .search-box-modern.focused {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    
    .search-box-modern.typing .search-icon-modern {
        color: var(--ui-accent);
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
`;
document.head.appendChild(modernA11yStyles);

// Export for global access
window.modernUIIntegration = {
    initializeThemeAwareness,
    upgradeExistingSearchBoxes,
    integrateSemanticSearchNavigation,
    applyModernMicroInteractions,
    setupModernAccessibility,
    addComponentDataToSearch
};

console.log('🎨 Modern UI Integration script loaded');
