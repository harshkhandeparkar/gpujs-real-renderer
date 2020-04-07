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
    const X = Math.floor(this.output.y * (this.constants.xOffset / 100));
    const Y = Math.floor(this.output.x * (this.constants.yOffset / 100));

    if (this.thread.x === Y || this.thread.y === X) return [1, 1, 1];
    else return [0, 0, 0]; 

    if (this.thread.x === X || this.thread.y === Y) return this.constants.axesColor;
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
    }
  })
}

module.exports = getBlankGraphKernel;