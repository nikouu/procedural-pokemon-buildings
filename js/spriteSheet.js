import { OriginalTiles } from './tiles/OriginalTiles.js'

export class SpriteSheet {
	constructor(spriteSheetUrl, spriteWidth, spriteHeight, scale = 1) {
		this.spriteSheetUrl = spriteSheetUrl;
		this.spriteWidth = spriteWidth;
		this.spriteHeight = spriteHeight;
		this.scale = scale;

		//this.#init3();
	}

	#spriteMap = new Map();

	#init() {
		// promiseify for fun?
		fabric.Image.fromURL(this.spriteSheetUrl, (spriteSheet) => {
			for (let tileKey in OriginalTiles) {
				const tileInfo = OriginalTiles[tileKey];

				var crop = {
					left: tileInfo.x * this.scale,
					top: tileInfo.y * this.scale,
					width: this.spriteWidth,
					height: this.spriteHeight
				};

				let cropDataUrl = spriteSheet.toDataURL(crop);

				new fabric.Image.fromURL(cropDataUrl, (sprite) => {

					//sprite.left = tileInfo.x;
					//sprite.top = tileInfo.y;

					//this.fabricCanvas.add(sprite);

					this.#spriteMap.set(tileKey, sprite);
				})
			}
		});
	}

	#init2() {
		// inefficient loading of the spritesheet for each loop, but need the context of the tilekey
		for (let tileKey in OriginalTiles) {
			this.loadImage(this.spriteSheetUrl).then(spriteSheet => {

				const tileInfo = OriginalTiles[tileKey];
				var crop = {
					left: tileInfo.x * this.scale,
					top: tileInfo.y * this.scale,
					width: this.spriteWidth,
					height: this.spriteHeight
				};

				const cropDataUrl = spriteSheet.toDataURL(crop);

				return this.loadImage(cropDataUrl);

			}).then(sprite => {
				this.#spriteMap.set(tileKey, sprite);
			});
		};
	}


	#init3() {
		// this is going to be a raw version of the fabric work to promisfy
		for (let tileKey in OriginalTiles) {
			this.loadFabricImage(this.spriteSheetUrl).then(spriteSheet => {
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
				this.#spriteMap.set(tileKey, sprite);
			});
		};
	}

	#init4() {
		var spriteSheet = fabric.Image(spriteSheet);
		for (let tileKey in OriginalTiles) {
			const tileInfo = OriginalTiles[tileKey];
			var crop = {
				left: tileInfo.x * this.scale,
				top: tileInfo.y * this.scale,
				width: this.spriteWidth,
				height: this.spriteHeight
			};

			const cropDataUrl = new fabric.Image(spriteSheet).toDataURL(crop);

			var spriteSheet = fabric.Image(cropDataUrl);
			this.#spriteMap.set(tileKey, sprite);

		};
	}

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

	// promisify(f, true) to get array of results
	promisify(f, manyArgs = false) {
		return function (...args) {
			return new Promise((resolve, reject) => {
				function callback(err, ...results) { // our custom callback for f
					if (err) {
						reject(err);
					} else {
						// resolve with all callback results if manyArgs is specified
						resolve(manyArgs ? results : results[0]);
					}
				}

				args.push(callback);

				f.call(this, ...args);
			});
		};
	}
}