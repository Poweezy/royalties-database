// Shared bootstrap glue. Loaded as a classic script on purpose: these
// handlers must run at the same point in the parse order as the original
// page inline scripts they replaced.

console.warn(
      "This browser does not support ES6 modules. Please upgrade to a modern browser.",
    );

    // Simple fallback for basic functionality
    document.addEventListener("DOMContentLoaded", function () {
      // Populate dashboard metrics with sample data
      const updateDashboardMetrics = () => {
        // Update royalty metrics
        const totalRoyalties = document.getElementById("total-royalties");
        const activeEntities = document.getElementById("active-entities");
        const complianceRate = document.getElementById("compliance-rate");
        const pendingApprovals = document.getElementById("pending-approvals");

        if (totalRoyalties) totalRoyalties.textContent = "E 2,847,650.00";
        if (activeEntities) activeEntities.textContent = "15";
        if (complianceRate) complianceRate.textContent = "94%";
        if (pendingApprovals) pendingApprovals.textContent = "5";

        // Update progress bars
        const royaltiesProgress =
          document.getElementById("royalties-progress");
        const complianceProgress = document.getElementById(
          "compliance-progress",
        );

        if (royaltiesProgress) royaltiesProgress.style.width = "75%";
        if (complianceProgress) complianceProgress.style.width = "94%";

        // Update trend indicators
        const royaltiesTrend = document.getElementById("royalties-trend");
        const entitiesTrend = document.getElementById("entities-trend");

        if (royaltiesTrend) {
          royaltiesTrend.innerHTML =
            '<i class="fas fa-arrow-up trend-positive"></i> +15.8% from last year';
        }
        if (entitiesTrend) {
          entitiesTrend.innerHTML =
            '<i class="fas fa-arrow-up trend-positive"></i> +2 new entities';
        }

        // Update compliance metrics
        const overallComplianceRate = document.getElementById(
          "overall-compliance-rate",
        );
        const auditScore = document.getElementById("audit-score");
        const upcomingDeadlinesCount = document.getElementById(
          "upcoming-deadlines-count",
        );
        const regulatoryUpdatesCount = document.getElementById(
          "regulatory-updates-count",
        );

        if (overallComplianceRate) overallComplianceRate.textContent = "94%";
        if (auditScore) auditScore.textContent = "98%";
        if (upcomingDeadlinesCount) upcomingDeadlinesCount.textContent = "5";
        if (regulatoryUpdatesCount) regulatoryUpdatesCount.textContent = "2";

        // Update notification counts
        const activeNotificationsCount = document.getElementById(
          "active-notifications-count",
        );
        const unreadCount = document.getElementById("unread-count");
        const criticalAlertsCount = document.getElementById(
          "critical-alerts-count",
        );
        const systemHealthStatus = document.getElementById(
          "system-health-status",
        );

        if (activeNotificationsCount)
          activeNotificationsCount.textContent = "7";
        if (unreadCount) unreadCount.textContent = "3";
        if (criticalAlertsCount) criticalAlertsCount.textContent = "2";
        if (systemHealthStatus) systemHealthStatus.textContent = "Optimal";

        // Update communication metrics
        const messagesSentCount = document.getElementById(
          "messages-sent-count",
        );
        const responseRate = document.getElementById("response-rate");
        const activeConversations = document.getElementById(
          "active-conversations",
        );
        const urgentMessages = document.getElementById("urgent-messages");

        if (messagesSentCount) messagesSentCount.textContent = "127";
        if (responseRate) responseRate.textContent = "89%";
        if (activeConversations) activeConversations.textContent = "23";
        if (urgentMessages) urgentMessages.textContent = "3";
      };

      // Call the update function
      updateDashboardMetrics();

      // Additional dashboard initialization with sample data
      let dashboardDataCache = null;
      const initializeDashboardWithData = () => {
        // Cache data to avoid repetitive DOM manipulation
        if (dashboardDataCache) {
          return; // Don't re-populate if data hasn't changed
        }

        // Populate chart summaries
        const avgMonthly = document.getElementById("avg-monthly");
        const peakMonth = document.getElementById("peak-month");
        const totalProduction = document.getElementById("total-production");
        const topProducer = document.getElementById("top-producer");

        if (avgMonthly && avgMonthly.textContent !== "387,500") avgMonthly.textContent = "387,500";
        if (peakMonth && peakMonth.textContent !== "December") peakMonth.textContent = "December";
        if (totalProduction && totalProduction.textContent !== "240,000") totalProduction.textContent = "240,000";
        if (topProducer && topProducer.textContent !== "Maloma Colliery") topProducer.textContent = "Maloma Colliery";

        dashboardDataCache = true;

        // Update mines vs quarries breakdown
        const minesCount = document.getElementById("mines-count");
        const quarriesCount = document.getElementById("quarries-count");
        if (minesCount) minesCount.textContent = "3";
        if (quarriesCount) quarriesCount.textContent = "3";

        // Update system status indicators
        const dbStatus = document.getElementById("db-status");
        const lastBackup = document.getElementById("last-backup");
        const activeSessions = document.getElementById("active-sessions");
        const systemUptime = document.getElementById("system-uptime");

        if (dbStatus && !dbStatus.textContent.includes("Connected")) {
          dbStatus.innerHTML = '<i class="fas fa-circle"></i> Connected';
        }
        if (lastBackup && !lastBackup.textContent.includes("AM")) {
          lastBackup.textContent = "Today, 03:00 AM";
        }
        if (activeSessions && !activeSessions.textContent.includes("users")) {
          activeSessions.textContent = "3 users";
        }
        if (systemUptime && !systemUptime.textContent.includes("days")) {
          systemUptime.textContent = "7 days, 14 hours";
        }

        console.log("Dashboard initialized with complete sample data");
      };

      // Initialize dashboard with data
      initializeDashboardWithData();

      // Update metrics every 10 minutes to further reduce memory usage
      let dashboardInterval = setInterval(() => {
        // Only update if page is visible
        if (!document.hidden) {
          updateDashboardMetrics();
          initializeDashboardWithData();
        }
      }, 600000); // 10 minutes instead of 30 seconds

      // Clear interval when page is hidden/unloaded
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearInterval(dashboardInterval);
        } else {
          clearInterval(dashboardInterval);
          dashboardInterval = setInterval(() => {
            updateDashboardMetrics();
            initializeDashboardWithData();
          }, 300000);
        }
      });

      window.addEventListener('beforeunload', () => {
        clearInterval(dashboardInterval);
      });

      // Add basic form validation for login - handled by main app.js
      // Login functionality is managed by the modular js/app.js

      // Enhanced navigation functionality
      document.addEventListener("click", function (e) {
        const link = e.target.closest('nav a[href^="#"]');
        if (link) {
          e.preventDefault();
          const targetId = link.getAttribute("href").substring(1);

          // Handle logout separately
          if (targetId === "logout") {
            if (confirm("Are you sure you want to logout?")) {
              // Reset to login
              document.getElementById("app-container").style.display = "none";
              document.getElementById("login-section").style.display = "flex";
            }
            return;
          }

          // Hide all sections
          document.querySelectorAll("main section").forEach((section) => {
            section.style.display = "none";
          });

          // Show target section
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.style.display = "block";
            console.log(`Switched to section: ${targetId}`);
          }

          // Update navigation active state
          document
            .querySelectorAll("nav a")
            .forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });

      // Initialize dashboard as active on page load
      document.addEventListener("DOMContentLoaded", function () {
        // Set dashboard nav as active
        const dashboardNav = document.querySelector(
          'nav a[href="#dashboard"]',
        );
        if (dashboardNav) {
          dashboardNav.classList.add("active");
        }

        // Ensure dashboard is visible
        const dashboardSection = document.getElementById("dashboard");
        if (dashboardSection) {
          dashboardSection.style.display = "block";
        }

        // Hide all other sections
        document
          .querySelectorAll("main section:not(#dashboard)")
          .forEach((section) => {
            section.style.display = "none";
          });
      });

      // Enhanced chart initialization
      const initializeCharts = () => {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== "undefined") {
          try {
            // Revenue Trends Chart
            const revenueCtx = document.getElementById(
              "revenue-trends-chart",
            );
            if (revenueCtx) {
              new Chart(revenueCtx, {
                type: "line",
                data: {
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Revenue (E)",
                      data: [500000, 600000, 750000, 700000, 800000, 900000],
                      borderColor: "#1a365d",
                      backgroundColor: "rgba(26, 54, 93, 0.2)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `E ${value.toLocaleString()}`,
                      },
                    },
                  },
                },
              });
            }

            // Production by Entity Chart
            const productionCtx = document.getElementById(
              "production-by-entity-chart",
            );
            if (productionCtx) {
              new Chart(productionCtx, {
                type: "pie",
                data: {
                  labels: [
                    "Maloma Colliery",
                    "Kwalini Quarry",
                    "Mbabane Quarry",
                    "Sidvokodvo Quarry",
                    "Ngwenya Mine",
                    "Malolotja Mine",
                  ],
                  datasets: [
                    {
                      data: [55000, 45000, 38000, 42000, 28000, 32000],
                      backgroundColor: [
                        "#1a365d",
                        "#2563eb",
                        "#059669",
                        "#dc2626",
                        "#d97706",
                        "#7c3aed",
                      ],
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { padding: 20 } },
                  },
                },
              });
            }

            console.log("Charts initialized successfully");
          } catch (error) {
            console.warn("Chart initialization failed:", error);
            showChartFallbacks();
          }
        } else {
          console.warn("Chart.js not available, showing fallback content");
          showChartFallbacks();
        }
      };

      // Chart fallback function
      const showChartFallbacks = () => {
        const revenueChart = document.getElementById("revenue-trends-chart");
        const productionChart = document.getElementById(
          "production-by-entity-chart",
        );

        if (revenueChart) {
          revenueChart.parentElement.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #f8fafc; border-radius: 8px;">
              <i class="fas fa-chart-line" style="font-size: 2rem; color: #64748b; margin-bottom: 1rem;"></i>
              <h4 style="color: #334155; margin: 0.5rem 0;">Revenue Trends</h4>
              <p style="color: #64748b; margin: 0.5rem 0;">YTD Revenue: <strong>E 4,250,000</strong></p>
              <p style="color: #64748b; margin: 0;">Growth: <strong>+15.8%</strong></p>
            </div>
          `;
        }

        if (productionChart) {
          productionChart.parentElement.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #f8fafc; border-radius: 8px;">
              <i class="fas fa-chart-pie" style="font-size: 2rem; color: #64748b; margin-bottom: 1rem;"></i>
              <h4 style="color: #334155; margin: 0.5rem 0;">Production Overview</h4>
              <p style="color: #64748b; margin: 0.5rem 0;">Total Volume: <strong>240,000 m³</strong></p>
              <p style="color: #64748b; margin: 0;">Top Producer: <strong>Maloma Colliery</strong></p>
            </div>
          `;
        }
      };

      // Initialize charts with delay to ensure DOM is ready
      setTimeout(initializeCharts, 1000);

      // Chart control buttons
      document.addEventListener("click", function (e) {
        if (e.target.closest(".chart-btn")) {
          const btn = e.target.closest(".chart-btn");
          const chartType = btn.dataset.chartType;
          const chartId = btn.dataset.chartId;

          // Update active button
          btn.parentElement
            .querySelectorAll(".chart-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          console.log(`Chart type changed to ${chartType} for ${chartId}`);
          showNotification(`Chart updated to ${chartType} view`, "info");
        }
      });

      // Show dashboard by default and initialize
      setTimeout(() => {
        const dashboardSection = document.getElementById("dashboard");
        if (dashboardSection) {
          dashboardSection.style.display = "block";
          // Mark dashboard nav as active
          const dashboardNav = document.querySelector(
            'nav a[href="#dashboard"]',
          );
          if (dashboardNav) dashboardNav.classList.add("active");
        }
      }, 500);
    });
  
