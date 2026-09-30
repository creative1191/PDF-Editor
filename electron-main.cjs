const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const iconPath = path.join(__dirname, 'public', 'favicon.ico');
  const winConfig = {
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'WinPDF Studio Pro',
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  if (fs.existsSync(iconPath)) {
    winConfig.icon = iconPath;
  }

  const win = new BrowserWindow(winConfig);

  // Load the built Vite production app
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
