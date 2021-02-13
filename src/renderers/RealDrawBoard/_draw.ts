import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';
import { Color } from '../../types/RealRendererTypes';

export function _plot(
  this: RealDrawBoard,
  x: number,
  y: number,
  size: number,
  color: Color
) {
  this.graphPixels = <Texture>this._plotKernel(
    this._cloneTexture(this.graphPixels),
    x,
    y,
    size,
    color
  )

  return this;
}

export function _stroke(
  this: RealDrawBoard,
  x: number,
  y: number,
  size: number,
  color: Color,
  identifier: string
) {
  if (!this._lastCoords.has(identifier)) this._lastCoords.set(identifier, [x, y]);

  this.graphPixels = <Texture>this._strokeKernel(
    this._cloneTexture(this.graphPixels),
    this._lastCoords.get(identifier),
    [x, y],
    size,
    color
  )
}
