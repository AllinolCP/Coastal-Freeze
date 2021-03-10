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



const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    nativeTheme, 
	globalShortcut
} = require('electron')

const DiscordRPC = require('discord-rpc');

const {
    autoUpdater
} = require("electron-updater");

const path = require('path')


let pluginName
switch (process.platform) {
	case 'win32':
		imageName = 'windows_icon';
		switch (process.arch) {
			case 'ia32':
				pluginName = 'flash/windows/32/pepflashplayer.dll'
				break
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
				pluginName = 'flash/linux/32/libpepflashplayer.so'
				break
			case 'x32':
				pluginName = 'flash/linux/32/libpepflashplayer.so'
				break
			case 'x64':
				pluginName = 'flash/linux/64/libpepflashplayer.so'
				break
			}
		break
	case 'darwin':
		imageName = 'mac_os_icon';
		pluginName = 'flash/mac/PepperFlashPlayer.plugin'
		break
}
app.commandLine.appendSwitch('no-sandbox'); // linux fix
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
app.commandLine.appendSwitch("disable-http-cache");

var win
app.on('ready', () => {
    createWindow();
})

//window creation function
function createWindow() {
    win = new BrowserWindow
    ({
    title: "Coastal Freeze",
    webPreferences: {
        plugins: true,
        nodeIntegration: true
    },
	show: false
    });
    makeMenu();
    ipcMain.on('load:data', (event, mute, theme) => {
        muted = (mute == 'true');
        nativeTheme.themeSource = theme;
        win.webContents.audioMuted = muted;
    });
    activateRPC();
	
    let loading = new BrowserWindow({show: false, frame: false})

    loading.once('show', () => {
		win.webContents.once('dom-ready', () => {
		  console.log('main loaded')
		  win.show()
		  loading.hide()
		  loading.close()
		})
		win.loadURL('https://play.coastalfreeze.net/client/');
	})
	
    autoUpdater.checkForUpdatesAndNotify();
    Menu.setApplicationMenu(fsmenu);
	
	globalShortcut.register('CmdOrCtrl+Shift+I', () => {
		win.webContents.openDevTools();
	})
	
    loading.loadURL('loading.html')
    loading.show()
	
    win.on('closed', () => {
    	win = null;
    });
}

// start of menubar part

const aboutMessage = `Coastal Freeze Client v${app.getVersion()}
Created by Allinol and Random for use with Coastal Freeze.
Owners of Coastal Freeze: Fliberjig1 and Snickerdoodle`;

function activateRPC() { 
  const clientId = '792072685790167070'; 
  DiscordRPC.register(clientId);
  const rpc = new DiscordRPC.Client({ transport: 'ipc' }); 
  const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: `coastalfreeze.net`, 
      state: `Desktop Client`, 
      startTimestamp, 
      largeImageKey: imageName
    });
  });
  rpc.login({ clientId }).catch();
}

function makeMenu() { 
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
                        win.setFullScreen(!win.isFullScreen());
                        win.webContents.send('fullscreen', win.isFullScreen());
                    }
                },
                {
                    label: 'Mute Audio (Toggle)',
					accelerator: 'CmdOrCtrl+M',
                    click: () => {
                        win.webContents.audioMuted = !win.webContents.audioMuted;
                        win.webContents.send('muted', win.webContents.audioMuted);
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
                    click: () => {
                        clearCache();
                        win.loadURL('https://play.coastalfreeze.net/client/');
                    }
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
                win.setFullScreen(!win.isFullScreen());
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Mute Audio (Toggle)',
			accelerator: 'CmdOrCtrl+M',
            click: () => {
                win.webContents.audioMuted = !win.webContents.audioMuted;
                win.webContents.send('muted', win.webContents.audioMuted);
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
            click: () => {
                clearCache();
                win.loadURL('https://play.coastalfreeze.net/client/');
            }
        }));
    }
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

function darkMode() {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
    } else {
        nativeTheme.themeSource = 'dark'
    }
    win.webContents.send('theme', nativeTheme.themeSource);
    return nativeTheme.shouldUseDarkColors
}


// end of menubar


//Auto update part

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

var updateAv = false;

autoUpdater.on('update-downloaded', () => {
    updateAv = true;
});

// end of Auto update part*/

app.on('window-all-closed', () => {
	if (updateAv) {
		autoUpdater.quitAndInstall();
	}
	else
	{
		if (process.platform !== 'darwin') {
			app.quit();
		}
	}
});

app.on('activate', () => {
  if (win === null) {createWindow();}
});
