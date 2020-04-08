/**
 * @param {Object} gpu GPU.js instance
 * @param {Object} dimensions Dimensions of Graph
 * @param {String} progressiveAxis The axis which progresses.
 * @param {Number} xOffset
 * @param {Number} yOffset
 * @param {Float32Array} axesColor
 * @param {Float32Array} bgColor
 */
function getProgressGraphKernel(gpu, dimensions, progressiveAxis, xOffset, yOffset, axesColor, bgColor) {
  return gpu.createKernel(function(graphPixels, numProgress) {
    const outX = this.output.x, outY = this.output.y;
    if (
      (this.thread.x * Math.abs(this.constants.progressiveAxis - 1) >= (outX - numProgress)) || 
      (this.thread.y * this.constants.progressiveAxis >= (outY + numProgress))
    ) {
      const X = Math.floor(outY * (this.constants.xOffset / 100));
      const Y = Math.floor(outX * (this.constants.yOffset / 100));

      if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
      else return this.constants.bgColor; 
    }
    else {
      return graphPixels[
        this.thread.y +
        numProgress*this.constants.progressiveAxis
      ][
        this.thread.x +
        numProgress*Math.abs(this.constants.progressiveAxis - 1)
      ]
    }
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      progressiveAxis: progressiveAxis == 'y' ? 1 : 0,
      xOffset,
      yOffset,
      axesColor,
      bgColor
    },
    constantTypes: {
      progressiveAxis: 'Integer',
      xOffset: 'Float',
      yOffset: 'Float',
      axesColor: 'Array(3)',
      bgColor: 'Array(3)'
    }
  })
}

module.exports = getProgressGraphKernel;