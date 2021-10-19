import { Cladding, Decoration, Depth } from './enums.js'

export class BuildingGenerator {

	constructor(options = {}){
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}

	#defaultFeatures = {
		height: 1,
		width: 4,
		hasDoor: true,
		hasWindowGap: true,
		cladding: Cladding.brick,
		decoration: Decoration.none,
		depth: Depth.small
	}

	#settings = {}

	getSettings() {
		return this.#settings;
	}

	setSettings(options = {}){
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}
}