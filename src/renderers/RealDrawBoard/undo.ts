import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';

export function undo(this: RealDrawBoard, numUndo: number = 1) {
  if (this._pathIndex >= numUndo - 1 && this._pathIndex - numUndo < this._drawnPaths.length) {
    this.graphPixels = <Texture>this._blankGraph(); // Start with a blank graph

    const originalMode = this.mode,
    originalBrushColor = this.brushColor,
    originalBrushSize = this.brushSize,
    originalEraserSize = this.eraserSize;

    this._removeDOMEvents();

    this._drawnPaths.slice(0, this._pathIndex - numUndo + 1).forEach(path => {
      this.mode = path.mode;
      this.brushColor = path.color;
      this.brushSize = path.brushSize;
      this.eraserSize = path.eraserSize;

      this._lastCoords.delete('mouse');
      path.pathCoords.forEach(coord => {
        if (coord[2] === false) {
          this._stroke(coord[0], coord[1]); // Replay all strokes
          this._lastCoords.set('mouse', [coord[0], coord[1]]);
        }
        else this._plot(coord[0], coord[1])
      })
    })

    this.mode = originalMode;
    this.brushColor = originalBrushColor;
    this.brushSize = originalBrushSize;
    this.eraserSize = originalEraserSize;

    this._pathIndex -= numUndo;

    this._lastCoords.delete('mouse');
    this._display(this.graphPixels);

    if (this._isDrawing) this.startRender();
  }

  return this;
}

export function redo(this: RealDrawBoard, numRedo: number = 1) {
  this.undo(-numRedo);

  return this;
}
