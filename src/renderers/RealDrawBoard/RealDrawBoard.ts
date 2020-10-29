import { RealRenderer } from '../RealRenderer';

import { Color } from '../../types/RealRendererTypes';
import { RealDrawBoardOptions, DrawMode } from '../../types/RealDrawBoardTypes';
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
  changeMode,
  clear,
  _resetBoard
} from './boardManip';
import {
  _addDOMEvents,
  _removeDOMEvents
} from './_DOMEvents';
import {
  _startStroke,
  _endStroke,
  _doStroke
} from './stroke';
import { _getMouseCoords } from './_coords';

export class RealDrawBoard extends RealRenderer {
  options: RealDrawBoardOptions;
  brushSize: number;
  brushColor: Color;
  eraserSize: number;
  mode: DrawMode;
  _isDrawing: boolean = false;
  _strokeHappening: boolean = false;
  _drawnPaths: {
    pathCoords: [number, number, boolean][], // [x, y, isAPoint][]
    color: Color,
    mode: DrawMode,
    brushSize: number,
    eraserSize: number
  }[] = [];
  _pathIndex: number = -1; // Index of path in _drawnPaths
  _plotKernel: IKernelRunShortcut;
  _strokeKernel: IKernelRunShortcut;
  _lastCoords: null | [number, number] = null;

  protected _initializeKernels = _initializeKernels;
  protected _stroke = _stroke;
  protected _plot = _plot;
  protected _resetBoard = _resetBoard;
  protected _addDOMEvents = _addDOMEvents;
  protected _removeDOMEvents = _removeDOMEvents;
  protected _startStroke = _startStroke;
  protected _endStroke = _endStroke;
  protected _doStroke = _doStroke;
  protected _getMouseCoords = _getMouseCoords;

  public undo = undo;
  public redo = redo;
  public changeBrushColor = changeBrushColor;
  public changeBrushSize = changeBrushSize;
  public changeEraserSize = changeEraserSize;
  public changeMode = changeMode;
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

    this.mode = options.mode;
    // *****DEFAULTS*****

    this._initializeKernels();
  }

  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      this.canvas.addEventListener('mousemove', this._mouseMoveEventListener);

      this._startStroke(this._getMouseCoords(e));
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      const endCoords = this._getMouseCoords(e);
      this._endStroke(endCoords);
    }
  }

  _mouseEnterEventListener = (e: MouseEvent) => {
    this._lastCoords = this._getMouseCoords(e);
  }

  _mouseLeaveEventListener = (e: MouseEvent) => {
    this._endStroke(this._getMouseCoords(e));
  }

  _mouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);
    this._doStroke(coords);
  }

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
