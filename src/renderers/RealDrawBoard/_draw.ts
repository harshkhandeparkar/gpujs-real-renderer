import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';

export function _plot(this: RealDrawBoard, x: number, y: number) {
  this.graphPixels = <Texture>this._plotKernel(
    this._cloneTexture(this.graphPixels),
    x,
    y,
    this.mode === 'paint' ? this.brushSize : this.eraserSize,
    this.mode === 'paint' ? this.brushColor : this.bgColor
  )

  this._display(this.graphPixels);

  return this;
}

export function _stroke(
  this: RealDrawBoard,
  x: number,
  y: number,
  identifier: string
) {
  if (!this._lastCoords.has(identifier)) this._lastCoords.set(identifier, [x, y]);

  // this.graphPixels = <Texture>this._strokeKernel(
  //   this._cloneTexture(this.graphPixels),
  //   this._lastCoords.get(identifier),
  //   [x, y],
  //   this.mode === 'paint' ? this.brushSize : this.eraserSize,
  //   this.mode === 'paint' ? this.brushColor : this.bgColor
  // )

  const lastCoords = this._lastCoords.get(identifier);
  const cos = (x - lastCoords[0]) / Math.sqrt((x - lastCoords[0]) ** 2 + (y - lastCoords[1]) ** 2);
  const sin = (y - lastCoords[1]) / Math.sqrt((x - lastCoords[0]) ** 2 + (y - lastCoords[1]) ** 2);
  const distance = Math.sqrt((x - lastCoords[0]) ** 2 + (y - lastCoords[1]) ** 2);

  for (let k = 0; k <= 1; k += 1 / distance) {
    const x1 = lastCoords[0] + cos * k * distance;
    const y1 = lastCoords[1] + sin * k * distance;

    this.graphPixels = <Texture>this._plotKernel(
      this._cloneTexture(this.graphPixels),
      Math.round(x1),
      Math.round(y1),
      this.mode === 'paint' ? this.brushSize : this.eraserSize,
      this.mode === 'paint' ? this.brushColor : this.bgColor
    )
  }

  this._display(this.graphPixels);
}
