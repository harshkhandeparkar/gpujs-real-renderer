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
