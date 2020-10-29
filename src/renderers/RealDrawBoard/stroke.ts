import { RealDrawBoard } from './RealDrawBoard';
import { Color } from '../../types/RealRendererTypes';

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number]
) {
  this._strokeHappening = true;

  this._drawnPaths[this._pathIndex + 1] = {
    pathCoords: [],
    color: <Color>this.brushColor.map(x => x),
    mode: this.mode,
    brushSize: this.brushSize,
    eraserSize: this.eraserSize
  }

  this._lastCoords = coords;
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number]
) {
  if (
    this._lastCoords[0] === endCoords[0] &&
    this._lastCoords[1] === endCoords[1]
  ) {
    this._plot(...endCoords);
    this._drawnPaths[this._pathIndex + 1].pathCoords.push([...endCoords, true]);
  }

  if (this._strokeHappening) {
    this.canvas.removeEventListener('mousemove', this._strokeEventListener);
    this._lastCoords = null;

    if (this._drawnPaths[this._pathIndex + 1].pathCoords.length === 0) this._drawnPaths.splice(-1, 1);
    else {
      this._drawnPaths = this._drawnPaths.slice(0, this._pathIndex + 2); // Overwrite further paths to prevent wrong redos
      this._pathIndex++;
    }

    this._strokeHappening = false;
  }
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number]
) {
  this._strokeHappening = true;
  this._drawnPaths[this._pathIndex + 1].pathCoords.push([...coords, false]);
  this._stroke(...coords);
  this._lastCoords = coords;
}
