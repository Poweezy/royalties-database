export class ChartManager {
  // Mock data for metric cards to simulate filtering
  #metricData = {
    'royalties': {
      '2024': { value: 'E 992,500.00', trend: '<i class="fas fa-arrow-up trend-positive"></i> +15.8% from last year' },
      '2023': { value: 'E 857,100.00', trend: '<i class="fas fa-arrow-down trend-negative"></i> -5.2% from 2022' },
      'all': { value: 'E 1,849,600.00', trend: 'Covering all available time' }
    },
    'entities': {
      'current': { value: '6', trend: '<i class="fas fa-arrow-up trend-positive"></i> +2 new this month' },
      'last': { value: '4', trend: '<i class="fas fa-minus"></i> No change from previous quarter' },
      'ytd': { value: '8', trend: '<i class="fas fa-arrow-up trend-positive"></i> +4 new this year' }
    }
  };

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

  /**
   * Updates a dashboard metric card with new data based on a filter.
   * @param {string} metricId - The root ID of the metric to update (e.g., 'royalties').
   * @param {string} filter - The selected filter value (e.g., '2024').
   */
  updateMetric(metricId, filter) {
    const data = this.#metricData[metricId]?.[filter];
    if (!data) {
      console.warn(`No data found for metric '${metricId}' with filter '${filter}'`);
      return;
    }

    // Find the metric card using the dropdown's ID
    const metricSelect = document.getElementById(`${metricId}-period`);
    const metricCard = metricSelect?.closest('.metric-card');

    if (!metricCard) {
        console.error(`Could not find metric card for ID: ${metricId}`);
        return;
    }

    const valueElement = metricCard.querySelector('.card-body p');
    const trendElement = metricCard.querySelector('.card-body .trend-indicator');

    if (valueElement) {
      valueElement.textContent = data.value;
    } else {
      console.error(`Value element not found in metric card for '${metricId}'`);
    }

    if (trendElement) {
      trendElement.innerHTML = data.trend;
    }
  }

  getChart(chartId) {
    if (chartId === 'revenue-trends-chart') {
        return this.charts.get('revenue');
    } else if (chartId === 'production-by-entity-chart') {
        return this.charts.get('production');
    }
    return null;
  }

  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}
