// Notification Handlers - Notification settings and management

function showAdvancedNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; height: auto;">
            <div class="modal-header">
                <h2>🔔 Notification Settings</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; color: #6b7280;">
                    Choose which types of notifications you want to receive.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">💎 Share Found</div>
                            <div style="font-size: 12px; color: #6b7280;">When new shares are discovered</div>
                        </div>
                        <input type="checkbox" id="notify-share-found" onchange="toggleNotification('shareFound', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🔴 Worker Offline</div>
                            <div style="font-size: 12px; color: #6b7280;">When workers go offline</div>
                        </div>
                        <input type="checkbox" id="notify-worker-offline" onchange="toggleNotification('workerOffline', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🟢 Worker Online</div>
                            <div style="font-size: 12px; color: #6b7280;">When workers come online</div>
                        </div>
                        <input type="checkbox" id="notify-worker-online" onchange="toggleNotification('workerOnline', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">🎉 Milestones</div>
                            <div style="font-size: 12px; color: #6b7280;">Share count and hashrate milestones</div>
                        </div>
                        <input type="checkbox" id="notify-milestones" onchange="toggleNotification('milestones', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">⚡ Hashrate Changes</div>
                            <div style="font-size: 12px; color: #6b7280;">Significant hashrate fluctuations</div>
                        </div>
                        <input type="checkbox" id="notify-hashrate-changes" onchange="toggleNotification('hashrateChanges', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">❌ Errors</div>
                            <div style="font-size: 12px; color: #6b7280;">System errors and alerts</div>
                        </div>
                        <input type="checkbox" id="notify-errors" onchange="toggleNotification('errors', this.checked)">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">💰 Price Alerts</div>
                            <div style="font-size: 12px; color: #6b7280;">Bitcoin price notifications</div>
                        </div>
                        <input type="checkbox" id="notify-price-alerts" onchange="toggleNotification('priceAlerts', this.checked)">
                    </div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="disableAllNotifications()" class="refresh-btn" style="background: #ef4444; margin: 0;">
                        Disable All
                    </button>
                    <button onclick="enableAllNotifications()" class="refresh-btn" style="background: #10b981; margin: 0;">
                        Enable All
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                            class="refresh-btn" style="margin: 0;">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load current settings
    loadNotificationCheckboxes();
}

function loadNotificationCheckboxes() {
    if (!window.miningActivityManager) return;
    
    const settings = window.miningActivityManager.notificationSettings;
    
    const shareFoundEl = document.getElementById('notify-share-found');
    const workerOfflineEl = document.getElementById('notify-worker-offline');
    const workerOnlineEl = document.getElementById('notify-worker-online');
    const milestonesEl = document.getElementById('notify-milestones');
    const hashrateChangesEl = document.getElementById('notify-hashrate-changes');
    const errorsEl = document.getElementById('notify-errors');
    const priceAlertsEl = document.getElementById('notify-price-alerts');
    
    if (shareFoundEl) shareFoundEl.checked = settings.shareFound;
    if (workerOfflineEl) workerOfflineEl.checked = settings.workerOffline;
    if (workerOnlineEl) workerOnlineEl.checked = settings.workerOnline;
    if (milestonesEl) milestonesEl.checked = settings.milestones;
    if (hashrateChangesEl) hashrateChangesEl.checked = settings.hashrateChanges;
    if (errorsEl) errorsEl.checked = settings.errors;
    if (priceAlertsEl) priceAlertsEl.checked = settings.priceAlerts;
}

function toggleNotification(type, enabled) {
    if (window.miningActivityManager) {
        window.miningActivityManager.toggleNotificationType(type, enabled);
        
        if (window.app) {
            const action = enabled ? 'enabled' : 'disabled';
            const typeLabel = type.replace(/([A-Z])/g, ' $1').toLowerCase();
            window.app.showNotification('Notification Setting', `${typeLabel} notifications ${action}`);
        }
    }
}

function disableAllNotifications() {
    if (!window.miningActivityManager) return;
    
    ['shareFound', 'workerOffline', 'workerOnline', 'milestones', 'hashrateChanges', 'errors', 'priceAlerts'].forEach(type => {
        window.miningActivityManager.toggleNotificationType(type, false);
    });
    
    loadNotificationCheckboxes();
    
    if (window.app) {
        window.app.showNotification('Notifications', 'All notifications disabled');
    }
}

function enableAllNotifications() {
    if (!window.miningActivityManager) return;
    
    ['shareFound', 'workerOffline', 'workerOnline', 'milestones', 'hashrateChanges', 'errors', 'priceAlerts'].forEach(type => {
        window.miningActivityManager.toggleNotificationType(type, true);
    });
    
    loadNotificationCheckboxes();
    
    if (window.app) {
        window.app.showNotification('Notifications', 'All notifications enabled');
    }
}

function quickToggleNotification(type, enabled) {
    if (window.miningActivityManager) {
        window.miningActivityManager.toggleNotificationType(type, enabled);
    }
}

function debugNotificationSettings() {
    console.log('=== NOTIFICATION DEBUG ===');
    console.log('Mining Activity Manager exists:', !!window.miningActivityManager);
    
    if (window.miningActivityManager) {
        console.log('Notification Settings:', window.miningActivityManager.notificationSettings);
        console.log('Share Found Setting:', window.miningActivityManager.notificationSettings.shareFound);
        console.log('Should notify shares:', window.miningActivityManager.shouldNotify('share'));
    }
    
    console.log('App Settings Manager exists:', !!(window.app && window.app.settingsManager));
    if (window.app && window.app.settingsManager) {
        console.log('Smart Notifications Enabled:', window.app.settingsManager.settings.enableSmartNotifications);
    }
    console.log('=========================');
}