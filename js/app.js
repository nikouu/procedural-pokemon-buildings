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
});