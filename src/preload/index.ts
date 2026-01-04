import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  ytm: {
    search: (query: string) => {
      return electronAPI.ipcRenderer.invoke('ytm.search', query);
    }
  },
  window: {
    close: () => electronAPI.ipcRenderer.invoke('window.close'),
    minimize: () => electronAPI.ipcRenderer.invoke('window.minimize'),
    maximize: () => electronAPI.ipcRenderer.invoke('window.maximize')
  },
  app: {
    isDevelopment: () => electronAPI.ipcRenderer.invoke('app.isDevelopment')
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
