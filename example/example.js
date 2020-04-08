const LineGraph = new GPUjsRealRenderer.RealLineGraph({
  canvasTag: 'line-canvas',
  dimensions: [1280, 720],

  xScaleFactor: 10,
  yScaleFactor: 1,

  bgColor: [0.2, 0.2, 0.2],
  axesColor: [0.2, 1, 1],

  drawsPerFrame: 2, // Draws twice before displaying the pixels (every browser frame)
  timeStep: 1 / 120, // Increases internal time count by 1 / 120 every *draw*

  xOffset: 20, // 20%
  yOffset: 10, // 10%
  
  progressiveAxis: 'x', // x -> Graph moves along x-axis; y -> Graph moves along y-axis
  progressionMode: 'continous', // continous -> Axis always moves; overfloa -> Axis only moves when space for new data is inadequate;
  progressInterval: 0.4, // Axis moves by one pixel every 0.4 internal time units (Only for continous type)

  brushSize: 1, // The radius of one point of data, in coordinate units
  brushColor: [1, 0, 0] // Color of the brush
})

LineGraph.draw();

document.getElementById('line-btn').onclick = e => {
  e.preventDefault();

  if (LineGraph.doRender) {
    LineGraph.stopRender();
    document.getElementById('line-btn').innerText = 'Start Rendering';
  }
  else {
    LineGraph.startRender();
    document.getElementById('line-btn').innerText = 'Stop Rendering';
  }
}
