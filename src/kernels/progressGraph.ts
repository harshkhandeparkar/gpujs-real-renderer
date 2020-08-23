import { GPU, IKernelRunShortcut } from 'gpu.js';
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
export function getProgressGraphKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  progressiveAxis: Axis,
  xOffset: number,
  yOffset: number,
  axesColor: Color,
  bgColor: Color
): IKernelRunShortcut {
  return gpu.createKernel(
    function(
      graphPixels: any, // making this Texture throws an error
      numProgress: number
    ) {
      const outX = this.output.x, outY = this.output.y;
      if (
        (this.thread.x * Math.abs(this.constants.progressiveAxis as number - 1) >= (outX - numProgress)) || 
        (this.thread.y * (this.constants.progressiveAxis as number) >= (outY + numProgress))
      ) {
        const X = Math.floor(outY * (this.constants.xOffset as number / 100));
        const Y = Math.floor(outX * (this.constants.yOffset as number / 100));

        if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor as Color;
        else return this.constants.bgColor as Color; 
      }
      else {
        return graphPixels[
          this.thread.y +
          numProgress * (this.constants.progressiveAxis as number)
        ][
          this.thread.x +
          numProgress*Math.abs((this.constants.progressiveAxis as number) - 1)
        ] as Color
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