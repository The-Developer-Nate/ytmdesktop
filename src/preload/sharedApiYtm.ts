import { ipcRenderer } from 'electron';

export const createSharedApi = () => ({
  // --- Variables ---
  set: (key: string, value: any) => ipcRenderer.invoke('shared.set', key, value),
  get: (key: string) => ipcRenderer.invoke('shared.get', key),

  // Listen for updates: callback(key, value)
  onUpdate: (callback: (key: string, value: any) => void) => {
    const handler = (_event, key, value) => callback(key, value);
    ipcRenderer.on('shared.update', handler);
    return () => ipcRenderer.removeListener('shared.update', handler);
  },

  // --- RPC ---

  register: (methodName: string, handler: (...args: any[]) => Promise<any> | any) => {
    ipcRenderer.invoke('rpc.register', methodName);

    // Listen for execution requests for this method
    // We listen to a generic 'rpc.execute' channel
    ipcRenderer.on('rpc.execute', async (_event, { requestId, methodName: calledMethod, args }) => {
      if (calledMethod === methodName) {
        try {
          const result = await handler(...args);
          // Send response back using the unique requestId channel
          // We use invoke in Main, so Main is waiting for a response on 'rpc.response.{requestId}'?
          // Wait, ipcMain.handleOnce waits for invoke? No.
          // Re-reading Main implementation:
          // Main: ipcMain.handleOnce(responseChannel ... )
          // So Renderer must INVOKE that channel? No, Renderer must SEND to that channel if it's a handle?
          // Actually ipcMain.handle waits for ipcRenderer.invoke.
          // So the renderer should use ipcRenderer.invoke(responseChannel, { result })
          ipcRenderer.invoke(`rpc.response.${requestId}`, { result });
        } catch (error) {
          console.error(`RPC Error in ${methodName}:`, error);
          ipcRenderer.invoke(`rpc.response.${requestId}`, { error: String(error) });
        }
      }
    });
  },

  call: (methodName: string, ...args: any[]) => {
    return ipcRenderer.invoke('rpc.call', methodName, ...args);
  }
});
