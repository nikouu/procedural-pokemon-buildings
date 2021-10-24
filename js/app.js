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
	x position padded to 4 digits
	y position 
	width 
	height 
	roof 1 or 0
	door 1 or 0
	window gap 1 or 0
	cladding as 1 or 0
	decoration as 0-4
*/

// perhaps use this to shorten https://stackoverflow.com/a/25963279
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
	const encodedSettings = document.getElementById("buildingCode").value;

	const xPosition =  parseInt(encodedSettings.slice(0, 4));
	const yPosition =  parseInt(encodedSettings.slice(4, 8));
	const width =  parseInt(encodedSettings.slice(8, 12));
	const height =  parseInt(encodedSettings.slice(12, 16));

	const roof = encodedSettings.slice(16, 17);
	const hasDoor = encodedSettings.slice(17, 18);
	const hasWindowGap = encodedSettings.slice(18, 19);
	const cladding = encodedSettings.slice(19, 20);
	const decoration = encodedSettings.slice(20, 21);

	const settingsForm = document.getElementById("settings");

	settingsForm.roof.value = roof;
	settingsForm.hasDoor.value = hasDoor;
	settingsForm.hasWindowGap.value = hasWindowGap;
	settingsForm.cladding.value = cladding;
	settingsForm.decoration.value = decoration;

	var options = {
		width,
		height,
		hasDoor: !!+hasDoor,
		hasWindowGap: !!+hasWindowGap,
		cladding: +cladding,
		decoration: +decoration,
		depth: +roof // sort out roof/depth issuewith naming and usage
	}

	window.canvas.updateBuildingSettings(+xPosition, +yPosition, options);

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

	encodeSettings();

	const settingsForm = document.getElementById("settings");

	settingsForm.addEventListener("change", (event) => {
		if (event.target.id === "buildingCode") {
			return;
		}

		if (!event.isTrusted) {
			return;
		}

		encodeSettings();
	});

	settingsForm.onsubmit = function(event){
		event.preventDefault();
	}

	const buildingCodeInput = document.getElementById("buildingCode");

	buildingCodeInput.addEventListener("change", (event) => {
		console.log("update settings")
		decodeSettings();
	});
	
});