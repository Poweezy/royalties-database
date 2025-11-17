/**
 * Production-Ready Logging Service
 * 
 * Features:
 * - Environment-based log levels
 * - Remote logging support
 * - Log buffering and batching
 * - Error reporting integration
 * - Performance logging
 * - User action tracking (opt-in)
 */

import { config } from './config.js';

class Logger {
  constructor() {
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    };

    this.currentLevel = this.logLevels[config.get('logging.level', 'debug')];
    this.logBuffer = [];
    this.maxBufferSize = config.get('logging.maxLogEntries', 100);
    this.enableConsole = config.get('logging.enableConsole', true);
    this.enableRemoteLogging = config.get('logging.enableRemoteLogging', false);
    this.remoteEndpoint = config.get('logging.remoteLoggingEndpoint', '/api/logs');

    // Flush buffer periodically (every 30 seconds) or when full
    this.bufferFlushInterval = setInterval(() => {
      this.flushBuffer();
    }, 30000);

    // Flush buffer before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushBuffer(true);
      });
    }
  }

  /**
   * Check if log level should be logged
   * @param {number} level - Log level number
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return level >= this.currentLevel;
  }

  /**
   * Create log entry
   * @param {string} level - Log level name
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Log entry
   */
  createLogEntry(level, message, data = null, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data !== null && { data }),
      ...metadata,
    };

    // Add user context if available
    if (typeof window !== 'undefined' && window.app?.state?.currentUser) {
      entry.user = {
        username: window.app.state.currentUser.username,
        role: window.app.state.currentUser.role,
      };
    }

    // Add browser context
    if (typeof window !== 'undefined') {
      entry.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        url: window.location.href,
      };
    }

    // Add stack trace for errors
    if (level === 'error' || level === 'fatal') {
      const stack = new Error().stack;
      if (stack) {
        entry.stack = stack;
      }
    }

    return entry;
  }

  /**
   * Log message to console (if enabled)
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  logToConsole(level, message, data) {
    if (!this.enableConsole) return;

    const styles = {
      debug: 'color: #6b7280; font-weight: normal',
      info: 'color: #3b82f6; font-weight: normal',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      fatal: 'color: #dc2626; font-weight: bold; background: #fee2e2',
    };

    const style = styles[level] || '';
    const prefix = `[${level.toUpperCase()}]`;

    if (data !== null) {
      console.log(`%c${prefix} ${message}`, style, data);
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  /**
   * Add log entry to buffer
   * @param {Object} entry - Log entry
   */
  addToBuffer(entry) {
    this.logBuffer.push(entry);

    // Flush buffer if it exceeds max size
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Flush log buffer to remote endpoint
   * @param {boolean} sync - Use synchronous flush (for page unload)
   */
  async flushBuffer(sync = false) {
    if (this.logBuffer.length === 0 || !this.enableRemoteLogging) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      if (sync) {
        // Use sendBeacon for synchronous flush (page unload)
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(logsToSend)], {
            type: 'application/json',
          });
          navigator.sendBeacon(this.remoteEndpoint, blob);
        }
      } else {
        // Use fetch for async flush
        const response = await fetch(this.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logsToSend),
        });

        if (!response.ok) {
          // Re-add logs to buffer if send failed
          this.logBuffer.unshift(...logsToSend);
          this.logBuffer = this.logBuffer.slice(0, this.maxBufferSize);
        }
      }
    } catch (error) {
      // Re-add logs to buffer if send failed
      this.logBuffer.unshift(...logsToSend);
      this.logBuffer = this.logBuffer.slice(0, this.maxBufferSize);
      
      // Only log error in development
      if (config.isDevelopment()) {
        console.error('Failed to send logs to remote endpoint:', error);
      }
    }
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  debug(message, data = null) {
    if (!this.shouldLog(this.logLevels.debug)) return;

    const entry = this.createLogEntry('debug', message, data);
    this.logToConsole('debug', message, data);
    
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
    }
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  info(message, data = null) {
    if (!this.shouldLog(this.logLevels.info)) return;

    const entry = this.createLogEntry('info', message, data);
    this.logToConsole('info', message, data);
    
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
    }
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {*} data - Additional data
   */
  warn(message, data = null) {
    if (!this.shouldLog(this.logLevels.warn)) return;

    const entry = this.createLogEntry('warn', message, data);
    this.logToConsole('warn', message, data);
    
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
    }

    // Report warnings to error reporting service
    if (config.isFeatureEnabled('enableErrorReporting')) {
      this.reportToErrorService(entry);
    }
  }

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {Error|*} error - Error object or additional data
   * @param {Object} metadata - Additional metadata
   */
  error(message, error = null, metadata = {}) {
    if (!this.shouldLog(this.logLevels.error)) return;

    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    const entry = this.createLogEntry('error', message, errorData, metadata);
    this.logToConsole('error', message, errorData);
    
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
    }

    // Always report errors to error reporting service
    if (config.isFeatureEnabled('enableErrorReporting')) {
      this.reportToErrorService(entry);
    }
  }

  /**
   * Fatal level logging (critical errors)
   * @param {string} message - Log message
   * @param {Error|*} error - Error object or additional data
   * @param {Object} metadata - Additional metadata
   */
  fatal(message, error = null, metadata = {}) {
    if (!this.shouldLog(this.logLevels.fatal)) return;

    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    const entry = this.createLogEntry('fatal', message, errorData, metadata);
    this.logToConsole('fatal', message, errorData);
    
    // Immediately flush buffer for fatal errors
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
      this.flushBuffer();
    }

    // Always report fatal errors
    if (config.isFeatureEnabled('enableErrorReporting')) {
      this.reportToErrorService(entry);
    }
  }

  /**
   * Report to error reporting service (e.g., Sentry)
   * @param {Object} entry - Log entry
   */
  reportToErrorService(entry) {
    // Integration with Sentry or other error reporting service
    if (typeof window !== 'undefined' && window.Sentry) {
      try {
        if (entry.level === 'error' || entry.level === 'fatal') {
          window.Sentry.captureException(new Error(entry.message), {
            level: entry.level,
            tags: {
              logger: true,
            },
            extra: entry.data,
            contexts: {
              browser: entry.browser,
              user: entry.user,
            },
          });
        } else {
          window.Sentry.captureMessage(entry.message, {
            level: entry.level,
            extra: entry.data,
          });
        }
      } catch (e) {
        // Fail silently if Sentry is not available
      }
    }
  }

  /**
   * Log performance metric
   * @param {string} name - Metric name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  performance(name, duration, metadata = {}) {
    const entry = this.createLogEntry('info', `Performance: ${name}`, {
      duration,
      metric: name,
      ...metadata,
    }, { type: 'performance' });

    this.logToConsole('info', `[PERF] ${name}: ${duration}ms`, metadata);
    
    if (this.enableRemoteLogging) {
      this.addToBuffer(entry);
    }

    // Send performance metrics to analytics if enabled
    if (config.isFeatureEnabled('enableAnalytics')) {
      this.reportPerformanceMetric(name, duration, metadata);
    }
  }

  /**
   * Report performance metric to analytics
   * @param {string} name - Metric name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  reportPerformanceMetric(name, duration, metadata) {
    // Integration with analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', 'timing_complete', {
          name,
          value: Math.round(duration),
          ...metadata,
        });
      } catch (e) {
        // Fail silently
      }
    }
  }

  /**
   * Set log level dynamically
   * @param {string} level - Log level name
   */
  setLevel(level) {
    if (level in this.logLevels) {
      this.currentLevel = this.logLevels[level];
    }
  }

  /**
   * Get current log level
   * @returns {string} Current log level
   */
  getLevel() {
    return Object.keys(this.logLevels).find(
      key => this.logLevels[key] === this.currentLevel
    );
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.logBuffer = [];
  }

  /**
   * Get log buffer (for debugging)
   * @returns {Array} Log buffer
   */
  getBuffer() {
    return [...this.logBuffer];
  }

  /**
   * Cleanup logger
   */
  destroy() {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }
    this.flushBuffer(true);
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export default logger for backward compatibility
export default logger;


