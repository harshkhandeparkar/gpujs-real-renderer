import { GPU } from 'gpu.js';
import { GraphDimensions, Color } from '../types/RealRendererTypes';
import { Axis } from '../types/RealLineGraphTypes';

/**
 * @param gpu GPU.js instance
 * @param dimensions Dimensions of Graph
 * @param progressiveAxis The axis which progresses.
 * @param xOffset
 * @param yOffset
 * @param axesColor
 * @param bgColor
 */
export function getSqueezeGraphKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  progressiveAxis: Axis,
  xOffset: number,
  yOffset: number,
  axesColor: Color,
  bgColor: Color
) {
  return gpu.createKernel(
    function(
      graphPixels: any,
      squeezingFactor: number
    ) {
      const outX = this.output.x, outY = this.output.y;
      const X = Math.floor(outY * (this.constants.xOffset as number / 100));
      const Y = Math.floor(outX * (this.constants.yOffset as number/ 100));
      
      if (
        (Math.floor(this.thread.x * (1 - (this.constants.progressiveAxis as number)) / squeezingFactor) >= outX) || 
        (Math.floor(this.thread.y * (this.constants.progressiveAxis as number) / squeezingFactor)  >= outY)
      ) {
        if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
        else return this.constants.bgColor; 
      }
      else {
        const newY = this.constants.progressiveAxis == 1 ? Math.floor(this.thread.y / squeezingFactor) : Math.floor(this.thread.y);
        const newX = this.constants.progressiveAxis == 0 ? Math.floor(this.thread.x / squeezingFactor) : Math.floor(this.thread.x);

        return graphPixels[newY][newX];
      }
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        progressiveAxis: progressiveAxis == 'y' ? 1 : 0,
        xOffset,
        yOffset,
        axesColor,
        bgColor
      },
      constantTypes: {
        progressiveAxis: 'Integer',
        xOffset: 'Float',
        yOffset: 'Float',
        axesColor: 'Array(3)',
        bgColor: 'Array(3)'
      }
    }
  )
}