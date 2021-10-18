export class SelectionRect {

	constructor(fabricCanvas, gridSize) {
		this.fabricCanvas = fabricCanvas;
		this.gridSize = gridSize;
	}

	init() {
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
}