// filepath: /preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronStore', {
  set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  get: (key) => ipcRenderer.invoke('store-get', key)
});

contextBridge.exposeInMainWorld('electronUpdater', {
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback)
});