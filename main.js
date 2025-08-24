const { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true, // Enable for debugging and shell access
            contextIsolation: false, // Disable for easier debugging
            webSecurity: false, // Disabled to allow iframe loading of external sites
            allowRunningInsecureContent: true, // Allow mixed content for some mining sites
            experimentalFeatures: true,
            plugins: true,
            enableRemoteModule: true // For remote module access
        },
        icon: path.join(__dirname, 'icon.png'), // You'll need to add an icon
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        backgroundColor: '#667eea',
        show: false
    });

    // Load the HTML file
    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Enhanced window open handler to support in-app browsing
    mainWindow.webContents.setWindowOpenHandler(({ url, frameName, features, disposition }) => {
        console.log(`Window open handler: ${url}`);
        // Allow all iframe navigation for in-app browser
        return { action: 'allow' };
    });

    // Handle navigation events more carefully
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        console.log(`Main window navigation attempt: ${navigationUrl}`);
        const parsedUrl = new URL(navigationUrl);
        
        // Allow navigation to local files and the main API
        if (parsedUrl.protocol === 'file:' || 
            parsedUrl.hostname === 'www.yourdomain.com' ||
            navigationUrl === mainWindow.webContents.getURL()) {
            console.log('Allowing main window navigation');
            return; // Allow navigation
        }
        
        // Prevent main window from navigating to external sites
        console.log('Preventing main window navigation to external site');
        event.preventDefault();
    });

    // Handle subframe navigation (iframes) differently
    mainWindow.webContents.on('will-frame-navigate', (event, navigationUrl, isMainFrame, frameProcessId, frameRoutingId) => {
        if (!isMainFrame) {
            console.log(`Iframe navigation: ${navigationUrl}`);
            // Allow iframe navigation to local devices
            try {
                const parsedUrl = new URL(navigationUrl);
                if (parsedUrl.hostname.match(/^192\.168\./) || 
                    parsedUrl.hostname.match(/^10\./) || 
                    parsedUrl.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
                    parsedUrl.hostname === 'localhost' ||
                    parsedUrl.hostname.includes('comed.com')) {
                    console.log('Allowing iframe navigation to local/allowed device');
                    return; // Allow
                }
            } catch (e) {
                console.log('Could not parse URL for iframe navigation');
            }
        }
    });

    // Handle frame navigation (for iframes)
    mainWindow.webContents.on('did-create-window', (childWindow, details) => {
        // Configure child windows (iframes) with minimal restrictions
        childWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    });

    // Handle IPC messages for new windows
    const { ipcMain } = require('electron');
    ipcMain.on('open-new-window', (event, url) => {
        console.log(`Opening new window for: ${url}`);
        createChildWindow(url);
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    createMenu();

    // Create system tray icon (optional)
    if (process.platform !== 'darwin') {
        createTray();
    }
}

function createChildWindow(url) {
    console.log(`Creating child window for: ${url}`);
    
    const childWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // Disable for local mining equipment
            allowRunningInsecureContent: true,
            experimentalFeatures: true,
            additionalArguments: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        },
        parent: mainWindow,
        modal: false,
        show: false,
        title: `Mining Equipment - ${url}`,
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, 'icon.png')
    });

    // Create a custom session for this window
    const { session } = require('electron');
    const customSession = session.fromPartition(`mining-device-${Date.now()}`);
    
    // Configure custom session to aggressively fix MIME types
    customSession.webRequest.onBeforeRequest((details, callback) => {
        console.log(`Child window request: ${details.url}`);
        callback({});
    });

    customSession.webRequest.onHeadersReceived((details, callback) => {
        console.log(`Child window response for: ${details.url}`);
        console.log(`Original content-type: ${details.responseHeaders['content-type']}`);
        
        const responseHeaders = { ...details.responseHeaders };
        
        // Aggressively fix MIME types for any file that might be JavaScript
        if (details.url.includes('.js') || 
            details.url.includes('assets/js') || 
            details.url.includes('script') ||
            (details.url.includes('assets') && !details.url.includes('.css') && !details.url.includes('.woff'))) {
            
            responseHeaders['content-type'] = ['application/javascript; charset=utf-8'];
            console.log(`FORCED JavaScript MIME type for: ${details.url}`);
        }
        
        // Fix CSS files
        if (details.url.includes('.css') || details.url.includes('assets/css')) {
            responseHeaders['content-type'] = ['text/css; charset=utf-8'];
            console.log(`FORCED CSS MIME type for: ${details.url}`);
        }
        
        // Fix HTML files
        if (details.url.endsWith('/') || details.url.includes('.html') || details.url === url) {
            responseHeaders['content-type'] = ['text/html; charset=utf-8'];
            console.log(`FORCED HTML MIME type for: ${details.url}`);
        }
        
        // Remove ALL restrictive headers
        delete responseHeaders['x-frame-options'];
        delete responseHeaders['X-Frame-Options'];
        delete responseHeaders['content-security-policy'];
        delete responseHeaders['Content-Security-Policy'];
        delete responseHeaders['x-content-type-options'];
        delete responseHeaders['X-Content-Type-Options'];
        delete responseHeaders['referrer-policy'];
        delete responseHeaders['Referrer-Policy'];
        
        console.log(`Final content-type: ${responseHeaders['content-type']}`);
        callback({ responseHeaders });
    });

    // Apply the custom session to the window
    childWindow.webContents.session = customSession;

    // Load the URL
    childWindow.loadURL(url);
    
    childWindow.once('ready-to-show', () => {
        childWindow.show();
        console.log(`Child window ready and shown for: ${url}`);
        
        // Give it a moment then check if content loaded
        setTimeout(() => {
            childWindow.webContents.executeJavaScript(`
                console.log('Page title:', document.title);
                console.log('Body content length:', document.body.innerHTML.length);
                console.log('Script tags:', document.querySelectorAll('script').length);
                if (document.body.innerHTML.length < 100) {
                    console.log('Very little content - possible loading issue');
                    console.log('Current URL:', window.location.href);
                }
            `).catch(e => console.log('Could not execute debug script:', e));
        }, 3000);
    });

    childWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.log(`Child window failed to load: ${errorDescription} (${errorCode}) for ${validatedURL}`);
    });

    childWindow.webContents.on('did-finish-load', () => {
        console.log(`Child window finished loading: ${url}`);
    });

    childWindow.webContents.on('dom-ready', () => {
        console.log(`Child window DOM ready: ${url}`);
        
        // Inject a script to help with module loading issues
        childWindow.webContents.executeJavaScript(`
            // Override module loading to be more permissive
            if (window.location.href.includes('10.229.65.')) {
                console.log('BitAxe device detected, applying compatibility fixes...');
                
                // Log all script errors
                window.addEventListener('error', function(e) {
                    console.log('Script error:', e.message, 'File:', e.filename, 'Line:', e.lineno);
                });
                
                // Check if we have the expected BitAxe elements
                setTimeout(() => {
                    const hasContent = document.body && document.body.innerHTML.length > 500;
                    const hasScripts = document.querySelectorAll('script').length > 0;
                    console.log('Content check - Has content:', hasContent, 'Has scripts:', hasScripts);
                    
                    if (!hasContent) {
                        console.log('BitAxe interface appears to have loading issues');
                        document.body.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h2>BitAxe Loading Issue</h2><p>The device is responding but the interface has loading problems.</p><p>Try refreshing or check the device directly at <a href="' + window.location.href + '">' + window.location.href + '</a></p></div>';
                    }
                }, 5000);
            }
        `).catch(e => console.log('Could not inject compatibility script:', e));
    });

    // Handle window close
    childWindow.on('closed', () => {
        console.log(`Child window closed for: ${url}`);
    });

    return childWindow;
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Refresh',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('app.fetchData()');
                    }
                },
                {
                    label: 'Open ComEd Pricing',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`app.openBrowser('https://hourlypricing.comed.com/live-prices/', 'ComEd Live Pricing')`);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Close Browser',
                    accelerator: 'Escape',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('app.closeBrowser()');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Reload', role: 'reload' },
                { label: 'Force Reload', role: 'forceReload' },
                { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Actual Size', role: 'resetZoom' },
                { label: 'Zoom In', role: 'zoomIn' },
                { label: 'Zoom Out', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Toggle Fullscreen', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Clear Worker URLs',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'question',
                            title: 'Clear Worker URLs',
                            message: 'Are you sure you want to clear all worker URLs?',
                            detail: 'This action cannot be undone.',
                            buttons: ['Cancel', 'Clear All'],
                            defaultId: 0,
                            cancelId: 0
                        }).then((result) => {
                            if (result.response === 1) {
                                mainWindow.webContents.executeJavaScript(`
                                    app.workerUrls = {};
                                    app.saveWorkerUrlsToStorage();
                                    app.render();
                                    app.showNotification('Worker URLs Cleared', 'All worker URLs have been removed.');
                                `);
                            }
                        });
                    }
                },
                {
                    label: 'Export Worker URLs',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('JSON.stringify(app.workerUrls, null, 2)')
                            .then((workerUrlsJson) => {
                                const { dialog } = require('electron');
                                const fs = require('fs');
                                
                                dialog.showSaveDialog(mainWindow, {
                                    title: 'Export Worker URLs',
                                    defaultPath: 'worker-urls.json',
                                    filters: [
                                        { name: 'JSON Files', extensions: ['json'] },
                                        { name: 'All Files', extensions: ['*'] }
                                    ]
                                }).then((result) => {
                                    if (!result.canceled && result.filePath) {
                                        fs.writeFileSync(result.filePath, workerUrlsJson);
                                        mainWindow.webContents.executeJavaScript(`
                                            app.showNotification('Export Complete', 'Worker URLs exported successfully.');
                                        `);
                                    }
                                });
                            });
                    }
                },
                {
                    label: 'Import Worker URLs',
                    click: () => {
                        const { dialog } = require('electron');
                        const fs = require('fs');
                        
                        dialog.showOpenDialog(mainWindow, {
                            title: 'Import Worker URLs',
                            filters: [
                                { name: 'JSON Files', extensions: ['json'] },
                                { name: 'All Files', extensions: ['*'] }
                            ],
                            properties: ['openFile']
                        }).then((result) => {
                            if (!result.canceled && result.filePaths.length > 0) {
                                try {
                                    const fileContent = fs.readFileSync(result.filePaths[0], 'utf8');
                                    const workerUrls = JSON.parse(fileContent);
                                    
                                    mainWindow.webContents.executeJavaScript(`
                                        app.workerUrls = ${JSON.stringify(workerUrls)};
                                        app.saveWorkerUrlsToStorage();
                                        app.render();
                                        app.showNotification('Import Complete', 'Worker URLs imported successfully.');
                                    `);
                                } catch (error) {
                                    dialog.showErrorBox('Import Error', 'Failed to import worker URLs. Please check the file format.');
                                }
                            }
                        });
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { label: 'Minimize', role: 'minimize' },
                { label: 'Close', role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Open ComEd Pricing (External)',
                    click: () => {
                        shell.openExternal('https://hourlypricing.comed.com/live-prices/');
                    }
                },
                {
                    label: 'Keyboard Shortcuts',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Keyboard Shortcuts',
                            message: 'Mining Stats Keyboard Shortcuts',
                            detail: `
Ctrl+R (Cmd+R on Mac) - Refresh data
Ctrl+P (Cmd+P on Mac) - Open ComEd pricing
Escape - Close in-app browser
Ctrl+Click - Edit worker URL
Shift+Click - Edit worker URL

Worker Actions:
• Click worker name - Open worker URL
• Ctrl+Click worker name - Edit worker URL
• 🔗 icon indicates URL is set
                            `.trim(),
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'About',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Mining Stats',
                            message: 'Belani Solo Mining Stats',
                            detail: `Version 1.0.0
Monitor your mining operations in real-time.

Features:
• Real-time mining statistics
• Historical hashrate charts
• Worker management with custom URLs
• In-app ComEd pricing browser
• Desktop notifications
• System tray integration

Built with Electron and Chart.js`,
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { label: 'About ' + app.getName(), role: 'about' },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide ' + app.getName(), role: 'hide' },
                { label: 'Hide Others', role: 'hideothers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', role: 'quit' }
            ]
        });

        // Window menu
        template[4].submenu = [
            { label: 'Close', role: 'close' },
            { label: 'Minimize', role: 'minimize' },
            { label: 'Zoom', role: 'zoom' },
            { type: 'separator' },
            { label: 'Bring All to Front', role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createTray() {
    // Create a tray icon (Windows/Linux)
    const iconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIcSURBVDiNpZNNaBNBFMefzWx2k6axNrGJtWlqbdVWPYgXL4L05MWDBy9evHjx4sWLFy9evHjx4sWLFy9evHjx4kERQRBBEEEQQRBBEEEQQRAEQfTixYsXLx7Ei5f+PczOZjOzs/Nm3rz3/2YIIYAgCCAIAhAEAQiCAARBAIIggCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAARBAIIgAEEQgCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAARBAIIgAEEQgCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAARBAIIgAEEQgCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAARBAIIgAEEQgCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAARBAIIgAEEQgCAIQBAEIAgCEAQBCIIABEEAgiAAQRCAIAhAEAQgCAIQBAEIggAEQQCCIABBEIAgCEAQBCAIAhAEAQiCAA/wD7WzrKvX8eT8AAAAAElFTkSuQmCC';
    
    tray = new Tray(nativeImage.createFromDataURL(iconData));
    tray.setToolTip('Belani Mining Stats');
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        {
            label: 'Refresh Data',
            click: () => {
                mainWindow.webContents.executeJavaScript('app.fetchData()');
            }
        },
        {
            label: 'ComEd Pricing',
            click: () => {
                mainWindow.webContents.executeJavaScript(`app.openBrowser('https://hourlypricing.comed.com/live-prices/', 'ComEd Live Pricing')`);
                mainWindow.show();
                mainWindow.focus();
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // Double-click to show/hide window
    tray.on('double-click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    // Single click behavior differs by platform
    if (process.platform === 'win32') {
        tray.on('click', () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    }
}

// Handle global keyboard shortcuts
function setupGlobalShortcuts() {
    const { globalShortcut } = require('electron');
    
    // Register global shortcut to show/hide window
    globalShortcut.register('CommandOrControl+Shift+M', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

// App event handlers
// (Removed - this is now handled in the app.whenReady() section above)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Unregister all global shortcuts
    const { globalShortcut } = require('electron');
    globalShortcut.unregisterAll();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Enable live reload for Electron in development
try {
    require('electron-reloader')(module, {
        debug: true,
        watchRenderer: true
    });
} catch (_) {
    // electron-reloader is optional for development
}

// Handle certificate errors for mining-related sites and allow local IPs
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // Allow self-signed certificates for local mining equipment and any local IPs
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.match(/^192\.168\./) || 
        parsedUrl.hostname.match(/^10\./) || 
        parsedUrl.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) { // Any IP address
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

// Handle permission requests
app.on('web-contents-created', (event, contents) => {
    contents.on('permission-request', (event, permission, callback) => {
        // Allow all permissions for local development and mining equipment access
        if (permission === 'camera' || permission === 'microphone') {
            callback(false); // Deny camera/microphone for security
        } else {
            callback(true); // Allow other permissions like notifications, etc.
        }
    });

    // Set user agent to avoid blocking
    contents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
});

// Add session configuration for better iframe support
app.whenReady().then(() => {
    // Configure session to allow all origins in iframes
    const { session } = require('electron');
    
    // Remove restrictive headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };
        
        // Remove headers that block iframe embedding
        delete responseHeaders['x-frame-options'];
        delete responseHeaders['X-Frame-Options'];
        delete responseHeaders['content-security-policy'];
        delete responseHeaders['Content-Security-Policy'];
        delete responseHeaders['x-content-type-options'];
        delete responseHeaders['X-Content-Type-Options'];
        
        callback({ responseHeaders });
    });

    // Handle CORS for local devices
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        const requestHeaders = { ...details.requestHeaders };
        
        // Add headers for better compatibility with mining equipment
        requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        requestHeaders['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
        requestHeaders['Accept-Language'] = 'en-US,en;q=0.5';
        
        callback({ requestHeaders });
    });

    createWindow();
    setupGlobalShortcuts();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});