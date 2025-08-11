export class ChartManager {
  constructor() {
    this.charts = new Map();
  }

  async initializeCharts() {
    try {
      await Promise.all([
        this.createRevenueChart(),
        this.createProductionChart()
      ]);
    } catch (error) {
      console.warn('Chart initialization failed:', error);
      this.showFallbackCharts();
    }
  }

  async createRevenueChart() {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    this.charts.get('revenue')?.destroy();
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (E)',
          data: [500000, 600000, 750000, 700000, 800000, 900000],
          borderColor: '#1a365d',
          backgroundColor: 'rgba(26, 54, 93, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: value => `E ${value.toLocaleString()}` }
          },
          x: { grid: { display: false } }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
    
    this.charts.set('revenue', chart);
  }

  async createProductionChart() {
    const canvas = document.getElementById('production-by-entity-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    this.charts.get('production')?.destroy();
    
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Kwalini Quarry', 'Mbabane Quarry', 'Sidvokodvo Quarry', 'Maloma Colliery', 'Ngwenya Mine', 'Malolotja Mine'],
        datasets: [{
          label: 'Production Volume (m³)',
          data: [45000, 38000, 42000, 55000, 28000, 32000],
          backgroundColor: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed'],
          borderColor: ['#1a365d', '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (context) => {
                const { label, parsed } = context;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((parsed / total) * 100).toFixed(1);
                return `${label}: ${parsed.toLocaleString()} m³ (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    this.charts.set('production', chart);
  }

  showFallbackCharts() {
    const containers = ['#revenue-trends-chart', '#production-by-entity-chart'];
    containers.forEach(selector => {
      const container = document.querySelector(selector)?.parentNode;
      if (container) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">Chart data will be loaded shortly...</p>';
      }
    });
  }

  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}
