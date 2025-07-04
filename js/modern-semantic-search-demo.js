/**
 * Modern Semantic Search Demo
 * 
 * Interactive demo showcasing the semantic search capabilities
 * and modern UI/UX features
 */

class ModernSemanticSearchDemo {
    constructor() {
        this.demoData = this.generateDemoData();
        this.init();
    }

    init() {
        // Wait for semantic search to be ready
        if (window.modernSemanticSearch) {
            this.setupDemo();
        } else {
            setTimeout(() => this.init(), 500);
        }
    }

    setupDemo() {
        console.log('🎮 Setting up Semantic Search Demo...');
        
        // Add demo data to search
        this.addDemoDataToSearch();
        
        // Setup demo controls
        this.createDemoControls();
        
        // Setup demo scenarios
        this.setupDemoScenarios();
        
        console.log('✅ Semantic Search Demo ready!');
    }

    generateDemoData() {
        return {
            notifications: [
                {
                    id: 'demo-notif-1',
                    title: 'Urgent: Payment Overdue - Maloma Colliery',
                    description: 'Quarterly royalty payment is 15 days overdue',
                    content: 'The Q4 2024 royalty payment of E3,250,000 from Maloma Colliery is now 15 days overdue. Immediate action required.',
                    date: new Date('2025-01-01'),
                    priority: 'critical',
                    category: 'payment'
                },
                {
                    id: 'demo-notif-2',
                    title: 'Environmental Audit Completed - Bomvu Ridge',
                    description: 'Annual environmental compliance audit successfully completed',
                    content: 'The 2024 environmental compliance audit for Bomvu Ridge Mine has been completed with a 95% compliance score.',
                    date: new Date('2025-01-12'),
                    priority: 'high',
                    category: 'compliance'
                },
                {
                    id: 'demo-notif-3',
                    title: 'New Mining License Approved - Sidvokodvo Hills',
                    description: 'Mining license application approved for iron ore extraction',
                    content: 'The mining license application for iron ore extraction at Sidvokodvo Hills has been approved by the Ministry of Natural Resources.',
                    date: new Date('2025-01-20'),
                    priority: 'medium',
                    category: 'licensing'
                }
            ],
            records: [
                {
                    id: 'demo-record-1',
                    title: 'RR-2025-015 - Ngwenya Mine Iron Ore Production',
                    description: 'January 2025 iron ore royalty calculation',
                    content: 'Iron ore production: 52,000 tons at market price E175/ton. Royalty calculated at 3.5% of gross value.',
                    date: new Date('2025-01-25'),
                    entity: 'Ngwenya Mine',
                    mineral: 'Iron Ore',
                    amount: 'E318,500'
                },
                {
                    id: 'demo-record-2',
                    title: 'RR-2025-016 - Mahamba Gorge Coal Mining',
                    description: 'Coal extraction royalties for January 2025',
                    content: 'Coal production: 28,000 tons at market price E120/ton. Environmental compliance fee included.',
                    date: new Date('2025-01-26'),
                    entity: 'Mahamba Gorge Mining',
                    mineral: 'Coal',
                    amount: 'E117,600'
                }
            ],
            contracts: [
                {
                    id: 'demo-contract-1',
                    title: 'CONT-2024-M07 - Motshane Quarrying Agreement',
                    description: '15-year stone quarrying lease agreement',
                    content: 'Comprehensive stone quarrying agreement with progressive royalty rates starting at 2.5% and increasing to 4% over the contract period.',
                    date: new Date('2024-08-15'),
                    entity: 'Motshane Stone Quarries',
                    contractType: 'Quarrying Lease',
                    royaltyRate: '2.5% - 4.0%'
                },
                {
                    id: 'demo-contract-2',
                    title: 'CONT-2023-A22 - Bulembu Asbestos Extraction',
                    description: '20-year asbestos mining lease with environmental clauses',
                    content: 'Asbestos mining lease with strict environmental monitoring requirements and progressive rehabilitation obligations.',
                    date: new Date('2023-11-20'),
                    entity: 'Bulembu Asbestos Corporation',
                    contractType: 'Mining Lease',
                    royaltyRate: '4.2%'
                }
            ],
            compliance: [
                {
                    id: 'demo-compliance-1',
                    title: 'Environmental Impact Assessment - Mahamba Expansion',
                    description: 'EIA for proposed coal mining expansion project',
                    content: 'Comprehensive environmental impact assessment for the proposed expansion of coal mining operations at Mahamba Gorge, including water management and air quality monitoring.',
                    date: new Date('2025-01-08'),
                    status: 'Under Review',
                    entity: 'Mahamba Gorge Mining'
                },
                {
                    id: 'demo-compliance-2',
                    title: 'Safety Compliance Audit - Ngwenya Mine',
                    description: 'Annual workplace safety compliance audit',
                    content: 'Comprehensive safety audit covering equipment maintenance, worker training, emergency procedures, and accident prevention measures.',
                    date: new Date('2025-01-15'),
                    status: 'Completed',
                    entity: 'Ngwenya Mine',
                    score: '92%'
                }
            ],
            users: [
                {
                    id: 'demo-user-1',
                    title: 'Mining Operations Manager - Sarah Dlamini',
                    description: 'Senior operations manager overseeing multiple mining sites',
                    content: 'Experienced mining operations manager responsible for coordinating activities across Ngwenya Mine and Motshane Quarries.',
                    date: new Date('2024-03-15'),
                    role: 'Operations Manager',
                    department: 'Mining Operations'
                },
                {
                    id: 'demo-user-2',
                    title: 'Compliance Officer - James Mthembu',
                    description: 'Environmental and regulatory compliance specialist',
                    content: 'Certified compliance officer specializing in environmental regulations, safety standards, and mining law compliance.',
                    date: new Date('2024-01-10'),
                    role: 'Compliance Officer',
                    department: 'Regulatory Affairs'
                }
            ]
        };
    }

    addDemoDataToSearch() {
        if (!window.modernSemanticSearch) return;

        Object.entries(this.demoData).forEach(([category, items]) => {
            window.modernSemanticSearch.addSearchData(category, items);
        });

        console.log('✅ Demo data added to semantic search');
    }

    createDemoControls() {
        // Create a demo panel
        const demoPanel = document.createElement('div');
        demoPanel.className = 'demo-panel glass-card';
        demoPanel.innerHTML = `
            <div class="demo-header">
                <h4><i class="fas fa-rocket"></i> Semantic Search Demo</h4>
                <button class="btn-icon" id="close-demo-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="demo-content">
                <p>Try these search examples to see the semantic search in action:</p>
                <div class="demo-scenarios">
                    <button class="demo-scenario-btn" data-search="payment overdue">💰 Find overdue payments</button>
                    <button class="demo-scenario-btn" data-search="environmental audit">🌱 Environmental audits</button>
                    <button class="demo-scenario-btn" data-search="iron ore mining">⛏️ Iron ore operations</button>
                    <button class="demo-scenario-btn" data-search="safety compliance">🛡️ Safety compliance</button>
                    <button class="demo-scenario-btn" data-search="contract renewal">📄 Contract renewals</button>
                </div>
                <div class="demo-features">
                    <h5>Features to try:</h5>
                    <ul>
                        <li>🎤 Voice search (click and hold microphone)</li>
                        <li>⚡ Real-time suggestions</li>
                        <li>🔍 Advanced filters</li>
                        <li>⌨️ Keyboard shortcuts (Ctrl+K)</li>
                    </ul>
                </div>
            </div>
        `;

        // Add styles for demo panel
        const demoStyles = document.createElement('style');
        demoStyles.textContent = `
            .demo-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                z-index: 1000;
                max-height: 500px;
                overflow-y: auto;
                animation: slideInFromRight 0.3s ease-out;
            }
            
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .demo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .demo-header h4 {
                margin: 0;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .demo-content {
                padding: 1rem;
            }
            
            .demo-content p {
                margin-bottom: 1rem;
                color: var(--text-secondary);
            }
            
            .demo-scenarios {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            
            .demo-scenario-btn {
                padding: 0.75rem;
                background: rgba(37, 99, 235, 0.1);
                border: 1px solid rgba(37, 99, 235, 0.2);
                border-radius: 0.5rem;
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                font-size: 0.875rem;
            }
            
            .demo-scenario-btn:hover {
                background: var(--ui-primary);
                color: white;
                transform: translateY(-1px);
            }
            
            .demo-features h5 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary);
                font-size: 0.875rem;
            }
            
            .demo-features ul {
                margin: 0;
                padding-left: 1rem;
                color: var(--text-secondary);
                font-size: 0.8rem;
            }
            
            .demo-features li {
                margin-bottom: 0.25rem;
            }
            
            @media (max-width: 768px) {
                .demo-panel {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    width: auto;
                }
            }
        `;
        document.head.appendChild(demoStyles);

        // Add to page
        document.body.appendChild(demoPanel);

        // Bind events
        demoPanel.querySelector('#close-demo-btn').addEventListener('click', () => {
            demoPanel.remove();
        });

        // Bind scenario buttons
        demoPanel.querySelectorAll('.demo-scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const searchTerm = btn.dataset.search;
                this.executeSearchDemo(searchTerm);
            });
        });

        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (demoPanel.parentNode) {
                demoPanel.style.opacity = '0.7';
                demoPanel.style.transform = 'scale(0.95)';
            }
        }, 30000);
    }

    executeSearchDemo(searchTerm) {
        if (!window.modernSemanticSearch) return;

        // Focus the search input and perform search
        const searchInput = document.querySelector('#semantic-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.value = searchTerm;
            
            // Trigger the search
            window.modernSemanticSearch.search(searchTerm);
            
            // Show demo feedback
            if (window.notificationManager) {
                window.notificationManager.show(`🔍 Searching for: "${searchTerm}"`, 'info', {
                    duration: 2000
                });
            }
        }
    }

    setupDemoScenarios() {
        // Setup keyboard shortcut for demo
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D for demo
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.showDemoHelp();
            }
        });
    }

    showDemoHelp() {
        if (window.notificationManager) {
            window.notificationManager.show(
                'Demo Help: Use Ctrl+K for search, try voice search, or click demo scenarios!', 
                'info', 
                { duration: 5000 }
            );
        }
    }
}

// Auto-initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only show demo in development or when explicitly requested
    const showDemo = localStorage.getItem('show-semantic-search-demo') === 'true' || 
                     window.location.search.includes('demo=true');
    
    if (showDemo) {
        setTimeout(() => {
            new ModernSemanticSearchDemo();
        }, 2000);
    }
});

// Export for manual activation
window.startSemanticSearchDemo = () => {
    new ModernSemanticSearchDemo();
};

console.log('🎮 Semantic Search Demo script loaded. Use window.startSemanticSearchDemo() to activate.');
