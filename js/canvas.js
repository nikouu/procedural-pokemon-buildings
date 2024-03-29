import { SpriteSheet } from './spriteSheet.js'
import { BuildingGenerator } from './buildingGenerator.js'

// TODO: move most of the hard coded values into a config object
export class Canvas {

	// Javascript flavour of named parameters with optional parameters
	// https://javascript.info/destructuring-assignment#smart-function-parameters
	constructor({ canvasId = "canvas", state, buildingGenerator } = {}) {
		window.app.canvas = this;

		this.#state = state;
		this.#buildingGenerator = buildingGenerator;
		this.gridSize = 48;

		this.maxWidthInCells = 30; // in grid cell size, not pixels
		this.maxHeightInCells = 30; // in grid cell size, not pixels

		this.maxHeight = this.maxHeightInCells * this.gridSize;
		this.maxWidth = this.maxWidthInCells * this.gridSize;

		// x,y of the selection rectangle, kept to help calculate deltas for before and after events
		this.selectionCoords = new fabric.Point(this.gridSize * 2, this.gridSize * 2);
		this.isPanning = false;
		this.touchCoords;
		this.zoomStartScale;

		// move these to a new object
		this.currentXScale = 1;
		this.currentYScale = 1;

		this.fabricCanvas = new fabric.Canvas(canvasId,
			{
				preserveObjectStacking: true,
				selection: false,
				backgroundColor: '#FFF'
			}
		);

		this.fabricCanvas.setBackgroundColor({source: 'assets/background2.png', repeat: 'repeat'});

		fabric.Object.prototype.set({
			transparentCorners: false,
			borderColor: '#ff00ff',
			cornerColor: '#ff0000'
		});

		const squareCanvasDimension = document.getElementById("canvasCol").clientWidth;

		// fixed weird sizing resolution bug by doing it here and not in the constructor
		this.fabricCanvas.setWidth(squareCanvasDimension);
		this.fabricCanvas.setHeight(squareCanvasDimension);

		if (squareCanvasDimension < 800) {
			this.#setZoom(1, 1, squareCanvasDimension / 800);
		}

		this.fabricCanvas.renderAll();

		this.#setupGrid();
		this.#setupSelectorRectangle();
		this.#setupEvents();

		this.#state.addSubscriber(this.onStateChange.bind(this));
	}

	#state;

	#buildingGenerator;

	onStateChange(key, state, oldState) {
		this.#buildingGenerator.setState(this.#state.settings);

		const attrs = {
			scaleX: this.#state.settings.width,
			scaleY: this.#state.settings.height
		}

		const selectionRectangle = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'selectionRect')[0];

		const generatedBuilding = this.#buildingGenerator.generate();

		this.#placeTiles(attrs, generatedBuilding, selectionRectangle);
	}

	#setupGrid() {
		const gridColour = '#dedede';
		for (let i = 0; i < this.maxWidthInCells; i++) {
			// offset is to trim the offcuts over the sides because the canvas dimensions might not align fully with the grid proportions
			// the -this.gridSize is such that the bottom right corner is covered
			const verticalStartCoords = [i * this.gridSize, 0];
			const verticalEndCoords = [i * this.gridSize, this.maxHeightInCells * this.gridSize - this.gridSize];

			let verticalLine = new fabric.Line(verticalStartCoords.concat(verticalEndCoords), {
				stroke: gridColour,
				selectable: false,
				name: 'grid',
				hoverCursor: 'default'
			});

			this.fabricCanvas.add(verticalLine)
			this.fabricCanvas.moveTo(verticalLine, 0);
		}

		for (let i = 0; i < this.maxHeightInCells; i++) {
			// offset is to trim the offcuts over the sides because the canvas dimensions might not align fully with the grid proportions
			// the -this.gridSize is such that the bottom right corner is covered
			const horizontalStartCoords = [0, i * this.gridSize];
			const horizontalEndCoords = [this.maxWidthInCells * this.gridSize - this.gridSize, i * this.gridSize]

			let horizontalLine = new fabric.Line(horizontalStartCoords.concat(horizontalEndCoords), {
				stroke: gridColour,
				selectable: false,
				name: 'grid',
				hoverCursor: 'default'
			});

			this.fabricCanvas.add(horizontalLine);
			this.fabricCanvas.moveTo(horizontalLine, 0);
		}
	}

	#setupSelectorRectangle() {
		this.currentXScale = this.#state.settings.width
		this.currentYScale = this.#state.settings.height

		const selectionRect = new fabric.Rect({
			left: this.#state.settings.x,
			top: this.#state.settings.y,
			width: this.gridSize,
			height: this.gridSize,
			scaleX: this.#state.settings.width,
			scaleY: this.#state.settings.height,
			lockRotation: true,
			fill: 'rgba(120,5,5,0.0)',
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
		this.fabricCanvas.setActiveObject(selectionRect);
	}

	#setupEvents() {
		this.fabricCanvas.on({
			"object:moving": this.#onMoving.bind(this),
			"object:scaling": this.#onScaling.bind(this),
			'mouse:wheel': this.#onZooming.bind(this),
			'mouse:up': () => { this.isPanning = false; this.touch = undefined },
			'mouse:down': () => { this.isPanning = true; },
			'mouse:move': this.#onMouseMoving.bind(this),
			'touch:gesture': this.#onGesture.bind(this)
		});
	}

	#snap(value) {
		return Math.round(value / this.gridSize) * this.gridSize;
	}

	#onMoving(event) {
		let snap = {
			// closest width to snap to
			left: this.#snap(event.target.left),
			top: this.#snap(event.target.top),
		};

		// https://stackoverflow.com/questions/42833142/prevent-fabric-js-objects-from-scaling-out-of-the-canvas-boundary
		const boundingRect = event.target.getBoundingRect(true);

		if (snap.left < 0
			|| snap.top < 0
			|| snap.left + boundingRect.width > this.maxWidth
			|| snap.top + boundingRect.height > this.maxHeight) {
			snap.left = this.selectionCoords.x;
			snap.top = this.selectionCoords.y;
		}

		event.target.set(snap);

		// if the selection rectangle has moved
		if (this.selectionCoords.x != snap.left ||
			this.selectionCoords.y != snap.top) {
			let objectsToMove = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'buildingTile');

			objectsToMove.forEach((element) => {
				element.set({
					left: element.left - (this.selectionCoords.x - this.#snap(event.target.left - (this.gridSize / 2))),
					top: element.top - (this.selectionCoords.y - this.#snap(event.target.top - (this.gridSize / 2)))
				})
			})

			// updates new selection position value for deltas
			this.selectionCoords = new fabric.Point(snap.left, snap.top);
		}

		this.#state.settings.x = snap.left;
		this.#state.settings.y = snap.top;
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

		let attrs = {
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
			case false:
				//case with touch events
				return;
		}

		let updateScale = true;

		if (scaledObject.left < (-this.gridSize / 2) - 1 // this because the object, due to scaling i think, can go slightly over, so this ensures within the snap calculation
			|| scaledObject.top < (-this.gridSize / 2) - 1
			|| scaledObject.left + scaledObject.scaleX * this.gridSize > this.maxWidth
			|| scaledObject.top + scaledObject.scaleY * this.gridSize > this.maxHeight) {
			attrs.scaleX = this.currentXScale;
			attrs.scaleY = this.currentYScale;
			updateScale = false;
		}

		if (attrs.scaleX !== scaledObject.scaleX || attrs.scaleY !== scaledObject.scaleY) {
			scaledObject.set(attrs);
			scaledObject.setPositionByOrigin(anchorPoint, anchorX, anchorY);
		}

		if (updateScale && Number.isInteger(attrs.scaleX) && Number.isInteger(attrs.scaleY)) {
			this.currentXScale = attrs.scaleX;
			this.currentYScale = attrs.scaleY;
		}

		// correctly sets the values of the new selection shape size for the delta calculations in the movement
		this.selectionCoords = new fabric.Point(this.#snap(scaledObject.left), this.#snap(scaledObject.top));

		this.#state.settings.x = this.#snap(scaledObject.left);
		this.#state.settings.y = this.#snap(scaledObject.top);
		this.#state.settings.width = this.currentXScale;
		this.#state.settings.height = this.currentYScale;
	}

	#onZooming(event) {
		const delta = event.e.deltaY;
		let zoom = this.fabricCanvas.getZoom();
		zoom *= 0.999 ** delta;

		this.#setZoom(event.e.offsetX, event.e.offsetY, zoom);

		event.e.preventDefault();
		event.e.stopPropagation();
	}

	// todo: cleanup rash attempt at making touch events work
	// https://groups.google.com/g/fabricjs/c/FQ0EWKHNG90/m/oylD96ceBQAJ
	#onMouseMoving(event) {
		// target == null otherwise we would pan when scaling/panning the object
		if (this.isPanning && event.target == null && event.e.type !== "touchmove") {
			const delta = new fabric.Point(event.e.movementX, event.e.movementY);
			this.fabricCanvas.relativePan(delta);
		} else if (this.isPanning & event.target == null && event.e.type === "touchmove") {
			if (this.touch != undefined) {
				const delta = new fabric.Point(event.e.touches[0].pageX - this.touch.pageX, event.e.touches[0].pageY - this.touch.pageY);
				this.fabricCanvas.relativePan(delta);
			}

			this.touch = event.e.touches[0];
		}
	}

	#onGesture(event) {
		if (event.e.touches && event.e.touches.length == 2 && event.target?.name != "selectionRect") {
			if (event.self.state == "start") {
				this.zoomStartScale = this.fabricCanvas.getZoom();
			}

			if (isNaN(this.zoomStartScale)) {
				return;
			}

			console.log(`${event.self.state} ${this.zoomStartScale}`)
			this.#setZoom(event.self.x, event.self.y, this.zoomStartScale * event.self.scale);
			event.e.preventDefault();
			event.e.stopPropagation();
		}
	}

	#setZoom(x, y, zoom) {
		if (zoom > 1.5) {
			zoom = 1.5;
		}
		if (zoom < 0.4) {
			zoom = 0.4;
		}
		this.fabricCanvas.zoomToPoint({ x: x, y: y }, zoom);
	}

	#placeTiles(attrs, generatedBuilding, scaledObject) {
		let objectsToRemove = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'buildingTile');

		// clear existing tiles
		this.fabricCanvas.remove(...objectsToRemove);

		// this draws top to bottom, left to right
		for (let currentX = 0; currentX < attrs.scaleX; currentX++) {
			for (let currentY = 0; currentY < attrs.scaleY; currentY++) {

				let keys = Array.from(this.spriteMap.keys());
				let spriteHandle;

				if (keys.includes(generatedBuilding[currentX][currentY])) {
					const spriteReference = this.spriteMap.get(generatedBuilding[currentX][currentY]);
					spriteHandle = new fabric.Image(spriteReference);
				}
				else {
					spriteHandle = new fabric.Rect({
						width: this.gridSize * 1,
						height: this.gridSize * 1,
						fill: '#000',
						name: 'buildingTile',
						selectable: false,
						originX: 'left',
						originY: 'top'
					});
				}

				spriteHandle["name"] = 'buildingTile';
				spriteHandle["selectable"] = false;
				spriteHandle["originX"] = 'left';
				spriteHandle["originY"] = 'top';
				spriteHandle["left"] = scaledObject.left + (this.gridSize * currentX);
				spriteHandle["top"] = scaledObject.top + (this.gridSize * currentY);

				this.fabricCanvas.add(spriteHandle);
				this.fabricCanvas.bringToFront(spriteHandle);
			}
		}
		// hacky workaround to get the selection bit back on top, probably needs fixing
		const selectionRectangle = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'selectionRect')[0];

		// scales the selection rectangle correctly after a code has been entered
		selectionRectangle.scaleX = attrs.scaleX;
		selectionRectangle.scaleY = attrs.scaleY;

		this.fabricCanvas.bringToFront(selectionRectangle);
	}

	async loadSprites() {
		let spriteSheet = new SpriteSheet("spritesheets/original-spritesheet-6x.png", 48, 48, 6);
		await spriteSheet.getSpriteMap().then(result => {
			this.spriteMap = result;
		}).then(() => {
			const attrs = {
				scaleX: this.#state.settings.width,
				scaleY: this.#state.settings.height
			}

			this.currentXScale = attrs.scaleX;
			this.currentYScale = attrs.scaleY;

			const selectionRectangle = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'selectionRect')[0];

			const generatedBuilding = this.#buildingGenerator.generate();

			this.#placeTiles(attrs, generatedBuilding, selectionRectangle);
		});
	}
}