/**
 * Chart Testing Module
 * For manual chart testing and troubleshooting from the browser console
 */

// Create global ChartTester namespace
window.ChartTester = {
    // Test if chartManager methods exist
    testChartManager: function() {
        console.log('=== CHART MANAGER TEST ===');
        
        if (!window.chartManager) {
            console.error('❌ chartManager not found in global scope');
            return false;
        }
        
        console.log('✅ chartManager found');
        
        // Check required methods
        const requiredMethods = [
            'create',
            'createRevenueChart',
            'createProductionChart',
            'destroyAll'
        ];
        
        let allMethodsExist = true;
        
        requiredMethods.forEach(method => {
            const exists = typeof window.chartManager[method] === 'function';
            console.log(`${exists ? '✅' : '❌'} ${method}: ${exists ? 'exists' : 'MISSING'}`);
            if (!exists) allMethodsExist = false;
        });
        
        return allMethodsExist;
    },
    
    // Test canvas elements
    testCanvases: function() {
        console.log('=== CANVAS ELEMENTS TEST ===');
        
        const requiredCanvasIds = [
            'revenue-trends-chart',
            'revenue-by-entity-chart',
            'production-by-entity-chart', 
            'payment-timeline-chart',
            'mineral-performance-chart',
            'forecast-chart'
        ];
        
        let missingCanvases = [];
        let foundCount = 0;
        
        requiredCanvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            const exists = canvas !== null;
            
            console.log(`${exists ? '✅' : '❌'} Canvas #${id}: ${exists ? 'found' : 'MISSING'}`);
            
            if (exists) {
                foundCount++;
            } else {
                missingCanvases.push(id);
            }
        });
        
        if (missingCanvases.length > 0) {
            console.log(`Missing ${missingCanvases.length} canvases: ${missingCanvases.join(', ')}`);
        } else {
            console.log('All required canvases found');
        }
        
        return foundCount > 0;
    },
    
    // Create all canvases if missing
    createCanvases: function() {
        console.log('=== CREATING MISSING CANVASES ===');
        
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection) {
            console.error('Dashboard section not found');
            return false;
        }
        
        // Find or create chart grid
        let chartGrid = dashboardSection.querySelector('.charts-grid');
        if (!chartGrid) {
            console.log('Creating chart grid container');
            chartGrid = document.createElement('div');
            chartGrid.className = 'charts-grid';
            chartGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;';
            dashboardSection.appendChild(chartGrid);
        }
        
        // Canvas definitions
        const canvasList = [
            { id: 'revenue-trends-chart', title: 'Revenue Trends' },
            { id: 'revenue-by-entity-chart', title: 'Revenue by Entity' },
            { id: 'production-by-entity-chart', title: 'Production by Entity' },
            { id: 'payment-timeline-chart', title: 'Payment Timeline' },
            { id: 'mineral-performance-chart', title: 'Mineral Performance' },
            { id: 'forecast-chart', title: 'Revenue Forecast' }
        ];
        
        // Create each missing canvas
        canvasList.forEach(def => {
            if (!document.getElementById(def.id)) {
                console.log(`Creating canvas: ${def.id}`);
                
                // Create card container
                const cardDiv = document.createElement('div');
                cardDiv.className = 'chart-card card';
                cardDiv.style.cssText = 'margin-bottom: 20px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 15px;';
                
                // Add title
                const titleEl = document.createElement('h3');
                titleEl.textContent = def.title;
                titleEl.style.cssText = 'margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold;';
                
                // Create canvas wrapper
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'chart-wrapper';
                wrapperDiv.style.cssText = 'position: relative; height: 300px;';
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.id = def.id;
                
                // Assemble elements
                wrapperDiv.appendChild(canvas);
                cardDiv.appendChild(titleEl);
                cardDiv.appendChild(wrapperDiv);
                chartGrid.appendChild(cardDiv);
            }
        });
        
        return this.testCanvases();
    },
    
    // Add missing chart methods
    fixChartMethods: function() {
        console.log('=== FIXING CHART METHODS ===');
        
        if (!window.chartManager) {
            console.error('ChartManager not found, cannot fix methods');
            return false;
        }
        
        // Fix createProductionChart method
        if (typeof window.chartManager.createProductionChart !== 'function') {
            console.log('Adding missing createProductionChart method');
            
            window.chartManager.createProductionChart = function(canvasId, entityData) {
                console.log(`Creating production chart on ${canvasId}`);
                
                // Find canvas (with alias support)
                let canvas = document.getElementById(canvasId);
                if (!canvas && canvasId === 'production-by-entity-chart') {
                    canvasId = 'revenue-by-entity-chart';
                    canvas = document.getElementById(canvasId);
                } else if (!canvas && canvasId === 'revenue-by-entity-chart') {
                    canvasId = 'production-by-entity-chart';
                    canvas = document.getElementById(canvasId);
                }
                
                if (!canvas) {
                    console.error(`Canvas ${canvasId} not found`);
                    return null;
                }
                
                // Use sample data if needed
                if (!entityData) {
                    entityData = {
                        'Diamond Mining Corp': 150,
                        'Gold Rush Ltd': 85,
                        'Copper Valley Mining': 2500,
                        'Rock Aggregates': 350,
                        'Mountain Iron': 1220
                    };
                }
                
                // Configure chart data
                const labels = Object.keys(entityData);
                const values = Object.values(entityData);
                const colors = ['#1a365d', '#2d5282', '#3b6eb6', '#598ade', '#84abeb', '#6b32a8'];
                
                return this.create(canvasId, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values,
                            backgroundColor: colors
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            };
        }
        
        return this.testChartManager();
    },
    
    // Initialize all dashboard charts
    initializeCharts: function() {
        console.log('=== INITIALIZING ALL CHARTS ===');
        
        // Make sure we have the manager and canvases
        if (!this.testChartManager()) {
            this.fixChartMethods();
        }
        
        if (!this.testCanvases()) {
            this.createCanvases();
        }
        
        // Sample data
        const sampleData = {
            revenueData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [45000, 52000, 48000, 61000, 55000, 67000]
            },
            entityData: {
                'Diamond Mining Corp': 150000,
                'Gold Rush Ltd': 85000,
                'Copper Valley Mining': 250000,
                'Rock Aggregates': 35000,
                'Mountain Iron': 122000
            }
        };
        
        try {
            // Destroy existing charts
            window.chartManager.destroyAll();
            
            // Revenue chart
            if (document.getElementById('revenue-trends-chart')) {
                console.log('Creating revenue chart');
                window.chartManager.createRevenueChart('revenue-trends-chart', sampleData.revenueData);
            }
            
            // Entity/production chart
            if (document.getElementById('revenue-by-entity-chart')) {
                console.log('Creating entity chart (revenue-by-entity-chart)');
                window.chartManager.createProductionChart('revenue-by-entity-chart', sampleData.entityData);
            } else if (document.getElementById('production-by-entity-chart')) {
                console.log('Creating entity chart (production-by-entity-chart)');
                window.chartManager.createProductionChart('production-by-entity-chart', sampleData.entityData);
            }
            
            console.log('Charts initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing charts:', error);
            return false;
        }
    },
    
    // Full fix - run all steps
    runFullFix: function() {
        console.log('=== RUNNING COMPREHENSIVE CHART FIX ===');
        
        // Step 1: Test chart manager and methods
        this.testChartManager();
        
        // Step 2: Fix missing methods
        this.fixChartMethods();
        
        // Step 3: Test and create canvases
        this.testCanvases();
        this.createCanvases();
        
        // Step 4: Initialize charts
        this.initializeCharts();
        
        console.log('=== CHART FIX COMPLETED ===');
        console.log('If charts are still not showing, please check the browser console for errors');
        console.log('You can also try refreshing the page after this fix has been applied');
    }
};

// Log instructions
console.log('ChartTester utility loaded. Use these commands in console:');
console.log('- ChartTester.testChartManager() - Test if chart methods exist');
console.log('- ChartTester.testCanvases() - Test if canvas elements exist');
console.log('- ChartTester.createCanvases() - Create missing canvases');
console.log('- ChartTester.fixChartMethods() - Add missing chart methods');
console.log('- ChartTester.initializeCharts() - Initialize all charts');
console.log('- ChartTester.runFullFix() - Run all fixes');
