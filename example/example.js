const LineGraph = new GPUjsRealRenderer.RealLineGraph({
  canvasTag: 'line-canvas',
  dimensions: [1280, 720],
  xOffset: 20, // 20%
  yOffset: 10,  // 80%
  xScaleFactor: 20,
  yScaleFactor: 10,
  progressInterval: 0.4,
  progressiveAxis: 'x'
})

LineGraph.draw();
