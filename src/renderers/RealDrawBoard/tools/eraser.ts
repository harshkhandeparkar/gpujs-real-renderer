import { RealDrawBoard } from '../RealDrawBoard';
import { Texture } from 'gpu.js';

export const name = 'eraser';

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._doPreview = false;
  this._plot(coords[0], coords[1], this.eraserSize, this.bgColor);

  this._lastCoords.set(identifier, coords);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  this._doPreview = true;
  this._plot(endCoords[0], endCoords[1], this.eraserSize, this.bgColor);

  this._lastCoords.delete(identifier);
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._plot(coords[0], coords[1], this.eraserSize, this.bgColor);
  this._stroke(coords[0], coords[1], this.eraserSize, this.bgColor, identifier);

  this._lastCoords.set(identifier, coords);
}

export function _toolPreview(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
): Texture {
  return <Texture>this._previewPlot(
    this.graphPixels,
    coords[0],
    coords[1],
    this.eraserSize,
    this.bgColor
  )
}
