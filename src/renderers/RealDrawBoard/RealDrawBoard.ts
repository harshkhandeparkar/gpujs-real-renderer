import { RealRenderer } from '../RealRenderer';

import { Color } from '../../types/RealRendererTypes';
import { RealDrawBoardOptions } from '../../types/RealDrawBoardTypes';
import { RealDrawBoardDefaults } from '../../constants/defaults/RealDrawBoardDefaults';

import { IKernelRunShortcut } from 'gpu.js';

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
  _isStroking: boolean = false; // If a tool is drawing a stroke
  _snapshots: number[][] = []; // Undo snapshots
  _currentSnapshotIndex = 0; // Current snapshot
  _maxSnapshots: number;
  _plotKernel: IKernelRunShortcut;
  _previewPlot: IKernelRunShortcut;
  _strokeKernel: IKernelRunShortcut;
  /** key -> identifier, value -> coordinate
   *  For mouse, the key is 'mouse', for touches, stringified identifier -> https://developer.mozilla.org/en-US/docs/Web/API/Touch/identifier
   */
  _lastCoords: Map<string, [number, number]> = new Map(); /* key -> identifier, value -> coordinate*/

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

    const frameHandler = () => {
      if (this._isStroking) this._display(this.graphPixels);
      window.requestAnimationFrame(frameHandler);
    }

    window.requestAnimationFrame(frameHandler);
  }
  // --- DOM Event Listeners ---

  // --- Mouse Events ---
  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      this.canvas.addEventListener('mousemove', this._mouseMoveEventListener);
      this._isStroking = true;

      this._startStroke(
        this._getMouseCoords(e),
        'mouse'
      )
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      const endCoords = this._getMouseCoords(e);
      if(this._lastCoords.has('mouse')) this._endStroke(endCoords, 'mouse');

      this._isStroking = false;
      this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);
    }
  }

  _mouseLeaveEventListener = (e: MouseEvent) => {
    this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);
    this._isStroking = false;
    this._display(this.graphPixels);

    if(this._lastCoords.has('mouse')) this._endStroke(this._getMouseCoords(e), 'mouse');
  }

  _mouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);
    this._doStroke(coords, 'mouse');
  }

  _previewMouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);

    // if (!this._isStroking) {
    //   this._display(
    //     this._toolPreview(coords, 'mouse')
    //   )
    // }
    // else {
    //   this._display(this.graphPixels);
    //   console.log('not previewing')
    // }
  }
  // --- Mouse Events ---

  // --- Touch Events ---
  _touchStartEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
      this._isStroking = true;

      this._startStroke(
        this._getTouchCoords(e.touches.item(i)),
        e.touches.item(i).identifier.toString()
      )
    }
  }

  _touchEndEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      this._endStroke(
        this._getTouchCoords(e.changedTouches.item(i)),
        e.changedTouches.item(i).identifier.toString()
      )

      this._isStroking = false;
    }
  }

  _touchMoveEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
      this._doStroke(
        this._getTouchCoords(e.touches.item(i)),
        e.touches.item(i).identifier.toString()
      )
    }
  }

  _previewTouchMoveEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
      // if (!this._isStroking) {
      //   this._display(
      //     this._toolPreview(this._getTouchCoords(e.touches.item(i)), e.touches.item(i).identifier.toString())
      //   )
      // }
      // else this._display(this.graphPixels);
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
