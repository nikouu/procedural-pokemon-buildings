
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

		this.maxWidth = 1000;
		this.maxHeight = 1000;

		// x,y of the selection rectangle, kept to help calculate deltas for before and after events
		this.selectionCoords = new fabric.Point(this.gridSize * 2, this.gridSize * 2);
		this.isPanning = false;

		// move these to a new object
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
		const maxDimension = Math.max(this.maxWidth, this.maxHeight) / this.gridSize;
		for (let i = 0; i < maxDimension; i++) {

			// offset is to trim the offcuts over the sides because the canvas dimensions might not align fully with the grid proportions
			const verticalEndingOffset = Math.ceil(this.maxWidth / this.gridSize)
			const vertialStartCoords = [i * this.gridSize, 0];
			const verticalEndCoords = [i * this.gridSize, this.maxHeight - verticalEndingOffset];

			let vertialLine = new fabric.Line(vertialStartCoords.concat(verticalEndCoords), {
				stroke: '#fff',
				selectable: false,
				name: 'grid',
				hoverCursor: 'default'
			});

			// offset is to trim the offcuts over the sides because the canvas dimensions might not align fully with the grid proportions
			const horizontalEndingOffset = Math.ceil(this.maxHeight / this.gridSize)
			const horizontalStartCoords = [0, i * this.gridSize];
			const horizontalEndCoords = [this.maxWidth - horizontalEndingOffset, i * this.gridSize]

			let horizontalLine = new fabric.Line(horizontalStartCoords.concat(horizontalEndCoords), {
				stroke: '#fff',
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
		}

		let updateScale = true;

		if (scaledObject.left < (-this.gridSize / 2) - 1 // this because the object, due to scaling i think, can go slightly over, so this ensures within the snap calculation
			|| scaledObject.top < (-this.gridSize / 2) - 1
			|| scaledObject.left + scaledObject.scaleX * this.gridSize > this.maxWidth
			|| scaledObject.top + scaledObject.scaleY * this.gridSize > this.maxHeight
		) {
			attrs.scaleX = this.currentXScale;
			attrs.scaleY = this.currentYScale;

			// SCALED OBJECT UPDATES THE LOOP BEFORE BOUNDING RECT
			// THIS MEANS BOUNDING RECT IS BEHIND AND BY THE TIME IT UPDATES
			// THE BAD VALUES HAVE ALREADY BEEN WRITTEN TO THIS.CURRENTXSCALE ETC
			console.log("out of bounds");


			updateScale = false;
		}

		console.log(scaledObject)

		console.log(`${scaledObject.left + scaledObject.scaleX * this.gridSize} > ${this.maxWidth} : ${scaledObject.left + scaledObject.scaleX * this.gridSize > this.maxWidth}`)

		if (attrs.scaleX !== scaledObject.scaleX || attrs.scaleY !== scaledObject.scaleY) {
			console.log(attrs)
			scaledObject.set(attrs);
			scaledObject.setPositionByOrigin(anchorPoint, anchorX, anchorY);
		}

		if (updateScale) {
			this.currentXScale = attrs.scaleX;
			this.currentYScale = attrs.scaleY;
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

		console.log("----")

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


		// http://fabricjs.com/fabric-intro-part-5
		let vpt = this.fabricCanvas.viewportTransform;



		// if (zoom < 400 / 1000) {
		// 	vpt[4] = 200 - 1000 * zoom / 2;
		// 	vpt[5] = 200 - 1000 * zoom / 2;
		// } else {
		// 	if (vpt[4] >= 0) {
		// 		vpt[4] = 0;
		// 	} else if (vpt[4] < this.fabricCanvas.getWidth() - 1000 * zoom) {
		// 		vpt[4] = this.fabricCanvas.getWidth() - 1000 * zoom;
		// 	}
		// 	if (vpt[5] >= 0) {
		// 		vpt[5] = 0;
		// 	} else if (vpt[5] < this.fabricCanvas.getHeight() - 1000 * zoom) {
		// 		vpt[5] = this.fabricCanvas.getHeight() - 1000 * zoom;
		// 	}
		// }

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