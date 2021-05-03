const {ipcRenderer} = require('electron');
let checkExist;

ipcRenderer.on('muted', (event, data) => {
	localStorage.muted = data;
});

ipcRenderer.on('theme', (event, data) => {
	localStorage.theme = data;
	const game = document.getElementById('game');
	game.setDarkMode()
});

ipcRenderer.on('reload', async (event) => {
	const game = document.getElementById('game');
	game.style.display = "none"
	await sleep(3000)
	game.style.display = "block"
	
});

window.addEventListener('load', (event) => {
	checkExist = setInterval(() => {
		if(game.setDarkMode) { 
			clearInterval(checkExist)
		    load()
		}
	}, 100);
});
function load(){
	if(localStorage.muted == undefined){
		localStorage.muted = false;
		localStorage.theme = 'dark';
	}
	ipcRenderer.sendSync('load:data', localStorage.muted, localStorage.theme)
}
function loadSettings() { 
	const game = document.getElementById('game');
	if(localStorage.theme === 'dark'){
		game.setDarkMode()
	}
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

