// Line Graph
const lineGraphOptions = {
  canvas: document.getElementById('line-canvas'),
  dimensions: [420, 360],

  xScaleFactor: 20,
  yScaleFactor: 0.2,

  bgColor: [0.2, 0.2, 0.2],
  axesColor: [0.2, 1, 1],

  drawsPerFrame: 2, // Draws twice before displaying the pixels (every browser frame)
  timeStep: 1 / 120, // Increases internal time count by 1 / 120 every *draw*

  xOffset: 20, // 20%
  yOffset: 10, // 10%

  progressiveAxis: 'x', // x -> Graph moves along x-axis; y -> Graph moves along y-axis
  progressionMode: 'squeeze', // continous -> Axis always moves; overflow -> Axis only moves when space for new data is inadequate;
  progressInterval: 0.4, // Axis moves by one pixel every 0.4 internal time units (Only for continous type)

  brushSize: 2, // The radius of one point of data, in coordinate units
  brushColor: [0.76, 0, 0], // Color of the brush

  lineThickness: 0.03, // Thickness of the line joining points
  lineColor: [0.1, 0.2, 0.8]
}

const LineGraph = new GPUjsRealRenderer.RealLineGraph(lineGraphOptions);
const progressModeSelector = document.querySelector('#progress-mode');
// progressModeSelector.oninput = e => {
//   e.preventDefault();
//   lineGraphOptions.progressionMode = progressModeSelector.value;
//   LineGraph.progressionMode = lineGraphOptions.progressionMode;
//   LineGraph.reset();
// }

LineGraph.draw(); // To draw the initial axes


document.getElementById('add').onclick = e => {
  e.preventDefault();

  if (typeof document.getElementById('value').value != 'undefined') {
    LineGraph.addData(document.getElementById('value').value);
  }
}
