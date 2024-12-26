// filepath: /main.js
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const url = require('url');

let store;
let startUrl;

async function createWindow() {
  const Store = (await import('electron-store')).default;
  store = new Store();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  let win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js')

    },
  });

  startUrl = 
  url.format({
    pathname: path.join(app.getAppPath(), 'dist/warhouse-barcode-generator/browser/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  win.loadURL(startUrl);

  win.on('closed', () => {
    win = null;
  });

  // Handle all routes and serve index.html
  win.webContents.on('did-fail-load', () => {
    win.loadURL(startUrl);
  });

  // Handle navigation to base path on reload
  win.webContents.on('will-navigate', (event, newUrl) => {
    if (newUrl !== startUrl) {
      event.preventDefault();
      win.loadURL(startUrl);
    }
  });
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