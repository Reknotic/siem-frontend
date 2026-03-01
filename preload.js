const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  saveFile: (filename, data) => ipcRenderer.invoke('save-file', { filename, data }),
  loadFile: (filename) => ipcRenderer.invoke('load-file', { filename }),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),
  getStoragePath: () => ipcRenderer.invoke('get-storage-path'),
  openPath: (p) => ipcRenderer.invoke('open-path', p)
});
