import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'PhysEng',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// IPC handlers for file operations (used by scene save/load)
ipcMain.handle('dialog:showOpen', async () => {
  if (!mainWindow) return { canceled: true, filePaths: [] };
  return dialog.showOpenDialog(mainWindow, {
    title: 'Open Scene',
    filters: [{ name: 'PhysEng Scene', extensions: ['physeng'] }],
    properties: ['openFile'],
  });
});

ipcMain.handle('dialog:showSave', async (_event, defaultName?: string) => {
  if (!mainWindow) return { canceled: true, filePath: '' };
  return dialog.showSaveDialog(mainWindow, {
    title: 'Save Scene',
    defaultPath: defaultName || 'untitled.physeng',
    filters: [{ name: 'PhysEng Scene', extensions: ['physeng'] }],
  });
});

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  return fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('fs:writeFile', async (_event, filePath: string, data: string) => {
  await fs.writeFile(filePath, data, 'utf-8');
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
