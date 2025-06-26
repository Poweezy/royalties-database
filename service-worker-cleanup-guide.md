# Service Worker Cleanup and Cache Clearing Guide
**Date: July 1, 2025**

This document provides instructions for completely removing the service worker and clearing cache for the Mining Royalties Manager application. These steps are useful if you encounter any persistent issues with cached content, especially after the removal of the audit-dashboard component.

## Automatic Cleanup

The application now includes a comprehensive cleanup solution that should automatically:
- Unregister any existing service workers
- Clear all application caches
- Remove audit-dashboard components from the DOM
- Fix navigation to redirect any audit-dashboard requests
- Block loading of audit-dashboard components
- Clean localStorage of audit-dashboard references

This happens automatically when you load the application. If you still encounter issues, follow the manual steps below.

## Manual Cleanup Steps

### Method 1: Using Developer Tools

1. **Open Developer Tools:**
   - Press `F12` or right-click and select "Inspect" in your browser
   - Navigate to the "Application" tab

2. **Clear Service Worker:**
   - In the left sidebar, click on "Service Workers"
   - Click the "Unregister" link next to each service worker
   - Check the "Update on reload" checkbox

3. **Clear Storage:**
   - In the left sidebar, click on "Storage"
   - Click the "Clear site data" button to remove all storage
   - Alternatively, expand "Cache Storage" and delete individual caches

4. **Clear Application Data:**
   - In the left sidebar, click on "Local Storage"
   - Delete any keys related to audit-dashboard
   - Also check "Session Storage" and "IndexedDB" if available

5. **Hard Reload:**
   - Hold down Shift while clicking the reload button
   - Or press Ctrl+Shift+R (Windows/Linux) or Command+Shift+R (Mac)

### Method 2: From JavaScript Console

You can also execute the following commands in the browser console (F12 > Console):

```javascript
// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
        registration.unregister();
        console.log('Service worker unregistered');
    }
});

// Clear all caches
caches.keys().then(function(cacheNames) {
    return Promise.all(
        cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
        })
    );
}).then(function() {
    console.log('Caches cleared');
});

// Clear localStorage
localStorage.clear();
console.log('localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('sessionStorage cleared');

// Reload the page
window.location.reload(true);
```

### Method 3: Browser Settings

1. **Clear browsing data:**
   - Chrome: Settings > Privacy and security > Clear browsing data
   - Firefox: Settings > Privacy & Security > Cookies and Site Data > Clear Data
   - Edge: Settings > Privacy, search, and services > Clear browsing data

2. **Make sure to select:**
   - Cached images and files
   - Cookies and site data
   - Time range: "All time"

3. **Restart Browser:** Close and reopen your browser before accessing the application again

## Verifying Cleanup Success

After performing the cleanup, you can verify it worked by:

1. Opening the browser console (F12)
2. Checking for messages like:
   - "Service Worker: Activating..."
   - "Service Worker: Caching files"
3. Verify no audit-dashboard related errors appear
4. Verify all sections in the sidebar load correctly

## Troubleshooting Persistent Issues

If you still encounter issues:

1. **Try a different browser**
2. **Temporarily disable service workers:**
   - Chrome: Visit `chrome://serviceworker-internals/` and click "Stop and Clear" for your site
   - Firefox: Visit `about:debugging#workers` and click "Unregister" for your site
3. **Try incognito/private mode** which doesn't use existing service workers or cache

## Contact Support

If issues persist after trying all these steps, please contact technical support with:
- The browser and version you're using
- Any error messages from the console (F12)
- Steps you've already tried

---

Document Version: 1.0
Last Updated: July 1, 2025
