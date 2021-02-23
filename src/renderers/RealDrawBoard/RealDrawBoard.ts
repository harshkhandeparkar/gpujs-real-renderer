import { RealRenderer } from '../RealRenderer';

import { Color } from '../../types/RealRendererTypes';
import { RealDrawBoardOptions } from '../../types/RealDrawBoardTypes';
import { RealDrawBoardDefaults } from '../../constants/defaults/RealDrawBoardDefaults';

import { IKernelRunShortcut, Texture } from 'gpu.js';

export * as RealRendererTypes from '../../types/RealRendererTypes';
export * as RealDrawBoardTypes from '../../types/RealDrawBoardTypes';
export * from '../../constants/defaults/RealDrawBoardDefaults';

import { _initializeKernels } from './_initializeKernels';
import { _plot, _stroke } from './_draw';
import { undo, redo } from './undo';
import {
  changeBrushColor,
  changeBrushSize,
  changeEraserSize,
  changeTool,
  clear,
  _resetBoard
} from './boardManip';
import {
  _addDOMEvents,
  _removeDOMEvents
} from './_DOMEvents';
import {
  _getMouseCoords,
  _getTouchCoords
} from './_coords';

import { tools, Tool } from './tools/tools';

export class RealDrawBoard extends RealRenderer {
  options: RealDrawBoardOptions;
  brushSize: number;
  brushColor: Color;
  eraserSize: number;
  tool: Tool = RealDrawBoardDefaults.tool;
  _isDrawing: boolean = false;
  _: boolean = false; // If a tool is drawing a stroke
  _snapshots: (number[][][])[] = []; // Undo snapshots
  _currentSnapshotIndex = 0; // Current snapshot
  _maxSnapshots: number;
  _plotKernel: IKernelRunShortcut;
  _previewPlot: IKernelRunShortcut;
  _strokeKernel: IKernelRunShortcut;
  /** key -> identifier, value -> coordinate
   *  For mouse, the key is 'mouse', for touches, stringified identifier -> https://developer.mozilla.org/en-US/docs/Web/API/Touch/identifier
   */
  _lastCoords: Map<string, [number, number]> = new Map(); /* key -> identifier, value -> coordinate*/
  _doPreview: boolean = true; // If a preview should be drawn

  protected _initializeKernels = _initializeKernels;
  protected _stroke = _stroke;
  protected _plot = _plot;
  protected _resetBoard = _resetBoard;
  protected _addDOMEvents = _addDOMEvents;
  protected _removeDOMEvents = _removeDOMEvents;
  protected _startStroke = tools[RealDrawBoardDefaults.tool]._startStroke;
  protected _endStroke = tools[RealDrawBoardDefaults.tool]._endStroke;
  protected _doStroke = tools[RealDrawBoardDefaults.tool]._doStroke;
  protected _toolPreview = tools[RealDrawBoardDefaults.tool]._toolPreview;
  protected _getMouseCoords = _getMouseCoords;
  protected _getTouchCoords = _getTouchCoords;

  public undo = undo;
  public redo = redo;
  public changeBrushColor = changeBrushColor;
  public changeBrushSize = changeBrushSize;
  public changeEraserSize = changeEraserSize;
  public changeTool = changeTool;
  public clear = clear;

  constructor(options: RealDrawBoardOptions) {
    // *****DEFAULTS*****
    super(options);

    options = {
      ...RealDrawBoardDefaults,
      ...options
    }

    this.options = options;

    this.brushSize = options.brushSize;
    this.brushColor = options.brushColor;

    this.eraserSize = options.eraserSize;
    this._maxSnapshots = options.allowUndo ? Math.max(options.maxUndos + 1, 0) : 0;

    this.changeTool(options.tool);
    // *****DEFAULTS*****

    this._initializeKernels();
    if (this._maxSnapshots > 0) this._snapshots[0] = this.getData();
  }
  // --- DOM Event Listeners ---

  // --- Mouse Events ---
  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      this.canvas.addEventListener('mousemove', this._mouseMoveEventListener);

      if (this._currentSnapshotIndex < this._snapshots.length - 1 && this._maxSnapshots > 0) this._snapshots.splice(this._currentSnapshotIndex + 1); // Delete all redo snapshots
      const coords = this._getMouseCoords(e);

      this._startStroke(
        coords,
        'mouse'
      )
      this._lastCoords.set('mouse', coords);
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      const endCoords = this._getMouseCoords(e);
      this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);
      this._removeDOMEvents();

      if(this._lastCoords.has('mouse')) {
        this._endStroke(endCoords, 'mouse');
        this._lastCoords.delete('mouse');
      }

      this._display(this.graphPixels);

      setTimeout(() => {
        if (this._maxSnapshots > 0) this._snapshots[++this._currentSnapshotIndex] = this.getData(); // Take snapshot
        if (this._snapshots.length > this._maxSnapshots) {
          this._snapshots.shift();
          this._currentSnapshotIndex--;
        }

        this._addDOMEvents();
      }, 20)
    }
  }

  _mouseLeaveEventListener = (e: MouseEvent) => {
    this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);

    if(this._lastCoords.has('mouse')) {
      this._removeDOMEvents();
      this._endStroke(this._getMouseCoords(e), 'mouse');
      this._lastCoords.delete('mouse');
      this._display(this.graphPixels);

      setTimeout(() => { // Delay to let the canvas 'settle'
        if (this._maxSnapshots > 0) this._snapshots[++this._currentSnapshotIndex] = this.getData(); // Take snapshot
        if (this._snapshots.length > this._maxSnapshots) {
          this._snapshots.shift();
          this._currentSnapshotIndex--;
        }

        this._addDOMEvents();
      }, 20)
    }
  }

  _mouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);
    this._doStroke(coords, 'mouse');
    this._lastCoords.set('mouse', coords);
  }

  _previewMouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);

    if (this._doPreview) {
      this._display(this._toolPreview(coords, 'mouse'));
    }
    else this._display(this.graphPixels);
  }
  // --- Mouse Events ---

  // --- Touch Events ---
  _touchStartEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
      if (this._currentSnapshotIndex < this._snapshots.length - 1 && this._maxSnapshots > 0) this._snapshots.splice(this._currentSnapshotIndex + 1); // Delete all redo snapshots

      const coords = this._getTouchCoords(e.touches.item(i));
      this._startStroke(
        coords,
        e.touches.item(i).identifier.toString()
      )
      this._lastCoords.set(
        e.touches.item(i).identifier.toString(),
        coords
      )
    }
  }

  _touchEndEventListener = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const coords = this._getTouchCoords(e.changedTouches.item(i));
      this._endStroke(
        coords,
        e.changedTouches.item(i).identifier.toString()
      )
      this._lastCoords.delete(
        e.changedTouches.item(i).identifier.toString()
      )
    }

    setTimeout(() => {
      if (this._maxSnapshots > 0) this._snapshots[++this._currentSnapshotIndex] = this.getData(); // Take snapshot
      if (this._snapshots.length > this._maxSnapshots) {
        this._snapshots.shift();
        this._currentSnapshotIndex--;
      }

      this._addDOMEvents();
    }, 20)
  }

  _touchMoveEventListener = (e: TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const coords = this._getTouchCoords(e.touches.item(i));
      this._doStroke(
        coords,
        e.touches.item(i).identifier.toString()
      )
      this._lastCoords.set(
        e.touches.item(i).identifier.toString(),
        coords
      )
    }
  }

  _previewTouchMoveEventListener = (e: TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      if (!this._doPreview) {
        this._display(this._toolPreview(this._getTouchCoords(e.touches.item(i)), e.touches.item(i).identifier.toString()));
      }
      else this._display(this.graphPixels);
    }
  }
  // --- Touch Events ---

  // --- DOM Event Listeners ---
  startRender() {
    this._addDOMEvents();
    this._isDrawing = true;

    return this;
  }

  stopRender() {
    this._removeDOMEvents();
    this._isDrawing = false;

    return this;
  }

  reset() {
    this._resetBoard();
    super.reset();

    return this;
  }
}
