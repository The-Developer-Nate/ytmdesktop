import { ElectronAPI } from '@electron-toolkit/preload';
import { Is } from '@electron-toolkit/utils';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      ytm: {
        preloadPath: string;
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
      shared: {
        set: (key: string, value: any) => Promise<boolean>;
        get: (key: string) => Promise<any>;
        onUpdate: (callback: (key: string, value: any) => void) => () => void;
        register: (methodName: string, handler: (...args: any[]) => any) => void;
        call: (methodName: string, ...args: any[]) => Promise<any>;
      };
    };
    is: Is;
  }
}
