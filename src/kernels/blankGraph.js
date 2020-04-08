/**
 * @param {Object} gpu GPU.js instance
 * @param {Object} dimensions Dimensions of Graph
 * @param {Number} xOffset 
 * @param {Number} yOffset 
 * @param {Float32Array} bgColor 
 * @param {Float32Array} axesColor 
 */
function getBlankGraphKernel(gpu, dimensions, xOffset, yOffset, bgColor, axesColor) {
  return gpu.createKernel(function() {
    const outX = this.output.x, outY = this.output.y;

    const X = Math.floor(outY * (this.constants.xOffset / 100));
    const Y = Math.floor(outX * (this.constants.yOffset / 100));

    if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
    else return this.constants.bgColor; 
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      xOffset,
      yOffset,
      bgColor,
      axesColor
    },
    constantTypes: {
      bgColor: 'Array(3)',
      axesColor: 'Array(3)',
      xOffset: 'Float',
      yOffset: 'Float'
    }
  })
}

module.exports = getBlankGraphKernel;