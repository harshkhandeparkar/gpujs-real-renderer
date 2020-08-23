import { GPU, IKernelRunShortcut } from "gpu.js";
import { GraphDimensions, Color } from "../types/RealRendererTypes";

/**
 * @param gpu GPU.js instance
 * @param dimensions Dimensions of Graph
 * @param xOffset 
 * @param yOffset 
 * @param bgColor 
 * @param axesColor 
 */
export function getBlankGraphKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  xOffset: number,
  yOffset: number,
  bgColor: Color,
  axesColor: Color
): IKernelRunShortcut {
  return gpu.createKernel(
    function() {
      const outX = this.output.x, outY = this.output.y;

      const X = Math.floor(outY * (this.constants.xOffset as number / 100));
      const Y = Math.floor(outX * (this.constants.yOffset as number / 100));

      if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor as Color;
      else return this.constants.bgColor as Color; 
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        xOffset,
        yOffset,
        bgColor,
        axesColor
      },
      constantTypes: {
        bgColor: 'Array(3)',
        axesColor: 'Array(3)',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    }
  )
}