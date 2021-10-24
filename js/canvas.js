
import { SpriteSheet } from './spriteSheet.js'
import { BuildingGenerator } from './buildingGenerator.js'

// TODO: move most of the hard coded values into a config object
export class Canvas {

	// Javascript flavour of named parameters with optional parameters
	// https://javascript.info/destructuring-assignment#smart-function-parameters
	constructor({ canvasId = "canvas", width = 600, height = 600 } = {}) {
		this.width = width;
		this.height = height;
		this.gridSize = 48;
		// x,y of the selection rectangle, kept to help calculate deltas for before and after events
		this.selectionCoords = new fabric.Point(this.gridSize * 2, this.gridSize * 2);
		this.isPanning = false;
		this.currentXScale = 1;
		this.currentYScale = 1;

		this.fabricCanvas = new fabric.Canvas(canvasId,
			{
				preserveObjectStacking: true,
				selection: false,
				backgroundColor: '#abbbc5'
			}
		);

		// weird fix for blurry canvas 
		// https://stackoverflow.com/questions/30549556/fabric-js-images-blurry?rq=1
		this.fabricCanvas.setWidth(this.width);
		this.fabricCanvas.setHeight(this.height);
		this.fabricCanvas.requestRenderAll();

		this.buildingGenerator = new BuildingGenerator();

		this.#setupGrid();
		this.#setupSelectorRectangle();
		this.#setupEvents();
	}

	#setupGrid() {
		for (let i = 0; i < (Math.max(this.width, this.height) / this.gridSize); i++) {

			let vertialLine = new fabric.Line([i * this.gridSize, 0, i * this.gridSize, this.height], {
				stroke: '#ccc',
				selectable: false,
				name: 'grid',
				hoverCursor: 'default'
			});

			let horizontalLine = new fabric.Line([0, i * this.gridSize, this.width, i * this.gridSize], {
				stroke: '#ccc',
				selectable: false,
				name: 'grid',
				hoverCursor: 'default'
			});

			this.fabricCanvas.add(horizontalLine);
			this.fabricCanvas.add(vertialLine)

			this.fabricCanvas.moveTo(horizontalLine, 0);
			this.fabricCanvas.moveTo(vertialLine, 0);
		}
	}

	#setupSelectorRectangle() {
		const selectionRect = new fabric.Rect({
			left: this.selectionCoords.x,
			top: this.selectionCoords.y,
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
			'mouse:wheel': this.#onZooming.bind(this),
			'mouse:up': () => { this.isPanning = false; },
			'mouse:down': () => { this.isPanning = true; },
			'mouse:move': this.#onMouseMoving.bind(this)
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

		let objectsToRemove = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'buildingTile');

		// clear existing tiles
		this.fabricCanvas.remove(...objectsToRemove);

		let settings = this.buildingGenerator.getSettings();
		settings.width = attrs.scaleX;
		settings.height = attrs.scaleY;
		settings.depth = 4;
		this.buildingGenerator.setSettings(settings);

		let generatedBuilding = this.buildingGenerator.generate();

		this.#placeTiles(attrs, generatedBuilding, scaledObject);
		// correctly sets the values of the new selection shape size for the delta calculations in the movement
		this.selectionCoords = new fabric.Point(this.#snap(scaledObject.left), this.#snap(scaledObject.top));
	}

	#onZooming(event) {
		var delta = event.e.deltaY;
		var zoom = this.fabricCanvas.getZoom();
		zoom *= 0.999 ** delta;
		if (zoom > 20) zoom = 20;
		if (zoom < 0.01) zoom = 0.01;
		this.fabricCanvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
		event.e.preventDefault();
		event.e.stopPropagation();
	}

	// https://groups.google.com/g/fabricjs/c/FQ0EWKHNG90/m/oylD96ceBQAJ
	#onMouseMoving(event) {
		// target == null otherwise we would pan when scaling/panning the object
		if (this.isPanning && event.target == null) {
			const delta = new fabric.Point(event.e.movementX, event.e.movementY);
			this.fabricCanvas.relativePan(delta);
		}
	}

	#placeTiles(attrs, generatedBuilding, scaledObject) {
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
					const randomSpriteReference = keys[Math.floor(Math.random() * keys.length)];
					spriteHandle = new fabric.Image(this.spriteMap.get(randomSpriteReference));
				}

				spriteHandle["name"] = 'buildingTile';
				spriteHandle["selectable"] = false;
				spriteHandle["originX"] = 'left';
				spriteHandle["originY"] = 'top';
				spriteHandle["left"] = scaledObject.left + (this.gridSize * currentX);
				spriteHandle["top"] = scaledObject.top + (this.gridSize * currentY);

				this.fabricCanvas.add(spriteHandle);
				this.fabricCanvas.moveTo(spriteHandle, 100);
			}
		}
		// hacky workaround to get the selection bit back on top, probably needs fixing
		const selectionRectangle = this.fabricCanvas.getObjects().filter(e => e.get("name") === 'selectionRect')[0];
		this.fabricCanvas.bringToFront(selectionRectangle);
	}

	async loadSprites() {
		let spriteSheet = new SpriteSheet("/spritesheets/original-spritesheet-6x.png", 48, 48, 6);
		await spriteSheet.getSpriteMap().then(result => {
			this.spriteMap = result;
		});
	}
}