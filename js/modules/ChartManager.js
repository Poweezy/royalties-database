import { dbService } from '../services/database.service.js';

const noDataPlugin = {
  id: 'noData',
  afterDraw: (chart) => {
    if (chart.data.datasets.every(dataset => dataset.data.length === 0)) {
      const { ctx, chartArea: { left, top, right, bottom } } = chart;
      const width = right - left;
      const height = bottom - top;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = '#64748b';
      ctx.fillText('No data available to display chart.', left + width / 2, top + height / 2);
      ctx.restore();
    }
  }
};

Chart.register(noDataPlugin);

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
    this.chartData = null;
  }

  async initializeCharts() {
    try {
      this.chartData = await this._prepareChartData();
      await Promise.all([
        this.createRevenueChart('line'),
        this.createProductionChart('pie')
      ]);
    } catch (error) {
      console.warn('Chart initialization failed:', error);
      this.showFallbackCharts();
    }
  }

  async _prepareChartData() {
    const records = await dbService.getAll('royalties');

    // Prepare revenue data (aggregated by month)
    const revenueByMonth = records.reduce((acc, record) => {
      const month = new Date(record.date).toLocaleString('default', { month: 'short' });
      const revenue = record.volume * record.tariff;
      acc[month] = (acc[month] || 0) + revenue;
      return acc;
    }, {});

    const revenueLabels = Object.keys(revenueByMonth);
    const revenueValues = Object.values(revenueByMonth);

    // Prepare production data (aggregated by entity)
    const productionByEntity = records.reduce((acc, record) => {
      const entity = record.entity;
      acc[entity] = (acc[entity] || 0) + record.volume;
      return acc;
    }, {});

    const productionLabels = Object.keys(productionByEntity);
    const productionValues = Object.values(productionByEntity);

    return {
      revenueData: { labels: revenueLabels, data: revenueValues },
      productionData: { labels: productionLabels, data: productionValues }
    };
  }

  async createRevenueChart(type = 'line') {
    const canvas = document.getElementById('revenue-trends-chart');
    if (!canvas || typeof Chart === 'undefined' || !this.chartData) return;

    const { labels, data } = this.chartData.revenueData;
    const ctx = canvas.getContext('2d');
    this.charts.get('revenue')?.destroy();
    
    const chart = new Chart(ctx, {
      type: (type === 'area') ? 'line' : type,
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue (E)',
          data: data,
          borderColor: '#1a365d',
          backgroundColor: type === 'area' ? 'rgba(26, 54, 93, 0.2)' : '#2563eb',
          fill: type === 'area',
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

  async createProductionChart(type = 'pie') {
    const canvas = document.getElementById('production-by-entity-chart');
    if (!canvas || typeof Chart === 'undefined' || !this.chartData) return;

    const { labels, data } = this.chartData.productionData;
    const ctx = canvas.getContext('2d');
    this.charts.get('production')?.destroy();
    
    const chart = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: 'Production Volume (m³)',
          data: data,
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
                const percentage = total > 0 ? ((parsed / total) * 100).toFixed(1) : 0;
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

  updateMetric(metricId, filter) {
    const data = this.#metricData[metricId]?.[filter];
    if (!data) {
      console.warn(`No data found for metric '${metricId}' with filter '${filter}'`);
      return;
    }

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

  destroyAll() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  async changeChartType(chartId, newType) {
    if (chartId.includes('revenue')) {
      await this.createRevenueChart(newType);
    } else if (chartId.includes('production')) {
      await this.createProductionChart(newType);
    }
  }

  async refreshCharts() {
    try {
      this.chartData = await this._prepareChartData();

      // Re-create charts with their current types
      const revenueChart = this.charts.get('revenue');
      const productionChart = this.charts.get('production');

      const revenueType = revenueChart ? revenueChart.config.type : 'line';
      const productionType = productionChart ? productionChart.config.type : 'pie';

      await Promise.all([
        this.createRevenueChart(revenueType),
        this.createProductionChart(productionType)
      ]);
    } catch (error) {
      console.warn('Chart refresh failed:', error);
      this.showFallbackCharts();
    }
  }
}
