// Worker Handlers - Worker management and URL configuration

function showWorkerManagement() {
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        alert('No worker data available');
        return;
    }
    
    const workers = window.app.stats.workers;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; height: auto; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>👷 Worker URL Management</h2>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; color: #6b7280;">
                    Set URLs for your workers to enable quick access. You can click worker names in the table to open their interfaces.
                </p>
                <div id="worker-url-inputs">
                    ${workers.map(worker => {
                        const cleanName = window.app.cleanWorkerName(worker.workername);
                        const currentUrl = window.app.workerUrls[cleanName] || '';
                        return `
                            <div style="display: flex; align-items: center; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
                                <label style="flex: 1; font-weight: 600; margin-right: 12px;">${cleanName}</label>
                                <input type="url" 
                                       placeholder="http://192.168.1.100 or miner IP"
                                       value="${currentUrl}"
                                       data-worker="${cleanName}"
                                       style="flex: 2; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                <button onclick="testWorkerUrl('${cleanName}')" 
                                        class="refresh-btn" style="margin-left: 8px; padding: 6px 12px; font-size: 12px;">
                                    Test
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="clearAllWorkerUrls()" 
                            class="refresh-btn" style="background: #ef4444; margin: 0;">
                        Clear All
                    </button>
                    <button onclick="saveWorkerUrls()" 
                            class="refresh-btn" style="margin: 0;">
                        Save URLs
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Close main menu
    document.querySelectorAll('.modal').forEach(m => {
        if (m !== modal) m.remove();
    });
}

function testWorkerUrl(workerName) {
    const input = document.querySelector(`input[data-worker="${workerName}"]`);
    if (!input || !input.value) {
        alert('Please enter a URL first');
        return;
    }
    
    let url = input.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    
    // Try to open in new tab
    const testWindow = window.open(url, '_blank');
    if (testWindow) {
        setTimeout(() => {
            try {
                if (testWindow.closed) {
                    alert('Connection test completed');
                } else {
                    testWindow.close();
                    alert('Connection successful!');
                }
            } catch (e) {
                alert('Connection test completed');
            }
        }, 2000);
    } else {
        alert('Popup blocked or invalid URL');
    }
}

function saveWorkerUrls() {
    if (!window.app) return;
    
    const inputs = document.querySelectorAll('#worker-url-inputs input[data-worker]');
    let saved = 0;
    
    inputs.forEach(input => {
        const workerName = input.dataset.worker;
        let url = input.value.trim();
        
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
            }
            window.app.workerUrls[workerName] = url;
            saved++;
        } else {
            delete window.app.workerUrls[workerName];
        }
    });
    
    window.app.saveWorkerUrlsToStorage();
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    window.app.showNotification('URLs Saved', `Saved URLs for ${saved} workers`);
    
    // Re-render workers table to show URL indicators
    if (window.app.stats) {
        window.app.render();
    }
}

function clearAllWorkerUrls() {
    if (confirm('Are you sure you want to clear all worker URLs?')) {
        if (window.app) {
            window.app.workerUrls = {};
            window.app.saveWorkerUrlsToStorage();
        }
        
        // Clear all inputs
        document.querySelectorAll('#worker-url-inputs input').forEach(input => {
            input.value = '';
        });
        
        if (window.app) {
            window.app.showNotification('URLs Cleared', 'All worker URLs have been cleared');
        }
    }
}

function handleWorkerClick(workerName, event) {
    if (!window.app) return;
    
    const url = window.app.workerUrls[workerName];
    
    if (url) {
        if (event.ctrlKey || event.metaKey) {
            // Edit URL on Ctrl/Cmd + click
            const newUrl = prompt(`Edit URL for ${workerName}:`, url);
            if (newUrl && newUrl !== url) {
                const finalUrl = newUrl.startsWith('http') ? newUrl : `http://${newUrl}`;
                window.app.workerUrls[workerName] = finalUrl;
                window.app.saveWorkerUrlsToStorage();
                window.app.showNotification('URL Updated', `URL updated for ${workerName}`);
                window.app.render(); // Re-render to update URL indicator
            }
        } else {
            // Open URL in new tab
            window.open(url, '_blank');
        }
    } else {
        // Prompt to add URL
        const newUrl = prompt(`Enter URL for ${workerName} (e.g., 192.168.1.100):`);
        if (newUrl) {
            const finalUrl = newUrl.startsWith('http') ? newUrl : `http://${newUrl}`;
            window.app.workerUrls[workerName] = finalUrl;
            window.app.saveWorkerUrlsToStorage();
            window.app.showNotification('URL Added', `URL added for ${workerName}`);
            window.app.render(); // Re-render to show URL indicator
        }
    }
}

function exportWorkerData() {
    if (!window.app || !window.app.stats || !window.app.stats.workers) {
        alert('No worker data to export');
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        workers: window.app.stats.workers,
        workerUrls: window.app.workerUrls,
        summary: {
            totalWorkers: window.app.stats.worker_count,
            totalHashrate: window.app.stats.hashrate_1min_ths
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.app) {
        window.app.showNotification('Export Complete', 'Worker data exported successfully');
    }
}