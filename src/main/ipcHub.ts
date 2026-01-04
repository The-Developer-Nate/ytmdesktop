import { ipcMain, webContents } from 'electron';

// Store shared variables
const sharedVars: Record<string, any> = {};

// Store registered RPC methods: methodName -> senderWebContentsId
const rpcRegistry: Record<string, number> = {};

export default function initIpcHub() {
  // --- Shared Variables ---

  ipcMain.handle('shared.set', (_event, key: string, value: any) => {
    console.log(`[IPC Hub] Setting shared var: ${key} = ${value}`);
    sharedVars[key] = value;
    // Broadcast update to all windows/webviews
    const allContents = webContents.getAllWebContents();
    allContents.forEach((wc) => {
      // Don't send back to sender if you want to avoid loop, but useful to confirm
      wc.send('shared.update', key, value);
    });
    return true;
  });

  ipcMain.handle('shared.get', (_event, key: string) => {
    return sharedVars[key];
  });

  // --- RPC System ---

  // Register a method: Renderer/Webview says "I can handle 'methodName'"
  ipcMain.handle('rpc.register', (event, methodName: string) => {
    rpcRegistry[methodName] = event.sender.id;
    console.log(`[RPC] Registered '${methodName}' to WebContents ${event.sender.id}`);
    return true;
  });

  // Call a method: Renderer/Webview says "Call 'methodName' with args"
  ipcMain.handle('rpc.call', async (_event, methodName: string, ...args: any[]) => {
    const targetId = rpcRegistry[methodName];
    if (targetId === undefined) {
      throw new Error(`Method '${methodName}' not registered`);
    }

    const targetWC = webContents.fromId(targetId);
    if (!targetWC) {
      delete rpcRegistry[methodName]; // Clean up
      throw new Error(`Target WebContents ${targetId} for '${methodName}' not found (closed?)`);
    }

    // Send execution request to the target
    // We need a way to get the result back.
    // simpler: use ipcMain.handle in target? No, target is renderer.
    // We must send a message to target, and target must invoke generic handler?
    // Actually, `sendTo` might work if between frames, but here we are Main.
    // Let's use a temporary channel or request ID.

    // Better approach for Main->Renderer RPC: content.send('rpc.execute', ...)
    // and listen for one-time reply.
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(7);

      const responseChannel = `rpc.response.${requestId}`;

      ipcMain.handleOnce(responseChannel, (_e, { result, error }) => {
        if (error) reject(error);
        else resolve(result);
      });

      // Set a timeout
      setTimeout(() => {
        ipcMain.removeHandler(responseChannel);
        reject(new Error(`RPC timeout for '${methodName}'`));
      }, 5000);

      targetWC.send('rpc.execute', { requestId, methodName, args });
    });
  });
}
