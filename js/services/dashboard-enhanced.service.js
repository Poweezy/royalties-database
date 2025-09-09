/**
 * Enhanced Dashboard Analytics Service
 * Provides advanced analytics, forecasting, and real-time data processing
 */

class DashboardEnhancedService {
  constructor() {
    this.refreshInterval = null;
    this.realTimeUpdates = false;
    this.analyticsData = {
      revenue: [],
      production: [],
      compliance: [],
      alerts: []
    };
  }

  /**
   * Initialize enhanced dashboard features
   */
  async init() {
    await this.loadHistoricalData();
    this.setupRealTimeUpdates();
    this.initializeAlerts();
  }

  /**
   * Load historical data for analytics
   */
  async loadHistoricalData() {
    // Simulate loading historical data - in real app would fetch from API
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    this.analyticsData.revenue = months.map((month, index) => ({
      month,
      year: currentYear,
      amount: this.generateTrendData(800000, 1200000, index, 0.05),
      target: 1000000,
      previous: this.generateTrendData(750000, 1100000, index, 0.03)
    }));

    this.analyticsData.production = months.map((month, index) => ({
      month,
      coal: this.generateTrendData(45000, 65000, index, 0.02),
      stone: this.generateTrendData(35000, 55000, index, 0.03),
      gravel: this.generateTrendData(25000, 45000, index, 0.04),
      iron: this.generateTrendData(15000, 25000, index, 0.01)
    }));

    this.analyticsData.compliance = months.map((month, index) => ({
      month,
      overall: Math.max(75, Math.min(100, 85 + (Math.random() - 0.5) * 15)),
      environmental: Math.max(70, Math.min(100, 88 + (Math.random() - 0.5) * 12)),
      safety: Math.max(80, Math.min(100, 92 + (Math.random() - 0.5) * 10)),
      financial: Math.max(85, Math.min(100, 95 + (Math.random() - 0.5) * 8))
    }));
  }

  /**
   * Generate trending data with noise
   */
  generateTrendData(min, max, index, trend) {
    const base = min + (max - min) * (index / 11);
    const trendValue = base * (1 + trend * index);
    const noise = trendValue * (Math.random() - 0.5) * 0.1;
    return Math.round(trendValue + noise);
  }

  /**
   * Setup real-time data updates
   */
  setupRealTimeUpdates() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      if (this.realTimeUpdates) {
        this.updateRealTimeMetrics();
        this.checkAlerts();
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Update real-time metrics
   */
  updateRealTimeMetrics() {
    // Update current month data with small variations
    const currentMonth = new Date().getMonth();
    
    // Update revenue
    const revenueData = this.analyticsData.revenue[currentMonth];
    if (revenueData) {
      revenueData.amount += Math.round((Math.random() - 0.5) * 10000);
      revenueData.amount = Math.max(0, revenueData.amount);
    }

    // Update production
    const productionData = this.analyticsData.production[currentMonth];
    if (productionData) {
      productionData.coal += Math.round((Math.random() - 0.5) * 1000);
      productionData.stone += Math.round((Math.random() - 0.5) * 800);
      productionData.gravel += Math.round((Math.random() - 0.5) * 600);
      productionData.iron += Math.round((Math.random() - 0.5) * 400);
    }

    // Trigger update event
    window.dispatchEvent(new CustomEvent('dashboardDataUpdated', {
      detail: { timestamp: new Date().toISOString() }
    }));
  }

  /**
   * Initialize alert system
   */
  initializeAlerts() {
    this.alertRules = [
      {
        id: 'low-compliance',
        name: 'Low Compliance Rate',
        condition: (data) => data.compliance < 80,
        severity: 'warning',
        message: 'Compliance rate has dropped below 80%'
      },
      {
        id: 'production-drop',
        name: 'Production Drop',
        condition: (data) => data.productionVariance < -15,
        severity: 'error',
        message: 'Production has dropped significantly compared to target'
      },
      {
        id: 'revenue-target',
        name: 'Revenue Target Miss',
        condition: (data) => data.revenueVsTarget < -10,
        severity: 'warning',
        message: 'Revenue is falling behind target'
      }
    ];
  }

  /**
   * Check alert conditions
   */
  checkAlerts() {
    const currentData = this.getCurrentMetrics();
    
    this.alertRules.forEach(rule => {
      if (rule.condition(currentData)) {
        this.triggerAlert(rule);
      }
    });
  }

  /**
   * Get current metrics summary
   */
  getCurrentMetrics() {
    const currentMonth = new Date().getMonth();
    const revenue = this.analyticsData.revenue[currentMonth];
    const production = this.analyticsData.production[currentMonth];
    const compliance = this.analyticsData.compliance[currentMonth];

    return {
      compliance: compliance?.overall || 0,
      productionVariance: this.calculateProductionVariance(production),
      revenueVsTarget: revenue ? ((revenue.amount - revenue.target) / revenue.target) * 100 : 0
    };
  }

  /**
   * Calculate production variance
   */
  calculateProductionVariance(production) {
    if (!production) return 0;
    
    const total = production.coal + production.stone + production.gravel + production.iron;
    const target = 140000; // Example target
    return ((total - target) / target) * 100;
  }

  /**
   * Trigger alert
   */
  triggerAlert(rule) {
    const alert = {
      id: `${rule.id}-${Date.now()}`,
      type: rule.severity,
      title: rule.name,
      message: rule.message,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.analyticsData.alerts.unshift(alert);
    
    // Keep only latest 50 alerts
    this.analyticsData.alerts = this.analyticsData.alerts.slice(0, 50);

    // Dispatch alert event
    window.dispatchEvent(new CustomEvent('dashboardAlert', {
      detail: alert
    }));
  }

  /**
   * Get revenue forecast
   */
  getRevenueForecast(months = 6) {
    const lastMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
    if (!lastMonth) return [];

    const forecast = [];
    const trend = this.calculateRevenueTrend();
    
    for (let i = 1; i <= months; i++) {
      const forecastAmount = lastMonth.amount * (1 + (trend * i / 100));
      const confidence = Math.max(50, 95 - (i * 8)); // Decreasing confidence
      
      forecast.push({
        month: new Date(2024, new Date().getMonth() + i).toLocaleString('default', { month: 'short' }),
        amount: Math.round(forecastAmount),
        confidence: Math.round(confidence),
        range: {
          min: Math.round(forecastAmount * 0.85),
          max: Math.round(forecastAmount * 1.15)
        }
      });
    }

    return forecast;
  }

  /**
   * Calculate revenue trend
   */
  calculateRevenueTrend() {
    const recentMonths = this.analyticsData.revenue.slice(-6);
    if (recentMonths.length < 2) return 0;

    const firstMonth = recentMonths[0].amount;
    const lastMonth = recentMonths[recentMonths.length - 1].amount;
    
    return ((lastMonth - firstMonth) / firstMonth) * 100;
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights() {
    const insights = [];
    const currentMetrics = this.getCurrentMetrics();
    
    // Revenue insights
    const revenueTrend = this.calculateRevenueTrend();
    if (revenueTrend > 5) {
      insights.push({
        type: 'positive',
        category: 'Revenue',
        message: `Revenue is trending upward by ${revenueTrend.toFixed(1)}%`,
        impact: 'high'
      });
    } else if (revenueTrend < -5) {
      insights.push({
        type: 'negative',
        category: 'Revenue',
        message: `Revenue is declining by ${Math.abs(revenueTrend).toFixed(1)}%`,
        impact: 'high'
      });
    }

    // Compliance insights
    if (currentMetrics.compliance > 90) {
      insights.push({
        type: 'positive',
        category: 'Compliance',
        message: 'Excellent compliance rate maintained',
        impact: 'medium'
      });
    } else if (currentMetrics.compliance < 80) {
      insights.push({
        type: 'negative',
        category: 'Compliance',
        message: 'Compliance rate needs immediate attention',
        impact: 'high'
      });
    }

    // Production insights
    if (currentMetrics.productionVariance > 10) {
      insights.push({
        type: 'positive',
        category: 'Production',
        message: 'Production exceeding targets consistently',
        impact: 'medium'
      });
    }

    return insights;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary() {
    const currentMonth = new Date().getMonth();
    const revenue = this.analyticsData.revenue[currentMonth];
    const compliance = this.analyticsData.compliance[currentMonth];
    const forecast = this.getRevenueForecast(3);
    
    return {
      period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      revenue: {
        current: revenue?.amount || 0,
        target: revenue?.target || 0,
        variance: revenue ? ((revenue.amount - revenue.target) / revenue.target * 100) : 0
      },
      compliance: {
        overall: Math.round(compliance?.overall || 0),
        trend: 'stable'
      },
      forecast: {
        nextQuarter: forecast.reduce((sum, month) => sum + month.amount, 0),
        confidence: forecast.length > 0 ? Math.round(forecast.reduce((sum, month) => sum + month.confidence, 0) / forecast.length) : 0
      },
      keyInsights: this.getPerformanceInsights().slice(0, 3)
    };
  }

  /**
   * Enable/disable real-time updates
   */
  setRealTimeUpdates(enabled) {
    this.realTimeUpdates = enabled;
    if (enabled) {
      console.log('Real-time dashboard updates enabled');
    } else {
      console.log('Real-time dashboard updates disabled');
    }
  }

  /**
   * Get analytics data
   */
  getAnalyticsData() {
    return this.analyticsData;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

export const dashboardEnhancedService = new DashboardEnhancedService();
