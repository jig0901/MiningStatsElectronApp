// Performance Handlers - Worker performance tab management

// Make forceLoadPerformance globally available immediately
window.forceLoadPerformance = function() {
    console.log('🔧 Force loading performance data...');
    
    const performanceContent = document.getElementById('performance-content');
    if (!performanceContent) {
        console.error('❌ Performance content not found');
        return;
    }
    
    // Clear any existing content first
    performanceContent.innerHTML = '';
    
    // Create the worker-performance container with explicit styling
    const workerPerformanceDiv = document.createElement('div');
    workerPerformanceDiv.id = 'worker-performance';
    workerPerformanceDiv.style.minHeight = '200px';
    workerPerformanceDiv.style.width = '100%';
    workerPerformanceDiv.innerHTML = `
        <div style="text-align: center; color: #6b7280; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <h3>Loading Performance Analysis...</h3>
            <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
    `;
    
    performanceContent.appendChild(workerPerformanceDiv);
    
    console.log('✅ Created worker-performance container:', workerPerformanceDiv);
    
    // Check if we have the manager and data
    if (!window.workerPerformanceManager) {
        console.log('⚠️ Creating WorkerPerformanceManager...');
        try {
            window.workerPerformanceManager = new WorkerPerformanceManager();
            console.log('✅ WorkerPerformanceManager created successfully');
        } catch (e) {
            console.error('❌ Failed to create WorkerPerformanceManager:', e);
            workerPerformanceDiv.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 40px;">
                    <h3>Error Loading Performance Manager</h3>
                    <p>Worker performance manager failed to initialize.</p>
                    <pre style="font-size: 12px; margin-top: 10px; text-align: left; background: #f9f9f9; padding: 10px; border-radius: 4px;">${e.message}</pre>
                    <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                        Retry
                    </button>
                </div>
            `;
            return;
        }
    }
    
    // Check if we have worker data
    if (!window.app || !window.app.stats || !window.app.stats.workers || window.app.stats.workers.length === 0) {
        console.warn('⚠️ No worker data available');
        workerPerformanceDiv.innerHTML = `
            <div style="text-align: center; color: #f59e0b; padding: 40px;">
                <h3>No Worker Data Available</h3>
                <p>Please wait for worker data to load, then try again.</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                    App: ${!!window.app} | Stats: ${!!window.app?.stats} | Workers: ${window.app?.stats?.workers?.length || 0}
                </p>
                <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                    Retry
                </button>
                <button onclick="createSimplePerformanceDisplay()" class="refresh-btn" style="margin-top: 8px; background: #10b981;">
                    Show Simple View
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`📊 Triggering analysis for ${window.app.stats.workers.length} workers...`);
    
    // Trigger analysis with a delay to ensure DOM is ready
    setTimeout(() => {
        try {
            const analysis = window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
            console.log('📊 Analysis completed:', analysis);
            
            // Double-check that content was created
            setTimeout(() => {
                const updatedContent = document.getElementById('worker-performance');
                if (updatedContent && updatedContent.innerHTML.includes('Loading Performance Analysis')) {
                    console.warn('⚠️ Content still showing loading message, forcing manual update...');
                    forceManualPerformanceUpdate();
                }
            }, 1000);
            
        } catch (e) {
            console.error('❌ Analysis failed:', e);
            workerPerformanceDiv.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 40px;">
                    <h3>Analysis Failed</h3>
                    <p>Performance analysis encountered an error.</p>
                    <pre style="font-size: 12px; margin-top: 10px; text-align: left; background: #f9f9f9; padding: 10px; border-radius: 4px;">${e.message}</pre>
                    <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                        Retry
                    </button>
                    <button onclick="createSimplePerformanceDisplay()" class="refresh-btn" style="margin-top: 8px; background: #10b981;">
                        Show Simple View
                    </button>
                </div>
            `;
        }
    }, 200);
};

// Also make it available without window prefix
function forceLoadPerformance() {
    return window.forceLoadPerformance();
}

// Add this new function to manually force the performance update
function forceManualPerformanceUpdate() {
    console.log('🔧 Forcing manual performance update...');
    
    const container = document.getElementById('worker-performance');
    if (!container) {
        console.error('❌ Worker performance container not found');
        return;
    }
    
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        console.error('❌ No worker data for manual update');
        return;
    }
    
    const workers = window.app.stats.workers;
    console.log(`📊 Manual update for ${workers.length} workers`);
    
    // Create manual performance display
    let performanceHTML = `
        <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div class="section-title">🔧 Worker Performance (Manual)</div>
            
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-label">Total Workers</div>
                    <div class="stat-value">${workers.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Workers</div>
                    <div class="stat-value">${workers.filter(w => parseFloat(w.hashrate1m) > 0).length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Hashrate</div>
                    <div class="stat-value">${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s</div>
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
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Hashrate</span>
                                    <span style="font-weight: 600;">${hashrate.toFixed(2)} TH/s</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Shares</span>
                                    <span style="font-weight: 600;">${shares.toLocaleString()}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Reject Rate</span>
                                    <span style="font-weight: 600;">${rejectRate}%</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-size: 12px; color: #6b7280;">Status</span>
                                    <span style="font-weight: 600; color: ${statusColor};">${status}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-right: 10px;">
                    🔄 Refresh Analysis
                </button>
                <button onclick="showExpectedHashrateDialog()" class="refresh-btn" style="margin-right: 10px;">
                    📊 Set Expected Hashrates
                </button>
                <button onclick="exportPerformanceData()" class="refresh-btn">
                    💾 Export Data
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = performanceHTML;
    console.log('✅ Manual performance update completed');
}

// Force create a simple performance display (bypasses performance manager)
function createSimplePerformanceDisplay() {
    console.log('=== CREATING SIMPLE PERFORMANCE DISPLAY ===');
    
    const container = document.getElementById('worker-performance') || document.getElementById('performance-content');
    
    if (!container) {
        console.log('❌ No container found');
        return;
    }
    
    if (!window.app?.stats?.workers) {
        console.log('❌ No worker data');
        return;
    }
    
    const workers = window.app.stats.workers;
    
    container.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6;">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">🔧 Simple Performance Display</h2>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Summary</h3>
                <p><strong>Total Workers:</strong> ${workers.length}</p>
                <p><strong>Active Workers:</strong> ${workers.filter(w => parseFloat(w.hashrate1m) > 0).length}</p>
                <p><strong>Total Hashrate:</strong> ${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                ${workers.slice(0, 6).map(worker => {
                    const cleanName = worker.workername.split('.')[1] || worker.workername;
                    const hashrate = parseFloat(worker.hashrate1m) || 0;
                    const shares = parseInt(worker.shares) || 0;
                    const rejects = parseInt(worker.rejects) || 0;
                    const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100).toFixed(2) : '0.00';
                    const status = hashrate > 0 ? '🟢 Online' : '🔴 Offline';
                    
                    return `
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 10px 0; color: #374151;">${cleanName}</h4>
                            <p style="margin: 5px 0;"><strong>Hashrate:</strong> ${hashrate.toFixed(2)} TH/s</p>
                            <p style="margin: 5px 0;"><strong>Shares:</strong> ${shares.toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Reject Rate:</strong> ${rejectRate}%</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${workers.length > 6 ? `<p style="text-align: center; margin-top: 15px; color: #6b7280;">... and ${workers.length - 6} more workers</p>` : ''}
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="forceLoadPerformance()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Try Performance Manager
                </button>
                <button onclick="createSimplePerformanceDisplay()" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Simple View
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Simple performance display created');
}

// Debug performance tab specific functions
function debugPerformanceTab() {
    console.log('=== PERFORMANCE TAB DEBUG ===');
    console.log('Performance content exists:', !!document.getElementById('performance-content'));
    console.log('Worker performance exists:', !!document.getElementById('worker-performance'));
    console.log('Performance manager exists:', !!window.workerPerformanceManager);
    console.log('App exists:', !!window.app);
    console.log('App stats exists:', !!window.app?.stats);
    console.log('Workers exist:', !!window.app?.stats?.workers);
    console.log('Workers count:', window.app?.stats?.workers?.length || 0);
    
    if (window.app?.stats?.workers) {
        console.log('First worker:', window.app.stats.workers[0]);
    }
    
    const performanceDiv = document.getElementById('worker-performance');
    if (performanceDiv) {
        console.log('Performance div content length:', performanceDiv.innerHTML.length);
        console.log('Performance div preview:', performanceDiv.innerHTML.substring(0, 200) + '...');
    }
    console.log('=============================');
}

// Test if the performance manager can find its container
function testPerformanceContainer() {
    console.log('=== TESTING PERFORMANCE CONTAINER ===');
    
    // Check all possible container IDs the performance manager might look for
    const possibleContainers = [
        'worker-performance',
        'worker-performance-inline', 
        'worker-performance-tab-content',
        'performance-content'
    ];
    
    possibleContainers.forEach(id => {
        const container = document.getElementById(id);
        console.log(`Container "${id}":`, !!container);
        if (container) {
            console.log(`  - Has content: ${container.innerHTML.length > 0}`);
            console.log(`  - Visible: ${container.offsetWidth > 0 && container.offsetHeight > 0}`);
            console.log(`  - Display: ${getComputedStyle(container).display}`);
        }
    });
    
    console.log('=====================================');
}

// Test performance manager analysis directly
function testPerformanceAnalysis() {
    console.log('=== TESTING PERFORMANCE ANALYSIS ===');
    
    if (!window.workerPerformanceManager) {
        console.log('❌ No performance manager found');
        return;
    }
    
    if (!window.app?.stats?.workers) {
        console.log('❌ No worker data found');
        return;
    }
    
    console.log(`📊 Testing with ${window.app.stats.workers.length} workers`);
    
    try {
        const analysis = window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
        console.log('✅ Analysis successful:', analysis);
        
        // Check if the display update was called
        setTimeout(() => {
            const container = document.getElementById('worker-performance');
            if (container) {
                console.log('📋 Container content after analysis:');
                console.log(`  - Content length: ${container.innerHTML.length}`);
                console.log(`  - Contains "Worker Performance": ${container.innerHTML.includes('Worker Performance')}`);
                console.log(`  - Contains "Loading": ${container.innerHTML.includes('Loading')}`);
            }
        }, 500);
        
    } catch (e) {
        console.error('❌ Analysis failed:', e);
    }
    
    console.log('=====================================');
}

// Run all performance tests
function runAllPerformanceTests() {
    console.log('🚀 Running all performance tests...');
    testPerformanceContainer();
    setTimeout(() => testPerformanceAnalysis(), 1000);
    setTimeout(() => createSimplePerformanceDisplay(), 2000);
}

// Force enable worker performance for debugging
function forceEnableWorkerPerformance() {
    console.log('🔧 Force enabling worker performance...');
    
    // Switch to performance tab first
    if (typeof switchTab === 'function') {
        switchTab('performance-tab', document.querySelector('[onclick*="performance-tab"]'));
    }
    
    // Update settings
    if (window.app && window.app.settingsManager) {
        window.app.settingsManager.settings.showWorkerPerformance = true;
        window.app.settingsManager.saveSettings();
        console.log('✅ Settings updated');
    }
    
    // Force update the performance tab
    setTimeout(() => {
        forceLoadPerformance();
    }, 200);
}

// Make all functions globally available
window.forceManualPerformanceUpdate = forceManualPerformanceUpdate;
window.createSimplePerformanceDisplay = createSimplePerformanceDisplay;
window.debugPerformanceTab = debugPerformanceTab;
window.testPerformanceContainer = testPerformanceContainer;
window.testPerformanceAnalysis = testPerformanceAnalysis;
window.runAllPerformanceTests = runAllPerformanceTests;
window.forceEnableWorkerPerformance = forceEnableWorkerPerformance;// Performance Handlers - Worker performance tab management

// FIXED - Force load performance with better container management
function forceLoadPerformance() {
    console.log('🔧 Force loading performance data...');
    
    const performanceContent = document.getElementById('performance-content');
    if (!performanceContent) {
        console.error('❌ Performance content not found');
        return;
    }
    
    // Clear any existing content first
    performanceContent.innerHTML = '';
    
    // Create the worker-performance container with explicit styling
    const workerPerformanceDiv = document.createElement('div');
    workerPerformanceDiv.id = 'worker-performance';
    workerPerformanceDiv.style.minHeight = '200px';
    workerPerformanceDiv.style.width = '100%';
    workerPerformanceDiv.innerHTML = `
        <div style="text-align: center; color: #6b7280; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔧</div>
            <h3>Loading Performance Analysis...</h3>
            <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
    `;
    
    performanceContent.appendChild(workerPerformanceDiv);
    
    console.log('✅ Created worker-performance container:', workerPerformanceDiv);
    
    // Check if we have the manager and data
    if (!window.workerPerformanceManager) {
        console.log('⚠️ Creating WorkerPerformanceManager...');
        try {
            window.workerPerformanceManager = new WorkerPerformanceManager();
            console.log('✅ WorkerPerformanceManager created successfully');
        } catch (e) {
            console.error('❌ Failed to create WorkerPerformanceManager:', e);
            workerPerformanceDiv.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 40px;">
                    <h3>Error Loading Performance Manager</h3>
                    <p>Worker performance manager failed to initialize.</p>
                    <pre style="font-size: 12px; margin-top: 10px; text-align: left; background: #f9f9f9; padding: 10px; border-radius: 4px;">${e.message}</pre>
                    <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                        Retry
                    </button>
                </div>
            `;
            return;
        }
    }
    
    // Check if we have worker data
    if (!window.app || !window.app.stats || !window.app.stats.workers || window.app.stats.workers.length === 0) {
        console.warn('⚠️ No worker data available');
        workerPerformanceDiv.innerHTML = `
            <div style="text-align: center; color: #f59e0b; padding: 40px;">
                <h3>No Worker Data Available</h3>
                <p>Please wait for worker data to load, then try again.</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                    App: ${!!window.app} | Stats: ${!!window.app?.stats} | Workers: ${window.app?.stats?.workers?.length || 0}
                </p>
                <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                    Retry
                </button>
                <button onclick="createSimplePerformanceDisplay()" class="refresh-btn" style="margin-top: 8px; background: #10b981;">
                    Show Simple View
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`📊 Triggering analysis for ${window.app.stats.workers.length} workers...`);
    
    // Trigger analysis with a delay to ensure DOM is ready
    setTimeout(() => {
        try {
            const analysis = window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
            console.log('📊 Analysis completed:', analysis);
            
            // Double-check that content was created
            setTimeout(() => {
                const updatedContent = document.getElementById('worker-performance');
                if (updatedContent && updatedContent.innerHTML.includes('Loading Performance Analysis')) {
                    console.warn('⚠️ Content still showing loading message, forcing manual update...');
                    forceManualPerformanceUpdate();
                }
            }, 1000);
            
        } catch (e) {
            console.error('❌ Analysis failed:', e);
            workerPerformanceDiv.innerHTML = `
                <div style="text-align: center; color: #ef4444; padding: 40px;">
                    <h3>Analysis Failed</h3>
                    <p>Performance analysis encountered an error.</p>
                    <pre style="font-size: 12px; margin-top: 10px; text-align: left; background: #f9f9f9; padding: 10px; border-radius: 4px;">${e.message}</pre>
                    <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-top: 16px;">
                        Retry
                    </button>
                    <button onclick="createSimplePerformanceDisplay()" class="refresh-btn" style="margin-top: 8px; background: #10b981;">
                        Show Simple View
                    </button>
                </div>
            `;
        }
    }, 200);
}

// Add this new function to manually force the performance update
function forceManualPerformanceUpdate() {
    console.log('🔧 Forcing manual performance update...');
    
    const container = document.getElementById('worker-performance');
    if (!container) {
        console.error('❌ Worker performance container not found');
        return;
    }
    
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        console.error('❌ No worker data for manual update');
        return;
    }
    
    const workers = window.app.stats.workers;
    console.log(`📊 Manual update for ${workers.length} workers`);
    
    // Create manual performance display
    let performanceHTML = `
        <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div class="section-title">🔧 Worker Performance (Manual)</div>
            
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-label">Total Workers</div>
                    <div class="stat-value">${workers.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Workers</div>
                    <div class="stat-value">${workers.filter(w => parseFloat(w.hashrate1m) > 0).length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Hashrate</div>
                    <div class="stat-value">${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s</div>
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
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Hashrate</span>
                                    <span style="font-weight: 600;">${hashrate.toFixed(2)} TH/s</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Shares</span>
                                    <span style="font-weight: 600;">${shares.toLocaleString()}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 12px; color: #6b7280;">Reject Rate</span>
                                    <span style="font-weight: 600;">${rejectRate}%</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-size: 12px; color: #6b7280;">Status</span>
                                    <span style="font-weight: 600; color: ${statusColor};">${status}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button onclick="forceLoadPerformance()" class="refresh-btn" style="margin-right: 10px;">
                    🔄 Refresh Analysis
                </button>
                <button onclick="showExpectedHashrateDialog()" class="refresh-btn" style="margin-right: 10px;">
                    📊 Set Expected Hashrates
                </button>
                <button onclick="exportPerformanceData()" class="refresh-btn">
                    💾 Export Data
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = performanceHTML;
    console.log('✅ Manual performance update completed');
}

// Force create a simple performance display (bypasses performance manager)
function createSimplePerformanceDisplay() {
    console.log('=== CREATING SIMPLE PERFORMANCE DISPLAY ===');
    
    const container = document.getElementById('worker-performance') || document.getElementById('performance-content');
    
    if (!container) {
        console.log('❌ No container found');
        return;
    }
    
    if (!window.app?.stats?.workers) {
        console.log('❌ No worker data');
        return;
    }
    
    const workers = window.app.stats.workers;
    
    container.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6;">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">🔧 Simple Performance Display</h2>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Summary</h3>
                <p><strong>Total Workers:</strong> ${workers.length}</p>
                <p><strong>Active Workers:</strong> ${workers.filter(w => parseFloat(w.hashrate1m) > 0).length}</p>
                <p><strong>Total Hashrate:</strong> ${window.app.stats.hashrate_1min_ths?.toFixed(2) || 0} TH/s</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                ${workers.slice(0, 6).map(worker => {
                    const cleanName = worker.workername.split('.')[1] || worker.workername;
                    const hashrate = parseFloat(worker.hashrate1m) || 0;
                    const shares = parseInt(worker.shares) || 0;
                    const rejects = parseInt(worker.rejects) || 0;
                    const rejectRate = shares > 0 ? ((rejects / (shares + rejects)) * 100).toFixed(2) : '0.00';
                    const status = hashrate > 0 ? '🟢 Online' : '🔴 Offline';
                    
                    return `
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 10px 0; color: #374151;">${cleanName}</h4>
                            <p style="margin: 5px 0;"><strong>Hashrate:</strong> ${hashrate.toFixed(2)} TH/s</p>
                            <p style="margin: 5px 0;"><strong>Shares:</strong> ${shares.toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Reject Rate:</strong> ${rejectRate}%</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${workers.length > 6 ? `<p style="text-align: center; margin-top: 15px; color: #6b7280;">... and ${workers.length - 6} more workers</p>` : ''}
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="forceLoadPerformance()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                    Try Performance Manager
                </button>
                <button onclick="createSimplePerformanceDisplay()" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Simple View
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Simple performance display created');
}

// Debug performance tab specific functions
function debugPerformanceTab() {
    console.log('=== PERFORMANCE TAB DEBUG ===');
    console.log('Performance content exists:', !!document.getElementById('performance-content'));
    console.log('Worker performance exists:', !!document.getElementById('worker-performance'));
    console.log('Performance manager exists:', !!window.workerPerformanceManager);
    console.log('App exists:', !!window.app);
    console.log('App stats exists:', !!window.app?.stats);
    console.log('Workers exist:', !!window.app?.stats?.workers);
    console.log('Workers count:', window.app?.stats?.workers?.length || 0);
    
    if (window.app?.stats?.workers) {
        console.log('First worker:', window.app.stats.workers[0]);
    }
    
    const performanceDiv = document.getElementById('worker-performance');
    if (performanceDiv) {
        console.log('Performance div content length:', performanceDiv.innerHTML.length);
        console.log('Performance div preview:', performanceDiv.innerHTML.substring(0, 200) + '...');
    }
    console.log('=============================');
}

// Test if the performance manager can find its container
function testPerformanceContainer() {
    console.log('=== TESTING PERFORMANCE CONTAINER ===');
    
    // Check all possible container IDs the performance manager might look for
    const possibleContainers = [
        'worker-performance',
        'worker-performance-inline', 
        'worker-performance-tab-content',
        'performance-content'
    ];
    
    possibleContainers.forEach(id => {
        const container = document.getElementById(id);
        console.log(`Container "${id}":`, !!container);
        if (container) {
            console.log(`  - Has content: ${container.innerHTML.length > 0}`);
            console.log(`  - Visible: ${container.offsetWidth > 0 && container.offsetHeight > 0}`);
            console.log(`  - Display: ${getComputedStyle(container).display}`);
        }
    });
    
    console.log('=====================================');
}

// Test performance manager analysis directly
function testPerformanceAnalysis() {
    console.log('=== TESTING PERFORMANCE ANALYSIS ===');
    
    if (!window.workerPerformanceManager) {
        console.log('❌ No performance manager found');
        return;
    }
    
    if (!window.app?.stats?.workers) {
        console.log('❌ No worker data found');
        return;
    }
    
    console.log(`📊 Testing with ${window.app.stats.workers.length} workers`);
    
    try {
        const analysis = window.workerPerformanceManager.analyzeWorkerPerformance(window.app.stats.workers);
        console.log('✅ Analysis successful:', analysis);
        
        // Check if the display update was called
        setTimeout(() => {
            const container = document.getElementById('worker-performance');
            if (container) {
                console.log('📋 Container content after analysis:');
                console.log(`  - Content length: ${container.innerHTML.length}`);
                console.log(`  - Contains "Worker Performance": ${container.innerHTML.includes('Worker Performance')}`);
                console.log(`  - Contains "Loading": ${container.innerHTML.includes('Loading')}`);
            }
        }, 500);
        
    } catch (e) {
        console.error('❌ Analysis failed:', e);
    }
    
    console.log('=====================================');
}

// Run all performance tests
function runAllPerformanceTests() {
    console.log('🚀 Running all performance tests...');
    testPerformanceContainer();
    setTimeout(() => testPerformanceAnalysis(), 1000);
    setTimeout(() => createSimplePerformanceDisplay(), 2000);
}

// Force enable worker performance for debugging
function forceEnableWorkerPerformance() {
    console.log('🔧 Force enabling worker performance...');
    
    // Switch to performance tab first
    switchTab('performance-tab', document.querySelector('[onclick*="performance-tab"]'));
    
    // Update settings
    if (window.app && window.app.settingsManager) {
        window.app.settingsManager.settings.showWorkerPerformance = true;
        window.app.settingsManager.saveSettings();
        console.log('✅ Settings updated');
    }
    
    // Force update the performance tab
    setTimeout(() => {
        forceLoadPerformance();
    }, 200);
}