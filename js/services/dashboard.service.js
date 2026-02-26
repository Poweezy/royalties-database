/**
 * Dashboard Service
 * Provides comprehensive analytics, forecasting, and real-time data processing
 */
import { dbService } from "./database.service.js";
import { EnhancedRoyaltyCalculator } from "../modules/enhanced-royalty-calculator.js";
import { logger } from "../utils/logger.js";

class DashboardService {
    constructor() {
        this.calculator = new EnhancedRoyaltyCalculator();
        this.cache = new Map();
        this.refreshInterval = null;
        this.periodicRefreshInterval = 300000; // 5 minutes
        this.realTimeUpdates = false;
        this.analyticsData = {
            revenue: [],
            production: [],
            compliance: [],
            alerts: []
        };
        this.analyticsFeatures = {
            predictiveAnalysis: true,
            trendForecasting: true,
            anomalyDetection: true,
            performanceMetrics: true,
        };
    }

    /**
     * Initialize dashboard features
     */
    async init() {
        try {
            await this.loadHistoricalData();
            this.setupRealTimeUpdates();
            this.initializeAlerts();
            this.startPeriodicRefresh();
            logger.debug('DashboardService initialized');
        } catch (error) {
            logger.error('Failed to initialize DashboardService', error);
            throw error;
        }
    }

    /**
     * Load historical data for analytics
     */
    async loadHistoricalData() {
        // In a real app, this would fetch from database or API
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
     * Start periodic refresh of analytics
     */
    startPeriodicRefresh() {
        setInterval(async () => {
            try {
                await this.generateDashboardMetrics();
            } catch (error) {
                logger.error("Failed to refresh analytics", error);
            }
        }, this.periodicRefreshInterval);
    }

    /**
     * Update real-time metrics
     */
    updateRealTimeMetrics() {
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

    calculateProductionVariance(production) {
        if (!production) return 0;
        const total = production.coal + production.stone + production.gravel + production.iron;
        const target = 140000;
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
        if (this.analyticsData.alerts.length > 50) {
            this.analyticsData.alerts = this.analyticsData.alerts.slice(0, 50);
        }

        window.dispatchEvent(new CustomEvent('dashboardAlert', { detail: alert }));
    }

    /**
     * Generate all dashboard metrics
     */
    async generateDashboardMetrics() {
        const metrics = {
            revenue: await this.calculateRevenueMetrics(),
            compliance: await this.analyzeComplianceMetrics(),
            operations: await this.generateOperationalMetrics(),
            trends: await this.analyzeTrends(),
            summary: this.generateExecutiveSummary()
        };

        this.cache.set("dashboardMetrics", {
            data: metrics,
            timestamp: Date.now(),
        });

        return metrics;
    }

    async calculateRevenueMetrics() {
        const data = await dbService.getAll('royalties');
        return {
            totalRevenue: data.reduce((sum, r) => sum + r.royaltyPayment, 0),
            revenueByMineral: this.categorizeByMineral(data),
            revenueByEntity: this.categorizeByEntity(data),
            monthlyTrend: this.calculateMonthlyTrend(data),
            projectedRevenue: await this.predictRevenue(data),
        };
    }

    categorizeByMineral(data) {
        const groups = {};
        data.forEach(r => {
            groups[r.mineral] = (groups[r.mineral] || 0) + r.royaltyPayment;
        });
        return groups;
    }

    categorizeByEntity(data) {
        const groups = {};
        data.forEach(r => {
            groups[r.entity] = (groups[r.entity] || 0) + r.royaltyPayment;
        });
        return groups;
    }

    calculateMonthlyTrend(data) {
        // Simple mock trend
        return [5, 8, -2, 4, 12, 7];
    }

    async analyzeComplianceMetrics() {
        const contracts = await dbService.getAll('contracts');
        return {
            overallCompliance: 92, // Mock value
            complianceByEntity: {},
            riskAssessment: 'Low',
            upcomingDeadlines: 3,
        };
    }

    async generateOperationalMetrics() {
        return {
            activeContracts: (await dbService.getAll('contracts')).length,
            pendingPayments: 5,
            processingEfficiency: 98,
            systemHealth: 'Optimal',
        };
    }

    async analyzeTrends() {
        return {
            paymentTrends: [10, 15, 8, 20, 25, 22],
            seasonalPatterns: 'Higher in Q3',
            growthRate: 15.5,
            forecast: await this.getRevenueForecast(6),
        };
    }

    /**
     * Revenue prediction and forecasting
     */
    async predictRevenue(data) {
        const lastAmount = data.length > 0 ? data[data.length - 1].royaltyPayment : 1000000;
        const predictions = {
            nextMonth: lastAmount * 1.05,
            nextQuarter: lastAmount * 3.15,
            nextYear: lastAmount * 12.8,
        };

        return {
            ...predictions,
            confidence: this.calculateConfidenceIntervals(predictions),
        };
    }

    calculateConfidenceIntervals(predictions) {
        return {
            monthly: { lower: predictions.nextMonth * 0.9, upper: predictions.nextMonth * 1.1 },
            quarterly: { lower: predictions.nextQuarter * 0.85, upper: predictions.nextQuarter * 1.15 },
            yearly: { lower: predictions.nextYear * 0.8, upper: predictions.nextYear * 1.2 },
        };
    }

    getRevenueForecast(months = 6) {
        const lastMonth = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
        if (!lastMonth) return [];

        const forecast = [];
        const trend = this.calculateRevenueTrend();

        for (let i = 1; i <= months; i++) {
            const forecastAmount = lastMonth.amount * (1 + (trend * i / 100));
            forecast.push({
                month: new Date(2024, new Date().getMonth() + i).toLocaleString('default', { month: 'short' }),
                amount: Math.round(forecastAmount),
                confidence: Math.max(50, 95 - (i * 8))
            });
        }
        return forecast;
    }

    calculateRevenueTrend() {
        const recentMonths = this.analyticsData.revenue.slice(-6);
        if (recentMonths.length < 2) return 0;
        const firstMonth = recentMonths[0].amount;
        const lastMonth = recentMonths[recentMonths.length - 1].amount;
        return ((lastMonth - firstMonth) / firstMonth) * 100;
    }

    /**
     * Executive Summary and Insights
     */
    generateExecutiveSummary() {
        const currentMonth = new Date().getMonth();
        const revenue = this.analyticsData.revenue[currentMonth];
        const compliance = this.analyticsData.compliance[currentMonth];

        return {
            period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            revenue: {
                current: revenue?.amount || 0,
                target: revenue?.target || 0,
                variance: revenue ? ((revenue.amount - revenue.target) / revenue.target * 100) : 0
            },
            compliance: { overall: Math.round(compliance?.overall || 0), trend: 'stable' },
            keyInsights: this.getPerformanceInsights().slice(0, 3)
        };
    }

    getPerformanceInsights() {
        const insights = [];
        const metrics = this.getCurrentMetrics();

        if (metrics.revenueVsTarget > 0) insights.push({ type: 'positive', category: 'Revenue', message: 'Above target', impact: 'high' });
        if (metrics.compliance < 85) insights.push({ type: 'negative', category: 'Compliance', message: 'Below 85%', impact: 'high' });

        return insights;
    }

    /**
     * Interface methods for compatibility
     */
    getAnalyticsData() { return this.analyticsData; }
    setRealTimeUpdates(enabled) { this.realTimeUpdates = enabled; }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

export const dashboardService = new DashboardService();
