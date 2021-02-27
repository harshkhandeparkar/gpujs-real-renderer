import { RealDrawBoard } from './RealDrawBoard';
import { Texture } from 'gpu.js';
import { Tool, tools, ToolSettings } from './tools/tools';

export function changeTool(this: RealDrawBoard, newTool: Tool) {
  this.tool = newTool;
  this._startStroke = tools[this.tool]._startStroke;
  this._doStroke = tools[this.tool]._doStroke;
  this._endStroke = tools[this.tool]._endStroke;
  this._toolPreview = tools[this.tool]._toolPreview;
  return this;
}

export function changeToolSetting(
  this: RealDrawBoard,
  settingName: keyof ToolSettings,
  value: any
) {
  this.toolSettings[settingName] = value;

  return this;
}

export function clear(this: RealDrawBoard) {
  this._snapshots = [];
  this._currentSnapshotIndex = 0;
  this._lastCoords.clear();

  this.graphPixels = <Texture>this._blankGraph();
  if (this._maxSnapshots > 0) this._snapshots[0] = this.getData();
  this._display(this.graphPixels);

  return this;
}

export function _resetBoard(this: RealDrawBoard) {
  this.xScaleFactor = this.options.xScaleFactor;
  this.yScaleFactor = this.options.yScaleFactor;
  this.bgColor = this.options.bgColor;
  this.tool = this.options.tool;
  this.toolSettings = this.options.toolSettings;

  this._isDrawing = false;
  this._currentSnapshotIndex = 0;
  if (this._maxSnapshots > 0) this._snapshots = [this.getData()];
  this._lastCoords.clear();

  this.stopRender();
}
