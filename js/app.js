import { Canvas } from './canvas.js'
import { BuildingGenerator } from './buildingGenerator.js'

document.addEventListener("DOMContentLoaded", () => {
	let canvas = new Canvas();
	window.buildingGenerator = new BuildingGenerator();
});