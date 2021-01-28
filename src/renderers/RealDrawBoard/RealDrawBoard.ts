import { RealRenderer } from '../RealRenderer';

import { Color } from '../../types/RealRendererTypes';
import { RealDrawBoardOptions, DrawMode } from '../../types/RealDrawBoardTypes';
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
import {
  _getMouseCoords,
  _getTouchCoords
} from './_coords';

export class RealDrawBoard extends RealRenderer {
  options: RealDrawBoardOptions;
  brushSize: number;
  brushColor: Color;
  eraserSize: number;
  mode: DrawMode;
  _isDrawing: boolean = false;
  _drawnPaths: {
    pathCoords: [number, number, boolean][], // [x, y, isAPoint][]
    color: Color,
    mode: DrawMode,
    brushSize: number,
    eraserSize: number
  }[] = [];
  _pathIndex: number = -1; // Index of path in _drawnPaths
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
  protected _startStroke = _startStroke;
  protected _endStroke = _endStroke;
  protected _doStroke = _doStroke;
  protected _getMouseCoords = _getMouseCoords;
  protected _getTouchCoords = _getTouchCoords;

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
  // --- DOM Event Listeners ---

  // --- Mouse Events ---
  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      this.canvas.addEventListener('mousemove', this._mouseMoveEventListener);

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

      this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);
    }
  }

  _mouseLeaveEventListener = (e: MouseEvent) => {
    this.canvas.removeEventListener('mousemove', this._mouseMoveEventListener);
    if(this._lastCoords.has('mouse')) this._endStroke(this._getMouseCoords(e), 'mouse');
  }

  _mouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);
    this._doStroke(coords, 'mouse');
  }

  _previewMouseMoveEventListener = (e: MouseEvent) => {
    const coords = this._getMouseCoords(e);

    this._display(
      this._previewPlot(
        this.graphPixels,
        coords[0],
        coords[1],
        this.mode === 'paint' ? this.brushSize : this.eraserSize,
        this.mode === 'erase' ? this.bgColor : this.brushColor
      )
    )
  }
  // --- Mouse Events ---

  // --- Touch Events ---
  _touchStartEventListener = (e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
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
