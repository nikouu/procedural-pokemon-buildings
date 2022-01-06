import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Roof } from './enums/Roof.js'
import { Windows } from './enums/Windows.js'
import { BottomRowWindows } from './enums/BottomRowWindows.js'
import { Door } from './enums/Door.js'
import { DoorPosition } from './enums/DoorPosition.js'

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

			if (event.target.name === "cladding"
				|| event.target.name === "decoration"
				|| event.target.name === "roof"
				|| event.target.name === "windows"
				|| event.target.name === "bottomRowWindows"
				|| event.target.name === "door"
				|| event.target.name === "doorPosition") {
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

		this.#element.randomButton.addEventListener('click', (event) => {
			this.setRandomState();
		});

		this.#element.copyButton.addEventListener("click", () => {
			const encodedSettings = document.getElementById("buildingCode").value;
			navigator.clipboard.writeText(encodedSettings);
		});
	}

	onStateChange(key, state) {
		this.setSettingsUI();
	}

	setSettingsUI() {
		Object.keys(this.#state.settings).forEach((key) => {
			if (this.#element[key] !== undefined) {
				this.#element[key].value = this.#state.settings[key];
			}
		});

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

	setRandomState() {
		let newState = {};

		newState.door = Door[Object.keys(Door)[Math.floor(Math.random() * Object.keys(Door).length)]]
		newState.hasWindowGap = Math.random() < 0.5;
		newState.cladding = Cladding[Object.keys(Cladding)[Math.floor(Math.random() * Object.keys(Cladding).length)]]
		newState.decoration = Decoration[Object.keys(Decoration)[Math.floor(Math.random() * Object.keys(Decoration).length)]]
		newState.roof = Roof[Object.keys(Roof)[Math.floor(Math.random() * Object.keys(Roof).length)]]
		newState.windows = Windows[Object.keys(Windows)[Math.floor(Math.random() * Object.keys(Windows).length)]]
		newState.bottomRowWindows = BottomRowWindows[Object.keys(BottomRowWindows)[Math.floor(Math.random() * Object.keys(BottomRowWindows).length)]]
		newState.doorPosition = DoorPosition[Object.keys(DoorPosition)[Math.floor(Math.random() * Object.keys(DoorPosition).length)]]

		Object.keys(newState).forEach(key => this.#state.settings[key] = newState[key]);
	}
}