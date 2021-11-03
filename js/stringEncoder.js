import { Cladding } from './enums/Cladding.js'
import { Decoration } from './enums/Decoration.js'
import { Depth } from './enums/Depth.js'
import { Roof } from './enums/Roof.js'
// Looking to be a rough string shortener. Since the state contains only enums and ints, I won't worry about UTF concerns

// perhaps use this to shorten https://stackoverflow.com/a/25963279 
// or https://stackoverflow.com/a/47084996
export class StringEncoder {
	constructor() {
		window.app.stringEncoder = this;
	}

	#offset = 9728;

	encodeBoring(string) {
		string = unescape(encodeURIComponent(string));
		var newString = '',
			char, nextChar, combinedCharCode;

		console.log(this.#convertStringToBinary(string))
		for (var i = 0; i < string.length; i += 2) {

			// convert to binary instead of keeping the decimal
			char = string.charCodeAt(i).toString(2);

			if ((i + 1) < string.length) {


				nextChar = string.charCodeAt(i + 1).toString(2);


				// you still need padding, see this answer https://stackoverflow.com/questions/27641812/way-to-add-leading-zeroes-to-binary-string-in-javascript
				combinedCharCode = "0000000".substr(char.length) + char + "" + "0000000".substr(nextChar.length) + nextChar;

				// You take the concanated code string and convert it back to a binary number, then a character
				newString += String.fromCharCode(parseInt(combinedCharCode, 2));

			} else {

				// Here because you won't always have pair number length
				newString += string.charAt(i);
			}
		}
		return newString;
	}

	decodeBoring(string) {
		var newString = '',
			char, codeStr, firstCharCode, lastCharCode;

		for (var i = 0; i < string.length; i++) {
			char = string.charCodeAt(i);
			if (char > 132) {
				codeStr = char.toString(2);

				// You take the first part (the first byte) of the compressed char code, it's your first letter
				firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 7), 2);

				// then the second byte
				lastCharCode = parseInt(codeStr.substring(codeStr.length - 7, codeStr.length), 2);

				// You put back the 2 characters you had originally
				newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
			} else {
				newString += string.charAt(i);
			}
		}
		return newString;
	}

	encodeFun(state) {
		const encodedXY = `${String.fromCharCode(state.x + this.#offset)}${String.fromCharCode(state.y + this.#offset)}`
		const encodedSize = `${String.fromCharCode(state.width + this.#offset)}${String.fromCharCode(state.height + this.#offset)}`
		const stringSettings = `${+state.hasDoor}${+state.hasWindowGap}${state.cladding}${state.decoration}${state.depth}`
		const encodedSettings = String.fromCharCode(+stringSettings+ this.#offset);

		const encodedState = `${encodedXY}${encodedSize}${encodedSettings}`;

		return encodedState;
	}

	decodeFun(string) {
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

	#convertStateToString(state) {

	}


	#convertStringToBinary(string) {
		let binaryString = '';

		for (let i = 0; i < string.length; i += 2) {
			const char = string.charCodeAt(i).toString(2);
			if ((i + 1) < string.length) {
				const nextChar = string.charCodeAt(i + 1).toString(2);

				// you still need padding, see this answer https://stackoverflow.com/questions/27641812/way-to-add-leading-zeroes-to-binary-string-in-javascript
				binaryString += "0000000".substr(char.length) + char + "" + "0000000".substr(nextChar.length) + nextChar;
			}
		}

		return binaryString;
	}

	#convertBinaryToUTF16(binaryString) {
		let returnString = '';

		for (var i = 0; i < binaryString.length; i += 16) {
			var slicedString = binaryString.slice(i, i + 16);
			returnString += String.fromCharCode(parseInt(slicedString, 2));
		}

		return returnString;
	}

}