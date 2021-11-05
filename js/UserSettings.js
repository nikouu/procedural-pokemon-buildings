export class UserSettings {
	constructor(id, state, settingsEncoder) {
		window.app.userSettings = this;
		this.#element = document.getElementById(id);
		this.#state = state;
		this.#settingsEncoder = settingsEncoder;
		this.#setupEvents();

		this.#state.addSubscriber(this.onStateChange.bind(this));
	}
	#element;
	#state;
	#settingsEncoder;

	#setupEvents() {
		this.#element.addEventListener("change", (event) => {
			if (!event.isTrusted) {
				return;
			}

			if (event.target.name === "cladding" || event.target.name === "decoration" || event.target.name === "roof"|| event.target.name === "windows") {
				this.#state.settings[event.target.name] = +event.target.value;
			} else {
				this.#state.settings[event.target.name] = event.target.value;
			}
		});

		this.#element.buildingCode.addEventListener('input', (event) => {
			this.onEncodedSettingsChange(event.target.value);
		});

		this.#element.addEventListener('submit', (event) => {
			event.preventDefault();
		});
	}

	onStateChange(key, state) {
		this.setSettingsUI();
	}

	setSettingsUI() {
		this.#element.roof.value = this.#state.settings.roof;
		this.#element.hasDoor.value = this.#state.settings.hasDoor;
		this.#element.hasWindowGap.value = this.#state.settings.hasWindowGap;
		this.#element.cladding.value = this.#state.settings.cladding;
		this.#element.decoration.value = this.#state.settings.decoration;
		this.#element.windows.value = this.#state.settings.windows;

		this.#setEncodedSettingsString();
	}

	#setEncodedSettingsString() {
		const encodedSettings = this.#settingsEncoder.encode(this.#state.settings);
		document.getElementById("buildingCode").value = encodedSettings;
	}

	onEncodedSettingsChange(encodedSettings) {
		// solves issue if unicode character is >1 code units 
		if ([...encodedSettings].length != 6) {
			return;
		}
		const newState = this.#settingsEncoder.decode(encodedSettings);
		Object.keys(newState).forEach(key => this.#state.settings[key] = newState[key]);
	}
}