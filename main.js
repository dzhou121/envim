import {app} from 'electron';
import {BrowserWindow} from 'electron';

let mainWindow = null;

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 200 * 7, height: 50 * 14 * 1.5});
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.webContents.openDevTools()

    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    // mainWindow.webContents.addDevToolsExtension("~/Library/Application\ Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.14.11_0")
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
