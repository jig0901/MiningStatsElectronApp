// Fixed Tab Handlers - Prevents content from disappearing - UPDATED WITH ANALYTICS FIX

// Global flag to prevent multiple initializations
window.tabsInitialized = false;
window.activeTabLoaders = new Set();

// Enhanced switchTab function with better state management
window.switchTab = function(tabId, buttonElement) {
    console.log(`🔄 Switching to tab: ${tabId}`);
    
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab panel
    const selectedPanel = document.getElementById(tabId);
    if (selectedPanel) {
        selectedPanel.classList.add('active');
        console.log(`✅ Activated panel: ${tabId}`);
    } else {
        console.error(`❌ Panel not found: ${tabId}`);
        return;
    }
    
    // Add active class to clicked button
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    // Load content with debouncing to prevent race conditions
    const loaderId = `${tabId}-loader`;
    
    // Cancel any existing loader for this tab
    if (window.activeTabLoaders.has(loaderId)) {
        console.log(`ℹ️ Canceling existing loader for ${tabId}`);
        return;
    }
    
    window.activeTabLoaders.add(loaderId);
    
    setTimeout(() => {
        // Double-check the tab is still active before loading
        if (!document.getElementById(tabId).classList.contains('active')) {
            console.log(`ℹ️ Tab ${tabId} no longer active, skipping load`);
            window.activeTabLoaders.delete(loaderId);
            return;
        }
        
        try {
            switch(tabId) {
                case 'performance-tab':
                    loadPerformanceTabSafely();
                    break;
                case 'activity-tab':
                    loadActivityTabSafely();
                    break;
                case 'analytics-tab':
                    loadAnalyticsTabSafely();
                    break;
                case 'settings-tab':
                    if (typeof loadQuickSettings === 'function') {
                        loadQuickSettings();
                    }
                    break;
            }
        } catch (e) {
            console.error(`❌ Error loading ${tabId}:`, e);
        } finally {
            window.activeTabLoaders.delete(loaderId);
        }
    }, 150); // Slight delay to ensure DOM is ready
};

// Safe performance tab loader - prevents content clearing
function loadPerformanceTabSafely() {
    console.log('🔧 Safely loading performance tab...');
    
    const performanceContent = document.getElementById('performance-content');
    if (!performanceContent) {
        console.error('❌ Performance content container not found');
        return;
    }
    
    // Check if content already exists and is substantial
    const existingPerformance = document.getElementById('worker-performance');
    if (existingPerformance && existingPerformance.innerHTML.length > 500 && 
        !existingPerformance.innerHTML.includes('Loading Performance Analysis')) {
        console.log('✅ Performance content already loaded, skipping reload');
        return;
    }
    
    // Only clear if we're certain we can reload
    if (existingPerformance) {
        existingPerformance.remove();
    }
    
    // Create new container
    const workerPerformanceDiv = document.createElement('div');
    workerPerformanceDiv.id = 'worker-performance';
    workerPerformanceDiv.style.minHeight = '200px';
    workerPerformanceDiv.style.width = '100%';
    
    performanceContent.appendChild(workerPerformanceDiv);
    
    // Check for data availability
    if (!window.app?.stats?.workers || window.app.stats.workers.length === 0) {
        console.warn('⚠️ No worker data available for performance tab');
        workerPerformanceDiv.innerHTML = `
            <div style="text-align: center; color: #f59e0b; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
                <h3>Waiting for Worker Data</h3>
                <p>Performance analysis will appear once worker data is available.</p>
                <button onclick="retryLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                    🔄 Retry
                </button>
            </div>
        `;
        return;
    }
    
    // Show loading state briefly
    workerPerformanceDiv.innerHTML = `
        <div style="text-align: center; color: #6b7280; padding: 20px;">
            <div style="font-size: 32px; margin-bottom: 12px;">🔧</div>
            <h4>Loading Performance Analysis...</h4>
        </div>
    `;
    
    // Load performance manager
    if (!window.workerPerformanceManager) {
        try {
            window.workerPerformanceManager = new WorkerPerformanceManager();
        } catch (e) {
            console.error('❌ Failed to create WorkerPerformanceManager:', e);
            workerPerformanceDiv.innerHTML = createErrorDisplay('Performance Manager Error', e.message);
            return;
        }
    }
    
    // Trigger analysis with safety check
    setTimeout(() => {
        // Make sure the container still exists and tab is active
        const container = document.getElementById('worker-performance');
        const tabActive = document.getElementById('performance-tab')?.classList.contains('active');
        
        if (!container || !tabActive) {
            console.log('ℹ️ Performance tab no longer active or container missing');
            return;
        }
        
        try {
            const analysis = window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
            console.log('📊 Performance analysis completed successfully');
            
            // Verify content was actually created
            setTimeout(() => {
                const updatedContainer = document.getElementById('worker-performance');
                if (updatedContainer && updatedContainer.innerHTML.includes('Loading Performance Analysis')) {
                    console.warn('⚠️ Content still loading, trying manual update...');
                    createManualPerformanceDisplay();
                }
            }, 1000);
            
        } catch (e) {
            console.error('❌ Performance analysis failed:', e);
            container.innerHTML = createErrorDisplay('Performance Analysis Error', e.message, () => loadPerformanceTabSafely());
        }
    }, 300);
}

// Safe activity tab loader - IMPROVED
function loadActivityTabSafely() {
    console.log('📊 Safely loading activity tab...');
    
    const activityContent = document.getElementById('activity-content');
    if (!activityContent) {
        console.error('❌ Activity content container not found');
        return;
    }
    
    // Show loading state first
    activityContent.innerHTML = `
        <div style="text-align: center; color: #6b7280; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3>Loading Activity Data...</h3>
            <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
    `;
    
    // Create the mining-activity container
    const miningActivityDiv = document.createElement('div');
    miningActivityDiv.id = 'mining-activity';
    miningActivityDiv.style.minHeight = '300px';
    miningActivityDiv.style.width = '100%';
    
    // Clear and add the container
    activityContent.innerHTML = '';
    activityContent.appendChild(miningActivityDiv);
    
    // Load activity manager
    if (!window.miningActivityManager) {
        console.log('⚠️ Creating MiningActivityManager...');
        try {
            window.miningActivityManager = new MiningActivityManager();
            console.log('✅ MiningActivityManager created successfully');
        } catch (e) {
            console.error('❌ Failed to create MiningActivityManager:', e);
            miningActivityDiv.innerHTML = createErrorDisplay('Activity Manager Error', e.message, () => loadActivityTabSafely());
            return;
        }
    }
    
    // Force update display with a short delay to ensure DOM is ready
    setTimeout(() => {
        if (!document.getElementById('activity-tab')?.classList.contains('active')) {
            console.log('ℹ️ Activity tab no longer active, skipping display update');
            return;
        }
        
        console.log('🔄 Forcing activity display update...');
        window.miningActivityManager.updateActivityDisplay();
        
        // Double-check that content was created
        setTimeout(() => {
            const container = document.getElementById('mining-activity');
            if (container && (container.innerHTML.length < 500 || container.innerHTML.includes('Loading Activity Data'))) {
                console.warn('⚠️ Activity content may not have loaded properly, creating manual display...');
                createManualActivityDisplay();
            }
        }, 1000);
        
    }, 200);
}

// ENHANCED ANALYTICS TAB LOADER - FIXES WHITESPACE ISSUE
function loadAnalyticsTabSafely() {
    console.log('📈 Enhanced analytics loading with whitespace fix...');
    
    const analyticsContent = document.getElementById('analytics-content');
    if (!analyticsContent) {
        console.error('❌ Analytics content container not found');
        return;
    }
    
    // Ensure proper structure
    let bitcoinSection = document.getElementById('bitcoin-price-section');
    let analyticsPreview = document.getElementById('analytics-preview');
    
    // Create bitcoin section if needed and manager exists
    if (!bitcoinSection && window.bitcoinPriceManager) {
        bitcoinSection = document.createElement('div');
        bitcoinSection.id = 'bitcoin-price-section';
        bitcoinSection.style.cssText = 'display: block; width: 100%; margin-bottom: 20px;';
        analyticsContent.appendChild(bitcoinSection);
    }
    
    // Create or ensure analytics preview container
    if (!analyticsPreview) {
        analyticsPreview = document.createElement('div');
        analyticsPreview.id = 'analytics-preview';
        analyticsPreview.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 200px; width: 100%;';
        analyticsContent.appendChild(analyticsPreview);
        console.log('📊 Created analytics-preview container');
    } else {
        // Force visibility on existing container
        analyticsPreview.style.display = 'block';
        analyticsPreview.style.visibility = 'visible';
        analyticsPreview.style.opacity = '1';
        analyticsPreview.style.minHeight = '200px';
        console.log('📊 Fixed existing analytics-preview container visibility');
    }
    
    // Initialize analytics manager if needed
    if (!window.analyticsManager) {
        console.log('⚠️ Creating analytics manager...');
        try {
            window.analyticsManager = new MiningAnalyticsManager();
            console.log('✅ Analytics manager created');
        } catch (e) {
            console.error('❌ Failed to create analytics manager:', e);
            createManualAnalyticsDisplay();
            return;
        }
    }
    
    // Update displays with delays to ensure DOM readiness
    setTimeout(() => {
        // Update Bitcoin price if available
        if (window.bitcoinPriceManager && bitcoinSection) {
            window.bitcoinPriceManager.updatePriceDisplay();
        }
    }, 50);
    
    setTimeout(() => {
        // Use the enhanced update method if available
        if (window.analyticsManager.updateAnalyticsDisplayFixed) {
            window.analyticsManager.updateAnalyticsDisplayFixed();
        } else {
            window.analyticsManager.updateAnalyticsDisplay();
        }
        
        // Fallback check
        setTimeout(() => {
            const container = document.getElementById('analytics-preview');
            if (container && container.innerHTML.length < 200) {
                console.warn('⚠️ Creating fallback analytics display...');
                createManualAnalyticsDisplay();
            }
        }, 500);
    }, 100);
}

// Create manual activity display when automatic fails
function createManualActivityDisplay() {
    console.log('📊 Creating manual activity display...');
    
    const container = document.getElementById('mining-activity');
    if (!container) {
        console.error('❌ Cannot create manual activity display - missing container');
        return;
    }
    
    // Create a simple activity display
    container.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6;">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">📊 Mining Activity</h2>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Activity Overview</h3>
                <p><strong>Activities:</strong> ${window.miningActivityManager ? window.miningActivityManager.activities.length : 0}</p>
                <p><strong>Manager Status:</strong> ${window.miningActivityManager ? '✅ Loaded' : '❌ Not Found'}</p>
            </div>
            
            ${window.miningActivityManager && window.miningActivityManager.activities.length > 0 ? `
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px;">
                    ${window.miningActivityManager.activities.slice(0, 5).map(activity => `
                        <div style="padding: 8px; margin-bottom: 8px; background: #f9fafb; border-radius: 4px; border-left: 3px solid #3b82f6;">
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${activity.message}</div>
                            <div style="font-size: 12px; color: #6b7280;">${new Date(activity.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <h3 style="color: #374151; margin-bottom: 8px;">No Activities Yet</h3>
                    <p style="color: #6b7280; margin-bottom: 16px;">Activities will appear here as your mining operation runs</p>
                    <button onclick="testAddActivity()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Add Test Activity
                    </button>
                </div>
            `}
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="loadActivityTabSafely()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    🔄 Retry Auto Display
                </button>
                <button onclick="refreshActivityDisplay()" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Force Refresh
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Manual activity display created');
}

// Create manual analytics display when automatic fails
function createManualAnalyticsDisplay() {
    console.log('📊 Creating manual analytics display...');
    
    const container = document.getElementById('analytics-preview');
    if (!container) {
        console.error('❌ No analytics container for manual display');
        return;
    }
    
    // Force container visibility
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.minHeight = '200px';
    
    const hasAppData = window.app && window.app.stats;
    const manualContent = `
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6; display: block !important;">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">📊 Analytics Dashboard</h2>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Current Status</h3>
                <p><strong>Analytics Manager:</strong> ${window.analyticsManager ? '✅ Loaded' : '❌ Not Found'}</p>
                <p><strong>Data Source:</strong> ${hasAppData ? '✅ Available' : '❌ Waiting'}</p>
                <p><strong>Analytics Data:</strong> ${window.analyticsManager ? window.analyticsManager.shareAnalytics.length : 0} entries</p>
            </div>
            
            ${hasAppData ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 12px; color: #6b7280;">HASHRATE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">
                            ${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s
                        </div>
                    </div>
                    
                    <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 12px; color: #6b7280;">WORKERS</div>
                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">
                            ${window.app.stats.worker_count || 0}
                        </div>
                    </div>
                    
                    <div style="background: #fefce8; padding: 12px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 12px; color: #6b7280;">SHARES</div>
                        <div style="font-size: 18px; font-weight: bold; color: #f59e0b;">
                            ${window.app.stats.accepted_shares?.toLocaleString() || 0}
                        </div>
                    </div>
                    
                    <div style="background: #fef2f2; padding: 12px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 12px; color: #6b7280;">BEST SHARE</div>
                        <div style="font-size: 18px; font-weight: bold; color: #ef4444;">
                            ${window.app.formatValue(window.app.stats.best_shares) || 0}
                        </div>
                    </div>
                </div>
            ` : `
                <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
                    <h3 style="color: #374151; margin-bottom: 8px;">Waiting for Mining Data</h3>
                    <p style="color: #6b7280;">Analytics will appear once mining data is available</p>
                </div>
            `}
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="forceAnalyticsUpdate()" 
                        style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    🔄 Force Analytics Update
                </button>
                <button onclick="generateSampleAnalytics()" 
                        style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    📊 Generate Sample Data
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = manualContent;
    console.log('✅ Manual analytics display created successfully');
}

// Create manual performance display when automatic fails
function createManualPerformanceDisplay() {
    console.log('🔧 Creating manual performance display...');
    
    const container = document.getElementById('worker-performance');
    if (!container || !window.app?.stats?.workers) {
        console.error('❌ Cannot create manual display - missing container or data');
        return;
    }
    
    const workers = window.app.stats.workers;
    
    container.innerHTML = `
        <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div class="section-title">🔧 Worker Performance</div>
            
            <div class="stats-grid" style="margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                <div class="stat-card" style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                    <div class="stat-label" style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Total Workers</div>
                    <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #374151;">${workers.length}</div>
                </div>
                <div class="stat-card" style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                    <div class="stat-label" style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Active Workers</div>
                    <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #10b981;">${workers.filter(w => parseFloat(w.hashrate1m) > 0).length}</div>
                </div>
                <div class="stat-card" style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                    <div class="stat-label" style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Total Hashrate</div>
                    <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #3b82f6;">${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s</div>
                </div>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
                    ${workers.map(worker => {
                        const cleanName = worker.workername.split('.')[1] || worker.workername;
                        const hashrate = parseFloat(worker.hashrate1m) || 0;
                        const shares = parseInt(worker.shares) || 0;
                        const rejects = parseInt(worker.rejects) || 0;
                        const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100).toFixed(2) : '0.00';
                        const status = hashrate > 0 ? 'Online' : 'Offline';
                        const statusColor = hashrate > 0 ? '#10b981' : '#ef4444';
                        
                        return `
                            <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; border-left: 4px solid ${statusColor};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 600;">${cleanName}</h4>
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #6b7280;">Hashrate</span>
                                        <span style="font-weight: 600;">${hashrate.toFixed(2)} TH/s</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #6b7280;">Status</span>
                                        <span style="font-weight: 600; color: ${statusColor};">${status}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #6b7280;">Shares</span>
                                        <span style="font-weight: 600;">${shares.toLocaleString()}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #6b7280;">Reject Rate</span>
                                        <span style="font-weight: 600;">${rejectRate}%</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="retryLoadPerformance()" class="refresh-btn" style="margin: 0;">
                    🔄 Refresh Analysis
                </button>
                <button onclick="showExpectedHashrateDialog()" class="refresh-btn" style="margin: 0;">
                    📊 Set Expected Hashrates
                </button>
                <button onclick="exportPerformanceData()" class="refresh-btn" style="margin: 0;">
                    💾 Export Data
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Manual performance display created successfully');
}

// Helper function to create error displays
function createErrorDisplay(title, message, retryFunction = null) {
    return `
        <div style="text-align: center; color: #ef4444; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h3>${title}</h3>
            <p style="color: #6b7280; margin-bottom: 16px;">${message}</p>
            ${retryFunction ? `
                <button onclick="${retryFunction.name}()" class="refresh-btn" style="margin-top: 16px;">
                    🔄 Retry
                </button>
            ` : ''}
        </div>
    `;
}

// Retry functions
function retryLoadPerformance() {
    console.log('🔄 Retrying performance load...');
    const container = document.getElementById('worker-performance');
    if (container) {
        container.innerHTML = '';
    }
    loadPerformanceTabSafely();
}

function retryLoadActivity() {
    console.log('🔄 Retrying activity load...');
    const container = document.getElementById('mining-activity');
    if (container) {
        container.innerHTML = '';
    }
    loadActivityTabSafely();
}

function retryLoadAnalytics() {
    console.log('🔄 Retrying analytics load...');
    const container = document.getElementById('analytics-preview');
    if (container) {
        container.innerHTML = '';
    }
    loadAnalyticsTabSafely();
}

// Controlled initialization - only run once
function initializeTabsOnce() {
    if (window.tabsInitialized) {
        console.log('⭐ Tabs already initialized, skipping...');
        return;
    }
    
    console.log('🚀 Initializing tabs (first time)...');
    window.tabsInitialized = true;
    
    // Wait for everything to be ready
    setTimeout(() => {
        // Only initialize if we have actual tab content
        const performanceTab = document.getElementById('performance-tab');
        const activityTab = document.getElementById('activity-tab');
        const analyticsTab = document.getElementById('analytics-tab');
        
        if (performanceTab) {
            console.log('🔧 Initializing performance tab...');
            loadPerformanceTabSafely();
        }
        
        if (activityTab) {
            console.log('📊 Initializing activity tab...');
            loadActivityTabSafely();
        }
        
        if (analyticsTab) {
            console.log('📈 Initializing analytics tab...');
            loadAnalyticsTabSafely();
        }
        
        console.log('✅ Tab initialization complete');
    }, 1500); // Wait 1.5 seconds to ensure everything is loaded
}

// Replace the old autoInitializeTabs function
function autoInitializeTabs() {
    initializeTabsOnce();
}

// Debug function
function debugTabState() {
    console.log('=== TAB DEBUG INFO ===');
    console.log('Tabs initialized:', window.tabsInitialized);
    console.log('Active loaders:', Array.from(window.activeTabLoaders));
    console.log('Active tab panel:', document.querySelector('.tab-panel.active')?.id || 'none');
    console.log('Active tab button:', document.querySelector('.tab-button.active')?.textContent?.trim() || 'none');
    
    const containers = [
        'performance-content', 'worker-performance',
        'activity-content', 'mining-activity', 
        'analytics-content', 'analytics-preview'
    ];
    
    containers.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}:`, !!el, el ? `(${el.innerHTML.length} chars)` : '');
    });
    
    console.log('Managers:', {
        workerPerformanceManager: !!window.workerPerformanceManager,
        miningActivityManager: !!window.miningActivityManager,
        analyticsManager: !!window.analyticsManager
    });
    console.log('====================');
}

// Make functions globally available
window.loadPerformanceTabSafely = loadPerformanceTabSafely;
window.loadActivityTabSafely = loadActivityTabSafely;
window.loadAnalyticsTabSafely = loadAnalyticsTabSafely;
window.createManualPerformanceDisplay = createManualPerformanceDisplay;
window.createManualActivityDisplay = createManualActivityDisplay;
window.createManualAnalyticsDisplay = createManualAnalyticsDisplay;
window.retryLoadPerformance = retryLoadPerformance;
window.retryLoadActivity = retryLoadActivity;
window.retryLoadAnalytics = retryLoadAnalytics;
window.autoInitializeTabs = autoInitializeTabs;
window.debugTabState = debugTabState;

// ===============================================
// FINAL ACTIVITY TAB FIX - NO WHITE SPACE
// Replace your previous JavaScript fix with this version
// ===============================================

// Store mining activity content to restore later
let storedMiningActivityContent = null;

// Force activity tab visibility ONLY when activity tab is active
function forceActivityTabVisibility() {
    const activityTab = document.getElementById('activity-tab');
    
    // Only apply fixes if activity tab is actually active
    if (activityTab && activityTab.classList.contains('active')) {
        const activityContent = document.getElementById('activity-content');
        
        // Force tab visibility
        activityTab.style.display = 'block';
        activityTab.style.visibility = 'visible';
        activityTab.style.opacity = '1';
        activityTab.style.minHeight = '500px';
        
        if (activityContent) {
            activityContent.style.display = 'block';
            activityContent.style.visibility = 'visible';
            activityContent.style.opacity = '1';
            activityContent.style.minHeight = '400px';
            activityContent.style.position = 'relative';
            activityContent.style.zIndex = '1';
        }
        
        // Restore mining activity container if it doesn't exist
        restoreMiningActivityContainer();
        
        console.log('🎯 Activity tab visibility forced');
    }
}

// Completely remove mining activity container from DOM when not needed
function removeMiningActivityFromOtherTabs() {
    const miningActivity = document.getElementById('mining-activity');
    const activityTab = document.getElementById('activity-tab');
    
    if (miningActivity) {
        // If activity tab is not active, remove the container completely
        if (!activityTab || !activityTab.classList.contains('active')) {
            // Store the content before removing
            storedMiningActivityContent = miningActivity.outerHTML;
            
            // Remove from DOM completely
            miningActivity.remove();
            console.log('🗑️ Mining activity container removed from DOM');
        }
    }
}

// Restore mining activity container when switching back to activity tab
function restoreMiningActivityContainer() {
    const activityTab = document.getElementById('activity-tab');
    const activityContent = document.getElementById('activity-content');
    let miningActivity = document.getElementById('mining-activity');
    
    // Only restore if we're on activity tab and container doesn't exist
    if (activityTab && activityTab.classList.contains('active') && !miningActivity && activityContent) {
        if (storedMiningActivityContent) {
            // Restore from stored content
            activityContent.insertAdjacentHTML('beforeend', storedMiningActivityContent);
            console.log('♻️ Mining activity container restored from stored content');
        } else {
            // Create new container
            miningActivity = document.createElement('div');
            miningActivity.id = 'mining-activity';
            miningActivity.style.cssText = 'display: block; visibility: visible; opacity: 1; min-height: 400px; width: 100%; position: relative; z-index: 1;';
            activityContent.appendChild(miningActivity);
            console.log('🔧 New mining activity container created');
        }
        
        // Trigger content loading
        setTimeout(() => {
            ensureActivityContent();
        }, 100);
    }
}

// Enhanced switchTab function with complete container management
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId, buttonElement) {
    console.log(`🔄 Enhanced switching to tab: ${tabId}`);
    
    // Call original function first
    if (originalSwitchTab) {
        originalSwitchTab(tabId, buttonElement);
    } else {
        // Fallback if original doesn't exist
        // Hide all tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab panel
        const selectedPanel = document.getElementById(tabId);
        if (selectedPanel) {
            selectedPanel.classList.add('active');
        }
        
        // Add active class to clicked button
        if (buttonElement) {
            buttonElement.classList.add('active');
        }
    }
    
    // Handle tab-specific logic
    if (tabId === 'activity-tab') {
        // Switching TO activity tab
        setTimeout(() => {
            restoreMiningActivityContainer();
            forceActivityTabVisibility();
            ensureActivityContent();
        }, 100);
    } else {
        // Switching AWAY from activity tab
        setTimeout(() => {
            removeMiningActivityFromOtherTabs();
        }, 50);
    }
};

// Ensure activity content is loaded and visible ONLY for activity tab
function ensureActivityContent() {
    const activityTab = document.getElementById('activity-tab');
    
    // Only proceed if we're actually on the activity tab
    if (!activityTab || !activityTab.classList.contains('active')) {
        console.log('⭐ Not on activity tab, skipping content ensure');
        return;
    }
    
    let miningActivity = document.getElementById('mining-activity');
    
    // Create container if it doesn't exist
    if (!miningActivity) {
        console.log('🔧 Creating missing mining-activity container...');
        const activityContent = document.getElementById('activity-content');
        if (activityContent) {
            miningActivity = document.createElement('div');
            miningActivity.id = 'mining-activity';
            miningActivity.style.cssText = 'display: block; visibility: visible; opacity: 1; min-height: 400px; width: 100%; position: relative; z-index: 1;';
            activityContent.appendChild(miningActivity);
        }
    }
    
    // Ensure activity manager exists
    if (!window.miningActivityManager) {
        console.log('🔧 Creating missing activity manager...');
        try {
            window.miningActivityManager = new MiningActivityManager();
        } catch (e) {
            console.error('❌ Failed to create activity manager:', e);
            return;
        }
    }
    
    // Force update display if content is missing or minimal
    if (miningActivity && miningActivity.innerHTML.length < 500) {
        setTimeout(() => {
            console.log('🔄 Forcing activity display update...');
            if (window.miningActivityManager && typeof window.miningActivityManager.updateActivityDisplay === 'function') {
                window.miningActivityManager.updateActivityDisplay();
            }
            
            // Double-check visibility after update
            setTimeout(() => {
                forceActivityTabVisibility();
            }, 200);
        }, 200);
    }
}

// Set up mutation observer with container management
function setupActivityTabObserver() {
    const activityTab = document.getElementById('activity-tab');
    if (activityTab) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = activityTab.classList.contains('active');
                    if (isActive) {
                        setTimeout(() => {
                            restoreMiningActivityContainer();
                            forceActivityTabVisibility();
                            ensureActivityContent();
                        }, 50);
                    } else {
                        // Tab became inactive, remove mining activity
                        setTimeout(() => {
                            removeMiningActivityFromOtherTabs();
                        }, 50);
                    }
                }
            });
        });
        
        observer.observe(activityTab, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        console.log('👀 Activity tab mutation observer installed with container management');
    }
}

// Auto-fix function with container management
function autoFixActivityTab() {
    const activityTab = document.getElementById('activity-tab');
    const miningActivity = document.getElementById('mining-activity');
    
    if (activityTab && activityTab.classList.contains('active')) {
        // We're on activity tab - ensure container exists and is visible
        if (!miningActivity) {
            console.log('🔧 Auto-restoring missing mining activity container...');
            restoreMiningActivityContainer();
        } else {
            const isVisible = miningActivity.offsetWidth > 0 && 
                             miningActivity.offsetHeight > 0 &&
                             getComputedStyle(miningActivity).display !== 'none';
            
            if (!isVisible) {
                console.log('🔧 Auto-fixing invisible activity content...');
                forceActivityTabVisibility();
                ensureActivityContent();
            }
        }
    } else {
        // We're NOT on activity tab - ensure mining activity is removed
        if (miningActivity) {
            console.log('🔧 Auto-removing mining activity from non-activity tab...');
            removeMiningActivityFromOtherTabs();
        }
    }
}

// Initialize the activity tab fix when DOM is ready
function initializeActivityTabFix() {
    console.log('🚀 Initializing activity tab fix with container management...');
    
    // Set up observer
    setupActivityTabObserver();
    
    // Set up periodic auto-fix (every 3 seconds)
    setInterval(autoFixActivityTab, 3000);
    
    // Fix immediately based on current tab state
    const activityTab = document.getElementById('activity-tab');
    if (activityTab && activityTab.classList.contains('active')) {
        setTimeout(() => {
            restoreMiningActivityContainer();
            forceActivityTabVisibility();
            ensureActivityContent();
        }, 100);
    } else {
        // Remove mining activity if we're not on activity tab
        setTimeout(() => {
            removeMiningActivityFromOtherTabs();
        }, 100);
    }
    
    console.log('✅ Activity tab fix initialized with complete container management');
}

// Make functions globally available
window.forceActivityTabVisibility = forceActivityTabVisibility;
window.removeMiningActivityFromOtherTabs = removeMiningActivityFromOtherTabs;
window.restoreMiningActivityContainer = restoreMiningActivityContainer;
window.ensureActivityContent = ensureActivityContent;
window.autoFixActivityTab = autoFixActivityTab;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeActivityTabFix);
} else {
    initializeActivityTabFix();
}