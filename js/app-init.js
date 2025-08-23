// Application Initialization
(function() {
    'use strict';
    
    // Initialize the application when DOM is ready
    function initializeApp() {
        try {
            // Create the main app instance
            window.app = new MiningStatsApp();
            
            // Initialize global manager instances
            if (typeof EnhancedSettingsManager !== 'undefined') {
                window.settingsManager = new EnhancedSettingsManager();
            }
            
            if (typeof BitcoinPriceManager !== 'undefined') {
                window.bitcoinPriceManager = new BitcoinPriceManager();
            }
            
            if (typeof MiningAnalyticsManager !== 'undefined') {
                window.analyticsManager = new MiningAnalyticsManager();
            }
            
            if (typeof WorkerPerformanceManager !== 'undefined') {
                window.workerPerformanceManager = new WorkerPerformanceManager();
            }
            
            if (typeof MiningActivityManager !== 'undefined') {
                window.miningActivityManager = new MiningActivityManager();
            }
            
            console.log('✅ Mining Stats App initialized successfully');
            console.log('📊 Available managers:', {
                app: !!window.app,
                settings: !!window.settingsManager,
                bitcoin: !!window.bitcoinPriceManager,
                analytics: !!window.analyticsManager,
                performance: !!window.workerPerformanceManager,
                activity: !!window.miningActivityManager
            });
            
            // Show initialization notification
            setTimeout(() => {
                if (window.app && window.app.showNotification) {
                    window.app.showNotification('Dashboard Ready', 'Mining dashboard initialized successfully');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to initialize Mining Stats App:', error);
            
            // Show error notification
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                z-index: 9999;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;
            errorDiv.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">Initialization Error</div>
                <div style="font-size: 14px;">Failed to start the mining dashboard. Check console for details.</div>
            `;
            document.body.appendChild(errorDiv);
            
            // Auto-remove error after 10 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 10000);
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        // DOM is already ready, initialize immediately
        initializeApp();
    } else {
        // Fallback - wait a bit and try again
        setTimeout(initializeApp, 100);
    }
    
    // Additional fallback in case everything else fails
    setTimeout(() => {
        if (!window.app) {
            console.warn('⚠️ Primary initialization failed, attempting fallback...');
            initializeApp();
        }
    }, 2000);
    
    // Global error handler for uncaught errors
    window.addEventListener('error', function(event) {
        console.error('💥 Global error caught:', event.error);
        
        // Try to show notification if app is available
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Error', 'An unexpected error occurred. Check console for details.');
        }
    });
    
    // Global promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('💥 Unhandled promise rejection:', event.reason);
        
        // Try to show notification if app is available
        if (window.app && window.app.showNotification) {
            window.app.showNotification('Promise Error', 'A network or data error occurred.');
        }
    });
    
    // Expose useful debug functions to global scope
    window.debugMining = {
        app: () => window.app,
        managers: () => ({
            settings: window.settingsManager,
            bitcoin: window.bitcoinPriceManager,
            analytics: window.analyticsManager,
            performance: window.workerPerformanceManager,
            activity: window.miningActivityManager
        }),
        refreshAll: () => {
            if (window.app) window.app.fetchData();
            if (window.bitcoinPriceManager) window.bitcoinPriceManager.fetchBitcoinPrice();
        },
        exportDebugInfo: () => {
            const debugData = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                location: window.location.href,
                localStorage: Object.keys(localStorage),
                managers: {
                    app: !!window.app,
                    settings: !!window.settingsManager,
                    bitcoin: !!window.bitcoinPriceManager,
                    analytics: !!window.analyticsManager,
                    performance: !!window.workerPerformanceManager,
                    activity: !!window.miningActivityManager
                },
                appState: window.app ? {
                    stats: !!window.app.stats,
                    history: window.app.history ? window.app.history.length : 0,
                    workerUrls: Object.keys(window.app.workerUrls || {}).length
                } : null
            };
            
            console.log('🔍 Debug Info:', debugData);
            
            // Copy to clipboard if possible
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(debugData, null, 2)).then(() => {
                    console.log('📋 Debug info copied to clipboard');
                });
            }
            
            return debugData;
        }
    };
    
    console.log('🔧 Debug functions available at window.debugMining');
    
})();