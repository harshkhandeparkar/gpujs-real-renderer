import { RealDrawBoard } from './RealDrawBoard';

export function _getMouseCoords(
  this: RealDrawBoard,
  e: MouseEvent
): [number, number] {
  let x = e.offsetX; // in pixels
  let y = this.dimensions[1] - e.offsetY // in pixels

  x = x / this.xScaleFactor - (this.dimensions[0] * (this.yOffset / 100)) / this.xScaleFactor;
  y = y / this.yScaleFactor - (this.dimensions[1] * (this.xOffset / 100)) / this.yScaleFactor;

  return [x, y]; // In graph coordinates
}
