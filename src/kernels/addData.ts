import { GPU } from 'gpu.js';
import { GraphDimensions, Color } from '../types/RealRendererTypes';
import { Axis } from '../types/RealLineGraphTypes';

/**
 * 
 * @param gpu 
 * @param dimensions 
 * @param brushSize 
 * @param brushColor
 * @param xScaleFactor
 * @param yScaleFactor
 * @param xOffset
 * @param yOffset
 * @param lineThickness
 * @param lineColor
 * @param progressiveAxis
 */
export function getAddDataKernel(
  gpu: GPU,
  dimensions: GraphDimensions,
  brushSize: number,
  brushColor: Color,
  xOffset: number,
  yOffset: number,
  lineThickness: number,
  lineColor: Color,
  progressiveAxis: Axis
) {
  return gpu.createKernel(
    function(
      graphPixels: any,
      value: any,
      dataIndex: number,
      lastData: any,
      numProgress: number,
      xScaleFactor: number,
      yScaleFactor: number
    ) {
      const x = this.thread.x + numProgress * Math.abs((this.constants.progressiveAxis as number) - 1),
        y = this.thread.y + numProgress * (this.constants.progressiveAxis as number);

      const val = value[0];
      const last = lastData[0];
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / xScaleFactor - (outX * (this.constants.yOffset as number / 100)) / xScaleFactor;
      const Y = y / yScaleFactor - (outY * (this.constants.xOffset as number / 100)) / yScaleFactor;

      const xDist = (X - dataIndex) * xScaleFactor;
      const yDist = (Y - val) * yScaleFactor;

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      let lineEqn = X * (val - last) - Y - dataIndex * (val - last) + val;
      let lineDist = Math.abs(lineEqn) / Math.sqrt((val - last)*(val - last) + 1)

      if (dist <= this.constants.brushSize) return this.constants.brushColor;
      else if (
        lineDist <= this.constants.lineThickness &&
        X <= dataIndex &&
        X >= dataIndex - 1 &&
        Y <= Math.max(val, last) &&
        Y >= Math.min(val, last)
      ) return this.constants.lineColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        brushSize,
        brushColor,
        lineThickness,
        lineColor,
        xOffset,
        yOffset,
        progressiveAxis: progressiveAxis == 'y' ? 1 : 0
      },
      constantTypes: {
        brushColor: 'Array(3)',
        brushSize: 'Float',
        lineThickness: 'Float',
        lineColor: 'Array(3)',
        xOffset: 'Float',
        yOffset: 'Float',
        progressiveAxis: 'Integer'
      }
    }
  )
}

module.exports = getAddDataKernel;