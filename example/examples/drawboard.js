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

  toolSettings: {
    brushSize: 5, // The radius of one point of data, in coordinate units
    brushColor: [1, 1, 1], // Color of the brush
    lineColor: [1, 1, 1], // Color of the line
    lineSize: 5,
    changeSpeed: 2,
    eraserSize: 5
  },

  allowUndo: true
}

const DrawBoard = new GPUjsRealRenderer.RealDrawBoard(drawBoardOptions);
DrawBoard.draw().startRender();

const colorWheel = new iro.ColorPicker("#drawboard-colorwheel", {
  width: 100,
  color: '#fff',
  handleRadius: 4
})

colorWheel.on('input:change', color => {
  DrawBoard.changeToolSetting(
    'lineColor',
    [
    color.red / 255,
    color.green / 255,
    color.blue / 255
  ])
  DrawBoard.changeToolSetting(
    'brushColor',
    [
    color.red / 255,
    color.green / 255,
    color.blue / 255
  ])
})

const toolSelector = document.querySelector('#draw-tool');
toolSelector.addEventListener('change', e => {
  e.preventDefault();
  DrawBoard.changeTool(toolSelector.value);
})

const brushSizeRange = document.querySelector('#brush-size');
brushSizeRange.addEventListener('input', e => {
  e.preventDefault();
  DrawBoard.changeToolSetting('brushSize', Number(brushSizeRange.value));
  DrawBoard.changeToolSetting('lineSize', Number(brushSizeRange.value));
})

const eraserSizeRange = document.querySelector('#eraser-size');
eraserSizeRange.addEventListener('input', e => {
  e.preventDefault();
  DrawBoard.changeToolSetting('eraserSize', Number(eraserSizeRange.value))
})

document.querySelector('#draw-undo').addEventListener('click', e => {
  e.preventDefault();
  DrawBoard.undo();
})

document.querySelector('#draw-redo').addEventListener('click', e => {
  e.preventDefault();
  DrawBoard.redo();
})

document.querySelector('#draw-clear').addEventListener('click', e => {
  e.preventDefault();
  DrawBoard.clear();
})
