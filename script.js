let canvas = new fabric.Canvas('canvas',
    {
        width: 600,
        height: 600,
        preserveObjectStacking: true
    }
);

// https://stackoverflow.com/questions/44147762/fabricjs-snap-to-grid-on-resize
let snapSize = 50;
let gridSize = 50;

let currentXScale = 1;
let currentYScale = 1;

for (let i = 0; i < (600 / gridSize); i++) {
    canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, 600], {
        stroke: '#ccc',
        selectable: false
    }));
    canvas.add(new fabric.Line([0, i * gridSize, 600, i * gridSize], {
        stroke: '#ccc',
        selectable: false
    }))
}

let rect = new fabric.Rect({
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

let selectionLeft;
let selectionTop;

function SnapMoving(options) {
    options.target.set({
        left: Snap(options.target.left),
        top: Snap(options.target.top)
    });

    let reDraw = false;

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

        let objectsToRemove = canvas.getObjects().filter(e => e["name"] === 'layeredRect');

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
        target: scaledObject
    } = transform;

    const anchorY = transform.originY;
    const anchorX = transform.originX;

    let isShrinkingX = false;
    let isGrowingX = false;
    let isShrinkingY = false;
    let isGrowingY = false;

    // update x size
    if (scaledObject.scaleX < currentXScale) {
        isShrinkingX = true;
    }

    if (scaledObject.scaleX > currentXScale) {
        isGrowingX = true;
    }

    // update y size
    if (scaledObject.scaleY < currentYScale) {
        isShrinkingY = true;
    }

    if (scaledObject.scaleY > currentYScale) {
        isGrowingY = true;
    }

    // do some work
    if (isShrinkingX || isGrowingX || isShrinkingY || isGrowingY) {

        currentXScale = scaledObject.scaleX;
        currentYScale = scaledObject.scaleY;
  
        let objectsToRemove = canvas.getObjects().filter(e => e["name"] === 'layeredRect');

        // clear existing tiles
        canvas.remove(...objectsToRemove);

        for (let currentX = 0; currentX < currentXScale; currentX++) {
            for (let currentY = 0; currentY < currentYScale; currentY++) {

                let newRect = new fabric.Rect({
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

// new fabric.Canvas
// https://github.com/fmeringdal/nettu-meet/blob/e401decf0aefe069c1f72a6a41ec4cedf282f53f/frontend/src/modules/canvas/services/CanvasStateManager.ts
// https://github.com/fmeringdal/nettu-meet/blob/e401decf0aefe069c1f72a6a41ec4cedf282f53f/frontend/src/modules/canvas/services/CanvasManager.ts
// https://github.com/gadenbuie/xaringanExtra/blob/c74f0a365baaa9b284168fc2632679fe2e0d3e66/inst/scribble/scribble.js
// https://github.com/danilowoz/coverify/blob/2c37ca6d430293dc2a78dd1465cc6b68882f8eb8/src/modules/Canvas/fabricUtils/index.ts
// https://github.com/apache/openmeetings/blob/f3ca5c24394cb9fbb8e532cb36ceaa640102bb59/openmeetings-web/src/main/front/wb/src/wb.js
// https://github.com/Canvasbird/canvasboard/blob/8cde1f5c3bce77938d53d6c1aa4e37bdffab068c/src/app/components/new-board/new-board.component.ts
// https://github.com/tannerkrewson/drawphone/blob/ad6ffb3259c25ff46cfcd8935295a2ac761c2ca7/client/canvas.js
// https://github.com/oppia/oppia/blob/5bb07f6b17f19cdba43d0581a844be558a546619/extensions/objects/templates/svg-editor.component.spec.ts
// https://github.com/ObjTube/front-end-roadmap/blob/18d638411ab9b282cb1ccd352e1edb1fed2a141c/src/page/index/drawRoadmap.js
// https://github.com/slaylines/canvas-engines-comparison/blob/bc02a4d1992c7d297d51e5a8fb8289fbb8b6129a/src/scripts/fabric.js
// https://github.com/nhn/tui.image-editor/blob/7ef094a0a9479cd75f322b5a87e322a43f75ea6d/apps/image-editor/src/js/graphics.js