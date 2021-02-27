import { RealDrawBoard } from '../RealDrawBoard';
import { Texture } from 'gpu.js';
import { Color } from '../../../types/RealRendererTypes';

export const name = 'line';

export interface LineSettings {
  lineThickness: number,
  lineColor: Color
}

export const LineDefaults: LineSettings = {
  lineThickness: 1,
  lineColor: [1, 1, 1]
}

/** key -> identifier, value -> coordinate
   *  For mouse, the key is 'mouse', for touches, stringified identifier -> https://developer.mozilla.org/en-US/docs/Web/API/Touch/identifier
   */
const _startCoords: Map<string, [number, number]> = new Map(); /* key -> identifier, value -> coordinate*/

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._plot(coords[0], coords[1], this.toolSettings.lineThickness, this.toolSettings.lineColor);
  _startCoords.set(identifier, coords);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  this.graphPixels = <Texture>this._strokeKernel(
    this._cloneTexture(this.graphPixels),
    _startCoords.get(identifier),
    endCoords,
    this.toolSettings.lineThickness,
    this.toolSettings.lineColor
  )
  this._plot(endCoords[0], endCoords[1], this.toolSettings.lineThickness, this.toolSettings.lineColor);
  _startCoords.delete(identifier);
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
}

export function _toolPreview(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
): Texture {
  if (_startCoords.has(identifier)) {
    return <Texture>this._previewPlot(
      this._strokeKernel(
        this._cloneTexture(this.graphPixels),
        _startCoords.get(identifier),
        coords,
        this.toolSettings.lineThickness,
        this.toolSettings.lineColor
      ),
      coords[0],
      coords[1],
      this.toolSettings.lineThickness,
      this.toolSettings.lineColor
    )
  }
  else return <Texture>this._previewPlot(
    this.graphPixels,
    coords[0],
    coords[1],
    this.toolSettings.lineThickness,
    this.toolSettings.lineColor
  )
}
