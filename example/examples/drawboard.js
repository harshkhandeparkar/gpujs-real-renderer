// Draw Board
const drawBoardOptions = {
  canvas: document.getElementById('drawboard-canvas'),
  dimensions: [420, 360],

  xScaleFactor: 1,
  yScaleFactor: 1,

  bgColor: [0, 0, 0],
  axesColor: [0, 0, 0],

  drawsPerFrame: 2, // Draws twice before displaying the pixels (every browser frame)
  timeStep: 1 / 120, // Increases internal time count by 1 / 120 every *draw*

  xOffset: 0, // 100%
  yOffset: 0, // 100%

  brushSize: 5, // The radius of one point of data, in coordinate units
  brushColor: [1, 1, 1], // Color of the brush
}

const DrawBoard = new GPUjsRealRenderer.RealDrawBoard(drawBoardOptions);
DrawBoard.startRender();
