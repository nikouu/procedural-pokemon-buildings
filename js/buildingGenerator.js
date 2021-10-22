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
		decoration: Decoration.pokemart,
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
		this.#setDoor();
		this.#setExterior();
		this.#setWindows();
		
		this.#setDecoration();

		this.#setCladding();
		return this.#tileArray;
	}

	#writeToArrayIfPossible(x, y, value, canOverwrite = false) {

		if (typeof this.#tileArray[x] == 'undefined' || x >= this.#tileArray.length) {
			return;
		}

		if (typeof this.#tileArray[x][y] == 'undefined' || y >= this.#tileArray[x].length) {
			return
		}

		if (this.#tileArray[x][y] !== 0 && canOverwrite) {
			this.#tileArray[x][y] = value;
		} else if (this.#tileArray[x][y] === 0) {
			this.#tileArray[x][y] = value;
		}
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

	#setExterior() {
		this.#writeToArrayIfPossible(0, this.#settings.height - 1, "OuterBuilding00");
		this.#writeToArrayIfPossible(this.#settings.width - 1, this.#settings.height - 1, "OuterBuilding02");

		const bottomOfRoof = this.#settings.depth;

		for (let i = bottomOfRoof; i < this.#settings.height - 1; i++) {
			this.#writeToArrayIfPossible(0, i, "OuterBuilding03");
			this.#writeToArrayIfPossible(this.#settings.width - 1, i, "OuterBuilding04");
		}

		for (let i = 1; i < this.#settings.width - 1; i++) {
			this.#writeToArrayIfPossible(i, this.#settings.height - 1, "OuterBuilding01");
		}
	}

	#setCladding() {
		for (let x = 1; x < this.#settings.width - 1; x++) {
			for (let y = this.#settings.depth; y < this.#settings.height - 1; y++) {
				if (this.#settings.cladding == Cladding.wood) {
					this.#writeToArrayIfPossible(x, y, "WoodCladding");
				} else if (this.#settings.cladding == Cladding.brick) {
					this.#writeToArrayIfPossible(x, y, "BrickCladding");
				}

			}
		}
	}

	// need to work out better window settings
	#setWindows() {
		for (let x = 1; x < this.#settings.width - 1; x++) {
			this.#writeToArrayIfPossible(x, this.#settings.depth, "RegularWindow");
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

		// not tall enough for a door
		if (this.#settings.height <= this.#settings.depth + 2) {
			return;
		}

		// if a seed happens in the future, use it here to work out which position the door is
		// perhaps weigh it closer to the centre, but not true centre
		let doorXValue = Math.round((this.#settings.width - 2) * (1 / 2));
		if (this.#settings.width == 4) {
			doorXValue = 2;
		}

		this.#writeToArrayIfPossible(doorXValue - 1, this.#settings.height - 2, "Door00");
		this.#writeToArrayIfPossible(doorXValue, this.#settings.height - 2, "Door01");
		this.#writeToArrayIfPossible(doorXValue - 1, this.#settings.height - 1, "Door02");
		this.#writeToArrayIfPossible(doorXValue, this.#settings.height - 1, "Door03");
	}

	// work out later how to maybe make them not aware of each other?
	// tidy up branching
	#setDecoration() {
		if (!this.#settings.decoration === Decoration.none) {
			return;
		}

		// too small (width) to have a door and a sign, though this statement is also including gym signs...
		if (this.#settings.hasDoor && this.#settings.width < 8) {
			return;
		}

		// too small (height)
		if ((this.#settings.height - this.#settings.depth) < 4) {
			return;
		}

		let signXValue = Math.round((this.#settings.width - 2) * (1 / 2));
		if (this.#settings.decoration === Decoration.pokemonCenter) {
			
			this.#writeToArrayIfPossible(signXValue + 1, this.#settings.height - 2, "PokemonCenterLeft");
			this.#writeToArrayIfPossible(signXValue + 2, this.#settings.height - 2, "PokemonCenterRight");
			this.#writeToArrayIfPossible(signXValue + 1,  this.#settings.height - 1, "DecorationSignBase", true);
			this.#writeToArrayIfPossible(signXValue + 2, this.#settings.height - 1, "DecorationSignBase", true);
		}

		if (this.#settings.decoration === Decoration.pokemart) {
			this.#writeToArrayIfPossible(signXValue + 1, this.#settings.height - 2, "PokeMartLeft");
			this.#writeToArrayIfPossible(signXValue + 2, this.#settings.height - 2, "PokeMartRight");
			this.#writeToArrayIfPossible(signXValue + 1,  this.#settings.height - 1, "DecorationSignBase", true);
			this.#writeToArrayIfPossible(signXValue + 2, this.#settings.height - 1, "DecorationSignBase", true);
		}

		if (this.#settings.decoration === Decoration.gym) {

		}

		if (this.#settings.decoration === Decoration.doubleGym) {

		}
	}

}