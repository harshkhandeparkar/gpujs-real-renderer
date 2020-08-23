import { GPU, Texture } from 'gpu.js';
import { GraphDimensions, Color } from '../types/RealRendererTypes';

/**
 * @param gpu 
 * @param dimensions 
 * @param brushSize 
 * @param brushColor
 * @param xScaleFactor
 * @param yScaleFactor
 * @param xOffset
 * @param yOffset
 */
export function getPlotComplexKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  brushSize: number,
  brushColor: Color,
  xScaleFactor: number,
  yScaleFactor: number,
  xOffset: number,
  yOffset: number
) {
  return gpu.createKernel(
    function(graphPixels: any, valX: number, valY: number) {
      const x = this.thread.x,
        y = this.thread.y;
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / (this.constants.xScaleFactor as number) - (outX * (this.constants.yOffset as number/ 100)) / (this.constants.xScaleFactor as number);
      const Y = y / (this.constants.yScaleFactor as number) - (outY * (this.constants.xOffset as number/ 100)) / (this.constants.yScaleFactor as number);

      const xDist = (X - valX) * (this.constants.xScaleFactor as number);
      const yDist = (Y - valY) * (this.constants.yScaleFactor as number);

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      if (dist <= this.constants.brushSize) return this.constants.brushColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        brushSize,
        brushColor,
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset,
      },
      constantTypes: {
        brushColor: 'Array(3)',
        brushSize: 'Float',
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    }
  )
}