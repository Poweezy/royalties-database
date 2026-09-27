// Shared bootstrap glue. Loaded as a classic script on purpose: these
// handlers must run at the same point in the parse order as the original
// page inline scripts they replaced.

// Global error handler for better debugging
    window.addEventListener("error", function (e) {
      // Filter out extension-related errors
      if (
        e.message &&
        (e.message.includes("Extension context invalidated") ||
          e.message.includes("message channel closed") ||
          e.message.includes("chrome-extension"))
      ) {
        e.preventDefault();
        return false;
      }

      // Use logger if available, otherwise console (for early errors)
      const errorData = {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error,
      };

      if (typeof window !== 'undefined' && window.logger) {
        window.logger.error("Application error", e.error || new Error(e.message), errorData);
      } else if (typeof console !== 'undefined') {
        console.error("Application error:", errorData);
      }
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", function (e) {
      if (e.reason && typeof e.reason === "object" && e.reason.message) {
        if (
          e.reason.message.includes("Extension context") ||
          e.reason.message.includes("chrome-extension")
        ) {
          e.preventDefault();
          return false;
        }
      }

      // Use logger if available
      if (typeof window !== 'undefined' && window.logger) {
        window.logger.error("Unhandled promise rejection", e.reason);
      } else if (typeof console !== 'undefined') {
        console.error("Unhandled promise rejection:", e.reason);
      }
    });
  
