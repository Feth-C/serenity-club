// electron/preload.cjs 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    controlWindow: (action) => ipcRenderer.send('window-controls', action),
    onMaximizedState: (callback) => ipcRenderer.on('maximized-state', (event, state) => callback(state))
});