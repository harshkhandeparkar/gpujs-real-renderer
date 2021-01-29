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
        graphPixels[this.thread.y * this.output.x * 3 + this.thread.x * 3 + 0],
        graphPixels[this.thread.y * this.output.x * 3 + this.thread.x * 3 + 1],
        graphPixels[this.thread.y * this.output.x * 3 + this.thread.x * 3 + 2]
      ]
    },
    {
      argumentTypes: {
        graphPixels: 'Array'
      },
      output: dimensions,
      pipeline: true
    }
  )
}
