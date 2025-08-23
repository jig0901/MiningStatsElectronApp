// Main UI Handlers - Core event handlers and initialization

// Add CSS for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshData();
    }
    
    // Ctrl/Cmd + M for menu
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        showMainMenu();
    }
    
    // Ctrl/Cmd + N for notifications
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showAdvancedNotificationSettings();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.remove());
    }
});

// Click outside modal to close
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.remove();
    }
});

// Initialize tabs when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeTabs);
} else {
    autoInitializeTabs();
}

// Console message for developers
console.log(`
🔧 Mining Dashboard Developer Tools
====================================
Available debug functions:
- checkManagersAndData()      - Check what managers and data are available
- debugTabState()             - Show current tab state and containers  
- debugPerformanceTab()       - Performance tab specific debugging
- debugNotificationSettings() - Check notification configuration
- runAllPerformanceTests()    - Run comprehensive performance tests
- createSimplePerformanceDisplay() - Force simple performance view

Tab functions:
- forceLoadPerformance()      - Force load performance tab
- forceLoadActivity()         - Force load activity tab  
- forceLoadAnalytics()        - Force load analytics tab

Use these in the browser console to debug issues!
====================================
`);