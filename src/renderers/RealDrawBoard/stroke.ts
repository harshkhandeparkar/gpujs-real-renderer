import { RealDrawBoard } from './RealDrawBoard';
import { Color } from '../../types/RealRendererTypes';

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._drawnPaths[this._pathIndex + 1] = {
    pathCoords: [],
    color: <Color>this.brushColor.map(x => x),
    mode: this.mode,
    brushSize: this.brushSize,
    eraserSize: this.eraserSize
  }

  this._lastCoords.set(identifier, coords);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  if (
    this._lastCoords.get(identifier)[0] === endCoords[0] &&
    this._lastCoords.get(identifier)[1] === endCoords[1]
  ) {
    this._plot(...endCoords);
    if(this._drawnPaths[this._pathIndex + 1]) this._drawnPaths[this._pathIndex + 1].pathCoords.push([...endCoords, true]);
  }

  this._lastCoords.delete(identifier);

  if (this._drawnPaths[this._pathIndex + 1].pathCoords.length === 0) this._drawnPaths.splice(-1, 1);
  else {
    this._drawnPaths = this._drawnPaths.slice(0, this._pathIndex + 2); // Overwrite further paths to prevent wrong redos
    this._pathIndex++;
  }
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._drawnPaths[this._pathIndex + 1].pathCoords.push([...coords, false]);
  this._stroke(coords[0], coords[1], identifier);
  this._lastCoords.set(identifier, coords);
}
