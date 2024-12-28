// filepath: /main.js
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');

let store;
let startUrl;
let mainWindow;

async function createWindow() {
  const Store = (await import('electron-store')).default;
  store = new Store();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(app.getAppPath(), 'assets/icons/icon.ico');
  } else {
    iconPath = path.join(app.getAppPath(), 'assets/icons/icon.png');
  }

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js')

    },
  });

  startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(app.getAppPath(), 'dist/warehouse-barcode-generator/browser/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle all routes and serve index.html
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(startUrl);
  });

  // Handle navigation to base path on reload
  // mainWindow.webContents.on('will-navigate', (event, newUrl) => {
  //   if (newUrl !== startUrl) {
  //     event.preventDefault();
  //     mainWindow.loadURL(startUrl);
  //   }
  // });

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages for storing and retrieving data
ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  if (mainWindow)
    mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('Download progress:', progressObj);
  if (mainWindow)
    mainWindow.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');

  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
  }

  // Wait half a second, then quit and install the update
  setTimeout(() => { autoUpdater.quitAndInstall(); }, 500);
});

// Simulate update events
ipcMain.on('simulate-update-events', () => {
  if (mainWindow) {
    // Simulate update-available event
    mainWindow.webContents.send('update-available');
    console.log('Simulated: Update available, starting download...');

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      mainWindow.webContents.send('download-progress', { percent: progress });
      console.log(`Simulated: Download progress: ${progress}%`);

      if (progress >= 100) {
        clearInterval(interval);
        mainWindow.webContents.send('update-downloaded');
        console.log('Simulated: Update downloaded, ready to install.');
      }
    }, 250);
  }
});

// Handle IPC message to get available printers
ipcMain.handle('get-available-printers', async (event) => {
  const printers = await mainWindow.webContents.getPrintersAsync();
  console.log(printers);
  event.sender.send('available-printers', printers);
});

// Handle IPC message for silent printing
ipcMain.handle('print-silent', async (event, options) => {
  const printOptions = {
    silent: true,
    printBackground: true,
    deviceName: options.deviceName,
    pagesPerSheet: 1,
    pageSize: {
      width: options.pageWidth,
      height: options.pageHeight
    },
    dpi: options.dpi,
    copies: options.copies || 1
  };
  if (options.margins) {
    printOptions.margins = {
      marginType: 'custom',
      top: options.margins.top,
      bottom: options.margins.bottom,
      left: options.margins.left,
      right: options.margins.right
    }
  }
  console.log(printOptions);

  mainWindow.webContents.print(printOptions, (success, errorType) => {
    if (!success) {
      event.sender.send('print-failed', errorType);
      console.error('Print failed:', errorType);
    } else {
      event.sender.send('print-started', options);
      console.log('Print success');
    }
  });
});