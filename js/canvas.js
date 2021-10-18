export class Canvas {

	// Javascript flavour of named parameters with optional parameters
	// https://javascript.info/destructuring-assignment#smart-function-parameters
	constructor({ canvasId = "canvas", width = 600, height = 600 } = {}) {

		this.fabricCanvas = new fabric.Canvas(canvasId,
			{
				width: width,
				height: height,
				preserveObjectStacking: true
			}
		);

		this.gridSize = 50;
		this.selectionCoords = new fabric.Point(100, 100);
		this.currentXScale = 1;
		this.currentYScale = 1;
	}

	// this feels like its breaking encapsulation
	get canvas() {
		return this.fabricCanvas;
	}

	run() {
		this.fabricCanvas.on({
			"object:moving": this.SnapMoving.bind(this),
			"object:scaling": this.SnapScaling.bind(this),
		});

		this.fabricCanvas.on('object:scaling', this.onObjectScaled.bind(this));
	}

	setupGrid() {
		for (let i = 0; i < (600 / this.gridSize); i++) {
			this.fabricCanvas.add(new fabric.Line([i * this.gridSize, 0, i * this.gridSize, 600], {
				stroke: '#ccc',
				selectable: false
			}));
			this.fabricCanvas.add(new fabric.Line([0, i * this.gridSize, 600, i * this.gridSize], {
				stroke: '#ccc',
				selectable: false
			}))
		}
	}

	Snap(value) {
		return Math.round(value / this.gridSize) * this.gridSize;
	}

	SnapMoving(options) {
		options.target.set({
			left: this.Snap(options.target.left),
			top: this.Snap(options.target.top)
		});

		let reDraw = false;

		if (this.selectionCoords.x != this.Snap(options.target.left)) {
			reDraw = true;
			//console.log(`${selectionLeft}, ${selectionTop}`)
		}

		if (this.selectionCoords.y != this.Snap(options.target.top)) {
			reDraw = true;
			//console.log(`${selectionLeft}, ${selectionTop}`)
		}

		if (reDraw) {
			// hm either move or redraw it where it is...

			let objectsToRemove = this.fabricCanvas.getObjects().filter(e => e["name"] === 'layeredRect');

			objectsToRemove.forEach((element) => {
				element.set({
					left: element.left - (this.selectionCoords.x - this.Snap(options.target.left - 25)),
					top: element.top - (this.selectionCoords.y - this.Snap(options.target.top - 25))
				})
			})

			// updates new selection position value for deltas

			this.selectionCoords = new fabric.Point(this.Snap(options.target.left), this.Snap(options.target.top));
		}
	}


	SnapScaling(event) {
		const {
			transform
		} = event;
		const {
			target
		} = transform;

		const targetWidth = target.width * target.scaleX;
		const targetHeight = target.height * target.scaleY;

		const snap = {
			// closest width to snap to
			width: this.Snap(targetWidth),
			height: this.Snap(targetHeight),
		};

		const dist = {
			// distance from current width to snappable width
			width: Math.abs(targetWidth - snap.width),
			height: Math.abs(targetHeight - snap.height),
		};

		const centerPoint = target.getCenterPoint();

		const anchorY = transform.originY;
		const anchorX = transform.originX;

		const anchorPoint = target.translateToOriginPoint(
			centerPoint,
			anchorX,
			anchorY,
		);

		const attrs = {
			scaleX: target.scaleX,
			scaleY: target.scaleY,
		};

		// eslint-disable-next-line default-case
		switch (transform.corner) {
			case 'tl':
			case 'br':
			case 'tr':
			case 'bl':
				if (dist.width < this.gridSize) {
					attrs.scaleX = snap.width / target.width;
				}

				if (dist.height < this.gridSize) {
					attrs.scaleY = snap.height / target.height;
				}

				break;
			case 'mt':
			case 'mb':
				if (dist.height < this.gridSize) {
					attrs.scaleY = snap.height / target.height;
				}

				break;
			case 'ml':
			case 'mr':
				if (dist.width < this.gridSize) {
					attrs.scaleX = snap.width / target.width;
				}

				break;
		}

		if (attrs.scaleX !== target.scaleX || attrs.scaleY !== target.scaleY) {
			target.set(attrs);
			target.setPositionByOrigin(anchorPoint, anchorX, anchorY);
		}
	}


	onObjectScaled(event) {
		const {
			transform
		} = event;
		const {
			target: scaledObject
		} = transform;

		const anchorY = transform.originY;
		const anchorX = transform.originX;

		let isShrinkingX = false;
		let isGrowingX = false;
		let isShrinkingY = false;
		let isGrowingY = false;

		// update x size
		if (scaledObject.scaleX < this.currentXScale) {
			isShrinkingX = true;
		}

		if (scaledObject.scaleX > this.currentXScale) {
			isGrowingX = true;
		}

		// update y size
		if (scaledObject.scaleY < this.currentYScale) {
			isShrinkingY = true;
		}

		if (scaledObject.scaleY > this.currentYScale) {
			isGrowingY = true;
		}

		// do some work
		if (isShrinkingX || isGrowingX || isShrinkingY || isGrowingY) {

			this.currentXScale = scaledObject.scaleX;
			this.currentYScale = scaledObject.scaleY;

			let objectsToRemove = this.fabricCanvas.getObjects().filter(e => e["name"] === 'layeredRect');

			// clear existing tiles
			this.fabricCanvas.remove(...objectsToRemove);

			for (let currentX = 0; currentX < this.currentXScale; currentX++) {
				for (let currentY = 0; currentY < this.currentYScale; currentY++) {

					let newRect = new fabric.Rect({
						width: this.gridSize * 1,
						height: this.gridSize * 1,
						fill: '#000',
						name: 'layeredRect',
						selectable: false,
						originX: 'left',
						originY: 'top'
					});

					if (anchorX == "left" && anchorY == "top") {
						// right middle grow
						// right middle shrink
						// bottom middle grow
						// bottom middle shrink
						newRect["left"] = scaledObject.left + (this.gridSize * currentX);
						newRect["top"] = scaledObject.top + (this.gridSize * currentY);
					}
					else if (anchorX == "left" && anchorY == "bottom") {
						if (isGrowingY) {
							// top middle grow
							newRect["left"] = scaledObject.left + (this.gridSize * currentX);
							newRect["top"] = scaledObject.top - 25 + (this.gridSize * currentY);
						}

						if (isShrinkingY) {
							// top middle shrink
							newRect["left"] = scaledObject.left + (this.gridSize * currentX);
							newRect["top"] = scaledObject.top + 25 + (this.gridSize * currentY);
						}
					}
					else if (anchorX == "right" && anchorY == "top") {
						if (isGrowingX) {
							// left middle grow
							newRect["left"] = scaledObject.left - 25 + (this.gridSize * currentX);
							newRect["top"] = scaledObject.top + (this.gridSize * currentY);
						}

						if (isShrinkingX) {
							// left middle shrink
							newRect["left"] = scaledObject.left + 25 + (this.gridSize * currentX);
							newRect["top"] = scaledObject.top + (this.gridSize * currentY);
						}
					}

					this.fabricCanvas.add(newRect);
					this.fabricCanvas.sendToBack(newRect);
				}
			}
		}

		// correctly sets the values of the new selection shape size for the delta calculations in the movement
		this.selectionCoords = new fabric.Point(this.Snap(event.target.left), this.Snap(event.target.top));
	}
}