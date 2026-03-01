const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// determine if running in development (not packaged) - more reliable than NODE_ENV
const isDev = !app.isPackaged; // `app.isPackaged` is false when running `electron .` in dev


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // always open devtools for visibility (helps diagnose blank white screen)
  win.webContents.openDevTools({ mode: 'detach' });

  if (isDev) {
    const url = 'http://localhost:3000';
    console.log('DEV MODE: loading', url);
    win.loadURL(url);
  } else {
    const file = path.join(__dirname, 'build', 'index.html');
    console.log('PROD MODE: loading', file);
    win.loadFile(file);
  }

  // if the page fails to load (e.g. server not ready) try again
  win.webContents.on('did-fail-load', () => {
    console.warn('Load failed, retrying in 1s');
    setTimeout(() => {
      if (isDev) {
        win.loadURL('http://localhost:3000');
      } else {
        win.loadFile(path.join(__dirname, 'build', 'index.html'));
      }
    }, 1000);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ignore certificate errors (useful during development or with self-signed/remote hosts)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  console.warn('Bypassing certificate error for', url, error);
  event.preventDefault();
  callback(true);
});

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, { filename, data }) => {
  const userPath = app.getPath('userData');
  const fullPath = path.join(userPath, filename);
  try {
    // data is base64 without data: prefix
    fs.writeFileSync(fullPath, data, { encoding: 'base64' });
    return fullPath;
  } catch (e) {
    console.error('save-file error', e);
    throw e;
  }
});

ipcMain.handle('load-file', async (event, { filename }) => {
  const userPath = app.getPath('userData');
  const fullPath = path.join(userPath, filename);
  try {
    if (fs.existsSync(fullPath)) {
      const contents = fs.readFileSync(fullPath, { encoding: 'base64' });
      return contents;
    }
    return null;
  } catch (e) {
    console.error('load-file error', e);
    throw e;
  }
});

ipcMain.handle('choose-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.filePaths;
});

ipcMain.handle('get-storage-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-path', async (event, targetPath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(targetPath);
    return true;
  } catch (e) {
    console.error('open-path error', e);
    return false;
  }
});
