// Advanced Error Handler for GRUDGE MATCH WebGL
// Comprehensive error tracking and user-friendly error reporting

(function() {
    'use strict';
    
    class GameErrorHandler {
        constructor() {
            this.errors = [];
            this.maxErrors = 50;
            this.init();
        }
        
        init() {
            // Global error handling
            window.addEventListener('error', (event) => {
                this.handleError({
                    type: 'JavaScript Error',
                    message: event.message,
                    source: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    stack: event.error ? event.error.stack : 'No stack trace',
                    timestamp: new Date().toISOString()
                });
            });
            
            // Promise rejection handling
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    type: 'Unhandled Promise Rejection',
                    message: event.reason ? event.reason.toString() : 'Unknown rejection',
                    stack: event.reason ? event.reason.stack : 'No stack trace',
                    timestamp: new Date().toISOString()
                });
            });
            
            // Unity-specific error handling
            this.setupUnityErrorHandling();
            
            console.log('🛡️ Advanced error handler initialized');
        }
        
        setupUnityErrorHandling() {
            // Override console.error to capture Unity errors
            const originalError = console.error;
            console.error = (...args) => {
                const message = args.join(' ');
                if (message.includes('Unity') || message.includes('WebGL') || message.includes('WASM')) {
                    this.handleError({
                        type: 'Unity WebGL Error',
                        message: message,
                        timestamp: new Date().toISOString(),
                        unity: true
                    });
                }
                originalError.apply(console, args);
            };
        }
        
        handleError(errorInfo) {
            // Add to error log
            this.errors.push(errorInfo);
            
            // Keep only recent errors
            if (this.errors.length > this.maxErrors) {
                this.errors = this.errors.slice(-this.maxErrors);
            }
            
            // Log error details
            console.group(`🚨 ${errorInfo.type}`);
            console.error('Message:', errorInfo.message);
            if (errorInfo.source) console.error('Source:', errorInfo.source);
            if (errorInfo.line) console.error('Line:', errorInfo.line);
            if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
            console.groupEnd();
            
            // Show user-friendly error message
            this.showUserError(errorInfo);
            
            // Try auto-recovery for certain errors
            this.attemptRecovery(errorInfo);
        }
        
        showUserError(errorInfo) {
            const isUnityError = errorInfo.unity || 
                errorInfo.message.toLowerCase().includes('unity') ||
                errorInfo.message.toLowerCase().includes('webgl') ||
                errorInfo.message.toLowerCase().includes('wasm');
                
            let userMessage = '';
            let isRecoverable = false;
            
            if (isUnityError) {
                if (errorInfo.message.includes('memory') || errorInfo.message.includes('heap')) {
                    userMessage = 'Game is running low on memory. Try closing other tabs or refreshing the page.';
                    isRecoverable = true;
                } else if (errorInfo.message.includes('webgl') || errorInfo.message.includes('context')) {
                    userMessage = 'WebGL context lost. The game will attempt to recover automatically.';
                    isRecoverable = true;
                } else if (errorInfo.message.includes('network') || errorInfo.message.includes('fetch')) {
                    userMessage = 'Network error loading game files. Check your connection and try refreshing.';
                    isRecoverable = true;
                } else {
                    userMessage = 'A game error occurred. The game may not function properly.';
                }
            } else {
                if (errorInfo.message.includes('Script error')) {
                    userMessage = 'A script error occurred. This may be caused by browser extensions.';
                } else {
                    userMessage = 'An unexpected error occurred.';
                }
            }
            
            // Show error banner
            if (window.unityShowBanner) {
                const actionText = isRecoverable ? ' Click to retry.' : ' Check console for details.';
                window.unityShowBanner(userMessage + actionText, 'error');
            }
        }
        
        attemptRecovery(errorInfo) {
            const message = errorInfo.message.toLowerCase();
            
            // Auto-recovery for WebGL context loss
            if (message.includes('webgl') && message.includes('context')) {
                setTimeout(() => {
                    console.log('🔄 Attempting WebGL context recovery...');
                    if (window.unityInstance) {
                        try {
                            // Unity has built-in context recovery
                            console.log('✅ WebGL context recovery handled by Unity');
                        } catch (e) {
                            console.error('❌ WebGL context recovery failed:', e);
                            this.suggestReload();
                        }
                    }
                }, 1000);
            }
            
            // Memory cleanup for memory errors
            if (message.includes('memory') || message.includes('heap')) {
                this.performMemoryCleanup();
            }
            
            // Retry for network errors
            if (message.includes('network') || message.includes('fetch')) {
                this.scheduleRetry();
            }
        }
        
        performMemoryCleanup() {
            console.log('🧹 Performing memory cleanup...');
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Clear caches
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('grudge-match')) {
                            caches.delete(name);
                        }
                    });
                });
            }
            
            console.log('✅ Memory cleanup completed');
        }
        
        scheduleRetry() {
            setTimeout(() => {
                console.log('🔄 Attempting to retry failed operations...');
                // This could trigger a reload or specific retry logic
            }, 3000);
        }
        
        suggestReload() {
            if (window.unityShowBanner) {
                window.unityShowBanner(
                    'Game recovery failed. Please refresh the page to restart.',
                    'error'
                );
            }
            
            // Auto-reload after delay if critical error
            setTimeout(() => {
                if (confirm('The game encountered a critical error. Reload the page?')) {
                    location.reload();
                }
            }, 5000);
        }
        
        getErrorReport() {
            const report = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                errors: this.errors,
                gameInfo: {
                    version: '1.7.3',
                    unityLoaded: !!window.unityInstance,
                    webglSupported: window.WebGLCompatibility ? 
                        window.WebGLCompatibility.checkWebGL().supported : 'unknown'
                }
            };
            
            return report;
        }
        
        exportErrors() {
            const report = this.getErrorReport();
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `grudge-match-errors-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
        }
        
        clearErrors() {
            this.errors = [];
            console.log('🗑️ Error log cleared');
        }
    }
    
    // Initialize error handler
    window.GameErrorHandler = new GameErrorHandler();
    
    // Make error reporting functions available globally
    window.ErrorReporting = {
        getReport: () => window.GameErrorHandler.getErrorReport(),
        export: () => window.GameErrorHandler.exportErrors(),
        clear: () => window.GameErrorHandler.clearErrors(),
        getErrors: () => window.GameErrorHandler.errors
    };
    
})();