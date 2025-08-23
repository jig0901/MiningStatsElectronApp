// Enhanced Mining Activity Manager with Improved Tab Support
class MiningActivityManager {
    constructor() {
        this.activities = [];
        this.lastStats = null;
        this.maxActivities = 1000;
        this.displayInitialized = false;
        this.activityTypes = {
            SHARE_FOUND: 'share',
            WORKER_ONLINE: 'worker-change',
            WORKER_OFFLINE: 'worker-change',
            HASHRATE_CHANGE: 'hashrate',
            ERROR: 'error',
            MILESTONE: 'milestone',
            PRICE_ALERT: 'price'
        };
        
        // Enhanced notification settings
        this.notificationSettings = {
            shareFound: false,       // Default to disabled
            workerOffline: true,     // Worker going offline
            workerOnline: false,     // Worker coming online
            milestones: true,        // Milestone achievements
            errors: true,           // Error notifications
            hashrateChanges: false, // Hashrate change alerts
            priceAlerts: false      // Bitcoin price alerts
        };
        
        this.init();
    }
    
    init() {
        this.loadActivities();
        this.loadNotificationSettings();
        this.initializeActivityTracking();
        
        // Add some sample activities if none exist (for testing)
        if (this.activities.length === 0) {
            this.addSampleActivities();
        }
        
        console.log('📊 Mining Activity Manager initialized with', this.activities.length, 'activities');
    }
    
    // Add sample activities for testing
    addSampleActivities() {
        const now = new Date();
        const samples = [
            {
                type: this.activityTypes.MILESTONE,
                message: '🚀 Mining dashboard started',
                data: { workerCount: 0, hashrate: 0 },
                timestamp: new Date(now.getTime() - 300000) // 5 minutes ago
            },
            {
                type: this.activityTypes.SHARE_FOUND,
                message: '💎 5 new shares found!',
                data: { newShares: 5, totalShares: 1205, currentHashrate: 45.67 },
                timestamp: new Date(now.getTime() - 240000) // 4 minutes ago
            },
            {
                type: this.activityTypes.WORKER_ONLINE,
                message: '🟢 Worker "Miner-01" came online',
                data: { workerName: 'Miner-01', totalWorkers: 3 },
                timestamp: new Date(now.getTime() - 180000) // 3 minutes ago
            },
            {
                type: this.activityTypes.HASHRATE_CHANGE,
                message: '⬆️ Hashrate increased by 12.5%',
                data: { previousHashrate: 40.2, currentHashrate: 45.23, changePercent: 12.5 },
                timestamp: new Date(now.getTime() - 120000) // 2 minutes ago
            },
            {
                type: this.activityTypes.MILESTONE,
                message: '🎉 Milestone reached: 1,000 shares!',
                data: { milestone: 1000, totalShares: 1200 },
                timestamp: new Date(now.getTime() - 60000) // 1 minute ago
            }
        ];
        
        samples.forEach(sample => {
            this.activities.push({
                id: Date.now() + Math.random(),
                timestamp: sample.timestamp,
                type: sample.type,
                message: sample.message,
                data: sample.data,
                read: false
            });
        });
        
        this.saveActivities();
        console.log('📋 Added sample activities for testing');
    }
    
    // Load notification settings from localStorage
    loadNotificationSettings() {
        const stored = localStorage.getItem('notificationSettings');
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                this.notificationSettings = { ...this.notificationSettings, ...settings };
                console.log('📥 Notification settings loaded:', this.notificationSettings);
            } catch (e) {
                console.error('Failed to load notification settings:', e);
            }
        }
    }
    
    // Save notification settings to localStorage
    saveNotificationSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
        console.log('💾 Notification settings saved');
    }
    
    // Toggle specific notification types
    toggleNotificationType(type, enabled) {
        if (this.notificationSettings.hasOwnProperty(type)) {
            this.notificationSettings[type] = enabled;
            this.saveNotificationSettings();
            console.log(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    // Enhanced shouldNotify method with granular control
    shouldNotify(type) {
        // Check if smart notifications are globally disabled
        if (window.app && window.app.settingsManager && 
            !window.app.settingsManager.settings.enableSmartNotifications) {
            return false;
        }
        
        // Check granular settings
        switch (type) {
            case this.activityTypes.SHARE_FOUND:
                return this.notificationSettings.shareFound;
            case this.activityTypes.WORKER_OFFLINE:
                return this.notificationSettings.workerOffline;
            case this.activityTypes.WORKER_ONLINE:
                return this.notificationSettings.workerOnline;
            case this.activityTypes.MILESTONE:
                return this.notificationSettings.milestones;
            case this.activityTypes.ERROR:
                return this.notificationSettings.errors;
            case this.activityTypes.HASHRATE_CHANGE:
                return this.notificationSettings.hashrateChanges;
            case this.activityTypes.PRICE_ALERT:
                return this.notificationSettings.priceAlerts;
            default:
                return false;
        }
    }
    
    // Track mining activities based on stats changes
    trackActivities(currentStats, previousStats = null) {
        if (!currentStats) return;
        
        const timestamp = new Date();
        
        // First run - just store stats
        if (!previousStats) {
            this.lastStats = currentStats;
            this.addActivity(this.activityTypes.MILESTONE, '🚀 Mining dashboard started', {
                workerCount: currentStats.worker_count,
                hashrate: currentStats.hashrate_1min_ths
            });
            return;
        }
        
        // Check for new shares
        this.checkForNewShares(currentStats, previousStats);
        
        // Check for worker changes
        this.checkForWorkerChanges(currentStats, previousStats);
        
        // Check for significant hashrate changes
        this.checkForHashrateChanges(currentStats, previousStats);
        
        // Check for new best shares
        this.checkForBestShares(currentStats, previousStats);
        
        // Check for milestones
        this.checkForMilestones(currentStats, previousStats);
        
        this.lastStats = currentStats;
    }
    
    // Check for new shares
    checkForNewShares(current, previous) {
        if (current.accepted_shares && previous.accepted_shares) {
            const newShares = current.accepted_shares - previous.accepted_shares;
            if (newShares > 0) {
                this.addActivity(this.activityTypes.SHARE_FOUND, 
                    `💎 ${newShares} new share${newShares > 1 ? 's' : ''} found!`, {
                    newShares,
                    totalShares: current.accepted_shares,
                    currentHashrate: current.hashrate_1min_ths
                });
            }
        }
    }
    
    // Check for worker changes
    checkForWorkerChanges(current, previous) {
        const currentWorkers = new Set(current.workers?.map(w => this.cleanWorkerName(w.workername)) || []);
        const previousWorkers = new Set(previous.workers?.map(w => this.cleanWorkerName(w.workername)) || []);
        
        // New workers
        const newWorkers = [...currentWorkers].filter(w => !previousWorkers.has(w));
        const offlineWorkers = [...previousWorkers].filter(w => !currentWorkers.has(w));
        
        newWorkers.forEach(worker => {
            this.addActivity(this.activityTypes.WORKER_ONLINE, 
                `🟢 Worker "${worker}" came online`, {
                workerName: worker,
                totalWorkers: current.worker_count
            });
        });
        
        offlineWorkers.forEach(worker => {
            this.addActivity(this.activityTypes.WORKER_OFFLINE, 
                `🔴 Worker "${worker}" went offline`, {
                workerName: worker,
                totalWorkers: current.worker_count
            });
        });
        
        // Worker count changes
        if (current.worker_count !== previous.worker_count) {
            const change = current.worker_count - previous.worker_count;
            const icon = change > 0 ? '📈' : '📉';
            this.addActivity(this.activityTypes.WORKER_ONLINE, 
                `${icon} Worker count changed: ${previous.worker_count} → ${current.worker_count}`, {
                change,
                newCount: current.worker_count
            });
        }
    }
    
    // Check for significant hashrate changes
    checkForHashrateChanges(current, previous) {
        const currentHashrate = current.hashrate_1min_ths || 0;
        const previousHashrate = previous.hashrate_1min_ths || 0;
        
        if (previousHashrate > 0) {
            const changePercent = ((currentHashrate - previousHashrate) / previousHashrate) * 100;
            
            // Alert on changes > 10%
            if (Math.abs(changePercent) > 10) {
                const icon = changePercent > 0 ? '⬆️' : '⬇️';
                const direction = changePercent > 0 ? 'increased' : 'decreased';
                
                this.addActivity(this.activityTypes.HASHRATE_CHANGE, 
                    `${icon} Hashrate ${direction} by ${Math.abs(changePercent).toFixed(1)}%`, {
                    previousHashrate,
                    currentHashrate,
                    changePercent
                });
            }
        }
    }
    
    // Check for new best shares
    checkForBestShares(current, previous) {
        if (current.best_shares && previous.best_shares && 
            current.best_shares > previous.best_shares) {
            
            this.addActivity(this.activityTypes.SHARE_FOUND, 
                `🏆 New best share! ${this.formatValue(current.best_shares)}`, {
                previousBest: previous.best_shares,
                newBest: current.best_shares,
                improvement: current.best_shares - previous.best_shares
            });
        }
    }
    
    // Check for milestones
    checkForMilestones(current, previous) {
        // Share milestones
        if (current.accepted_shares && previous.accepted_shares) {
            const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
            
            milestones.forEach(milestone => {
                if (current.accepted_shares >= milestone && previous.accepted_shares < milestone) {
                    this.addActivity(this.activityTypes.MILESTONE, 
                        `🎉 Milestone reached: ${milestone.toLocaleString()} shares!`, {
                        milestone,
                        totalShares: current.accepted_shares
                    });
                }
            });
        }
        
        // Hashrate milestones (in TH/s)
        const hashrateMillestones = [10, 25, 50, 100, 250, 500, 1000];
        const currentHashrate = current.hashrate_1min_ths || 0;
        const previousHashrate = previous.hashrate_1min_ths || 0;
        
        hashrateMillestones.forEach(milestone => {
            if (currentHashrate >= milestone && previousHashrate < milestone) {
                this.addActivity(this.activityTypes.MILESTONE, 
                    `⚡ Hashrate milestone: ${milestone} TH/s!`, {
                    milestone,
                    currentHashrate
                });
            }
        });
    }
    
    // Add activity to the log
    addActivity(type, message, data = {}) {
        const activity = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            type,
            message,
            data,
            read: false
        };
        
        this.activities.unshift(activity);
        
        // Keep only the most recent activities
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }
        
        this.saveActivities();
        
        // Update display immediately if it exists
        this.updateActivityDisplay();
        
        // Show notification for important activities
        if (this.shouldNotify(type)) {
            this.showActivityNotification(activity);
        }
    }
    
    // Show notification for activity
    showActivityNotification(activity) {
        if (window.app && window.app.showNotification) {
            const title = this.getActivityTypeLabel(activity.type);
            window.app.showNotification(title, activity.message);
        }
    }
    
    // Get activity type label
    getActivityTypeLabel(type) {
        const labels = {
            [this.activityTypes.SHARE_FOUND]: 'Share Found',
            [this.activityTypes.WORKER_ONLINE]: 'Worker Status',
            [this.activityTypes.WORKER_OFFLINE]: 'Worker Status',
            [this.activityTypes.HASHRATE_CHANGE]: 'Hashrate Change',
            [this.activityTypes.ERROR]: 'Error',
            [this.activityTypes.MILESTONE]: 'Milestone',
            [this.activityTypes.PRICE_ALERT]: 'Price Alert'
        };
        return labels[type] || 'Activity';
    }
    
    // IMPROVED: Update the activity display with better container detection
    updateActivityDisplay() {
        console.log('📊 Updating activity display...');
        
        // Try to find the container in order of preference
        let container = null;
        const containerIds = [
            'mining-activity',          // Primary target
            'activity-content',         // Tab content
            'mining-activity-inline',   // Alternative
            'mining-activity-tab-content' // Tab specific
        ];
        
        for (const id of containerIds) {
            const element = document.getElementById(id);
            if (element) {
                container = element;
                console.log(`✅ Found activity container: ${id}`);
                break;
            }
        }
        
        if (!container) {
            console.warn('⚠️ No activity container found, tried:', containerIds);
            return;
        }
        
        // Force create the display
        this.renderActivityDisplay(container);
        this.displayInitialized = true;
    }
    
    // IMPROVED: Separate rendering method
    renderActivityDisplay(container) {
        const recentActivities = this.activities.slice(0, 20);
        const unreadCount = this.activities.filter(a => !a.read).length;
        
        console.log(`📋 Rendering ${recentActivities.length} activities (${unreadCount} unread)`);
        
        container.innerHTML = `
            <div class="section" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; min-height: 300px;">
                <div class="section-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px; font-weight: 600; color: #374151;">📊 Mining Activity</span>
                        ${unreadCount > 0 ? `<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${unreadCount} new</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button onclick="showAdvancedNotificationSettings()" 
                                class="refresh-btn" style="padding: 6px 12px; font-size: 12px; margin: 0; background: #6b7280;">
                            🔔 Settings
                        </button>
                        <button onclick="markAllActivitiesRead()" 
                                class="refresh-btn" style="padding: 6px 12px; font-size: 12px; margin: 0; background: #10b981;">
                            ✓ Mark Read
                        </button>
                        <button onclick="clearAllActivities()" 
                                class="refresh-btn" style="padding: 6px 12px; font-size: 12px; margin: 0; background: #ef4444;">
                            🗑 Clear
                        </button>
                        <button onclick="testAddActivity()" 
                                class="refresh-btn" style="padding: 6px 12px; font-size: 12px; margin: 0; background: #8b5cf6;">
                            ➕ Test
                        </button>
                    </div>
                </div>
                
                <!-- Activity Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 25px;">
                    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
                        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Total Activities</div>
                        <div style="font-size: 24px; font-weight: bold; color: #374151;">${this.activities.length}</div>
                    </div>
                    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #bae6fd;">
                        <div style="color: #0369a1; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Today</div>
                        <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${this.getTodayActivitiesCount()}</div>
                    </div>
                    <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #bbf7d0;">
                        <div style="color: #059669; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Shares Found</div>
                        <div style="font-size: 24px; font-weight: bold; color: #059669;">${this.getActivityCount(this.activityTypes.SHARE_FOUND)}</div>
                    </div>
                    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #fde68a;">
                        <div style="color: #d97706; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Milestones</div>
                        <div style="font-size: 24px; font-weight: bold; color: #d97706;">${this.getActivityCount(this.activityTypes.MILESTONE)}</div>
                    </div>
                </div>
                
                <!-- Activity Timeline -->
                <div class="activity-timeline" style="max-height: 400px; overflow-y: auto;">
                    ${recentActivities.length > 0 
                        ? recentActivities.map(activity => this.renderActivity(activity)).join('')
                        : `<div style="text-align: center; color: #6b7280; padding: 60px 20px; background: #f9fafb; border-radius: 8px; border: 2px dashed #d1d5db;">
                             <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                             <h3 style="margin-bottom: 8px; color: #374151;">No Activities Yet</h3>
                             <p style="margin: 0; font-size: 14px;">Mining activities will appear here as they occur</p>
                             <button onclick="testAddActivity()" class="refresh-btn" style="margin-top: 16px;">Add Test Activity</button>
                           </div>`
                    }
                </div>
                
                ${this.activities.length > 20 ? `
                    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <button onclick="showAllActivitiesModal()" class="refresh-btn" style="margin: 0; background: #6366f1;">
                            📜 View All ${this.activities.length} Activities
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        console.log('✅ Activity display rendered successfully');
    }
    
    // IMPROVED: Render individual activity with better styling
    renderActivity(activity) {
        const timeStr = this.formatTimeAgo(activity.timestamp);
        const isUnread = !activity.read;
        const typeColor = this.getActivityTypeColor(activity.type);
        
        return `
            <div class="activity-item" 
                 style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e5e7eb; background: ${isUnread ? '#f0f9ff' : 'white'}; cursor: pointer; transition: all 0.2s ease; ${isUnread ? 'border-left: 4px solid #3b82f6;' : ''}"
                 onclick="markActivityAsRead('${activity.id}')"
                 onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                
                <div style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: ${typeColor}; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                    ${this.getActivityIcon(activity.type)}
                </div>
                
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 4px;">
                        <div style="font-weight: 600; color: #374151; font-size: 14px; line-height: 1.4;">
                            ${activity.message}
                        </div>
                        <div style="color: #6b7280; font-size: 12px; margin-left: 12px; white-space: nowrap;">
                            ${timeStr}
                        </div>
                    </div>
                    
                    ${activity.data && Object.keys(activity.data).length > 0 ? `
                        <div style="font-size: 12px; color: #6b7280; margin-top: 6px; background: #f9fafb; padding: 8px; border-radius: 4px;">
                            ${this.formatActivityData(activity.data)}
                        </div>
                    ` : ''}
                    
                    ${isUnread ? '<div style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>' : ''}
                </div>
            </div>
        `;
    }
    
    // Get color for activity type
    getActivityTypeColor(type) {
        const colors = {
            [this.activityTypes.SHARE_FOUND]: '#ecfdf5',
            [this.activityTypes.WORKER_ONLINE]: '#f0fdf4',
            [this.activityTypes.WORKER_OFFLINE]: '#fef2f2',
            [this.activityTypes.HASHRATE_CHANGE]: '#f0f9ff',
            [this.activityTypes.ERROR]: '#fef2f2',
            [this.activityTypes.MILESTONE]: '#fef3c7',
            [this.activityTypes.PRICE_ALERT]: '#f3e8ff'
        };
        return colors[type] || '#f9fafb';
    }
    
    // Get icon for activity type
    getActivityIcon(type) {
        const icons = {
            [this.activityTypes.SHARE_FOUND]: '💎',
            [this.activityTypes.WORKER_ONLINE]: '🟢',
            [this.activityTypes.WORKER_OFFLINE]: '🔴',
            [this.activityTypes.HASHRATE_CHANGE]: '⚡',
            [this.activityTypes.ERROR]: '❌',
            [this.activityTypes.MILESTONE]: '🎉',
            [this.activityTypes.PRICE_ALERT]: '💰'
        };
        return icons[type] || 'ℹ️';
    }
    
    // Format time ago
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }
    
    // Format activity data for display
    formatActivityData(data) {
        const formatted = [];
        if (data.totalShares) formatted.push(`Total: ${data.totalShares.toLocaleString()}`);
        if (data.currentHashrate) formatted.push(`Hashrate: ${data.currentHashrate.toFixed(2)} TH/s`);
        if (data.changePercent) formatted.push(`Change: ${data.changePercent.toFixed(1)}%`);
        if (data.totalWorkers) formatted.push(`Workers: ${data.totalWorkers}`);
        if (data.workerName) formatted.push(`Worker: ${data.workerName}`);
        if (data.milestone) formatted.push(`Milestone: ${data.milestone.toLocaleString()}`);
        return formatted.join(' • ');
    }
    
    // Mark activity as read
    markAsRead(activityId) {
        const activity = this.activities.find(a => a.id == activityId);
        if (activity && !activity.read) {
            activity.read = true;
            this.saveActivities();
            this.updateActivityDisplay();
        }
    }
    
    // Mark all activities as read
    markAllAsRead() {
        this.activities.forEach(activity => activity.read = true);
        this.saveActivities();
        this.updateActivityDisplay();
        if (window.app) {
            window.app.showNotification('Activities', 'All activities marked as read');
        }
    }
    
    // Clear all activities
    clearActivities() {
        if (confirm('Are you sure you want to clear all activity history?')) {
            this.activities = [];
            this.saveActivities();
            this.updateActivityDisplay();
            if (window.app) {
                window.app.showNotification('Activities', 'Activity history cleared');
            }
        }
    }
    
    // Add test activity (for debugging)
    addTestActivity() {
        const testTypes = [
            { type: this.activityTypes.SHARE_FOUND, message: '💎 Test share found!', data: { newShares: 1, totalShares: 1234 } },
            { type: this.activityTypes.WORKER_ONLINE, message: '🟢 Test worker online', data: { workerName: 'Test-Worker', totalWorkers: 5 } },
            { type: this.activityTypes.MILESTONE, message: '🎉 Test milestone reached!', data: { milestone: 5000 } },
            { type: this.activityTypes.HASHRATE_CHANGE, message: '⚡ Test hashrate change', data: { changePercent: 15.5 } }
        ];
        
        const randomTest = testTypes[Math.floor(Math.random() * testTypes.length)];
        this.addActivity(randomTest.type, randomTest.message, randomTest.data);
        
        console.log('🧪 Test activity added');
    }
    
    // Show all activities in modal
    showAllActivities() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; height: 80vh;">
                <div class="modal-header">
                    <h2>📊 All Mining Activities (${this.activities.length})</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div style="padding: 20px; height: calc(100% - 70px); overflow-y: auto;">
                    <div class="activity-timeline" style="max-height: none;">
                        ${this.activities.map(activity => this.renderActivity(activity)).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }
    
    // Get count of activities by type
    getActivityCount(type) {
        return this.activities.filter(a => a.type === type).length;
    }
    
    // Get count of today's activities
    getTodayActivitiesCount() {
        const today = new Date().toDateString();
        return this.activities.filter(a => a.timestamp.toDateString() === today).length;
    }
    
    // Initialize activity tracking
    initializeActivityTracking() {
        if (window.addEventListener) {
            window.addEventListener('statsUpdated', (event) => {
                this.trackActivities(event.detail.current, event.detail.previous);
            });
        }
    }
    
    // Utility functions
    cleanWorkerName(fullName) {
        const dotIndex = fullName.indexOf('.');
        return dotIndex > -1 ? fullName.substring(dotIndex + 1) : fullName;
    }
    
    formatValue(n) {
        const absN = Math.abs(n);
        if (absN >= 1e12) return (n / 1e12).toFixed(2) + 'T';
        if (absN >= 1e9) return (n / 1e9).toFixed(2) + 'G';
        if (absN >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (absN >= 1e3) return (n / 1e3).toFixed(2) + 'k';
        return n.toFixed(2);
    }
    
    // Load activities from localStorage
    loadActivities() {
        const stored = localStorage.getItem('miningActivities');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.activities = data.map(activity => ({
                    ...activity,
                    timestamp: new Date(activity.timestamp)
                }));
                console.log(`📊 Loaded ${this.activities.length} activities`);
            } catch (e) {
                console.error('Failed to load mining activities:', e);
                this.activities = [];
            }
        }
    }
    
    // Save activities to localStorage
    saveActivities() {
        try {
            localStorage.setItem('miningActivities', JSON.stringify(this.activities));
        } catch (e) {
            console.error('Failed to save mining activities:', e);
        }
    }
}

// Global functions for UI handlers
function markActivityAsRead(activityId) {
    if (window.miningActivityManager) {
        window.miningActivityManager.markAsRead(activityId);
    }
}

function markAllActivitiesRead() {
    if (window.miningActivityManager) {
        window.miningActivityManager.markAllAsRead();
    }
}

function clearAllActivities() {
    if (window.miningActivityManager) {
        window.miningActivityManager.clearActivities();
    }
}

function showAllActivitiesModal() {
    if (window.miningActivityManager) {
        window.miningActivityManager.showAllActivities();
    }
}

function testAddActivity() {
    if (window.miningActivityManager) {
        window.miningActivityManager.addTestActivity();
    }
}

// Force refresh activity display (for debugging)
function refreshActivityDisplay() {
    if (window.miningActivityManager) {
        console.log('🔄 Force refreshing activity display...');
        window.miningActivityManager.updateActivityDisplay();
    }
}