import { GPU, IKernelFunctionThis } from 'gpu.js';
import { GraphDimensions, Color } from '../types/RealRendererTypes';

interface IPlotKernelThis extends IKernelFunctionThis {
  constants: {
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
 */
export function getPlotKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  xScaleFactor: number,
  yScaleFactor: number,
  xOffset: number,
  yOffset: number
) {
  return gpu.createKernel(
    function(
      this: IPlotKernelThis,
      graphPixels: any,
      valX: number,
      valY: number,
      brushSize: number,
      brushColor: Color
    ) {
      const x = this.thread.x,
        y = this.thread.y;

      const outX = this.output.x, outY = this.output.y;

      const x1 = valX * this.constants.xScaleFactor + (outX * (this.constants.yOffset / 100));
      const y1 = valY * this.constants.yScaleFactor + (outY * (this.constants.xOffset / 100));

      const xDist = (x - x1);
      const yDist = (y - y1);

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      const graphColor = graphPixels[this.thread.y][this.thread.x];

       if (dist <= brushSize + 1) {
        let r = 0, g = 0, b = 0;

        // The following code basically blurs the line by convolving a simple average kernel
        // Very crude implementation of https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-22-fast-prefiltered-lines
        for (let i = x - 1; i <= x + 1; i++) {
          for (let j = y - 1; j <= y + 1; j++) {
            const xDist = (i - x1);
            const yDist = (j - y1);

            const distance = Math.sqrt(xDist ** 2 + yDist ** 2);

            if (distance > brushSize) {
              r += graphColor[0];
              g += graphColor[1];
              b += graphColor[2];
            }
            else {
              r += brushColor[0];
              g += brushColor[1];
              b += brushColor[2];
            }
          }
        }

        r /= 9;
        g /= 9;
        b /= 9;

        return [r, g, b]
      }
      else return graphColor;
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset
      },
      constantTypes: {
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    }
  )
}
