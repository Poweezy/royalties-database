export class ErrorHandler {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
        this.errorQueue = [];
        this.isProcessing = false;
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise-rejection',
                error: event.reason,
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
            event.preventDefault();
        });

        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript-error',
                error: event.error,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource-error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: `Failed to load ${event.target.tagName.toLowerCase()}`,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);
    }

    handleError(errorInfo) {
        // Add to queue for processing
        this.errorQueue.push(errorInfo);
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processErrorQueue();
        }

        // Log error to console
        console.error('Error captured:', errorInfo);

        // Show user notification based on error type
        this.showUserNotification(errorInfo);
    }

    processErrorQueue() {
        this.isProcessing = true;

        // Process errors in batches
        const batchSize = 5;
        const batch = this.errorQueue.splice(0, batchSize);

        if (batch.length > 0) {
            // Send to logging service (simulated)
            this.sendToLoggingService(batch);

            // Continue processing if more errors exist
            if (this.errorQueue.length > 0) {
                setTimeout(() => this.processErrorQueue(), 1000);
            } else {
                this.isProcessing = false;
            }
        } else {
            this.isProcessing = false;
        }
    }

    showUserNotification(errorInfo) {
        if (!this.notificationManager) return;

        switch (errorInfo.type) {
            case 'resource-error':
                this.notificationManager.show(
                    `Failed to load ${errorInfo.element?.toLowerCase() || 'resource'}. Please refresh the page.`,
                    'warning'
                );
                break;
            
            case 'network-error':
                this.notificationManager.show(
                    'Network connection issue. Please check your internet connection.',
                    'error'
                );
                break;
            
            case 'validation-error':
                this.notificationManager.show(
                    errorInfo.message || 'Please check your input and try again.',
                    'warning'
                );
                break;
            
            case 'permission-error':
                this.notificationManager.show(
                    'You do not have permission to perform this action.',
                    'error'
                );
                break;
            
            default:
                // For critical errors, show generic message
                if (this.isCriticalError(errorInfo)) {
                    this.notificationManager.show(
                        'An unexpected error occurred. Please refresh the page.',
                        'error'
                    );
                }
        }
    }

    isCriticalError(errorInfo) {
        const criticalKeywords = [
            'network',
            'cors',
            'syntax',
            'reference',
            'type',
            'security'
        ];

        const message = (errorInfo.message || '').toLowerCase();
        return criticalKeywords.some(keyword => message.includes(keyword));
    }

    // Retry mechanism
    async retry(operation, maxAttempts = 3, delay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                this.handleError({
                    type: 'retry-attempt',
                    attempt,
                    maxAttempts,
                    error,
                    message: `Retry attempt ${attempt}/${maxAttempts} failed`,
                    timestamp: new Date().toISOString()
                });

                if (attempt < maxAttempts) {
                    await this.sleep(delay * attempt); // Exponential backoff
                }
            }
        }

        throw lastError;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Circuit breaker pattern
    createCircuitBreaker(operation, threshold = 5, resetTime = 60000) {
        let failures = 0;
        let lastFailureTime = 0;
        let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

        return async (...args) => {
            const now = Date.now();

            // Reset circuit if enough time has passed
            if (state === 'OPEN' && now - lastFailureTime > resetTime) {
                state = 'HALF_OPEN';
                failures = 0;
            }

            // Reject if circuit is open
            if (state === 'OPEN') {
                throw new Error('Circuit breaker is OPEN');
            }

            try {
                const result = await operation(...args);
                
                // Success resets failure count
                if (state === 'HALF_OPEN') {
                    state = 'CLOSED';
                }
                failures = 0;
                
                return result;
            } catch (error) {
                failures++;
                lastFailureTime = now;

                if (failures >= threshold) {
                    state = 'OPEN';
                    this.handleError({
                        type: 'circuit-breaker',
                        message: 'Circuit breaker opened due to repeated failures',
                        failures,
                        threshold,
                        timestamp: new Date().toISOString()
                    });
                }

                throw error;
            }
        };
    }

    // Graceful degradation
    gracefulDegradation(primaryOperation, fallbackOperation) {
        return async (...args) => {
            try {
                return await primaryOperation(...args);
            } catch (error) {
                this.handleError({
                    type: 'graceful-degradation',
                    message: 'Primary operation failed, using fallback',
                    error,
                    timestamp: new Date().toISOString()
                });

                return await fallbackOperation(...args);
            }
        };
    }

    // Component error boundary
    componentErrorBoundary(component, fallback) {
        try {
            return component();
        } catch (error) {
            this.handleError({
                type: 'component-error',
                component: component.name || 'unknown',
                error,
                message: `Component ${component.name || 'unknown'} failed to render`,
                timestamp: new Date().toISOString()
            });

            return fallback || this.createErrorFallback(error);
        }
    }

    createErrorFallback(error) {
        const fallback = document.createElement('div');
        fallback.className = 'error-fallback';
        fallback.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Something went wrong</h3>
                <p>This component couldn't load properly. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i> Refresh Page
                </button>
            </div>
        `;
        return fallback;
    }

    // Send errors to logging service (simulated)
    async sendToLoggingService(errors) {
        try {
            // In a real application, this would send to your logging service
            console.log('Sending errors to logging service:', errors);
            
            // Simulate API call
            await this.sleep(100);
            
        } catch (error) {
            console.error('Failed to send errors to logging service:', error);
        }
    }

    // Get error statistics
    getErrorStats() {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        
        const recentErrors = this.errorQueue.filter(error => 
            new Date(error.timestamp).getTime() > last24Hours
        );

        const errorsByType = recentErrors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: recentErrors.length,
            byType: errorsByType,
            critical: recentErrors.filter(error => this.isCriticalError(error)).length
        };
    }

    // Cleanup
    destroy() {
        this.errorQueue = [];
        this.isProcessing = false;
        
        // Note: We can't remove the global event listeners as they might be needed by other parts of the app
    }
}
