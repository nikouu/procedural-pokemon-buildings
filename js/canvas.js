// TODO: move most of the hard coded values into a config object
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

		this.#setupGrid();
		this.#setupEvents();
		this.#setupSelectorRectangle();
	}

	// TODO: make this dependent on canvas size and not hardcoded 600
	#setupGrid() {
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

	#setupSelectorRectangle() {
		const selectionRect = new fabric.Rect({
			left: this.gridSize * 2,
			top: this.gridSize * 2,
			width: this.gridSize,
			height: this.gridSize,
			fill: 'rgba(120,5,5,0.2)',
			originX: 'left',
			originY: 'top',
			name: 'selectionRect'
		});

		selectionRect.setControlsVisibility(
			{
				mtr: false,
				tl: false,
				tr: false,
				bl: false,
				br: false
			});

		this.fabricCanvas.add(selectionRect);
		this.fabricCanvas.bringToFront(selectionRect);
	}

	#setupEvents() {
		this.fabricCanvas.on({
			"object:moving": this.#onMoving.bind(this),
			"object:scaling": this.#onScaling.bind(this),
		});
	}

	#snap(value) {
		return Math.round(value / this.gridSize) * this.gridSize;
	}

	#onMoving(event) {

		const snap = {
			// closest width to snap to
			left: this.#snap(event.target.left),
			top: this.#snap(event.target.top),
		};
		event.target.set(snap);

		let reDraw = false;

		if (this.selectionCoords.x != snap.left ||
			this.selectionCoords.y != snap.top) {
			reDraw = true;
		}

		if (reDraw) {
			let objectsToMove = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'layeredRect');

			objectsToMove.forEach((element) => {
				element.set({
					left: element.left - (this.selectionCoords.x - this.#snap(event.target.left - 25)),
					top: element.top - (this.selectionCoords.y - this.#snap(event.target.top - 25))
				})
			})

			// updates new selection position value for deltas
			this.selectionCoords = new fabric.Point(snap.left, snap.top);
		}
	}

	#onScaling(event) {
		const {
			transform
		} = event;
		const {
			target: scaledObject
		} = transform;

		// scaledObject.width/height is the original object dimensions, not the new scaled dimensions
		const calculatedWidth = scaledObject.width * scaledObject.scaleX;
		const calculatedHeight = scaledObject.height * scaledObject.scaleY;

		const snap = {
			// closest width to snap to
			width: this.#snap(calculatedWidth),
			height: this.#snap(calculatedHeight),
		};

		const dist = {
			// distance from current width to snappable width
			width: Math.abs(calculatedWidth - snap.width),
			height: Math.abs(calculatedHeight - snap.height),
		};

		const centerPoint = scaledObject.getCenterPoint();

		const anchorY = transform.originY;
		const anchorX = transform.originX;

		const anchorPoint = scaledObject.translateToOriginPoint(
			centerPoint,
			anchorX,
			anchorY,
		);

		const attrs = {
			scaleX: scaledObject.scaleX,
			scaleY: scaledObject.scaleY,
		};

		switch (transform.corner) {
			case 'tl':
			case 'br':
			case 'tr':
			case 'bl':
				if (dist.width < this.gridSize) {
					attrs.scaleX = snap.width / scaledObject.width;
				}

				if (dist.height < this.gridSize) {
					attrs.scaleY = snap.height / scaledObject.height;
				}

				break;
			case 'mt':
			case 'mb':
				if (dist.height < this.gridSize) {
					attrs.scaleY = snap.height / scaledObject.height;
				}

				break;
			case 'ml':
			case 'mr':
				if (dist.width < this.gridSize) {
					attrs.scaleX = snap.width / scaledObject.width;
				}

				break;
		}

		if (attrs.scaleX !== scaledObject.scaleX || attrs.scaleY !== scaledObject.scaleY) {
			scaledObject.set(attrs);
			scaledObject.setPositionByOrigin(anchorPoint, anchorX, anchorY);
		}

		let objectsToRemove = this.fabricCanvas.getObjects().filter(e => e["name"] === 'layeredRect');

		// clear existing tiles
		this.fabricCanvas.remove(...objectsToRemove);

		for (let currentX = 0; currentX < scaledObject.scaleX; currentX++) {
			for (let currentY = 0; currentY < scaledObject.scaleY; currentY++) {

				let newRect = new fabric.Rect({
					width: this.gridSize * 1,
					height: this.gridSize * 1,
					fill: '#000',
					name: 'layeredRect',
					selectable: false,
					originX: 'left',
					originY: 'top',
					left: scaledObject.left + (this.gridSize * currentX),
					top: scaledObject.top + (this.gridSize * currentY)
				});

				this.fabricCanvas.add(newRect);
				this.fabricCanvas.sendToBack(newRect);
			}
		}
		// correctly sets the values of the new selection shape size for the delta calculations in the movement
		this.selectionCoords = new fabric.Point(this.#snap(scaledObject.left), this.#snap(scaledObject.top));
	}
}