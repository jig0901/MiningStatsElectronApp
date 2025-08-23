// Debug Utilities - Debugging and diagnostic functions

function checkManagersAndData() {
    console.log('=== MANAGERS AND DATA CHECK ===');
    console.log('App exists:', !!window.app);
    console.log('App stats:', !!window.app?.stats);
    console.log('App workers:', !!window.app?.stats?.workers);
    console.log('Workers count:', window.app?.stats?.workers?.length || 0);
    
    console.log('WorkerPerformanceManager:', !!window.workerPerformanceManager);
    console.log('MiningActivityManager:', !!window.miningActivityManager);
    console.log('MiningAnalyticsManager:', !!window.analyticsManager);
    console.log('BitcoinPriceManager:', !!window.bitcoinPriceManager);
    
    console.log('Performance Manager Class:', typeof WorkerPerformanceManager);
    console.log('Activity Manager Class:', typeof MiningActivityManager);
    console.log('Analytics Manager Class:', typeof MiningAnalyticsManager);
    console.log('============================');
}

function showAnalyticsDetails() {
    if (window.analyticsManager) {
        window.analyticsManager.showDetailedAnalytics();
    } else {
        alert('Analytics manager not available');
    }
}

// Export all data function
function exportAllData() {
    const data = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        settings: window.app && window.app.settingsManager ? window.app.settingsManager.settings : {},
        workerUrls: window.app ? window.app.workerUrls : {},
        currentStats: window.app ? window.app.stats : null,
        hashrateHistory: window.app ? window.app.history : [],
        bitcoinPriceHistory: window.app && window.app.bitcoinPriceManager ? 
            window.app.bitcoinPriceManager.priceHistory : [],
        analyticsData: window.app && window.app.analyticsManager ? 
            window.app.analyticsManager.shareAnalytics : [],
        performanceData: window.workerPerformanceManager ? {
            expectedHashrates: Object.fromEntries(window.workerPerformanceManager.expectedHashrates),
            performanceHistory: window.workerPerformanceManager.performanceHistory.slice(-100)
        } : {},
        activityData: window.miningActivityManager ? 
            window.miningActivityManager.activities.slice(0, 500) : []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `belani-mining-complete-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', 'Complete mining data exported successfully');
    }
    
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

// Export functions to global scope for console use
window.testPerformanceContainer = testPerformanceContainer;
window.testPerformanceAnalysis = testPerformanceAnalysis;
window.createSimplePerformanceDisplay = createSimplePerformanceDisplay;
window.runAllPerformanceTests = runAllPerformanceTests;
window.checkManagersAndData = checkManagersAndData;
window.debugTabState = debugTabState;
window.debugPerformanceTab = debugPerformanceTab;
window.debugNotificationSettings = debugNotificationSettings;