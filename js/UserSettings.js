export class UserSettings {
	constructor(id, state) {
		window.app.userSettings = this;
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

	setSettings() {
		this.#element.roof.value = this.#state.settings.roof;
		this.#element.hasDoor.value = this.#state.settings.hasDoor;
		this.#element.hasWindowGap.value = this.#state.settings.hasWindowGap;
		this.#element.cladding.value = this.#state.settings.cladding;
		this.#element.decoration.value = this.#state.settings.decoration;

		this.#setEncodedSettings();
	}

	onStateChange(key, state){
		this.setSettings();
	}

	#setEncodedSettings(buildingState) {
		document.getElementById("buildingCode").value = JSON.stringify(this.#state.settings);
	}
}