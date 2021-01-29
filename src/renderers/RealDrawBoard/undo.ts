import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';

export function undo(this: RealDrawBoard, numUndo: number = 1) {
  if (
    this._currentSnapshotIndex - numUndo >= 0 &&
    this._currentSnapshotIndex - numUndo < this._snapshots.length
  ) {
    const wasDrawing = this._isDrawing;
    this.stopRender();

    this.graphPixels = <Texture>this._loadData(this._snapshots[this._currentSnapshotIndex - numUndo]);
    this._currentSnapshotIndex -= numUndo;

    this._display(this.graphPixels);

    if (wasDrawing) this.startRender();
  }

  return this;
}

export function redo(this: RealDrawBoard, numRedo: number = 1) {
  this.undo(-numRedo);

  return this;
}
