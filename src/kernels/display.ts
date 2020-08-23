import { GPU } from 'gpu.js';

/**
 * @param gpu GPU.js Instance
 * @param dimensions Dimensions of the Output Graph
 */
export function getDisplayKernel(
  gpu: GPU,
  dimensions: import('../renderers/RealRenderer').GraphDimensions
) {
  return gpu.createKernel(function(graphPixels) {
    const color = graphPixels[this.thread.y][this.thread.x];

    this.color(color[0], color[1], color[2]);
  },
  {
    output: dimensions,
    graphical: true
  })
}