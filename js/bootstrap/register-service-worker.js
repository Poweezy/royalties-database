// Extracted from royalties.html inline script (D2 inline-script extraction).
// Legacy glue script: classic script on purpose (same parse-time execution
// order as the original inline block) — see APPLICATION_REVIEW.md.

// Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("js/service-worker.js")
          .then((registration) => {
            // Use logger if available
            if (typeof window !== 'undefined' && window.logger) {
              window.logger.debug("ServiceWorker registration successful");
            } else if (typeof console !== 'undefined') {
              console.debug("ServiceWorker registration successful");
            }

            // Request notification permission
            if ("Notification" in window) {
              Notification.requestPermission();
            }

            // Subscribe to push notifications
            // Push notifications will be configured later
            if (false && "PushManager" in window) {
              // Disabled for now until we have proper VAPID keys
              /*registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
            });*/
            }
          })
          .catch((err) => {
            // Use logger if available
            if (typeof window !== 'undefined' && window.logger) {
              window.logger.error("ServiceWorker registration failed", err);
            } else if (typeof console !== 'undefined') {
              console.error("ServiceWorker registration failed:", err);
            }
          });
      });
    }
  
