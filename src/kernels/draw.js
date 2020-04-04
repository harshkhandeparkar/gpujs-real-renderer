/**
 * 
 * @param {Object} gpu GPU.js instance.
 * @param {Object} dimensions Dimensions of the Graph.
 * @param {Number} xScaleFactor %age X scale factor
 * @param {Number} yScaleFactor %age Y scale factor
 * @param {Function} drawFunc Draw function
 * @param {Object} extraConstants Any extra constants for the kernel.
 */
function getDrawKernel(gpu, dimensions, xScaleFactor, yScaleFactor, drawFunc, extraConstants = {}) {  
  return gpu.createKernel(function(graphPixels, time, data) {
    const x = this.thread.x / this.constants.scaleFactor;
    const y = this.thread.y / this.constants.scaleFactor;
    
    const pix = graphPixels[this.thread.y][this.thread.x]; // Current color value of the pixel

    return drawFunc(x, y, pix, time, data); // Returns an array of colors
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      xScaleFactor,
      yScaleFactor,
      ...extraConstants
    }
  }).setFunctions([
    drawFunc
  ])
}