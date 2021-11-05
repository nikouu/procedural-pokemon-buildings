import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Roof } from './enums/Roof.js'
import { Windows } from './enums/Windows.js'
import { BottomRowWindows } from './enums/BottomRowWindows.js'
import { Door } from './enums/Door.js'
import { DoorPosition } from './enums/DoorPosition.js'

export class BuildingGenerator {

	constructor(state) {
		this.#state = state;
		window.app.buildingGenerator = this;
	}

	// could create a proxy that prints the array everytime something is being written to it, to be like a graphic 
	// representation as it gets built up
	// top left (0,0)
	#tileArray = [[]]

	#state = {}

	getState() {
		return this.#state;
	}

	setState(state) {
		this.#state = state;
	}

	getTileArray() {
		return this.#tileArray;
	}

	// generate a 2d array of tiles based on rules to construct a building
	// thinking of doing a pass to assign the type of tile to each square then doing a 
	// second pass to do the details, such as which roof edge to use
	generate() {
		//setup array
		this.#tileArray = [...Array(this.#state.width)].map(() => Array(this.#state.height).fill(0));

		// create the raw tile array
		this.#setRoof();
		this.#setDoor();
		this.#setExterior();
		this.#setWindows();


		this.#setDecoration();

		this.#setBottowRowWindows();

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
		if (this.#state.roof === Roof.type1) {

			this.#writeToArrayIfPossible(0, 0, "SlantedRoof00");
			this.#writeToArrayIfPossible(1, 0, "SlantedRoof01");
			this.#writeToArrayIfPossible(0, 1, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 1, "SlantedRoof04");
			this.#writeToArrayIfPossible(0, 2, "SlantedRoof09");
			this.#writeToArrayIfPossible(1, 2, "SlantedRoof10");

			this.#writeToArrayIfPossible(this.#state.width - 1, 0, "SlantedRoof03");
			this.#writeToArrayIfPossible(this.#state.width - 2, 0, "SlantedRoof02");
			this.#writeToArrayIfPossible(this.#state.width - 1, 1, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 1, "SlantedRoof07");
			this.#writeToArrayIfPossible(this.#state.width - 1, 2, "SlantedRoof12");
			this.#writeToArrayIfPossible(this.#state.width - 2, 2, "SlantedRoof11");

			const horizontalRoofWidthInTiles = this.#state.width - 2;

			for (let i = 2; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HorizontalRoof01");
				this.#writeToArrayIfPossible(i, 1, "HorizontalRoof02");
			}
		} else if (this.#state.roof === Roof.type2) {
			this.#writeToArrayIfPossible(0, 0, "HatchedRoof02");
			this.#writeToArrayIfPossible(0, 1, "HatchedRoof05");
			this.#writeToArrayIfPossible(0, 2, "HatchedRoof05");
			this.#writeToArrayIfPossible(0, 3, "OuterBuilding05");

			this.#writeToArrayIfPossible(this.#state.width - 1, 0, "HatchedRoof03");
			this.#writeToArrayIfPossible(this.#state.width - 1, 1, "HatchedRoof04");
			this.#writeToArrayIfPossible(this.#state.width - 1, 2, "HatchedRoof04");
			this.#writeToArrayIfPossible(this.#state.width - 1, 3, "OuterBuilding06");

			const horizontalRoofWidthInTiles = this.#state.width - 1;

			for (let i = 1; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HatchedRoof00");
				this.#writeToArrayIfPossible(i, 1, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 2, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 3, "HorizontalRoof02"); // this gets resused here too!
			}
		} else if (this.#state.roof === Roof.type3) {
			this.#writeToArrayIfPossible(0, 0, "SlantedRoof00");
			this.#writeToArrayIfPossible(1, 0, "SlantedRoof01");
			this.#writeToArrayIfPossible(0, 1, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 1, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 2, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 2, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 3, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 3, "SlantedRoof04");
			this.#writeToArrayIfPossible(0, 4, "SlantedRoof09");
			this.#writeToArrayIfPossible(1, 4, "SlantedRoof10");

			this.#writeToArrayIfPossible(this.#state.width - 1, 0, "SlantedRoof03");
			this.#writeToArrayIfPossible(this.#state.width - 2, 0, "SlantedRoof02");
			this.#writeToArrayIfPossible(this.#state.width - 1, 1, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 1, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 2, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 2, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 3, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 3, "SlantedRoof07");
			this.#writeToArrayIfPossible(this.#state.width - 1, 4, "SlantedRoof12");
			this.#writeToArrayIfPossible(this.#state.width - 2, 4, "SlantedRoof11");

			const horizontalRoofWidthInTiles = this.#state.width - 2;
			for (let i = 2; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HatchedRoof00");
				this.#writeToArrayIfPossible(i, 1, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 2, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 3, "HorizontalRoof02");
			}

		} else if (this.#state.roof === Roof.type4) {
			this.#writeToArrayIfPossible(0, 0, "SlantedRoof00");
			this.#writeToArrayIfPossible(1, 0, "SlantedRoof01");
			this.#writeToArrayIfPossible(0, 1, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 1, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 2, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 2, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 3, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 3, "SlantedRoof04");
			this.#writeToArrayIfPossible(0, 4, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 4, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 5, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 5, "SlantedRoof16");
			this.#writeToArrayIfPossible(0, 6, "SlantedRoof06");
			this.#writeToArrayIfPossible(1, 6, "SlantedRoof04");
			this.#writeToArrayIfPossible(0, 7, "SlantedRoof09");
			this.#writeToArrayIfPossible(1, 7, "SlantedRoof10");


			this.#writeToArrayIfPossible(this.#state.width - 1, 0, "SlantedRoof03");
			this.#writeToArrayIfPossible(this.#state.width - 2, 0, "SlantedRoof02");
			this.#writeToArrayIfPossible(this.#state.width - 1, 1, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 1, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 2, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 2, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 3, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 3, "SlantedRoof07");
			this.#writeToArrayIfPossible(this.#state.width - 1, 4, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 4, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 5, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 5, "SlantedRoof16");
			this.#writeToArrayIfPossible(this.#state.width - 1, 6, "SlantedRoof08");
			this.#writeToArrayIfPossible(this.#state.width - 2, 6, "SlantedRoof07");
			this.#writeToArrayIfPossible(this.#state.width - 1, 7, "SlantedRoof12");
			this.#writeToArrayIfPossible(this.#state.width - 2, 7, "SlantedRoof11");

			const horizontalRoofWidthInTiles = this.#state.width - 2;
			for (let i = 2; i < horizontalRoofWidthInTiles; i++) {
				this.#writeToArrayIfPossible(i, 0, "HatchedRoof00");
				this.#writeToArrayIfPossible(i, 1, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 2, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 3, "HorizontalRoof02");
				this.#writeToArrayIfPossible(i, 4, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 5, "HatchedRoof01");
				this.#writeToArrayIfPossible(i, 6, "HorizontalRoof02");
			}
		}
	}

	#setExterior() {
		this.#writeToArrayIfPossible(0, this.#state.height - 1, "OuterBuilding00");
		this.#writeToArrayIfPossible(this.#state.width - 1, this.#state.height - 1, "OuterBuilding02");

		const bottomOfRoof = this.#calculateDepth(this.#state.roof);

		for (let i = bottomOfRoof; i < this.#state.height - 1; i++) {
			this.#writeToArrayIfPossible(0, i, "OuterBuilding03");
			this.#writeToArrayIfPossible(this.#state.width - 1, i, "OuterBuilding04");
		}

		for (let i = 1; i < this.#state.width - 1; i++) {
			this.#writeToArrayIfPossible(i, this.#state.height - 1, "OuterBuilding01");
		}
	}

	#setCladding() {
		const bottomOfRoof = this.#calculateDepth(this.#state.roof);

		for (let x = 1; x < this.#state.width - 1; x++) {
			for (let y = bottomOfRoof; y < this.#state.height - 1; y++) {
				if (this.#state.cladding === Cladding.wood) {
					this.#writeToArrayIfPossible(x, y, "WoodCladding");
				} else if (this.#state.cladding === Cladding.brick) {
					this.#writeToArrayIfPossible(x, y, "BrickCladding");
				}
			}
		}
	}

	// need to work out better window settings
	#setWindows() {
		let bottomOfRoof = this.#calculateDepth(this.#state.roof);

		if (this.#state.roof === Roof.type4) {
			bottomOfRoof++;
		}

		if (this.#state.windows === Windows.noWindows) {
			return;
		} else if (this.#state.windows === Windows.singleTopRow) {
			for (let x = 1; x < this.#state.width - 1; x++) {
				this.#writeToArrayIfPossible(x, bottomOfRoof, "RegularWindow");
			}
		} else if (this.#state.windows === Windows.filledRows) {
			for (let x = 1; x < this.#state.width - 1; x++) {
				for (let y = bottomOfRoof; y < this.#state.height - 2; y += 2) {
					this.#writeToArrayIfPossible(x, y, "RegularWindow");
				}
			}
		}
	}

	#setBottowRowWindows() {
		if (this.#state.bottomRowWindows === BottomRowWindows.none) {
			return;
		} else if (this.#state.bottomRowWindows === BottomRowWindows.row) {
			for (let x = 1; x < this.#state.width - 1; x++) {
				this.#writeToArrayIfPossible(x, this.#state.height - 2, "RegularWindow");
			}
		} else if (this.#state.bottomRowWindows === BottomRowWindows.door && this.#state.hasDoor) {
			// todo: tidy this up
			const topRightDoorX = this.#tileArray.findIndex(row => row.includes("Door03"));
			this.#writeToArrayIfPossible(topRightDoorX + 1, this.#state.height - 2, "RegularWindow");
			this.#writeToArrayIfPossible(topRightDoorX + 2, this.#state.height - 2, "RegularWindow");
		}
	}

	#setDoor() {
		const bottomOfRoof = this.#calculateDepth(this.#state.roof);

		// if no door, don't set door
		if (!this.#state.door === Door.none) {
			return;
		}

		// if building is too narrow for a door, don't set door
		if (this.#state.width < 4) {
			return;
		}

		// not tall enough for a door
		if (this.#state.height <= bottomOfRoof + 2) {
			return;
		}

		// the special two door case
		if (this.#state.door === Door.two) {

			return;
		}

		if (this.#state.door === Door.one) {
			let topLeftDoorX = 0;
			const availableWidth = this.#state.width -2; // we dont want to include the outside of the building as space to put a door

			if (availableWidth < 5){
				topLeftDoorX = Math.round((this.#state.width - 2) / 2);
			} else if (this.#state.doorPosition === DoorPosition.farLeft) {
				topLeftDoorX = 2;
			} else if (this.#state.doorPosition === DoorPosition.left) {
				topLeftDoorX = Math.round(availableWidth * (1 / 3));
			} else if (this.#state.doorPosition === DoorPosition.centre) {
				topLeftDoorX = Math.round((availableWidth - 1) / 2);
			} else if (this.#state.doorPosition === DoorPosition.right) {
				topLeftDoorX = Math.round(availableWidth * (2 / 3));
			} else if (this.#state.doorPosition === DoorPosition.farRight) {
				topLeftDoorX = availableWidth - 2;
			}

			this.#writeToArrayIfPossible(topLeftDoorX, this.#state.height - 2, "Door00");
			this.#writeToArrayIfPossible(topLeftDoorX + 1, this.#state.height - 2, "Door01");
			this.#writeToArrayIfPossible(topLeftDoorX, this.#state.height - 1, "Door02");
			this.#writeToArrayIfPossible(topLeftDoorX + 1, this.#state.height - 1, "Door03");
		}	
	}

	// work out later how to maybe make them not aware of each other?
	// tidy up branching
	#setDecoration() {
		const bottomOfRoof = this.#calculateDepth(this.#state.roof);

		if (this.#state.decoration === Decoration.none) {
			return;
		}

		// too small (width) to have a door and a sign, though this statement is also including gym signs...
		if (this.#state.door !== Door.none && this.#state.width < 8) {
			return;
		}

		// too small (height)
		if ((this.#state.height - bottomOfRoof) < 4) {
			return;
		}

		// width restriction on double gym
		if (this.#state.decoration === Decoration.doubleGym && this.#state.width < 16) {
			return;
		}

		const signXValue = Math.round((this.#state.width - 2) * (1 / 2));
		if (this.#state.decoration === Decoration.pokemonCenter) {

			this.#writeToArrayIfPossible(signXValue + 1, this.#state.height - 2, "PokemonCenterLeft");
			this.#writeToArrayIfPossible(signXValue + 2, this.#state.height - 2, "PokemonCenterRight");
			this.#writeToArrayIfPossible(signXValue + 1, this.#state.height - 1, "DecorationSignBase", true);
			this.#writeToArrayIfPossible(signXValue + 2, this.#state.height - 1, "DecorationSignBase", true);
		}

		if (this.#state.decoration === Decoration.pokemart) {
			this.#writeToArrayIfPossible(signXValue + 1, this.#state.height - 2, "PokeMartLeft");
			this.#writeToArrayIfPossible(signXValue + 2, this.#state.height - 2, "PokeMartRight");
			this.#writeToArrayIfPossible(signXValue + 1, this.#state.height - 1, "DecorationSignBase", true);
			this.#writeToArrayIfPossible(signXValue + 2, this.#state.height - 1, "DecorationSignBase", true);
		}

		if (this.#state.decoration === Decoration.gym) {

			let cladding;
			if (this.#state.cladding === Cladding.wood) {
				cladding = "WoodCladding";
			} else if (this.#state.cladding === Cladding.brick) {
				cladding = "BrickCladding";
			}

			const centreX = Math.round(this.#state.width / 2) - 1;

			this.#writeToArrayIfPossible(centreX - 1, bottomOfRoof, cladding, true);
			this.#writeToArrayIfPossible(centreX, bottomOfRoof, "GymLeft", true);
			this.#writeToArrayIfPossible(centreX + 1, bottomOfRoof, "GymRight", true);
			this.#writeToArrayIfPossible(centreX + 2, bottomOfRoof, cladding, true);

		}

		if (this.#state.decoration === Decoration.doubleGym) {
			let cladding;
			if (this.#state.cladding === Cladding.wood) {
				cladding = "WoodCladding";
			} else if (this.#state.cladding === Cladding.brick) {
				cladding = "BrickCladding";
			}

			const centreX = Math.round(this.#state.width / 2) - 1;

			this.#writeToArrayIfPossible(centreX - 3, bottomOfRoof, cladding, true);
			this.#writeToArrayIfPossible(centreX - 2, bottomOfRoof, "GymLeft", true);
			this.#writeToArrayIfPossible(centreX - 1, bottomOfRoof, "GymRight", true);
			this.#writeToArrayIfPossible(centreX, bottomOfRoof, cladding, true);

			this.#writeToArrayIfPossible(centreX + 1, bottomOfRoof, cladding, true);
			this.#writeToArrayIfPossible(centreX + 2, bottomOfRoof, "GymLeft", true);
			this.#writeToArrayIfPossible(centreX + 3, bottomOfRoof, "GymRight", true);
			this.#writeToArrayIfPossible(centreX + 4, bottomOfRoof, cladding, true);
		}
	}

	#calculateDepth(roofType) {
		switch (roofType) {
			case Roof.type1:
				return 1
			case Roof.type2:
				return 4;
			case Roof.type3:
				return 4;
			case Roof.type4:
				return 7;
		}
	}
}