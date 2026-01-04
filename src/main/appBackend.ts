import { is } from '@electron-toolkit/utils';
import { ipcMain } from 'electron';

export default function init() {
  ipcMain.handle('app.isDevelopment', () => is.dev);
}
