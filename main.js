const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem
} = require('electron')
const path = require('path')
const express = require('express');
const server = express();

let pluginName
switch (process.platform) {
	case 'win32':
		switch(process.arch){
			case 'ia32':
				pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
				break
			case 'x64':
				pluginName = 'flash/pepflashplayer64_32_0_0_303.dll'
				break
		}
		break
	case 'darwin':
		pluginName = 'flash/PepperFlashPlayer.plugin'
		break
	case 'linux':
		pluginName = 'flash/libpepflashplayer.so'
		break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

let win = null
app.on('ready', () => {
    makeMenu()
    var win = new BrowserWindow({
        webPreferences: {
            plugins: true
        }
    })
    win.loadURL('https://play.coastalfreeze.net/client');
    Menu.setApplicationMenu(fsmenu);
})

function makeMenu() { // credits to random
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
                            title: "About Coastal Freeze DLC",
                            message: aboutMessage
                        });
                    }
                },
                {
                    label: 'Fullscreen (Toggle)',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        let fsbool = (win.isFullScreen() ? false : true);
                        win.setFullScreen(fsbool);
                    }
                },
                {
                    label: 'Mute Audio (Toggle)',
                    click: () => {
                        let ambool = (win.webContents.audioMuted ? false : true);
                        win.webContents.audioMuted = ambool;
                    }
                },
                {
                    label: 'Log Out',
                    click: () => {
                        clearCache();
                        win.loadURL("https://play.coastalfreeze.net/");
                    }
                }
            ]
        }));
    }
    else {
        fsmenu.append(new MenuItem({
            label: 'About',
            click: () => {
                dialog.showMessageBox({
                    type: "info",
                    buttons: ["Ok"],
                    title: "About Coastal Freeze DLC",
                    message: aboutMessage
                });
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Fullscreen (Toggle)',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
                let fsbool = (win.isFullScreen() ? false : true);
                win.setFullScreen(fsbool);
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Mute Audio (Toggle)',
            click: () => {
                let ambool = (win.webContents.audioMuted ? false : true);
                win.webContents.audioMuted = ambool;
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Log Out',
            click: () => {
                clearCache();
                win.loadURL("https://play.coastalfreeze.net/");
            }
        }));
    }
}

app.on('window-all-closed', () => {
    app.quit();
});