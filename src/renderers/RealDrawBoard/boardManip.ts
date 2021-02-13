import { RealDrawBoard } from './RealDrawBoard';
import { Color } from '../../types/RealRendererTypes';
import { Texture } from 'gpu.js';
import { Tool, tools } from './tools/tools';

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

export function changeTool(this: RealDrawBoard, newTool: Tool) {
  this.tool = newTool;
  this._startStroke = tools[this.tool]._startStroke;
  this._doStroke = tools[this.tool]._doStroke;
  this._endStroke = tools[this.tool]._endStroke;
  this._toolPreview = tools[this.tool]._toolPreview;
  return this;
}

export function clear(this: RealDrawBoard) {
  this._snapshots = [];
  this._currentSnapshotIndex = 0;
  this._lastCoords.clear();

  this.graphPixels = <Texture>this._blankGraph();
  this._snapshots[0] = this.getData();
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
  this.tool = this.options.tool;

  this._isDrawing = false;
  this._currentSnapshotIndex = 0;
  this._snapshots = [this.getData()];
  this._lastCoords.clear();

  this.stopRender();
}
