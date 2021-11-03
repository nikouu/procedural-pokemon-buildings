export class SettingsEncoder {
	constructor() {
		window.app.settingsEncoder = this;
	}

	#offset = 9728;

	encode(state) {
		const encodedXY = `${String.fromCharCode(state.x + this.#offset)}${String.fromCharCode(state.y + this.#offset)}`
		const encodedSize = `${String.fromCharCode(state.width + this.#offset)}${String.fromCharCode(state.height + this.#offset)}`
		const stringSettings = `${+state.hasDoor}${+state.hasWindowGap}${state.cladding}${state.decoration}${state.depth}`
		const encodedSettings = String.fromCharCode(+stringSettings+ this.#offset);

		const encodedState = `${encodedXY}${encodedSize}${encodedSettings}`;

		return encodedState;
	}

	decode(string) {
		const x = string.charCodeAt(0) - this.#offset;
		const y = string.charCodeAt(1) - this.#offset;

		const width = string.charCodeAt(2) - this.#offset;
		const height = string.charCodeAt(3) - this.#offset;

		const decodedSettings = (string.charCodeAt(4) - this.#offset).toString();

		const hasDoor = !!decodedSettings[0];
		const hasWindowGap = !!decodedSettings[1];
		const cladding = decodedSettings[2];
		const decoration = decodedSettings[3];
		const depth = +decodedSettings[4];

		return {
			x,
			y, 
			width,
			height,
			hasDoor,
			hasWindowGap,
			cladding,
			decoration,
			depth
		}
	}	
}