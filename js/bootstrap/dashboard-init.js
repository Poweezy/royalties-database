// Shared bootstrap glue. Loaded as a classic script on purpose: these
// handlers must run at the same point in the parse order as the original
// page inline scripts they replaced.

// Dashboard initialization function
    function initializeDashboardWithData() {
      // Use logger if available, fallback to console in development
      if (typeof window !== 'undefined' && window.logger) {
        window.logger.debug("Initializing dashboard with sample data...");
      } else if (typeof console !== 'undefined') {
        console.debug("Initializing dashboard with sample data...");
      }

      // Update all dashboard metrics
      const metrics = {
        "total-royalties": "E 992,500.00",
        "active-entities": "6",
        "compliance-rate": "80%",
        "pending-approvals": "2",
        "mines-count": "2",
        "quarries-count": "4",
        "paid-count": "3",
        "pending-count": "1",
        "overdue-count": "1",
        "avg-monthly": "82,708",
        "peak-month": "January 2024",
        "total-production": "52,000",
        "top-producer": "Kwalini Quarry",
      };

      // Update all metric elements
      Object.entries(metrics).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      });

      // Update progress bars
      const progressBars = {
        "compliance-progress": "80%",
        "royalties-progress": "75%",
      };

      Object.entries(progressBars).forEach(([id, width]) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.width = width;
        }
      });

      // Show urgent items
      const urgentItems = document.getElementById("urgent-items");
      if (urgentItems) {
        urgentItems.style.display = "inline-flex";
      }

      // Update trends to show positive indicators
      const trendsElements = document.querySelectorAll(".trend-indicator");
      trendsElements.forEach((trend) => {
        if (trend.id === "royalties-trend") {
          trend.innerHTML =
            '<i class="fas fa-arrow-up trend-positive"></i> +15.8% from last year';
        } else if (trend.id === "entities-trend") {
          trend.innerHTML =
            '<i class="fas fa-arrow-up trend-positive"></i> +2 new this month';
        }
      });

      // Use logger if available, fallback to console in development
      if (typeof window !== 'undefined' && window.logger) {
        window.logger.debug("Dashboard initialized successfully");
      } else if (typeof console !== 'undefined') {
        console.debug("Dashboard initialized successfully");
      }
    }
  
