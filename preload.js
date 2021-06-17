
/* 

    Frozen Tundra's Downloadable Client
    Copyright (C) 2021 Allinol<frozentundra.me>

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

