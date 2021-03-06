const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;

const Tray = electron.Tray;

const ipcMain = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = undefined;

function createMenu(mainWindow) {
    const template = [{
        label: 'File',
        submenu: [{
            label: 'Save',
            accelerator: 'CommandOrControl+S',
            click() {
                mainWindow.webContents.send('save');
            }
        }, {
            label: 'Save as',
            click() {
                mainWindow.webContents.send('saveAs');
            }
        }, {
            label: 'Load',
            accelerator: 'CommandOrControl+L',
            click() {
                mainWindow.webContents.send('load');
            }
        }, {
            label: 'Load as',
            click() {
                mainWindow.webContents.send('loadAs');
            }
        }, {
            label: 'Export',
            accelerator: 'CommandOrControl+E',
            click() {
                mainWindow.webContents.send('export');
            }
        }]
    }, {
        label: 'Options',
        submenu: [{
            label: 'Draw middle lines',
            type: 'checkbox',
            checked: true,
            click(item) {
                mainWindow.webContents.send('middleLines', item.checked);
            }
        }]
    }, {
        label: '&View',
        submenu: (process.env.NODE_ENV === 'DEV') ? [{
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click() {
                mainWindow.webContents.reload();
            }
        }, {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click() {
                mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
        }, {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click() {
                mainWindow.toggleDevTools();
            }
        }] : [{
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click() {
                mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
        }, {
            label: 'Toggle Developer Tools',
            accelerator: 'F12',
            click() {
                  mainWindow.toggleDevTools();
            }
        }]
    }];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        icon: './icon.png'
    });

    createMenu(mainWindow);


    // and load the index.html of the app.
    if (process.env.NODE_ENV === 'DEV'){
      mainWindow.loadURL(`file://${__dirname}/index.dev.html`);
    } else {
      mainWindow.loadURL(`file://${__dirname}/index.production.html`);
    }

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Open the DevTools.
    if (process.env.NODE_ENV === 'DEV') {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
