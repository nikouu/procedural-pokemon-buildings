import { Cladding, Decoration, Depth, Roof } from './enums.js'

export class BuildingGenerator {

	constructor(options = {}){
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
		decoration: Decoration.none,
		depth: Depth.small
	}

	#settings = {}

	// perhaps have another object that converts settings into tiles by * 2 everything
	// and sets up the depth calculations too

	// top left (0,0)
	#tileArray = [[]]

	getSettings() {
		return this.#settings;
	}

	setSettings(options = {}){
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}

	getTileArray() {
		return this.#tileArray;
	}

	// generate a 2d array of tiles based on rules to construct a building
	// thinking of doing a pass to assign the type of tile to each square then doing a 
	// second pass to do the details, such as which roof edge to use
	generate(){
		// use the enum value to increase the height. since this is a 2D plane, the depth of the building
		// is just added to the height
		const height = this.#settings.height + this.#settings.depth;

		//setup array
		// it takes two tiles to create one floor thus *2
		this.#tileArray = [...Array(height*2)].map(() => Array(this.#settings.width*2).fill(0));

		this.#setDoor();
		this.#setRoof();
	}


	#setRoof() {
		let actualRoof = Roof.hatch;

		// if the depth is small, use only the horizontal roof type
		if (this.#settings.depth === Depth.small) {
			actualRoof = Roof.horizontal;
		}

		// work out something nicer for the tile placeholder
		for (let currenty = 0; currenty < this.#settings.depth*2; currenty++) {
			this.#tileArray[currenty] = new Array(this.#settings.width*2)
				.fill(Object.keys(Roof).find(key => Roof[key] === actualRoof) + "Roof")
		}
	}



	#setDoor() {
		// if no door, don't set door
		if (!this.#settings.hasDoor){
			return;
		}

		// if building is too narrow for a door, don't set door
		if (this.#settings.width < 4) {
			return;
		}

		// if a seed happens in the future, use it here to work out which position the door is
		// perhaps weigh it closer to the centre 
		const doorPositionX = Math.round(this.#settings.width*2 / 2);
		const doorPositionY = this.#settings.height*2 + this.#settings.depth*2 - 1;

		// door is double width
		this.#tileArray[doorPositionY][doorPositionX] = "door"
		this.#tileArray[doorPositionY - 1][doorPositionX] = "door"
		this.#tileArray[doorPositionY][doorPositionX + 1] = "door"
		this.#tileArray[doorPositionY - 1][doorPositionX + 1] = "door"
		
	}

}