/**
 * @param {Object} gpu GPU.js Instance
 * @param {Object} dimensions Dimensions of the Output Graph
 */
function getDisplayKernel(gpu, dimensions) {
  return gpu.createKernel(function(graphPixels) {
    const color = graphPixels[this.thread.y][this.thread.x];

    this.color(color[0], color[1], color[2]);
  },
  {
    output: dimensions,
    graphical: true
  })
}

module.exports = getDisplayKernel;