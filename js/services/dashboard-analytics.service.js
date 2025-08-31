/**
 * Advanced Analytics Service for Mining Royalties Dashboard
 * Provides comprehensive analytics and insights for royalty management
 */
import { dbService } from './database.service.js';
import { RoyaltyCalculator } from '../modules/RoyaltyCalculator.js';

export class DashboardAnalytics {
    constructor() {
        this.calculator = new RoyaltyCalculator();
        this.cache = new Map();
        this.refreshInterval = 300000; // 5 minutes
    }

    async initialize() {
        await this.setupAnalyticsEngine();
        this.startPeriodicRefresh();
    }

    async setupAnalyticsEngine() {
        this.analyticsFeatures = {
            predictiveAnalysis: true,
            trendForecasting: true,
            anomalyDetection: true,
            performanceMetrics: true
        };
    }

    async generateDashboardMetrics() {
        const metrics = {
            revenue: await this.calculateRevenueMetrics(),
            compliance: await this.analyzeComplianceMetrics(),
            operations: await this.generateOperationalMetrics(),
            trends: await this.analyzeTrends()
        };

        this.cache.set('dashboardMetrics', {
            data: metrics,
            timestamp: Date.now()
        });

        return metrics;
    }

    async calculateRevenueMetrics() {
        const data = await dbService.getRoyaltyData();
        return {
            totalRevenue: this.calculateTotalRevenue(data),
            revenueByMineral: this.categorizeByMineral(data),
            revenueByEntity: this.categorizeByEntity(data),
            monthlyTrend: this.calculateMonthlyTrend(data),
            projectedRevenue: await this.predictRevenue(data)
        };
    }

    async analyzeComplianceMetrics() {
        const contracts = await dbService.getContracts();
        return {
            overallCompliance: this.calculateComplianceRate(contracts),
            complianceByEntity: this.analyzeEntityCompliance(contracts),
            riskAssessment: this.assessComplianceRisk(contracts),
            upcomingDeadlines: this.getUpcomingDeadlines(contracts)
        };
    }

    async generateOperationalMetrics() {
        return {
            activeContracts: await this.countActiveContracts(),
            pendingPayments: await this.analyzePendingPayments(),
            processingEfficiency: await this.calculateProcessingMetrics(),
            systemHealth: await this.checkSystemHealth()
        };
    }

    async analyzeTrends() {
        const historicalData = await dbService.getHistoricalData();
        return {
            paymentTrends: this.analyzePaymentPatterns(historicalData),
            seasonalPatterns: this.identifySeasonalPatterns(historicalData),
            growthRate: this.calculateGrowthRate(historicalData),
            forecast: await this.generateForecast(historicalData)
        };
    }

    async predictRevenue(data) {
        // Use advanced statistical models for revenue prediction
        const predictions = {
            nextMonth: this.calculatePrediction(data, 1),
            nextQuarter: this.calculatePrediction(data, 3),
            nextYear: this.calculatePrediction(data, 12)
        };

        return {
            ...predictions,
            confidence: this.calculateConfidenceIntervals(predictions),
            factors: this.identifyInfluencingFactors(data)
        };
    }

    calculateConfidenceIntervals(predictions) {
        return {
            monthly: {
                lower: predictions.nextMonth * 0.9,
                upper: predictions.nextMonth * 1.1
            },
            quarterly: {
                lower: predictions.nextQuarter * 0.85,
                upper: predictions.nextQuarter * 1.15
            },
            yearly: {
                lower: predictions.nextYear * 0.8,
                upper: predictions.nextYear * 1.2
            }
        };
    }

    identifyAnomalies(data) {
        // Advanced anomaly detection
        const anomalies = [];
        const threshold = this.calculateDynamicThreshold(data);

        for (const entry of data) {
            if (this.isAnomaly(entry, threshold)) {
                anomalies.push({
                    ...entry,
                    severity: this.calculateAnomalySeverity(entry, threshold),
                    impact: this.assessImpact(entry)
                });
            }
        }

        return anomalies;
    }

    startPeriodicRefresh() {
        setInterval(async () => {
            try {
                await this.generateDashboardMetrics();
            } catch (error) {
                console.error('Failed to refresh analytics:', error);
            }
        }, this.refreshInterval);
    }

    // Helper methods
    calculateDynamicThreshold(data) {
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
            values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
        );
        return {
            upper: mean + (2 * stdDev),
            lower: mean - (2 * stdDev)
        };
    }

    isAnomaly(entry, threshold) {
        return entry.value > threshold.upper || entry.value < threshold.lower;
    }

    calculateAnomalySeverity(entry, threshold) {
        const deviation = Math.abs(entry.value - ((threshold.upper + threshold.lower) / 2));
        const range = (threshold.upper - threshold.lower) / 2;
        return Math.min(Math.round((deviation / range) * 100), 100);
    }

    assessImpact(anomaly) {
        return {
            financial: this.calculateFinancialImpact(anomaly),
            operational: this.assessOperationalImpact(anomaly),
            compliance: this.evaluateComplianceImpact(anomaly)
        };
    }
}
