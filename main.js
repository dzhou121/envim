import {app, Menu} from 'electron';
import {BrowserWindow} from 'electron';

let mainWindow = null;

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
    ]
  },
]

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', () => {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    mainWindow = new BrowserWindow({width: 366 * 7, height: 63 * 14 * 1.5 + 35});
    mainWindow.webContents.openDevTools()
    console.log(mainWindow.width, mainWindow.height)

    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    // mainWindow.webContents.addDevToolsExtension("~/Library/Application\ Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.14.11_0")
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
});
