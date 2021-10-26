import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Depth } from './enums/Depth.js'
import { Roof } from './enums/Roof.js'

export class BuildingState {
	constructor(settings = {}) {
		let self = this; //ew
		
		this.#settings = Object.assign(this.#default, settings);

		this.settings = new Proxy(this.#settings, {
			set(state, key, value, receiver) {
				const oldState = {...state};
				const newValue = value === 'true' || (value === 'false' ? false : value);	//cleans up truthys		
	
				state[key] = newValue;
	
				// notify subscrubers
				self.#subscribers.forEach(callback => callback(key, state, oldState));
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
		x: 50,
		y: 50,
		height: 8, // tiles
		width: 8, // tiles
		hasDoor: true,
		hasWindowGap: true,
		cladding: Cladding.brick,
		decoration: Decoration.pokemonCenter,
		depth: Depth.medium
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