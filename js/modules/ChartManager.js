export class ChartManager {
  constructor() {
    this.charts = new Map();
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  createChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') {
      console.warn(`Cannot create chart: canvas ${canvasId} not found or Chart.js not loaded`);
      this.showFallbackChart(canvasId);
      return null;
    }

    // Destroy existing chart if it exists
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    // Merge with default options
    const mergedConfig = {
      ...config,
      options: {
        ...this.defaultOptions,
        ...config.options
      }
    };

    try {
      const chart = new Chart(canvas, mergedConfig);
      this.charts.set(canvasId, chart);
      return chart;
    } catch (error) {
      console.error(`Error creating chart ${canvasId}:`, error);
      this.showFallbackChart(canvasId);
      return null;
    }
  }

  updateChart(canvasId, newData) {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.data = newData;
      chart.update();
    }
  }

  destroyChart(canvasId) {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.destroy();
      this.charts.delete(canvasId);
    }
  }

  showFallbackChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const container = canvas.parentNode;
      if (container) {
        container.innerHTML = `
          <div class="chart-fallback">
            <i class="fas fa-chart-line"></i>
            <p>Chart data will be loaded shortly...</p>
          </div>
        `;
      }
    }
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

  // Specific chart creation methods
  createRevenueChart(canvasId, data) {
    return this.createChart(canvasId, {
      type: 'line',
      data: {
        labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Revenue (E)',
          data: data.values || [45000, 52000, 48000, 61000, 55000, 67000],
          borderColor: '#1a365d',
          backgroundColor: 'rgba(26, 54, 93, 0.1)',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'E' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  createProductionChart(canvasId, data) {
    return this.createChart(canvasId, {
      type: 'doughnut',
      data: {
        labels: data.labels || [],
        datasets: [{
          data: data.values || [],
          backgroundColor: [
            '#1a365d', '#2d5a88', '#4a90c2', 
            '#7ba7cc', '#a8c5e2', '#d4af37'
          ]
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  updateChartType(canvasId, newType) {
    const chart = this.charts.get(canvasId);
    if (!chart) return;

    chart.config.type = newType;
    
    if (newType === 'area') {
      chart.data.datasets[0].fill = true;
      chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.2)';
    } else if (newType === 'bar') {
      chart.data.datasets[0].fill = false;
      chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.8)';
    } else {
      chart.data.datasets[0].fill = false;
      chart.data.datasets[0].backgroundColor = 'rgba(26, 54, 93, 0.1)';
    }
    
    chart.update();
  }
}
