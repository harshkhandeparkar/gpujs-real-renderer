import { RealDrawBoard } from './RealDrawBoard';
import { Color } from '../../types/RealRendererTypes';
import { DrawMode } from '../../types/RealDrawBoardTypes';
import { Texture } from 'gpu.js';

export function changeBrushColor(this: RealDrawBoard, color: Color) {
  this.brushColor = color;
  return this;
}

export function changeBrushSize(this: RealDrawBoard, newSize: number) {
  this.brushSize = newSize;
  return this;
}

export function changeEraserSize(this: RealDrawBoard, newSize: number) {
  this.eraserSize = newSize;
  return this;
}

export function changeMode(this: RealDrawBoard, newMode: DrawMode) {
  this.mode = newMode;
  return this;
}

export function clear(this: RealDrawBoard) {
  this._strokeHappening = false;
  this._drawnPaths = [];
  this._pathIndex = -1;
  this._lastCoords = null;

  this.graphPixels = <Texture>this._blankGraph();
  this._display(this.graphPixels);

  return this;
}

export function _resetBoard(this: RealDrawBoard) {
  this.xScaleFactor = this.options.xScaleFactor;
  this.yScaleFactor = this.options.yScaleFactor;
  this.brushColor = this.options.brushColor;
  this.brushSize = this.options.brushSize;
  this.bgColor = this.options.bgColor;
  this.eraserSize = this.options.eraserSize;
  this.mode = this.options.mode;

  this._isDrawing = false;
  this._strokeHappening = false;
  this._drawnPaths = [];
  this._pathIndex = -1;
  this._lastCoords = null;

  this.stopRender();
}
