import {Canvas} from './canvas.js'
import {SelectionRect} from './selectionRect.js'

let canvas = new Canvas();
canvas.setupGrid();

let selectionRect = new SelectionRect(canvas.canvas, 50);
selectionRect.init();

canvas.run();