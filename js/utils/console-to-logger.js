/**
 * Console to Logger Migration Utility
 * Provides a helper function to replace console statements with logger
 */

/**
 * Helper function to log with logger if available, fallback to console
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export function logWithFallback(level, message, data = null) {
  if (typeof window !== 'undefined' && window.logger) {
    switch (level) {
      case 'debug':
        window.logger.debug(message, data);
        break;
      case 'info':
        window.logger.info(message, data);
        break;
      case 'warn':
        window.logger.warn(message, data);
        break;
      case 'error':
        window.logger.error(message, data);
        break;
      default:
        window.logger.info(message, data);
    }
  } else if (typeof console !== 'undefined') {
    switch (level) {
      case 'debug':
        console.debug(message, data || '');
        break;
      case 'info':
        console.log(message, data || '');
        break;
      case 'warn':
        console.warn(message, data || '');
        break;
      case 'error':
        console.error(message, data || '');
        break;
      default:
        console.log(message, data || '');
    }
  }
}

