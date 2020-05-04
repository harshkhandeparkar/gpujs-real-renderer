const options = {
  canvasTag: 'line-canvas',
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
  progressionMode: 'overflow', // continous -> Axis always moves; overfloa -> Axis only moves when space for new data is inadequate;
  progressInterval: 0.4, // Axis moves by one pixel every 0.4 internal time units (Only for continous type)

  brushSize: 2, // The radius of one point of data, in coordinate units
  brushColor: [0.76, 0, 0], // Color of the brush

  lineThickness: 0.03, // Thickness of the line joining points
  lineColor: [0.1, 0.2, 0.8]
}

const LineGraph = new GPUjsRealRenderer.RealLineGraph(options)

LineGraph.draw();

const ComplexGraph = new GPUjsRealRenderer.RealComplexSpace({
  canvasTag: 'complex-canvas',
  xScaleFactor: 1,
  dimensions: [420, 360]
})

window.ComplexGraph = ComplexGraph;
window.Complex = ComplexGraph.Complex;

ComplexGraph.draw();

// if (LineGraph.progressionMode == 'continous') {
  // document.getElementById('line-btn').onclick = e => {
  //   e.preventDefault();

  //   if (LineGraph.doRender) {
  //     LineGraph.stopRender();
  //     document.getElementById('line-btn').innerText = 'Start Rendering';
  //   }
  //   else {
  //     LineGraph.startRender();
  //     document.getElementById('line-btn').innerText = 'Stop Rendering';
  //   }
  // }
// }
// else document.getElementById('line-btn').disabled = true;

document.getElementById('add').onclick = e => {
  e.preventDefault();

  if (typeof document.getElementById('value').value != 'undefined') {
    LineGraph.addData(document.getElementById('value').value);
  }
}
