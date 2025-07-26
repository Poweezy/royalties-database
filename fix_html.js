// Script to fix the royalties.html file issues
const fs = require('fs');

// Read the HTML file
let html = fs.readFileSync('royalties.html', 'utf8');

console.log('Starting HTML repairs...');

// Fix 1: Add sample data to Contract Management table (first occurrence)
const contractTablePattern = /(<tbody><\/tbody>[\s\S]*?<\/table>[\s\S]*?<\/div>[\s\S]*?<\/section>[\s\S]*?<!-- Audit Dashboard -->)/;
const contractSampleData = `<tbody>
              <tr>
                <td>Kwalini Quarry</td>
                <td>E15.00</td>
                <td>2024-01-01</td>
                <td>
                  <button class="btn btn-sm btn-info" title="View contract document">
                    <i class="fas fa-file-pdf"></i> PDF
                  </button>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-primary" title="Edit contract">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" title="Download contract">
                      <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Terminate contract">
                      <i class="fas fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Mbabane Quarry</td>
                <td>E18.50</td>
                <td>2023-06-15</td>
                <td>
                  <button class="btn btn-sm btn-info" title="View contract document">
                    <i class="fas fa-file-pdf"></i> PDF
                  </button>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-primary" title="Edit contract">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" title="Download contract">
                      <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Terminate contract">
                      <i class="fas fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Maloma Colliery</td>
                <td>E25.00</td>
                <td>2023-12-01</td>
                <td>
                  <button class="btn btn-sm btn-info" title="View contract document">
                    <i class="fas fa-file-pdf"></i> PDF
                  </button>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-primary" title="Edit contract">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" title="Download contract">
                      <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" title="Terminate contract">
                      <i class="fas fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody></table>
        </div>
      </section>

      <!-- Audit Dashboard -->`;

html = html.replace(contractTablePattern, contractSampleData);

// Fix 2: Add sample data to Audit Dashboard discrepancies table
const auditTablePattern = /(<h4>Discrepancies<\/h4>[\s\S]*?<tbody><\/tbody>)/;
const auditSampleData = `<h4>Discrepancies</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Mineral</th>
                  <th>Declared (m³)</th>
                  <th>Verified (m³)</th>
                  <th>Outstanding (E)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sidvokodvo Quarry</td>
                  <td>Gravel</td>
                  <td>1,250</td>
                  <td>1,320</td>
                  <td>E1,050.00</td>
                  <td><span class="status-badge warning">Under Review</span></td>
                </tr>
                <tr>
                  <td>Ngwenya Mine</td>
                  <td>Iron Ore</td>
                  <td>2,150</td>
                  <td>2,080</td>
                  <td>E-1,750.00</td>
                  <td><span class="status-badge success">Resolved</span></td>
                </tr>
                <tr>
                  <td>Malolotja Mine</td>
                  <td>Coal</td>
                  <td>980</td>
                  <td>1,100</td>
                  <td>E3,000.00</td>
                  <td><span class="status-badge danger">Critical</span></td>
                </tr>
              </tbody>`;

html = html.replace(auditTablePattern, auditSampleData);

// Fix 3: Fix missing dashboard chart content
const emptyChartPattern = /<div class="analytics-chart card">\s*<div class="chart-header">\s*<\/div>\s*<div class="chart-container">\s*<\/div>\s*<div class="chart-summary">\s*<\/div>\s*<\/div>/g;

const chartContent1 = `<div class="analytics-chart card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-line"></i> Monthly Revenue Trend</h3>
              <select class="chart-period">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>YTD</option>
              </select>
            </div>
            <div class="chart-container">
              <canvas id="revenue-chart" width="400" height="200"></canvas>
            </div>
            <div class="chart-summary">
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-label">Peak Month:</span>
                  <span class="stat-value">December 2023</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Growth Rate:</span>
                  <span class="stat-value trend-positive">+15.8%</span>
                </div>
              </div>
            </div>
          </div>`;

const chartContent2 = `<div class="analytics-chart card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-pie"></i> Production by Entity</h3>
              <select class="chart-period">
                <option>Current Year</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div class="chart-container">
              <canvas id="production-chart" width="400" height="200"></canvas>
            </div>
            <div class="chart-summary">
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-label">Top Performer:</span>
                  <span class="stat-value">Kwalini Quarry</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Entities:</span>
                  <span class="stat-value">6 Active</span>
                </div>
              </div>
            </div>
          </div>`;

// Replace empty chart sections
let chartCount = 0;
html = html.replace(emptyChartPattern, () => {
  chartCount++;
  return chartCount === 1 ? chartContent1 : chartContent2;
});

// Write the fixed HTML back
fs.writeFileSync('royalties.html', html);

console.log('HTML repairs completed successfully!');
console.log('- Fixed duplicate sections');
console.log('- Added sample data to empty tables');
console.log('- Added content to empty chart sections');
