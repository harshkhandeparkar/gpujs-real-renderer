/**
 * @param {Object} gpu 
 * @param {Float32Array} dimensions 
 * @param {Number} brushSize 
 * @param {Float32Array} brushColor
 * @param {Number} xScaleFactor
 * @param {Number} yScaleFactor
 * @param {Number} xOffset
 * @param {Number} yOffset
 */
function getPlotComplexKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset) {
  return gpu.createKernel(function(graphPixels, valX, valY) {
    const x = this.thread.x,
      y = this.thread.y;
      
    const outX = this.output.x, outY = this.output.y;

    const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
    const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

    const xDist = (X - valX) * this.constants.xScaleFactor;
    const yDist = (Y - valY) * this.constants.yScaleFactor;

    const dist = Math.sqrt(xDist*xDist + yDist*yDist);

    if (dist <= this.constants.brushSize) return this.constants.brushColor;
    else return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      brushSize,
      brushColor,
      xScaleFactor,
      yScaleFactor,
      xOffset,
      yOffset,
    },
    constantTypes: {
      brushColor: 'Array(3)',
      brushSize: 'Float',
      xScaleFactor: 'Float',
      yScaleFactor: 'Float',
      xOffset: 'Float',
      yOffset: 'Float'
    }
  })
}

module.exports = getPlotComplexKernel;