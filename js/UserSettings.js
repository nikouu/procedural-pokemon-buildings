export class UserSettings {
	constructor(id, state, stringEncoder) {
		window.app.userSettings = this;
		this.#element = document.getElementById(id);
		this.#state = state;
		this.#stringEncoder = stringEncoder;
		this.#setupEvents();
		
		this.#state.addSubscriber(this.onStateChange.bind(this));
	}
	#element;
	#state;
	#stringEncoder;

	#setupEvents() {
		this.#element.addEventListener("change", (event) => {
			if (!event.isTrusted) {
				return;
			}
			
			this.#state.settings[event.target.name] = event.target.value;
		});

		this.#element.buildingCode.addEventListener('input', (event) => {		
			this.onEncodedSettingsChange(event.target.value);		
		});

		this.#element.onsubmit = function (event) {
			event.preventDefault();
		}
	}

	onStateChange(key, state){
		this.setSettingsUI();
	}

	setSettingsUI() {
		this.#element.roof.value = this.#state.settings.roof;
		this.#element.hasDoor.value = this.#state.settings.hasDoor;
		this.#element.hasWindowGap.value = this.#state.settings.hasWindowGap;
		this.#element.cladding.value = this.#state.settings.cladding;
		this.#element.decoration.value = this.#state.settings.decoration;

		this.#setEncodedSettingsString();
	}

	#setEncodedSettingsString() {
		const encodedSettings = this.#stringEncoder.encodeFun(this.#state.settings);	
		document.getElementById("buildingCode").value = encodedSettings;
	}

	onEncodedSettingsChange(encodedSettings){
		// solves issue if unicode character is >1 code units 
		if ([...encodedSettings].length != 5){
			return;
		}
		const newState = this.#stringEncoder.decodeFun(encodedSettings);
		Object.keys(newState).forEach(key => this.#state.settings[key] = newState[key]);
	}
}