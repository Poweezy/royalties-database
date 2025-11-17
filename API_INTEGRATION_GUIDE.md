# API Integration Guide

**Backend API Integration Documentation**

---

## 📋 Overview

The application includes a production-ready API service layer (`js/services/api.service.js`) that provides:

- Automatic authentication token management
- Request/response interceptors
- Error handling and retry logic
- Request timeout and cancellation
- Token refresh mechanism

---

## 🚀 Quick Start

### 1. Import the API Service

```javascript
import { apiService } from './services/api.service.js';
```

### 2. Configure API Base URL

Set in `.env` file:
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

Or update in `js/utils/config.js`:
```javascript
api: {
  baseUrl: 'https://api.yourdomain.com/api',
}
```

### 3. Basic Usage

```javascript
// GET request
const users = await apiService.get('/users');

// POST request
const newUser = await apiService.post('/users', {
  username: 'john',
  email: 'john@example.com',
});

// PUT request
const updated = await apiService.put('/users/123', {
  email: 'john.new@example.com',
});

// DELETE request
await apiService.delete('/users/123');
```

---

## 🔐 Authentication

### Automatic Token Management

The API service automatically:
- Adds authentication token to all requests
- Handles token refresh on 401 errors
- Logs out user if refresh fails

### Token Storage

Tokens are stored via `authService`:
- Access token: `localStorage.getItem('auth_token')`
- Refresh token: `localStorage.getItem('refresh_token')`

### Manual Token Refresh

```javascript
const refreshed = await apiService.refreshToken();
if (refreshed) {
  // Token refreshed successfully
}
```

---

## 📡 API Methods

### GET Request

```javascript
// Simple GET
const data = await apiService.get('/royalties');

// GET with query parameters
const filtered = await apiService.get('/royalties', {
  status: 'paid',
  year: 2024,
  page: 1,
  limit: 10,
});
```

### POST Request

```javascript
// Create new record
const newRecord = await apiService.post('/royalties', {
  entity: 'Kwalini Quarry',
  mineral: 'Quarried Stone',
  volume: 1200,
  tariff: 15.5,
});
```

### PUT Request

```javascript
// Update existing record
const updated = await apiService.put('/royalties/123', {
  status: 'paid',
  paymentDate: '2024-01-15',
});
```

### PATCH Request

```javascript
// Partial update
const patched = await apiService.patch('/royalties/123', {
  status: 'paid',
});
```

### DELETE Request

```javascript
// Delete record
await apiService.delete('/royalties/123');
```

### File Upload

```javascript
// Upload single file
const file = document.querySelector('input[type="file"]').files[0];
const result = await apiService.upload('/documents/upload', file);

// Upload with progress tracking
const result = await apiService.upload(
  '/documents/upload',
  file,
  {},
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);

// Upload FormData with additional fields
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Contract document');
formData.append('category', 'contracts');
const result = await apiService.upload('/documents/upload', formData);
```

---

## ⚙️ Configuration

### Timeout

Default: 30 seconds

```javascript
// In config.js
api: {
  timeout: 30000, // 30 seconds
}
```

### Retry Logic

Default: 3 attempts with exponential backoff

```javascript
// In config.js
api: {
  retryAttempts: 3,
  retryDelay: 1000, // Initial delay: 1 second
}
```

Retry behavior:
- Retries on network errors
- Retries on 5xx server errors
- Does NOT retry on 4xx client errors
- Uses exponential backoff (1s, 2s, 4s)

---

## 🔄 Request Cancellation

### Cancel Single Request

```javascript
// Make request with ID
const requestId = 'get-users-123';
const usersPromise = apiService.get('/users', {}, requestId);

// Cancel if needed
apiService.cancelRequest(requestId);
```

### Cancel All Requests

```javascript
// Useful when navigating away or logging out
apiService.cancelAllRequests();
```

---

## 🛡️ Error Handling

### Automatic Error Handling

The API service automatically handles:
- Network errors → User-friendly message
- Timeout errors → Timeout message
- 401 errors → Auto logout
- 403 errors → Permission denied message
- 5xx errors → Server error message

### Custom Error Handling

```javascript
try {
  const data = await apiService.get('/royalties');
} catch (error) {
  // Error already has user-friendly message
  logger.error('Failed to fetch royalties', error);
  
  // Access original error details
  if (error.status === 404) {
    // Handle not found
  } else if (error.status === 500) {
    // Handle server error
  }
  
  // Show error to user
  notificationManager.show(error.message, 'error');
}
```

---

## 🔌 Backend API Requirements

### Authentication Endpoints

#### POST /api/auth/login
```json
Request:
{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600,
  "user": {
    "id": "123",
    "username": "admin",
    "role": "admin",
    "email": "admin@government.sz"
  }
}
```

#### POST /api/auth/refresh
```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

#### POST /api/auth/logout
```json
Request: (with Authorization header)

Response:
{
  "success": true
}
```

### Data Endpoints

#### GET /api/royalties
Query parameters:
- `status` - Filter by status
- `year` - Filter by year
- `page` - Page number
- `limit` - Items per page

#### POST /api/royalties
Create new royalty record

#### PUT /api/royalties/:id
Update royalty record

#### DELETE /api/royalties/:id
Delete royalty record

---

## 🔄 Migrating from IndexedDB to API

### Step 1: Update Service to Use API

```javascript
// Before (IndexedDB)
const records = await dbService.getAll('royalties');

// After (API)
const records = await apiService.get('/royalties');
```

### Step 2: Handle Offline Mode

```javascript
// Check if API is available
try {
  const records = await apiService.get('/royalties');
  // Save to IndexedDB for offline access
  await dbService.addAll('royalties', records);
} catch (error) {
  // Fallback to IndexedDB if offline
  const records = await dbService.getAll('royalties');
}
```

### Step 3: Sync Offline Changes

```javascript
// When coming back online
window.addEventListener('online', async () => {
  const offlineChanges = await dbService.getAll('offline');
  for (const change of offlineChanges) {
    try {
      await apiService.post(change.endpoint, change.data);
      await dbService.delete('offline', change.id);
    } catch (error) {
      logger.error('Failed to sync offline change', error);
    }
  }
});
```

---

## 📝 Example: Complete Service Migration

### Before (IndexedDB Only)

```javascript
class RoyaltyService {
  async getAll() {
    return await dbService.getAll('royalties');
  }
  
  async create(royalty) {
    return await dbService.add('royalties', royalty);
  }
}
```

### After (API with Offline Fallback)

```javascript
import { apiService } from './api.service.js';
import { dbService } from './database.service.js';
import { config } from './utils/config.js';

class RoyaltyService {
  async getAll() {
    // Try API first
    if (config.isFeatureEnabled('enableOfflineMode') && navigator.onLine) {
      try {
        const records = await apiService.get('/royalties');
        // Cache in IndexedDB
        await dbService.clear('royalties');
        await dbService.addAll('royalties', records);
        return records;
      } catch (error) {
        logger.warn('API unavailable, using cached data', error);
      }
    }
    
    // Fallback to IndexedDB
    return await dbService.getAll('royalties');
  }
  
  async create(royalty) {
    // Try API first
    if (navigator.onLine) {
      try {
        const created = await apiService.post('/royalties', royalty);
        // Save to IndexedDB
        await dbService.add('royalties', created);
        return created;
      } catch (error) {
        // Save to offline queue
        await dbService.add('offline', {
          endpoint: '/royalties',
          method: 'POST',
          data: royalty,
        });
        throw error;
      }
    } else {
      // Offline: save to IndexedDB and queue
      const id = await dbService.add('royalties', royalty);
      await dbService.add('offline', {
        endpoint: '/royalties',
        method: 'POST',
        data: royalty,
      });
      return { id, ...royalty };
    }
  }
}
```

---

## 🧪 Testing API Integration

### Mock API Service for Testing

```javascript
// In test files
import { apiService } from './api.service.js';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);

// Test API call
test('fetches royalties', async () => {
  const royalties = await apiService.get('/royalties');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/royalties'),
    expect.any(Object)
  );
});
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS** in production
2. **Validate tokens** on backend
3. **Implement rate limiting** on API
4. **Use CORS** properly
5. **Sanitize inputs** on backend
6. **Log API requests** for audit
7. **Implement request signing** for sensitive operations

---

## 📚 Related Documentation

- `SECURITY_GUIDELINES.md` - Security best practices
- `BUILD_DEPLOYMENT.md` - Deployment configuration
- `js/services/api.service.js` - API service source code
- `js/utils/config.js` - Configuration management

---

**Last Updated**: 2025-01-17

