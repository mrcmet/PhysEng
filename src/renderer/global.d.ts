export interface ElectronAPI {
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (defaultName?: string) => Promise<{ canceled: boolean; filePath: string }>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
