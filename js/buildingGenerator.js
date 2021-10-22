import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Depth } from './enums/Depth.js'
import { Roof } from './enums/Roof.js'

export class BuildingGenerator {

	constructor(options = {}) {
		this.#settings = Object.assign(this.#defaultFeatures, options);
	}

	// it takes two tiles to create one floor. 
	// might need a seed too?
	#defaultFeatures = {
		height: 2, // tiles
		width: 4, // tiles
		hasDoor: true,
		hasWindowGap: true,
		cladding: Cladding.brick,
		decoration: Decoration.pokemonCenter,
		depth: Depth.small
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

		//setup array
		this.#tileArray = [...Array(this.#settings.width)].map(() => Array(this.#settings.height).fill(0));


		// create the raw tile array
		this.#setRoof();
		//this.#setCladding();
		//this.#setDoor();
		//this.#setWindows();
		//this.#setDecoration();

		return this.#tileArray;
	}

	#writeToArrayIfPossible(x, y, value) {

		if (typeof this.#tileArray[x] == 'undefined' || x >= this.#tileArray.length) {
			return;
		}

		if (typeof this.#tileArray[x][y] == 'undefined' || y >= this.#tileArray[x].length) {
			return
		}
		this.#tileArray[x][y] = value;
	}

	#setRoof() {
		if (this.#settings.depth === Depth.small) {

			this.#writeToArrayIfPossible(0, 0, "SlantedRoof00");
			this.#writeToArrayIfPossible(1, 0, "SlantedRoof01");
			this.#writeToArrayIfPossible(0, 1, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 1, "SlantedRoof04");
			this.#writeToArrayIfPossible(0, 2, "SlantedRoof09");
			this.#writeToArrayIfPossible(1, 2, "SlantedRoof10");

			this.#writeToArrayIfPossible(this.#settings.width - 1, 0, "SlantedRoof03");
			this.#writeToArrayIfPossible(this.#settings.width - 2, 0, "SlantedRoof02");
			this.#writeToArrayIfPossible(this.#settings.width - 1, 1, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#settings.width - 2, 1, "SlantedRoof07");
			this.#writeToArrayIfPossible(this.#settings.width - 1, 2, "SlantedRoof12");
			this.#writeToArrayIfPossible(this.#settings.width - 2, 2, "SlantedRoof11");

			var horizontalRoofWidthInTiles = this.#settings.width - 2;

			for (let i = 2; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HorizontalRoof01");
				this.#writeToArrayIfPossible(i, 1, "HorizontalRoof02");
			}
		} else if (this.#settings.depth === Depth.medium) {
			this.#writeToArrayIfPossible(0, 0, "HatchedRoof02");
			this.#writeToArrayIfPossible(0, 1, "HatchedRoof05");
			this.#writeToArrayIfPossible(0, 2, "HatchedRoof05");
			this.#writeToArrayIfPossible(0, 3, "OuterBuilding05");

			this.#writeToArrayIfPossible(this.#settings.width - 1, 0, "HatchedRoof03");
			this.#writeToArrayIfPossible(this.#settings.width - 1, 1, "HatchedRoof04");
			this.#writeToArrayIfPossible(this.#settings.width - 1, 2, "HatchedRoof04");
			this.#writeToArrayIfPossible(this.#settings.width - 1, 3, "OuterBuilding06");

			var horizontalRoofWidthInTiles = this.#settings.width - 1;

			for (let i = 1; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HatchedRoof00");
				this.#writeToArrayIfPossible(i, 1, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 2, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 3, "HorizontalRoof02"); // this gets resused here too!
			}

		}
	}

	#setCladding() {
		// work out something nicer for the tile placeholder
		for (let currenty = this.#settings.depth; currenty < this.#settings.height; currenty++) {
			this.#tileArray[currenty] = new Array(this.#settings.width)
				.fill(Object.keys(Cladding).find(key => Cladding[key] === this.#settings.cladding))
		}
	}

	// need to work out better window settings
	#setWindows() {
		// for now, put windows in the top array of height

		if (this.#settings.hasWindowGap) {

			// save existing cladding
			const windowGapXCoords = [Math.round(this.#settings.width / 2), Math.round(this.#settings.width / 2) - 1]
			const windowGapCladding = [
				this.#tileArray[this.#settings.depth][windowGapXCoords[0]],
				this.#tileArray[this.#settings.depth][windowGapXCoords[1]]
			];

			// place all windows
			this.#tileArray[(this.#settings.depth)] = new Array(this.#settings.width).fill("window")

			// rewrite over cladding
			// in the future, do this differently
			this.#tileArray[this.#settings.depth][windowGapXCoords[0]] = windowGapCladding[0];
			this.#tileArray[this.#settings.depth][windowGapXCoords[1]] = windowGapCladding[1];

		} else {
			this.#tileArray[(this.#settings.depth)] = new Array(this.#settings.width).fill("window")
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
		const doorPositionX = Math.round(this.#settings.width / 2);
		const doorPositionY = this.#settings.height + this.#settings.depth - 1;

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

		const signPositionX = Math.round(4 / 2) - 1;
		const signPositionY = this.#settings.height + this.#settings.depth - 1;

		if (this.#settings.decoration === Decoration.pokemonCenter) {
			this.#tileArray[signPositionY][signPositionX] = "pokemonCenter (0,1)"
			this.#tileArray[signPositionY - 1][signPositionX] = "pokemonCenter (0,0)"
			this.#tileArray[signPositionY][signPositionX - 1] = "pokemonCenter (1,1)"
			this.#tileArray[signPositionY - 1][signPositionX - 1] = "pokemonCenter (1,0)"

		}

		if (this.#settings.decoration === Decoration.mart) {
			this.#tileArray[signPositionY][signPositionX] = "mart (0,1)"
			this.#tileArray[signPositionY - 1][signPositionX] = "mart (0,0)"
			this.#tileArray[signPositionY][signPositionX - 1] = "mart (1,1)"
			this.#tileArray[signPositionY - 1][signPositionX - 1] = "mart (1,0)"

		}

		if (this.#settings.decoration === Decoration.gym) {

		}

		if (this.#settings.decoration === Decoration.doubleGym) {

		}
	}

}