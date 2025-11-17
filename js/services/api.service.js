/**
 * API Service
 * Centralized API communication layer for backend integration
 * 
 * Features:
 * - Automatic token management
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 * - Request timeout
 * - Request cancellation
 */

import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { authService } from './auth.service.js';

class ApiService {
  constructor() {
    this.baseUrl = config.get('api.baseUrl', '/api');
    this.timeout = config.get('api.timeout', 30000);
    this.retryAttempts = config.get('api.retryAttempts', 3);
    this.retryDelay = config.get('api.retryDelay', 1000);
    this.abortControllers = new Map(); // For request cancellation
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers object with auth token
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = authService.token || localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create timeout promise
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise} Timeout promise
   */
  createTimeout(timeoutMs) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Retry request with exponential backoff
   * @param {Function} requestFn - Function that returns a promise
   * @param {number} attempts - Number of retry attempts
   * @param {number} delay - Initial delay in milliseconds
   * @returns {Promise} Request promise
   */
  async retryRequest(requestFn, attempts = this.retryAttempts, delay = this.retryDelay) {
    let lastError;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on 4xx errors (client errors)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === attempts - 1) {
          break;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt);
        logger.warn(`Request failed, retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${attempts})`, error);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError;
  }

  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @returns {Promise} Parsed response data
   */
  async handleResponse(response) {
    // Handle different content types
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.data = errorData;
      } catch (e) {
        // Response is not JSON, use status text
        const text = await response.text();
        error.data = { message: text || response.statusText };
      }
      
      throw error;
    }

    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    // Parse JSON response
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Return text response
    return await response.text();
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @throws {Error} Re-throws with additional context
   */
  handleError(error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logger.error('Network error - unable to reach API', error);
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      logger.error('Request timeout', error);
      throw new Error('Request timed out. Please try again.');
    }

    // Authentication errors
    if (error.status === 401) {
      logger.warn('Authentication failed', error);
      authService.logout();
      throw new Error('Your session has expired. Please log in again.');
    }

    // Permission errors
    if (error.status === 403) {
      logger.warn('Permission denied', error);
      throw new Error('You do not have permission to perform this action.');
    }

    // Server errors
    if (error.status >= 500) {
      logger.error('Server error', error);
      throw new Error('A server error occurred. Please try again later.');
    }

    // Re-throw with original error
    throw error;
  }

  /**
   * Make API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {string} requestId - Optional request ID for cancellation
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}, requestId = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    
    // Store controller for cancellation
    if (requestId) {
      this.abortControllers.set(requestId, controller);
    }

    const requestOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      // Create timeout promise
      const timeoutPromise = this.createTimeout(this.timeout);

      // Create fetch promise
      const fetchPromise = fetch(url, requestOptions);

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Handle response
      const data = await this.handleResponse(response);

      // Remove controller from map
      if (requestId) {
        this.abortControllers.delete(requestId);
      }

      return data;
    } catch (error) {
      // Remove controller from map
      if (requestId) {
        this.abortControllers.delete(requestId);
      }

      // Handle errors
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make API request with retry
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {string} requestId - Optional request ID for cancellation
   * @returns {Promise} Response data
   */
  async requestWithRetry(endpoint, options = {}, requestId = null) {
    return this.retryRequest(() => this.request(endpoint, options, requestId));
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Response data
   */
  async get(endpoint, params = {}, options = {}) {
    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.requestWithRetry(url, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Response data
   */
  async post(endpoint, data = {}, options = {}) {
    return this.requestWithRetry(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Response data
   */
  async put(endpoint, data = {}, options = {}) {
    return this.requestWithRetry(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Response data
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.requestWithRetry(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Response data
   */
  async delete(endpoint, options = {}) {
    return this.requestWithRetry(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {File|FormData} file - File or FormData to upload
   * @param {Object} options - Additional fetch options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Response data
   */
  async upload(endpoint, file, options = {}, onProgress = null) {
    const formData = file instanceof FormData ? file : new FormData();
    if (!(file instanceof FormData)) {
      formData.append('file', file);
    }

    // Remove Content-Type header to let browser set it with boundary
    const headers = { ...this.getAuthHeaders() };
    delete headers['Content-Type'];

    return this.requestWithRetry(endpoint, {
      method: 'POST',
      body: formData,
      headers,
      ...options,
    });
  }

  /**
   * Cancel request
   * @param {string} requestId - Request ID to cancel
   */
  cancelRequest(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
      logger.debug(`Request ${requestId} cancelled`);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach((controller, requestId) => {
      controller.abort();
      logger.debug(`Request ${requestId} cancelled`);
    });
    this.abortControllers.clear();
  }

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} True if token refreshed successfully
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.token) {
        authService.setAuthenticationState({
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user,
        });
        logger.debug('Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Token refresh failed', error);
      authService.logout();
      return false;
    }
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export default for convenience
export default apiService;

