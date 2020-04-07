/**
 * @param {Object} gpu GPU.js instance
 * @param {Object} dimensions Dimensions of Graph
 */
function getCloneTextureKernel(gpu, dimensions) {
  return gpu.createKernel(function(graphPixels) {
    return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true
  })
}

module.exports = getCloneTextureKernel;