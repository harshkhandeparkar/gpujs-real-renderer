import { GPU } from 'gpu.js';
import { GraphDimensions } from '../types/RealRendererTypes';

/**
 * @param gpu GPU.js Instance
 * @param dimensions Dimensions of the Output Graph
 */
export function getLoadDataKernel(
  gpu: GPU,
  dimensions: GraphDimensions
) {
  return gpu.createKernel(
    function(graphPixels) {
      return [
        graphPixels[this.thread.y][this.thread.x][0],
        graphPixels[this.thread.y][this.thread.x][1],
        graphPixels[this.thread.y][this.thread.x][2]
      ]
    },
    {
      output: dimensions,
      pipeline: true
    }
  )
}
