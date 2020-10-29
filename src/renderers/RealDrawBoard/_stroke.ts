import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';

export function _stroke(this: RealDrawBoard, x: number, y: number) {
  if (this._lastCoords === null) this._lastCoords = [x, y];

  this.graphPixels = <Texture>this._strokeKernel(
    this._cloneTexture(this.graphPixels),
    this._lastCoords,
    [x, y],
    this.mode === 'paint' ? this.brushSize : this.eraserSize,
    this.mode === 'paint' ? this.brushColor : this.bgColor
  )

  this._display(this.graphPixels);
}
