import { RealDrawBoard } from '../RealDrawBoard';
import { Texture } from 'gpu.js';
import { Color } from '../../../types/RealRendererTypes';

export const name = 'brush';

export interface BrushSettings {
  brushColor: Color,
  brushSize: number
}

export const BrushDefaults: BrushSettings = {
  brushColor: [1, 1, 1],
  brushSize: 1
}

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._doPreview = false;
  this._plot(coords[0], coords[1], this.toolSettings.brushSize, this.toolSettings.brushColor);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  this._plot(endCoords[0], endCoords[1], this.toolSettings.brushSize, this.toolSettings.brushColor);
  this._doPreview = true;
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._plot(coords[0], coords[1], this.toolSettings.brushSize, this.toolSettings.brushColor);
  this._stroke(coords[0], coords[1], this.toolSettings.brushSize, this.toolSettings.brushColor, identifier);
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
    this.toolSettings.brushSize,
    this.toolSettings.brushColor
  )
}
