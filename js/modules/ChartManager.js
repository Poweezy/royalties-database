export default class ChartManager {
    constructor() {
        this.charts = new Map();
    }

    initializeCharts() {
        return Promise.resolve();
    }

    destroy() {
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        this.charts.clear();
    }
}
