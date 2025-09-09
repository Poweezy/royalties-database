/**
 * Advanced Analytics Module
 * Provides comprehensive analytics, forecasting, and business intelligence
 */

export class AdvancedAnalytics {
  constructor() {
    this.analyticsData = {
      revenue: [],
      production: [],
      entities: [],
      trends: [],
      forecasts: [],
      kpis: {}
    };
    this.models = {
      forecast: null,
      trend: null,
      seasonality: null
    };
    this.initialized = false;
  }

  /**
   * Initialize analytics system
   */
  async init() {
    if (this.initialized) return;

    await this.loadHistoricalData();
    await this.calculateKPIs();
    await this.generateForecasts();
    this.setupRealTimeAnalytics();
    this.initialized = true;

    console.log('Advanced Analytics initialized');
  }

  /**
   * Load historical data for analysis
   */
  async loadHistoricalData() {
    // Simulate loading 24 months of historical data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: date.toLocaleString('default', { month: 'long' }),
        date: date.toISOString().split('T')[0]
      });
    }

    // Generate realistic revenue data with seasonality
    this.analyticsData.revenue = months.map((month, index) => {
      const baseRevenue = 850000;
      const trend = index * 15000; // Growing trend
      const seasonality = Math.sin((month.month / 12) * 2 * Math.PI) * 100000; // Seasonal variation
      const noise = (Math.random() - 0.5) * 50000; // Random variation
      
      return {
        ...month,
        totalRevenue: Math.max(0, baseRevenue + trend + seasonality + noise),
        coalRevenue: Math.max(0, (baseRevenue + trend + seasonality + noise) * 0.45),
        stoneRevenue: Math.max(0, (baseRevenue + trend + seasonality + noise) * 0.30),
        gravelRevenue: Math.max(0, (baseRevenue + trend + seasonality + noise) * 0.15),
        ironRevenue: Math.max(0, (baseRevenue + trend + seasonality + noise) * 0.10),
        entities: this.generateEntityData(6)
      };
    });

    // Generate production data
    this.analyticsData.production = months.map((month, index) => {
      return {
        ...month,
        coalProduction: this.generateProductionData(45000, 65000, index, month.month),
        stoneProduction: this.generateProductionData(35000, 55000, index, month.month),
        gravelProduction: this.generateProductionData(25000, 45000, index, month.month),
        ironProduction: this.generateProductionData(15000, 25000, index, month.month),
        totalProduction: 0 // Will be calculated
      };
    });

    // Calculate total production
    this.analyticsData.production.forEach(month => {
      month.totalProduction = month.coalProduction + month.stoneProduction + 
                             month.gravelProduction + month.ironProduction;
    });
  }

  /**
   * Generate entity-specific data
   */
  generateEntityData(count) {
    const entities = ['Maloma Colliery', 'Kwalini Quarry', 'Mbabane Quarry', 
                     'Sidvokodvo Quarry', 'Ngwenya Mine', 'Malolotja Mine'];
    
    return entities.slice(0, count).map(entity => ({
      name: entity,
      revenue: Math.random() * 200000 + 50000,
      production: Math.random() * 20000 + 5000,
      compliance: Math.random() * 20 + 80
    }));
  }

  /**
   * Generate production data with trends and seasonality
   */
  generateProductionData(min, max, index, month) {
    const base = min + (max - min) * 0.5;
    const trend = index * ((max - min) * 0.01);
    const seasonality = Math.sin((month / 12) * 2 * Math.PI) * ((max - min) * 0.2);
    const noise = (Math.random() - 0.5) * ((max - min) * 0.1);
    
    return Math.round(Math.max(min, Math.min(max, base + trend + seasonality + noise)));
  }

  /**
   * Calculate Key Performance Indicators
   */
  async calculateKPIs() {
    const currentMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
    const previousMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 2];
    const yearAgo = this.analyticsData.revenue[this.analyticsData.revenue.length - 13] || currentMonth;

    // Calculate trends
    const monthlyGrowth = previousMonth ? 
      ((currentMonth.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue * 100) : 0;
    
    const yearlyGrowth = yearAgo ? 
      ((currentMonth.totalRevenue - yearAgo.totalRevenue) / yearAgo.totalRevenue * 100) : 0;

    // Calculate averages
    const last12Months = this.analyticsData.revenue.slice(-12);
    const averageMonthlyRevenue = last12Months.reduce((sum, month) => sum + month.totalRevenue, 0) / 12;
    const averageMonthlyProduction = this.analyticsData.production.slice(-12)
      .reduce((sum, month) => sum + month.totalProduction, 0) / 12;

    // Calculate efficiency metrics
    const revenuePerTon = averageMonthlyRevenue / averageMonthlyProduction;
    const productionEfficiency = this.calculateProductionEfficiency();

    this.analyticsData.kpis = {
      currentRevenue: currentMonth.totalRevenue,
      monthlyGrowth: monthlyGrowth,
      yearlyGrowth: yearlyGrowth,
      averageMonthlyRevenue: averageMonthlyRevenue,
      averageMonthlyProduction: averageMonthlyProduction,
      revenuePerTon: revenuePerTon,
      productionEfficiency: productionEfficiency,
      topPerformingEntity: this.getTopPerformingEntity(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate production efficiency
   */
  calculateProductionEfficiency() {
    const last3Months = this.analyticsData.production.slice(-3);
    const targetProduction = 150000; // Monthly target
    
    const averageProduction = last3Months.reduce((sum, month) => sum + month.totalProduction, 0) / 3;
    return (averageProduction / targetProduction) * 100;
  }

  /**
   * Get top performing entity
   */
  getTopPerformingEntity() {
    const currentMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
    if (!currentMonth.entities || currentMonth.entities.length === 0) {
      return { name: 'N/A', revenue: 0 };
    }

    return currentMonth.entities.reduce((top, entity) => 
      entity.revenue > top.revenue ? entity : top
    );
  }

  /**
   * Generate forecasts using simple linear regression
   */
  async generateForecasts() {
    const forecastMonths = 6;
    const revenueData = this.analyticsData.revenue.slice(-12); // Last 12 months
    
    // Simple linear regression for trend
    const trend = this.calculateLinearTrend(revenueData.map(d => d.totalRevenue));
    const seasonality = this.calculateSeasonality(revenueData);
    
    this.analyticsData.forecasts = [];
    
    for (let i = 1; i <= forecastMonths; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      const trendValue = trend.slope * (revenueData.length + i) + trend.intercept;
      const seasonalFactor = seasonality[futureDate.getMonth()] || 1;
      const forecastValue = trendValue * seasonalFactor;
      
      // Add confidence intervals
      const stdDev = this.calculateStandardDeviation(revenueData.map(d => d.totalRevenue));
      const confidenceInterval = 1.96 * stdDev; // 95% confidence
      
      this.analyticsData.forecasts.push({
        month: futureDate.toLocaleString('default', { month: 'long' }),
        year: futureDate.getFullYear(),
        date: futureDate.toISOString().split('T')[0],
        forecast: Math.max(0, forecastValue),
        lowerBound: Math.max(0, forecastValue - confidenceInterval),
        upperBound: forecastValue + confidenceInterval,
        confidence: Math.max(50, 95 - (i * 5)) // Decreasing confidence over time
      });
    }
  }

  /**
   * Calculate linear trend
   */
  calculateLinearTrend(data) {
    const n = data.length;
    const xSum = n * (n - 1) / 2; // Sum of indices
    const ySum = data.reduce((sum, val) => sum + val, 0);
    const xySum = data.reduce((sum, val, index) => sum + val * index, 0);
    const xxSum = n * (n - 1) * (2 * n - 1) / 6; // Sum of squares of indices
    
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    return { slope, intercept };
  }

  /**
   * Calculate seasonality factors
   */
  calculateSeasonality(data) {
    const monthlyTotals = {};
    const monthlyCount = {};
    
    data.forEach(month => {
      const monthKey = month.month;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + month.totalRevenue;
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
    });
    
    const monthlyAverages = {};
    Object.keys(monthlyTotals).forEach(month => {
      monthlyAverages[month] = monthlyTotals[month] / monthlyCount[month];
    });
    
    const overallAverage = Object.values(monthlyAverages).reduce((sum, val) => sum + val, 0) / 
                          Object.keys(monthlyAverages).length;
    
    const seasonalFactors = {};
    Object.keys(monthlyAverages).forEach(month => {
      seasonalFactors[month] = monthlyAverages[month] / overallAverage;
    });
    
    return seasonalFactors;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(data) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Perform correlation analysis
   */
  analyzeCorrelations() {
    const correlations = {
      revenueProduction: this.calculateCorrelation(
        this.analyticsData.revenue.map(d => d.totalRevenue),
        this.analyticsData.production.map(d => d.totalProduction)
      ),
      coalRevenueProduction: this.calculateCorrelation(
        this.analyticsData.revenue.map(d => d.coalRevenue),
        this.analyticsData.production.map(d => d.coalProduction)
      ),
      seasonalTrend: this.analyzeSeasonalCorrelation()
    };

    return correlations;
  }

  /**
   * Calculate correlation coefficient
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length) return 0;
    
    const n = x.length;
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let xSumSq = 0;
    let ySumSq = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xSumSq += xDiff * xDiff;
      ySumSq += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(xSumSq * ySumSq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Analyze seasonal correlation
   */
  analyzeSeasonalCorrelation() {
    const monthlyData = {};
    
    this.analyticsData.revenue.forEach(month => {
      const monthKey = month.month;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: [], production: [] };
      }
      monthlyData[monthKey].revenue.push(month.totalRevenue);
      
      const prodMonth = this.analyticsData.production.find(p => 
        p.year === month.year && p.month === month.month
      );
      if (prodMonth) {
        monthlyData[monthKey].production.push(prodMonth.totalProduction);
      }
    });
    
    const seasonalCorrelations = {};
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      if (data.revenue.length > 1 && data.production.length > 1) {
        seasonalCorrelations[month] = this.calculateCorrelation(data.revenue, data.production);
      }
    });
    
    return seasonalCorrelations;
  }

  /**
   * Generate executive insights
   */
  generateExecutiveInsights() {
    const insights = [];
    const kpis = this.analyticsData.kpis;
    const forecasts = this.analyticsData.forecasts;
    const correlations = this.analyzeCorrelations();

    // Revenue insights
    if (kpis.yearlyGrowth > 10) {
      insights.push({
        type: 'positive',
        category: 'Revenue',
        title: 'Strong Annual Growth',
        description: `Revenue has grown by ${kpis.yearlyGrowth.toFixed(1)}% year-over-year`,
        impact: 'high',
        recommendation: 'Consider expanding operations in high-performing segments'
      });
    } else if (kpis.yearlyGrowth < 0) {
      insights.push({
        type: 'negative',
        category: 'Revenue',
        title: 'Revenue Decline',
        description: `Revenue has declined by ${Math.abs(kpis.yearlyGrowth).toFixed(1)}% year-over-year`,
        impact: 'high',
        recommendation: 'Review operational efficiency and market conditions'
      });
    }

    // Production efficiency insights
    if (kpis.productionEfficiency > 100) {
      insights.push({
        type: 'positive',
        category: 'Production',
        title: 'Exceeding Production Targets',
        description: `Production efficiency at ${kpis.productionEfficiency.toFixed(1)}% of target`,
        impact: 'medium',
        recommendation: 'Evaluate capacity for additional contracts'
      });
    } else if (kpis.productionEfficiency < 80) {
      insights.push({
        type: 'warning',
        category: 'Production',
        title: 'Below Production Targets',
        description: `Production efficiency at only ${kpis.productionEfficiency.toFixed(1)}% of target`,
        impact: 'high',
        recommendation: 'Investigate production bottlenecks and resource allocation'
      });
    }

    // Correlation insights
    if (correlations.revenueProduction > 0.8) {
      insights.push({
        type: 'positive',
        category: 'Analysis',
        title: 'Strong Revenue-Production Correlation',
        description: `High correlation (${correlations.revenueProduction.toFixed(2)}) between revenue and production`,
        impact: 'medium',
        recommendation: 'Focus on production optimization to drive revenue growth'
      });
    }

    // Forecast insights
    const nextQuarterForecast = forecasts.slice(0, 3).reduce((sum, f) => sum + f.forecast, 0);
    const currentQuarterActual = this.analyticsData.revenue.slice(-3).reduce((sum, r) => sum + r.totalRevenue, 0);
    const forecastGrowth = ((nextQuarterForecast - currentQuarterActual) / currentQuarterActual) * 100;

    if (forecastGrowth > 5) {
      insights.push({
        type: 'positive',
        category: 'Forecast',
        title: 'Positive Revenue Outlook',
        description: `Next quarter forecast shows ${forecastGrowth.toFixed(1)}% growth potential`,
        impact: 'medium',
        recommendation: 'Prepare for increased operational demands'
      });
    } else if (forecastGrowth < -5) {
      insights.push({
        type: 'warning',
        category: 'Forecast',
        title: 'Revenue Decline Expected',
        description: `Next quarter forecast shows ${Math.abs(forecastGrowth).toFixed(1)}% decline`,
        impact: 'high',
        recommendation: 'Implement cost management and efficiency measures'
      });
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Generate drill-down analysis
   */
  generateDrillDownAnalysis(category, timeframe = 'monthly') {
    switch (category) {
      case 'revenue':
        return this.analyzeRevenueDetails(timeframe);
      case 'production':
        return this.analyzeProductionDetails(timeframe);
      case 'entities':
        return this.analyzeEntityPerformance(timeframe);
      default:
        return null;
    }
  }

  /**
   * Analyze revenue details
   */
  analyzeRevenueDetails(timeframe) {
    const data = this.analyticsData.revenue;
    
    return {
      category: 'revenue',
      timeframe,
      breakdown: {
        byMineral: {
          coal: data.reduce((sum, month) => sum + month.coalRevenue, 0),
          stone: data.reduce((sum, month) => sum + month.stoneRevenue, 0),
          gravel: data.reduce((sum, month) => sum + month.gravelRevenue, 0),
          iron: data.reduce((sum, month) => sum + month.ironRevenue, 0)
        },
        trends: data.map(month => ({
          date: month.date,
          total: month.totalRevenue,
          coal: month.coalRevenue,
          stone: month.stoneRevenue,
          gravel: month.gravelRevenue,
          iron: month.ironRevenue
        })),
        statistics: {
          total: data.reduce((sum, month) => sum + month.totalRevenue, 0),
          average: data.reduce((sum, month) => sum + month.totalRevenue, 0) / data.length,
          highest: Math.max(...data.map(month => month.totalRevenue)),
          lowest: Math.min(...data.map(month => month.totalRevenue)),
          volatility: this.calculateVolatility(data.map(month => month.totalRevenue))
        }
      }
    };
  }

  /**
   * Calculate volatility
   */
  calculateVolatility(data) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(variance) / mean * 100; // Coefficient of variation as percentage
  }

  /**
   * Analyze production details
   */
  analyzeProductionDetails(timeframe) {
    const data = this.analyticsData.production;
    
    return {
      category: 'production',
      timeframe,
      breakdown: {
        byMineral: {
          coal: data.reduce((sum, month) => sum + month.coalProduction, 0),
          stone: data.reduce((sum, month) => sum + month.stoneProduction, 0),
          gravel: data.reduce((sum, month) => sum + month.gravelProduction, 0),
          iron: data.reduce((sum, month) => sum + month.ironProduction, 0)
        },
        trends: data.map(month => ({
          date: month.date,
          total: month.totalProduction,
          coal: month.coalProduction,
          stone: month.stoneProduction,
          gravel: month.gravelProduction,
          iron: month.ironProduction
        })),
        efficiency: data.map(month => ({
          date: month.date,
          efficiency: (month.totalProduction / 150000) * 100 // Against 150k target
        }))
      }
    };
  }

  /**
   * Analyze entity performance
   */
  analyzeEntityPerformance(timeframe) {
    const allEntities = {};
    
    this.analyticsData.revenue.forEach(month => {
      if (month.entities) {
        month.entities.forEach(entity => {
          if (!allEntities[entity.name]) {
            allEntities[entity.name] = {
              revenue: [],
              production: [],
              compliance: []
            };
          }
          allEntities[entity.name].revenue.push(entity.revenue);
          allEntities[entity.name].production.push(entity.production);
          allEntities[entity.name].compliance.push(entity.compliance);
        });
      }
    });

    const entityAnalysis = {};
    Object.keys(allEntities).forEach(entityName => {
      const data = allEntities[entityName];
      entityAnalysis[entityName] = {
        totalRevenue: data.revenue.reduce((sum, val) => sum + val, 0),
        averageRevenue: data.revenue.reduce((sum, val) => sum + val, 0) / data.revenue.length,
        totalProduction: data.production.reduce((sum, val) => sum + val, 0),
        averageProduction: data.production.reduce((sum, val) => sum + val, 0) / data.production.length,
        averageCompliance: data.compliance.reduce((sum, val) => sum + val, 0) / data.compliance.length,
        performance: this.calculateEntityPerformance(data)
      };
    });

    return {
      category: 'entities',
      timeframe,
      analysis: entityAnalysis,
      rankings: this.rankEntities(entityAnalysis)
    };
  }

  /**
   * Calculate entity performance score
   */
  calculateEntityPerformance(data) {
    const revenueScore = Math.min(100, (data.revenue.reduce((sum, val) => sum + val, 0) / 500000) * 100);
    const productionScore = Math.min(100, (data.production.reduce((sum, val) => sum + val, 0) / 50000) * 100);
    const complianceScore = data.compliance.reduce((sum, val) => sum + val, 0) / data.compliance.length;
    
    return Math.round((revenueScore * 0.4 + productionScore * 0.4 + complianceScore * 0.2));
  }

  /**
   * Rank entities by performance
   */
  rankEntities(entityAnalysis) {
    return Object.entries(entityAnalysis)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.performance - a.performance);
  }

  /**
   * Setup real-time analytics updates
   */
  setupRealTimeAnalytics() {
    // Update analytics every 5 minutes
    setInterval(() => {
      this.updateRealTimeMetrics();
    }, 5 * 60 * 1000);
  }

  /**
   * Update real-time metrics
   */
  updateRealTimeMetrics() {
    // Add small random variations to simulate real-time data
    const currentMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
    if (currentMonth) {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      currentMonth.totalRevenue *= (1 + variation);
      
      // Recalculate KPIs
      this.calculateKPIs();
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('analyticsUpdated', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Export analytics data
   */
  exportData(format = 'json', categories = ['all']) {
    const exportData = {};
    
    if (categories.includes('all') || categories.includes('revenue')) {
      exportData.revenue = this.analyticsData.revenue;
    }
    
    if (categories.includes('all') || categories.includes('production')) {
      exportData.production = this.analyticsData.production;
    }
    
    if (categories.includes('all') || categories.includes('forecasts')) {
      exportData.forecasts = this.analyticsData.forecasts;
    }
    
    if (categories.includes('all') || categories.includes('kpis')) {
      exportData.kpis = this.analyticsData.kpis;
    }

    exportData.metadata = {
      exportedAt: new Date().toISOString(),
      format,
      categories
    };

    switch (format) {
      case 'csv':
        return this.convertToCSV(exportData);
      case 'xlsx':
        return this.convertToXLSX(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    // Simple CSV conversion - in real implementation would use proper CSV library
    const csvLines = [];
    
    if (data.revenue) {
      csvLines.push('Revenue Data');
      csvLines.push('Date,Total Revenue,Coal Revenue,Stone Revenue,Gravel Revenue,Iron Revenue');
      data.revenue.forEach(month => {
        csvLines.push(`${month.date},${month.totalRevenue},${month.coalRevenue},${month.stoneRevenue},${month.gravelRevenue},${month.ironRevenue}`);
      });
      csvLines.push('');
    }

    return csvLines.join('\n');
  }

  /**
   * Convert data to XLSX format
   */
  convertToXLSX(data) {
    // Would use SheetJS or similar library for real XLSX generation
    return 'XLSX conversion would require SheetJS library';
  }

  // Getters
  getAnalyticsData() { return this.analyticsData; }
  getKPIs() { return this.analyticsData.kpis; }
  getForecasts() { return this.analyticsData.forecasts; }
  getInsights() { return this.generateExecutiveInsights(); }
}
