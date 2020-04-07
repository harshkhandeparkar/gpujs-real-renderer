const LineGraph = new GPUjsRealRenderer.RealRenderer({
  canvasTag: 'main-canvas',
  dimensions: [1280, 720],
  xOffset: 10, // 20%
  yOffset: 10,  // 80%
  xScaleFactor: 20,
  yScaleFactor: 10
})

LineGraph.draw(1)
