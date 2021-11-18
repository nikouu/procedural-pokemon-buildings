import { OriginalTiles } from './tiles/OriginalTiles.js'

export class SpriteSheet {
	constructor(spriteSheetUrl, spriteWidth, spriteHeight, scale = 1) {
		window.app.spriteSheet = this;
		this.spriteSheetUrl = spriteSheetUrl;
		this.spriteWidth = spriteWidth;
		this.spriteHeight = spriteHeight;
		this.scale = scale;
	}

	#spriteMap = new Map();

	loadImage(url) {
		return new Promise(resolve => {
			const image = new Image();
			image.addEventListener('load', () => {
				resolve(image);
			});
			image.src = url;
		});
	}

	loadFabricImage(url) {
		return new Promise(resolve => {
			const image = fabric.util.createImage();
			image.addEventListener('load', () => {
				if (image == undefined) {
					console.log("undefined")
				}
				resolve(image);
			});
			image.src = url;
		});
	}

	// really rough promise
	getSpriteMap() {
		var promiseArray = [];
		for (let tileKey in OriginalTiles) {
			promiseArray.push(this.loadFabricImage(this.spriteSheetUrl).then(spriteSheet => {
				const tileInfo = OriginalTiles[tileKey];
				var crop = {
					left: tileInfo.x * this.scale,
					top: tileInfo.y * this.scale,
					width: this.spriteWidth,
					height: this.spriteHeight
				};

				const cropDataUrl = new fabric.Image(spriteSheet).toDataURL(crop);

				return this.loadFabricImage(cropDataUrl);

			}).then(sprite => {
				//this.#spriteMap.set(tileKey, sprite);
				return { tileKey, sprite };
			}));
		};

		return Promise.all(promiseArray).then(result => {
			//this.#spriteMap.set(result.tileKey, result.sprite);

			this.#spriteMap = new Map(result.map(obj => [obj.tileKey, obj.sprite]));
		}).then(() => {
			return this.#spriteMap;
		})
	}
}