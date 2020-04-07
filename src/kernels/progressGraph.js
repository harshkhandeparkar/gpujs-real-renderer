/**
 * @param {Object} gpu GPU.js instance
 * @param {Object} dimensions Dimensions of Graph
 * @param {String} progressiveAxis The axis which progresses.
 */
function getProgressGraphKernel(gpu, dimensions, progressiveAxis) {
  return gpu.createKernel(function(graphPixels) {
    if ((this.thread.x + 1) === this.output.x) {
      // Temporary
      // TODO: Procedurally generate the axes and background
      return [0, 0, 0];
    }
    else {
      return graphPixels[this.thread.y][this.thread.x + 1]
    }
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      progressiveAxis: progressiveAxis == 'x' ? 0 : 1
    }
  })
}

module.exports = getProgressGraphKernel;