import { Canvas } from './canvas.js'
import { BuildingGenerator } from './buildingGenerator.js'

// https://www.ilearnjavascript.com/plainjs-fadein-fadeout/
const fadeOut = (el, smooth = true, displayStyle = 'none') => {
	if (smooth) {
		let opacity = el.style.opacity;
		let request;

		const animation = () => {
			el.style.opacity = opacity -= 0.04;
			if (opacity <= 0) {
				opacity = 0;
				el.style.display = displayStyle;
				cancelAnimationFrame(request);
			}
		};

		const rAf = () => {
			request = requestAnimationFrame(rAf);
			animation();
		};
		rAf();

	} else {
		el.style.opacity = 0;
	}
};

window.fadeOut = fadeOut;

/*
	Format as a concatenation of:
	x position padded to 4 difits
	y position 
	width 
	height 
	roof 1 or 0
	door 1 or 0
	window gap 1 or 0
	cladding as 1 or 0
	decoration as 0-4
*/

function encodeSettings() {
	const xPosition = window.canvas.getX().toString().padStart(4, 0);
	const yPosition = window.canvas.getY().toString().padStart(4, 0);
	const width = window.canvas.getWidth().toString().padStart(4, 0); 
	const height = window.canvas.getHeight().toString().padStart(4, 0); 

	const settingsForm = document.getElementById("settings");

	const roof = settingsForm.roof.value;
	const hasDoor = settingsForm.hasDoor.value;
	const hasWindowGap = settingsForm.hasWindowGap.value;
	const cladding = settingsForm.cladding.value;
	const decoration = settingsForm.decoration.value;

	const encodedSettings = `${xPosition}${yPosition}${width}${height}${roof}${hasDoor}${hasWindowGap}${cladding}${decoration}`

	document.getElementById("buildingCode").value = encodedSettings;
}

function decodeSettings() {

}

document.addEventListener("DOMContentLoaded", () => {
	const canvas = new Canvas();
	canvas.loadSprites().then(() => {
		// weird interaction where the gif will go behind other layers when doing this
		// solved by individually fading the elements
		//fadeOut(document.getElementById('loading'));
		fadeOut(document.getElementsByClassName("overlay")[0])
		fadeOut(document.getElementsByTagName("img")[0])
	});
	window.buildingGenerator = new BuildingGenerator();
	window.canvas = canvas;

	const settingsForm = document.getElementById("settings");

	settingsForm.addEventListener("change", () => {
		encodeSettings();
	});

	const buildingCodeInput = document.getElementById("buildingCode");

	buildingCodeInput.addEventListener("change", (event) => {
		console.log("update settings")

	});
});