import { RealDrawBoard } from '../RealDrawBoard';
import { Texture } from 'gpu.js';

export const name = 'brush';

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._doPreview = false;
  this._plot(coords[0], coords[1], this.brushSize, this.brushColor);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  this._plot(endCoords[0], endCoords[1], this.brushSize, this.brushColor);
  this._doPreview = true;
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._plot(coords[0], coords[1], this.brushSize, this.brushColor);
  this._stroke(coords[0], coords[1], this.brushSize, this.brushColor, identifier);
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
    this.brushSize,
    this.brushColor
  )
}
