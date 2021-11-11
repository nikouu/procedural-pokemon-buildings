export class SettingsEncoder {
	constructor() {
		window.app.settingsEncoder = this;
	}

	#offset = 9728;

	encode(state) {
		const encodedXY = `${String.fromCharCode(state.x + this.#offset)}${String.fromCharCode(state.y + this.#offset)}`
		const encodedSize = `${String.fromCharCode(state.width + this.#offset)}${String.fromCharCode(state.height + this.#offset)}`

		const windowSettings = `${+state.windows}${+state.hasWindowGap}${+state.bottomRowWindows}`;
		const encodedWindowSettings = String.fromCharCode(+windowSettings + this.#offset);

		const otherSettings = `${+state.door}${+state.cladding}${+state.decoration}${+state.roof}${+state.doorPosition}`
		const encodedSettings = String.fromCharCode(+otherSettings + this.#offset);

		const encodedState = `${encodedXY}${encodedSize}${encodedWindowSettings}${encodedSettings}`;

		return encodedState;
	}

	decode(string) {
		const x = string.charCodeAt(0) - this.#offset;
		const y = string.charCodeAt(1) - this.#offset;

		const width = string.charCodeAt(2) - this.#offset;
		const height = string.charCodeAt(3) - this.#offset;

		const decodedWindowSettings = (string.charCodeAt(4) - this.#offset).toString();

		const windows = +decodedWindowSettings[0];
		const hasWindowGap = +decodedWindowSettings[1];
		const bottomRowWindows = +decodedWindowSettings[2];

		const decodedOtherSettings = (string.charCodeAt(5) - this.#offset).toString();

		const door = +decodedOtherSettings[0];
		const cladding = +decodedOtherSettings[1];
		const decoration = +decodedOtherSettings[2];
		const roof = +decodedOtherSettings[3];
		const doorPosition = +decodedOtherSettings[4];

		return {
			x,
			y,
			width,
			height,
			door,
			hasWindowGap,
			cladding,
			decoration,
			roof,
			windows,
			bottomRowWindows,
			doorPosition
		}
	}
}