# Developer Guide - Mining Royalties Manager

**Quick Reference for Developers**

---

## 🚀 Getting Started

### Initial Setup

```bash
# 1. Clone and install
npm install

# 2. Setup environment
npm run setup  # Creates .env from .env.example

# 3. Edit .env file with your settings
# 4. Inject environment variables
npm run inject-env

# 5. Start development server
npm run dev
```

---

## 📁 Code Structure

### Services (`js/services/`)
Core business logic and data access:
- `auth.service.js` - Authentication
- `database.service.js` - IndexedDB operations
- `user-security.service.js` - User security features

### Modules (`js/modules/`)
Feature-specific modules:
- `ChartManager.js` - Chart rendering
- `UserManager.js` - User management
- `NavigationManager.js` - Navigation handling

### Utilities (`js/utils/`)
Shared utilities:
- `config.js` - Configuration manager
- `logger.js` - Logging service
- `error-handler.js` - Error handling

### Components (`js/components/`)
Reusable UI components:
- `BulkOperationsPanel.js` - Bulk operations UI
- `UserProfileModal.js` - User profile modal

---

## 🔧 Development Guidelines

### Using Configuration

```javascript
import { config } from './utils/config.js';

// Get configuration value
const apiUrl = config.get('api.baseUrl');
const timeout = config.get('api.timeout');

// Check environment
if (config.isProduction()) {
  // Production-only code
}

// Check feature flags
if (config.isFeatureEnabled('enableOfflineMode')) {
  // Feature-specific code
}
```

### Using Logger

```javascript
import { logger } from './utils/logger.js';

// Different log levels
logger.debug('Debug information', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error occurred', error);
logger.fatal('Critical error', error);

// Performance logging
logger.performance('Operation name', durationMs, metadata);
```

### Error Handling

```javascript
import { ErrorHandler } from './utils/error-handler.js';

// In constructor
this.errorHandler = new ErrorHandler(notificationManager);

// Handle errors
try {
  // Code that might fail
} catch (error) {
  this.errorHandler.handleError(error, { context: 'additional info' });
}
```

---

## 📝 Code Style

### ES6 Modules
```javascript
// Export
export class MyClass { }
export const myFunction = () => { }

// Import
import { MyClass } from './MyClass.js';
```

### Naming Conventions
- **Classes**: PascalCase (`UserManager`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Private methods**: `#privateMethod()`

### Async/Await
```javascript
// Preferred
async function fetchData() {
  try {
    const data = await dbService.getAll('royalties');
    return data;
  } catch (error) {
    logger.error('Failed to fetch data', error);
    throw error;
  }
}

// Avoid
function fetchData() {
  return dbService.getAll('royalties')
    .then(data => data)
    .catch(error => {
      console.error(error);
      throw error;
    });
}
```

---

## 🧪 Testing

### Writing Tests

```javascript
import { test, expect } from '@playwright/test';

test('User can login', async ({ page }) => {
  await page.goto('/royalties.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password');
  await page.click('button[type="submit"]');
  await expect(page.locator('#app-container')).toBeVisible();
});
```

### Running Tests

```bash
# All tests
npx playwright test

# Specific test
npx playwright test login.spec.js

# With UI
npx playwright test --ui
```

---

## 🔍 Debugging

### Browser Console
- Use logger instead of console.log
- Logger automatically filters based on environment
- Check log level in configuration

### Network Tab
- Monitor API calls
- Check service worker activity
- Review fetch requests

### Application Tab
- IndexedDB data inspection
- LocalStorage/SessionStorage
- Service Worker status

---

## 🚨 Common Issues

### Module Import Errors
**Issue**: Cannot find module error  
**Solution**: 
- Ensure HTTP server is running (not file://)
- Check file paths are correct
- Verify module exports match imports

### Database Errors
**Issue**: IndexedDB version errors  
**Solution**:
- Clear IndexedDB (DevTools > Application > IndexedDB)
- Check database version in config
- Verify object stores exist

### Environment Variables Not Working
**Issue**: Variables not accessible  
**Solution**:
- Run `npm run inject-env`
- Check `.env` file exists
- Verify variable names start with `VITE_` or `REACT_APP_`

---

## 📚 Key Concepts

### Application State
Managed in `app.js` `this.state`:
- Current user
- Current section
- Data arrays (users, records, etc.)
- Settings

### Service Initialization
Services initialize in `app.js` `initializeServices()`:
1. Core services (auth, database)
2. Enhanced services (can fail gracefully)
3. Module initialization

### Event Handling
- Global events: Document body click delegation
- Section-specific: Module-specific listeners
- Navigation: `NavigationManager` handles routing

---

## 🎯 Best Practices

1. **Always use logger** instead of console.log
2. **Check configuration** before accessing env variables
3. **Handle errors gracefully** with ErrorHandler
4. **Use async/await** for async operations
5. **Clean up event listeners** in destroy methods
6. **Validate user input** before processing
7. **Use environment variables** for configuration
8. **Write tests** for new features
9. **Document** complex logic
10. **Follow naming conventions**

---

## 🔐 Security Notes

### Development
- Demo credentials are allowed
- Console logging enabled
- Detailed error messages

### Production
⚠️ **CRITICAL**: Before production:
1. Disable demo mode (`VITE_DEMO_MODE=false`)
2. Configure proper API endpoint
3. Enable error reporting
4. Set log level to 'error'
5. Review all security settings

---

## 📞 Resources

- **Full TODO**: `PRODUCTION_READINESS_TODO.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Architecture**: `AGENTS.md`
- **Features**: `ENHANCED-FEATURES.md`

---

**Last Updated**: 2025-01-17


