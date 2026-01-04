import { ElectronAPI } from '@electron-toolkit/preload';
import { Is } from '@electron-toolkit/utils';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      ytm: {
        search: (query: string) => Promise<any>;
      };
      window: {
        close: () => void;
        minimize: () => void;
        maximize: () => void;
      };
      app: {
        isDevelopment: () => boolean;
      };
    };
    is: Is;
  }
}
