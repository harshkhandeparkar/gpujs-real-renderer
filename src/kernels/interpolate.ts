import { GPU, IKernelFunctionThis } from 'gpu.js';
import { GraphDimensions, Color } from '../types/RealRendererTypes';

export interface IInterpolateKernelThis extends IKernelFunctionThis {
  constants: {
    lineThickness: number,
    lineColor: [number, number, number],
    xScaleFactor: number,
    yScaleFactor: number,
    xOffset: number,
    yOffset: number
  }
}

/**
 * @param gpu
 * @param dimensions
 * @param xScaleFactor
 * @param yScaleFactor
 * @param xOffset
 * @param yOffset
 * @param lineThickness
 * @param lineColor
 */
export function getInterpolateKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  xScaleFactor: number,
  yScaleFactor: number,
  xOffset: number,
  yOffset: number,
  lineThickness: number,
  lineColor: Color
) {
  return gpu.createKernel(
    function(
      this: IInterpolateKernelThis,
      graphPixels: any,
      val1: [number, number],
      val2: [number, number]
    ) {
      const x = this.thread.x,
        y = this.thread.y;

      const lineHalfThickness = this.constants.lineThickness / 2;

      const x1 = val1[0];
      const y1 = val1[1];

      const x2 = val2[0];
      const y2 = val2[1];

      const outX = this.output.x, outY = this.output.y;

      const X = x / (this.constants.xScaleFactor) - (outX * (this.constants.yOffset / 100)) / (this.constants.xScaleFactor);
      const Y = y / (this.constants.yScaleFactor) - (outY * (this.constants.xOffset / 100)) / (this.constants.yScaleFactor);

      let lineEqn = X * (y1 - y2) - x1 * (y1 - y2) - Y * (x1 - x2) + y1 * (x1 -x2);
      let lineDist = Math.abs(lineEqn) / Math.sqrt((y1 - y2)*(y1 - y2) + (x1 - x2)*(x1 - x2));

      if (
        lineDist <= lineHalfThickness &&
        X <= Math.max(x1, x2) + lineHalfThickness &&
        X >= Math.min(x1, x2) - lineHalfThickness &&
        Y <= Math.max(y1, y2) + lineHalfThickness &&
        Y >= Math.min(y1, y2) - lineHalfThickness
      ) return this.constants.lineColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        lineThickness,
        lineColor,
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset
      },
      constantTypes: {
        lineThickness: 'Float',
        lineColor: 'Array(3)',
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    }
  )
}
