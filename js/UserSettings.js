export class UserSettings {
	constructor(id, state) {
		this.#element = document.getElementById(id);
		this.#state = state;
		this.#setupEvents();
		
		this.#state.addSubscriber(this.onStateChange.bind(this));

	}

	#state;

	#setupEvents() {
		this.#element.addEventListener("change", (event) => {
			if (event.target.id === "buildingCode") {
				return;
			}

			if (!event.isTrusted) {
				return;
			}
		
			this.#state.settings[event.target.name] = event.target.value;

		});

		this.#element.onsubmit = function (event) {
			event.preventDefault();
		}
	}

	#element;

	setSettings(buildingState) {
		this.#element.roof.value = buildingState.roof;
		this.#element.hasDoor.value = buildingState.hasDoor;
		this.#element.hasWindowGap.value = buildingState.hasWindowGap;
		this.#element.cladding.value = buildingState.cladding;
		this.#element.decoration.value = buildingState.decoration;

		this.#setEncodedSettings(buildingState);
	}

	onStateChange(key, state){
		this.#element.key = state;
	}

	getSettings() {

	}

	#getEncodedSettings() {

	}

	#setEncodedSettings(buildingState) {
		document.getElementById("buildingCode").value = JSON.stringify(buildingState);
	}
}