
/* 

    Coastal Freeze's Downloadable Client
    Copyright (C) 2021 Allinol<coastalfreeze.net>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
	
*/



/**
 * Modules and variables
 */
const {app, dialog, BrowserWindow, Menu, MenuItem, ipcMain, nativeTheme, globalShortcut, session} = require('electron')
const path = require('path')

const {autoUpdater} = require("electron-updater");

const DiscordRPC = require('discord-rpc');

const aboutMessage = `Coastal Freeze Client v${app.getVersion()}
Created by Allinol and Random for use with Coastal Freeze.
Owners of Coastal Freeze: Fliberjig1 and Snickerdoodle`;


/**
 * This switch case will return the correct DLL/so/plugin for the app
 */
let pluginName
switch (process.platform) {
	case 'win32':
		imageName = 'windows_icon';
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flash/windows/32/pepflashplayer.dll'
				break
			case 'x64':
				pluginName = 'flash/windows/64/pepflashplayer.dll'
				break
			}
		break
	case 'linux':
		imageName = 'linux_icon';
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flash/linux/32/libpepflashplayer.so'
				break
			case 'x64':
				pluginName = 'flash/linux/64/libpepflashplayer.so'
				break
			}
		
		app.commandLine.appendSwitch('no-sandbox');
		break
	case 'darwin':
		imageName = 'mac_os_icon';
		pluginName = 'flash/mac/PepperFlashPlayer.plugin'
		break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
app.commandLine.appendSwitch("disable-http-cache");


/**
 * Activates Discord Rich Presence
 * @returns {void}
 */
let rpc;
function activateRPC() { 
  DiscordRPC.register('792072685790167070');
  rpc = new DiscordRPC.Client({
	  transport: 'ipc'
  }); 
  const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: `coastalfreeze.net`, 
      state: `Desktop Client`, 
      startTimestamp, 
      largeImageKey: imageName
    });
  });
  rpc.login({
	clientId: '792072685790167070' 
  }).catch(console.error);
}
/**
 * creates the loading screen
 * @returns {void}
 */
let loadingScreen;
function createLoadingScreen(){
  /// create a browser mainWindow
  
  loadingScreen = new BrowserWindow({
      /// define width and height for the mainWindow
      width: 200,
      height: 300,
      /// remove the mainWindow frame, so it will become a frameless mainWindow
      frame: false,
      /// and set the transparency, to remove any mainWindow background color
      transparent: true
    }
  );
  if(mainWindow) mainWindow.close()
  loadingScreen.setResizable(false);
  loadingScreen.loadURL(
    'file://' + __dirname + '/window/loading.html'
  );
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
	createWindow();
	mainWindow.webContents.on('did-finish-load', () => {
		if(loadingScreen) loadingScreen.close()
		if(!rpc) activateRPC()
		mainWindow.show()
	})
  });
};
/**
 * Creates the Menu Bar
 * @returns {Menu}
 */
function createMenu() { 
    fsmenu = new Menu();
    if (process.platform == 'darwin') {
        fsmenu.append(new MenuItem({
            label: "Coastal Freeze Client",
            submenu: [{
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["Ok"],
                            title: "About Coastal Freeze",
                            message: aboutMessage
                        });
                    }
                },
                {
                    label: 'Fullscreen (Toggle)',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        mainWindow.webContents.send('fullscreen', mainWindow.isFullScreen());
                    }
                },
                {
                    label: 'Mute Audio (Toggle)',
					accelerator: 'CmdOrCtrl+M',
                    click: () => {
                        mainWindow.webContents.audioMuted = !mainWindow.webContents.audioMuted;
                        mainWindow.webContents.send('muted', mainWindow.webContents.audioMuted);
                    }
                },
                {
                    label: 'Dark Mode (Toggle)',
                    click: () => {
                        darkMode()
                    }
                },
                {
                    label: 'Log Out',
					click: () => clearCacheAndReload()
                }
            ]
        }));
    } else {
        fsmenu.append(new MenuItem({
            label: 'About',
            click: () => {
                dialog.showMessageBox({
                    type: "info",
                    buttons: ["Ok"],
                    title: "About Coastal Freeze",
                    message: aboutMessage
                });
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Fullscreen (Toggle)',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
                mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Mute Audio (Toggle)',
			accelerator: 'CmdOrCtrl+M',
            click: () => {
                mainWindow.webContents.audioMuted = !mainWindow.webContents.audioMuted;
                mainWindow.webContents.send('muted', mainWindow.webContents.audioMuted);
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Dark Mode (Toggle)',
            click: () => {
                darkMode()
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Log Out',
            click: () => clearCacheAndReload()
        }));
    }
	return fsmenu
}
/**
 * creates MainWindow
 * @returns {void}
 */
let mainWindow;
function createWindow () {
  // Create the browser mainWindow.
  mainWindow = new BrowserWindow({
    useContentSize: true,
    show: false,
    title: "Coastal Freeze",
    webPreferences: {
	  preload: path.join(__dirname, './preload.js'),
      plugins: true,
      nodeIntegration: false,
	  webSecurity: false
    }
  })
  registerKeys()
  Menu.setApplicationMenu(createMenu());
  mainWindow.loadURL('https://play.coastalfreeze.net/client/');
  
}

/**
 * Clears cache and reload
 * @returns {void}
 */
function clearCacheAndReload() {
	const ses = mainWindow.webContents.session;
	ses.clearCache().then(() => mainWindow.webContents.send('reload'));
}

/**
 * Registers the Shortcuts
 * @returns {void}
 */
function registerKeys() {
	globalShortcut.register('CmdOrCtrl+Shift+I', () => {
		mainWindow.webContents.openDevTools();
	})
}
/**
 * Toggles Dark mode
 * @returns {Boolean}
 */
function darkMode() {
	nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    mainWindow.webContents.send('theme', nativeTheme.themeSource);
    return nativeTheme.shouldUseDarkColors
}

/**
 * Auto Updater and Events!
 */
 
/**
* This event will fire if update is downloaded
* @returns {void}
*/
 
let updateAv = false;
autoUpdater.on('update-downloaded', () => {
    updateAv = true;
});

/**
 * This event will fire if electron is ready
 * @returns {void}
 */

app.whenReady().then(() => {
  createLoadingScreen()
  autoUpdater.checkForUpdatesAndNotify();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoadingScreen()
  })
})

/**
 * This event will fire if the windows are all closed
 * @returns {void}
 */

app.on('window-all-closed', () => {
	if(updateAv) autoUpdater.quitAndInstall();
	if(process.platform !== 'darwin') app.quit();
});

/**
 * This event will fire whenever an update is available
 * @param {Object}
 * @returns {void}
 */
 
autoUpdater.on('update-available', (updateInfo) => {
	switch (process.platform) {
	case 'win32':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). It will be installed when the app closes."
	    });
	    break
	case 'darwin':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). Please go install it manually from the website."
	    });
	    break
	case 'linux':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). Auto-update has not been tested on this OS, so if after relaunching app this appears again, please go install it manually."
	    });
	    break
	}
});

/**
 * This Event will fire if 'load:data' was sent from the site
 * @param {event}
 * @param {String}
 * @param {String}
 * @returns {void}
 */

ipcMain.on('load:data', (event, mute, theme) => {
	muted = (mute === 'true');
	nativeTheme.themeSource = theme;
	mainWindow.webContents.audioMuted = muted;
	
	mainWindow.webContents.send('theme', nativeTheme.themeSource);
	
});

/**
 * End of Auto Updater part
 */



