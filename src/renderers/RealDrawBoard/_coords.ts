import { RealDrawBoard } from './RealDrawBoard';

export function _getMouseCoords(
  this: RealDrawBoard,
  e: MouseEvent
): [number, number] {
  const graphX = (e.offsetX * this.dimensions[0]) / this.canvas.getBoundingClientRect().width; // Handle canvas resize
  const graphY = (e.offsetY * this.dimensions[1]) / this.canvas.getBoundingClientRect().height;

  let x = graphX; // in pixels;
  let y = this.dimensions[1] - graphY; // in pixels

  x = x / this.xScaleFactor - (this.dimensions[0] * (this.yOffset / 100)) / this.xScaleFactor;
  y = y / this.yScaleFactor - (this.dimensions[1] * (this.xOffset / 100)) / this.yScaleFactor;

  return [x, y]; // In graph coordinates
}

export function _getTouchCoords(
  this: RealDrawBoard,
  touch: Touch
): [number, number] {
  const graphX = ((touch.clientX - this.canvas.getBoundingClientRect().left) * this.dimensions[0]) / this.canvas.getBoundingClientRect().width; // Handle canvas resize
  const graphY = ((touch.clientY - this.canvas.getBoundingClientRect().top) * this.dimensions[1]) / this.canvas.getBoundingClientRect().height;

  let x = graphX;
  let y = this.dimensions[1] - graphY;

  x = x / this.xScaleFactor - (this.dimensions[0] * (this.yOffset / 100)) / this.xScaleFactor;
  y = y / this.yScaleFactor - (this.dimensions[1] * (this.xOffset / 100)) / this.yScaleFactor;

  return [x, y];
}
