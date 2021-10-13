var canvas = new fabric.Canvas('canvas',
    {
        width: 600,
        height: 600,
        preserveObjectStacking: true
    }
);

// https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize
var snapSize = 50;
var gridSize = 50;

var currentXSize = 1;
var currentYSize = 1;

for (var i = 0; i < (600 / gridSize); i++) {
    canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, 600], {
        stroke: '#ccc',
        selectable: false
    }));
    canvas.add(new fabric.Line([0, i * gridSize, 600, i * gridSize], {
        stroke: '#ccc',
        selectable: false
    }))
}

var rect = new fabric.Rect({
    left: gridSize * 2,
    top: gridSize * 2,
    width: gridSize,
    height: gridSize,
    fill: 'rgba(120,5,5,0.2)',
    originX: 'left',
    originY: 'top',
    name: 'baseRect'
});

// solved diagonal issues by just getting rid of them!
// https://stackoverflow.com/questions/51213760/getting-rid-of-rotation-control-in-fabric-js
rect.setControlsVisibility(
    {
        mtr: false,
        tl: false,
        tr: false,
        bl: false,
        br: false
    })

canvas.add(rect);
canvas.bringToFront(rect);


function Snap(value) {
    return Math.round(value / snapSize) * snapSize;
}

var selectionLeft;
var selectionTop;

function SnapMoving(options) {
    options.target.set({
        left: Snap(options.target.left),
        top: Snap(options.target.top)
    });

    var reDraw = false;

    if (selectionLeft != Snap(options.target.left)) {
        reDraw = true;
        //console.log(`${selectionLeft}, ${selectionTop}`)
    }

    if (selectionTop != Snap(options.target.top)) {
        reDraw = true;
        //console.log(`${selectionLeft}, ${selectionTop}`)
    }

    if (reDraw) {
        // hm either move or redraw it where it is...

        var objectsToRemove = canvas.getObjects().filter(function (o) {
            if (o.get('name') === 'layeredRect') {
                return o;
            }
        });

        objectsToRemove.forEach(function (element) {
            //console.log(`moving to new left of: ${element.left - (selectionLeft - Snap(options.target.left))} and new top of ${element.top - (selectionTop - Snap(options.target.top))}`)
            element.set({
                left: element.left - (selectionLeft - Snap(options.target.left - 25)),
                top: element.top - (selectionTop - Snap(options.target.top - 25))
            })
        });

        // updates new selection position value for deltas
        selectionTop = Snap(options.target.top)
        selectionLeft = Snap(options.target.left)
    }

}

function SnapScaling(event) {
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
        width: Snap(targetWidth),
        height: Snap(targetHeight),
    };

    const threshold = gridSize;

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
            if (dist.width < threshold) {
                attrs.scaleX = snap.width / target.width;
            }

            if (dist.height < threshold) {
                attrs.scaleY = snap.height / target.height;
            }

            break;
        case 'mt':
        case 'mb':
            if (dist.height < threshold) {
                attrs.scaleY = snap.height / target.height;
            }

            break;
        case 'ml':
        case 'mr':
            if (dist.width < threshold) {
                attrs.scaleX = snap.width / target.width;
            }

            break;
    }

    if (attrs.scaleX !== target.scaleX || attrs.scaleY !== target.scaleY) {
        target.set(attrs);
        target.setPositionByOrigin(anchorPoint, anchorX, anchorY);
    }
}

canvas.on({
    "object:moving": SnapMoving,
    "object:scaling": SnapScaling,
});

canvas.on('object:scaling', onObjectScaled);

function onObjectScaled(event) {
    const {
        transform
    } = event;
    const {
        target
    } = transform;

    const anchorY = transform.originY;
    const anchorX = transform.originX;

    var scaledObject = event.target;

    var isShrinkingX = false;
    var isGrowingX = false;
    var isShrinkingY = false;
    var isGrowingY = false;

    // update x size
    if (scaledObject.scaleX < currentXSize) {
        isShrinkingX = true;
    }

    if (scaledObject.scaleX > currentXSize) {
        isGrowingX = true;
    }

    // update y size
    if (scaledObject.scaleY < currentYSize) {
        isShrinkingY = true;
    }

    if (scaledObject.scaleY > currentYSize) {
        isGrowingY = true;
    }

    // do some work
    if (isShrinkingX || isGrowingX || isShrinkingY || isGrowingY) {

        currentXSize = scaledObject.scaleX;
        currentYSize = scaledObject.scaleY;

        var objectsToRemove = canvas.getObjects().filter(function (o) {
            if (o.get('name') === 'layeredRect') {
                return o;
            }
        });

        // clear existing tiles
        canvas.remove(...objectsToRemove);

        for (let currentX = 0; currentX < currentXSize; currentX++) {
            for (let currentY = 0; currentY < currentYSize; currentY++) {

                var newRect = new fabric.Rect({
                    width: gridSize * 1,
                    height: gridSize * 1,
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
                    newRect["left"] = scaledObject.left + (gridSize * currentX);
                    newRect["top"] = scaledObject.top + (gridSize * currentY);
                }
                else if (anchorX == "left" && anchorY == "bottom") {
                    if (isGrowingY) {
                        // top middle grow
                        newRect["left"] = scaledObject.left + (gridSize * currentX);
                        newRect["top"] = scaledObject.top - 25 + (gridSize * currentY);
                    }

                    if (isShrinkingY) {
                        // top middle shrink
                        newRect["left"] = scaledObject.left + (gridSize * currentX);
                        newRect["top"] = scaledObject.top + 25 + (gridSize * currentY);
                    }
                }
                else if (anchorX == "right" && anchorY == "top") {
                    if (isGrowingX) {
                        // left middle grow
                        newRect["left"] = scaledObject.left - 25 + (gridSize * currentX);
                        newRect["top"] = scaledObject.top + (gridSize * currentY);
                    }

                    if (isShrinkingX) {
                        // left middle shrink
                        newRect["left"] = scaledObject.left + 25 + (gridSize * currentX);
                        newRect["top"] = scaledObject.top + (gridSize * currentY);
                    }
                }

                canvas.add(newRect);
                canvas.sendToBack(newRect);
            }
        }
    }

    // correctly sets the values of the new selection shape size for the delta calculations in the movement
    selectionTop = Snap(scaledObject.top)
    selectionLeft = Snap(scaledObject.left)
}

