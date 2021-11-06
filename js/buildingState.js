import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Roof } from './enums/Roof.js'
import { Windows } from './enums/Windows.js'
import { BottomRowWindows } from './enums/BottomRowWindows.js'
import { Door } from './enums/Door.js'
import { DoorPosition } from './enums/DoorPosition.js'

export class BuildingState {
	constructor(settings = {}) {
		window.app.buildingState = this;
		let self = this; //ew
		
		this.#settings = Object.assign(this.#default, settings);

		this.settings = new Proxy(this.#settings, {
			set(state, key, value, receiver) {
				const oldState = {...state};
				const newValue = value === 'true' || (value === 'false' ? false : value);	//cleans up truthy true/false		
	
				state[key] = newValue;
	
				// notify subscrubers
				self.#subscribers.forEach(callback => callback(key, state, oldState));
				console.log(state)
				return state;
			}
		})
	}

	#subscribers = []

	addSubscriber(callback) {
		this.#subscribers.push(callback);
	}

	// it takes two tiles to create one floor. 
	// might need a seed too?
	#default = {
		x: 48,
		y: 48,
		height: 8, // tiles
		width: 8, // tiles
		door: Door.one,
		hasWindowGap: false,
		cladding: Cladding.brick,
		decoration: Decoration.pokemonCenter,
		roof: Roof.type2,
		windows: Windows.singleTopRow,
		bottomRowWindows: BottomRowWindows.none,
		doorPosition: DoorPosition.left
	}

	// properly name options/settings to the right thing across the code
	#settings = {}


	getState(){
		return JSON.parse(JSON.stringify(this.#settings));
	}

	setState(settings = {}){
		this.#settings = Object.assign(this.#default, settings);
		
	}
}