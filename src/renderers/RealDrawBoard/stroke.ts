import { RealDrawBoard } from './RealDrawBoard';

export function _startStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  if (this._currentSnapshotIndex < this._snapshots.length - 1) this._snapshots.splice(this._currentSnapshotIndex + 1); // Delete all redo snapshots
  this._plot(...coords);

  this._lastCoords.set(identifier, coords);
}

export function _endStroke(
  this: RealDrawBoard,
  endCoords: [number, number],
  identifier: string
) {
  this._plot(...endCoords);

  this._lastCoords.delete(identifier);

  this._snapshots[++this._currentSnapshotIndex] = this.getData();
  if (this._snapshots.length > this._maxSnapshots) {
    this._snapshots.shift();
    this._currentSnapshotIndex--;
  }
}

export function _doStroke(
  this: RealDrawBoard,
  coords: [number, number],
  identifier: string
) {
  this._plot(...coords);
  this._stroke(coords[0], coords[1], identifier);

  this._lastCoords.set(identifier, coords);
}
