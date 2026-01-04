import { ipcMain, BrowserWindow } from 'electron';

export default function init() {
  ipcMain.handle('window.minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('window.maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.maximize();
  });

  ipcMain.handle('window.close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
}
