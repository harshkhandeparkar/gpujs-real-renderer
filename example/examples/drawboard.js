// Draw Board
const drawBoardOptions = {
  canvas: document.getElementById('drawboard-canvas'),
  dimensions: [420, 360],

  xScaleFactor: 1,
  yScaleFactor: 1,

  bgColor: [0.960784314, 0.870588235, 0.701960784], // CSS wheat color
  drawAxes: false,

  drawsPerFrame: 2, // Draws twice before displaying the pixels (every browser frame)
  timeStep: 1 / 120, // Increases internal time count by 1 / 120 every *draw*

  xOffset: 10, // 100%
  yOffset: 0, // 100%

  brushSize: 5, // The radius of one point of data, in coordinate units
  brushColor: [0, 0, 0], // Color of the brush
}

const DrawBoard = new GPUjsRealRenderer.RealDrawBoard(drawBoardOptions);
DrawBoard.draw().startRender();

const colorWheel = new iro.ColorPicker("#drawboard-colorwheel", {
  width: 100,
  initialColor: '#000',
  handleRadius: 4
})

colorWheel.on('input:change', color => {
  DrawBoard.changeBrushColor([
    color.red / 255,
    color.green / 255,
    color.blue / 255
  ])
})

const drawModeSelector = document.querySelector('#draw-mode');
drawModeSelector.addEventListener('change', e => {
  e.preventDefault();
  DrawBoard.changeMode(drawModeSelector.value);
})

const brushSizeRange = document.querySelector('#brush-size');
brushSizeRange.addEventListener('input', e => {
  e.preventDefault();
  DrawBoard.changeBrushSize(Number(brushSizeRange.value))
})

const eraserSizeRange = document.querySelector('#eraser-size');
eraserSizeRange.addEventListener('input', e => {
  e.preventDefault();
  DrawBoard.changeEraserSize(Number(eraserSizeRange.value))
})
