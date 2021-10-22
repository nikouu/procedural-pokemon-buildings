import { Canvas } from './canvas.js'
import { BuildingGenerator } from './buildingGenerator.js'

document.addEventListener("DOMContentLoaded", () => {
	const canvas = new Canvas();
	canvas.loadSprites().then();
	window.buildingGenerator = new BuildingGenerator();
	window.canvas = canvas;
});
