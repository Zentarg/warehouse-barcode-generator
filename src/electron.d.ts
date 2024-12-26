interface Window {
  electronStore: {
    set: (key: string, value: any) => Promise<void>;
    get: (key: string) => Promise<any>;
  };
  electronUpdater: {
    onDownloadProgress: (callback: (event: any, progressObj: any) => void) => void;
    onUpdateAvailable: (callback: (event: any) => void) => void;
    onUpdateDownloaded: (callback: (event: any) => void) => void;
  };
}