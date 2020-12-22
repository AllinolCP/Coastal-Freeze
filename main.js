const {app, BrowserWindow} = require('electron')
  const path = require('path')
app.commandLine.appendSwitch('no-sandbox');
const express = require('express');
const server = express();
  
  // Specify flash path, supposing it is placed in the same directory with main.js.
let pluginName
switch (process.platform) {
  case 'win32':
	pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
	break
  case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'flash/libpepflashplayer.so'
    break
}
console.log(process.arch)
console.log(process.platform)


app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

let mainWindow = null
  app.on('ready', () => {
    let win = new BrowserWindow({
      webPreferences: {
        plugins: true
      }
    })
    server.use('/', express.static(__dirname));
	win.setMenuBarVisibility(false)
	const infos = server.listen(0, 'localhost', () => win.loadURL("https://play.coastalfreeze.net/client"));
    // Something else
  })


app.on('window-all-closed', () => {
  app.quit();
});	