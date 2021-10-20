import { Cladding, Decoration, Depth, Roof } from './enums.js'

export class BuildingGenerator {

	constructor(options = {}) {
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}

	// it takes two tiles to create one floor. 
	// might need a seed too?
	#defaultFeatures = {
		height: 2,
		width: 4,
		hasDoor: true,
		hasWindowGap: true,
		cladding: Cladding.brick,
		decoration: Decoration.pokemonCenter,
		depth: Depth.medium
	}

	#settings = {}

	// perhaps have another object that converts settings into tiles by * 2 everything
	// and sets up the depth calculations too

	// could create a proxy that prints the array everytime something is being written to it, to be like a graphic 
	// representation as it gets built up
	// top left (0,0)
	#tileArray = [[]]

	getSettings() {
		return this.#settings;
	}

	setSettings(options = {}) {
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}

	getTileArray() {
		return this.#tileArray;
	}

	// generate a 2d array of tiles based on rules to construct a building
	// thinking of doing a pass to assign the type of tile to each square then doing a 
	// second pass to do the details, such as which roof edge to use
	generate() {
		// use the enum value to increase the height. since this is a 2D plane, the depth of the building
		// is just added to the height
		const height = this.#settings.height + this.#settings.depth;

		//setup array
		// it takes two tiles to create one floor thus *2
		this.#tileArray = [...Array(height * 2)].map(() => Array(this.#settings.width * 2).fill(0));


		this.#setRoof();
		this.#setCladding();
		this.#setDoor();
		this.#setWindows();
		this.#setDecoration();
	}


	#setRoof() {
		let actualRoof = Roof.hatch;

		// if the depth is small, use only the horizontal roof type
		if (this.#settings.depth === Depth.small) {
			actualRoof = Roof.horizontal;
		}

		// work out something nicer for the tile placeholder
		for (let currenty = 0; currenty < this.#settings.depth * 2; currenty++) {
			this.#tileArray[currenty] = new Array(this.#settings.width * 2)
				.fill(Object.keys(Roof).find(key => Roof[key] === actualRoof) + "Roof")
		}
	}

	#setCladding() {
		// work out something nicer for the tile placeholder
		for (let currenty = this.#settings.depth * 2; currenty < (this.#settings.depth + this.#settings.height) * 2; currenty++) {
			this.#tileArray[currenty] = new Array(this.#settings.width * 2)
				.fill(Object.keys(Cladding).find(key => Cladding[key] === this.#settings.cladding))
		}
	}

	// need to work out better window settings
	#setWindows() {
		// for now, put windows in the top array of height

		if (this.#settings.hasWindowGap) {

			// save existing cladding
			const windowGapXCoords = [Math.round(this.#settings.width * 2 / 2), Math.round(this.#settings.width * 2 / 2) - 1]
			const windowGapCladding = [
				this.#tileArray[this.#settings.depth * 2][windowGapXCoords[0]],
				this.#tileArray[this.#settings.depth * 2][windowGapXCoords[1]]
			];

			// place all windows
			this.#tileArray[(this.#settings.depth * 2)] = new Array(this.#settings.width * 2).fill("window")

			// rewrite over cladding
			// in the future, do this differently
			this.#tileArray[this.#settings.depth * 2][windowGapXCoords[0]] = windowGapCladding[0];
			this.#tileArray[this.#settings.depth * 2][windowGapXCoords[1]] = windowGapCladding[1];

		} else {
			this.#tileArray[(this.#settings.depth * 2)] = new Array(this.#settings.width * 2).fill("window")
		}
	}

	#setDoor() {
		// if no door, don't set door
		if (!this.#settings.hasDoor) {
			return;
		}

		// if building is too narrow for a door, don't set door
		if (this.#settings.width < 4) {
			return;
		}

		// if a seed happens in the future, use it here to work out which position the door is
		// perhaps weigh it closer to the centre 
		// reword this mess of a coordinate finding
		const doorPositionX = Math.round(this.#settings.width * 2 / 2);
		const doorPositionY = this.#settings.height * 2 + this.#settings.depth * 2 - 1;

		// door is double width
		this.#tileArray[doorPositionY][doorPositionX] = "door (0,1)"
		this.#tileArray[doorPositionY - 1][doorPositionX] = "door (0,0)"
		this.#tileArray[doorPositionY][doorPositionX + 1] = "door (1,1)"
		this.#tileArray[doorPositionY - 1][doorPositionX + 1] = "door (1,0)"
	}

	// work out later how to maybe make them not aware of each other?
	// tidy up branching
	#setDecoration() {
		if (!this.#settings.decoration === Decoration.none) {
			return;
		}

		// too small to have a door and a sign, though this statement is also including gym signs...
		if (this.#settings.hasDoor && this.#settings.width < 4) {
			return;
		}

		const signPositionX = Math.round(4 * 2 / 2) - 1;
		const signPositionY = this.#settings.height * 2 + this.#settings.depth * 2 - 1;

		if (this.#settings.decoration === Decoration.pokemonCenter) {
			this.#tileArray[signPositionY][signPositionX] = "pokemonCenter (0,1)"
			this.#tileArray[signPositionY - 1][signPositionX] = "pokemonCenter (0,0)"
			this.#tileArray[signPositionY][signPositionX - 1] = "pokemonCenter (1,1)"
			this.#tileArray[signPositionY - 1][signPositionX - 1] = "pokemonCenter (1,0)"

		}

		if (this.#settings.decoration === Decoration.mart) {

		}

		if (this.#settings.decoration === Decoration.gym) {

		}

		if (this.#settings.decoration === Decoration.doubleGym) {

		}
	}

}