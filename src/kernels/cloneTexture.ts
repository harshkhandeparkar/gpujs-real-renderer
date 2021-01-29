import { GPU } from 'gpu.js';
import { GraphDimensions } from '../types/RealRendererTypes';

/**
 * @param gpu GPU.js instance
 * @param dimensions Dimensions of Graph
 */
export function getCloneTextureKernel(
  gpu: GPU,
  dimensions: GraphDimensions
) {
  return gpu.createKernel(function(graphPixels) {
    return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true
  })
}
