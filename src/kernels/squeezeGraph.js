/**
 * @param {Object} gpu GPU.js instance
 * @param {Object} dimensions Dimensions of Graph
 * @param {String} progressiveAxis The axis which progresses.
 * @param {Number} xOffset
 * @param {Number} yOffset
 * @param {Float32Array} axesColor
 * @param {Float32Array} bgColor
 */
function getSqueezeGraphKernel(gpu, dimensions, progressiveAxis, xOffset, yOffset, axesColor, bgColor) {
  return gpu.createKernel(function(graphPixels, scalingFactor) {
    const outX = this.output.x, outY = this.output.y;
    const X = Math.floor(outY * (this.constants.xOffset / 100));
    const Y = Math.floor(outX * (this.constants.yOffset / 100));
    
    if (
      (Math.floor(this.thread.x * (1 - this.constants.progressiveAxis) / scalingFactor) >= outX) || 
      (Math.floor(this.thread.y * this.constants.progressiveAxis / scalingFactor)  >= outY)
    ) {
      if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
      else return this.constants.bgColor; 
    }
    else {
      const newY = this.constants.progressiveAxis == 1 ? Math.floor(this.thread.y / scalingFactor) : Math.floor(this.thread.y);
      const newX = this.constants.progressiveAxis == 0 ? Math.floor(this.thread.x / scalingFactor) : Math.floor(this.thread.x);

      return graphPixels[newY][newX];
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

module.exports = getSqueezeGraphKernel;