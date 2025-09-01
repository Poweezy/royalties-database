/**
 * Error handling utilities
 */

export class ErrorHandler {
  constructor(notificationManager) {
    this.notificationManager = notificationManager;
    this.setupGlobalHandlers();
  }

  /**
   * Set up global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason);
    });

    // Handle uncaught exceptions
    window.addEventListener("error", (event) => {
      this.handleError(event.error);
    });
  }

  /**
   * Handle an error
   */
  handleError(error, context = {}) {
    console.error("Error:", error);

    // Format error message
    const message = this.formatErrorMessage(error);

    // Log error
    this.logError(error, context);

    // Show notification to user
    this.notifyUser(message);

    // Report error if necessary
    if (this.shouldReportError(error)) {
      this.reportError(error, context);
    }
  }

  /**
   * Format error message for display
   */
  formatErrorMessage(error) {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "An unexpected error occurred";
  }

  /**
   * Log error for debugging
   */
  logError(error, context) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
    };

    // Log to console in development
    console.error("Error Log:", errorLog);

    // Store in local storage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem("error_logs") || "[]");
      errors.push(errorLog);
      localStorage.setItem("error_logs", JSON.stringify(errors.slice(-100)));
    } catch (e) {
      console.error("Failed to store error log:", e);
    }
  }

  /**
   * Notify user about error
   */
  notifyUser(message) {
    if (this.notificationManager) {
      this.notificationManager.show(message, "error", 5000);
    }
  }

  /**
   * Determine if error should be reported
   */
  shouldReportError(error) {
    // Don't report network errors
    if (error.name === "NetworkError") return false;

    // Don't report user cancelation
    if (error.name === "AbortError") return false;

    // Don't report validation errors
    if (error.name === "ValidationError") return false;

    return true;
  }

  /**
   * Report error to monitoring service
   */
  async reportError(error, context) {
    try {
      const errorReport = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context: context,
      };

      // TODO: Replace with actual error reporting service
      console.warn("Error Report:", errorReport);
    } catch (e) {
      console.error("Failed to report error:", e);
    }
  }

  /**
   * Handle API errors
   */
  handleApiError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          this.handleError("Invalid request. Please check your input.");
          break;
        case 401:
          this.handleError("Your session has expired. Please log in again.");
          // Redirect to login
          window.location.href = "/login";
          break;
        case 403:
          this.handleError(
            "You do not have permission to perform this action.",
          );
          break;
        case 404:
          this.handleError("The requested resource was not found.");
          break;
        case 429:
          this.handleError("Too many requests. Please try again later.");
          break;
        case 500:
          this.handleError("A server error occurred. Please try again later.");
          break;
        default:
          this.handleError("An unexpected error occurred. Please try again.");
      }
    } else if (error.request) {
      this.handleError(
        "Unable to connect to the server. Please check your internet connection.",
      );
    } else {
      this.handleError(error.message);
    }
  }

  /**
   * Create validation error
   */
  createValidationError(message) {
    const error = new Error(message);
    error.name = "ValidationError";
    return error;
  }

  /**
   * Handle form validation errors
   */
  handleFormValidationError(form, errors) {
    // Clear existing errors
    form.querySelectorAll(".validation-error").forEach((el) => {
      el.style.display = "none";
    });

    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      const errorEl = form.querySelector(`#${field}-error`);
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
      }
    });

    // Show summary notification
    this.notifyUser("Please correct the errors in the form.");
  }
}
