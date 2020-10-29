import { RealRenderer } from '../RealRenderer';

import { Color } from '../../types/RealRendererTypes';
import { RealDrawBoardOptions, DrawMode } from '../../types/RealDrawBoardTypes';
import { RealDrawBoardDefaults } from '../../constants/defaults/RealDrawBoardDefaults';

import { IKernelRunShortcut } from 'gpu.js';

export * as RealRendererTypes from '../../types/RealRendererTypes';
export * as RealDrawBoardTypes from '../../types/RealDrawBoardTypes';
export * from '../../constants/defaults/RealDrawBoardDefaults';

import { _initializeKernels } from './_initializeKernels';
import { _stroke } from './_stroke';
import { _plot } from './_plot';
import { undo, redo } from './undo';
import {
  changeBrushColor,
  changeBrushSize,
  changeEraserSize,
  changeMode,
  clear,
  _resetBoard
} from './boardManip';
import { _addMouseEvents, _removeMouseEvents } from './_DOMEvents';

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
  protected _addMouseEvents = _addMouseEvents;
  protected _removeMouseEvents = _removeMouseEvents;

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

  _getCoords = (e: MouseEvent): [number, number] => {
    let x = e.offsetX; // in pixels
    let y = this.dimensions[1] - e.offsetY // in pixels

    x = x / this.xScaleFactor - (this.dimensions[0] * (this.yOffset / 100)) / this.xScaleFactor;
    y = y / this.yScaleFactor - (this.dimensions[1] * (this.xOffset / 100)) / this.yScaleFactor;

    return [x, y]; // In graph coordinates
  }


  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0 /* Left Click */) {
      this.canvas.addEventListener('mousemove', this._strokeEventListener);
      this._strokeHappening = true;

      this._drawnPaths[this._pathIndex + 1] = {
        pathCoords: [],
        color: <Color>this.brushColor.map(x => x),
        mode: this.mode,
        brushSize: this.brushSize,
        eraserSize: this.eraserSize
      }

      this._lastCoords = this._getCoords(e);
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0) {
      const currentCoords = this._getCoords(e);

      if (
        this._lastCoords[0] === currentCoords[0] &&
        this._lastCoords[1] === currentCoords[1]
      ) {
        this._plot(...currentCoords);
        this._drawnPaths[this._pathIndex + 1].pathCoords.push([...currentCoords, true])
      }

      this._strokeEnd();
    }
  }

  _mouseEnterEventListener = (e: MouseEvent) => {
    this._lastCoords = this._getCoords(e);
  }

  _mouseLeaveEventListener = (e: MouseEvent) => {
    this._strokeEnd();
  }

  _strokeEventListener = (e: MouseEvent) => {
    const coords = this._getCoords(e);

    this._strokeHappening = true;
    this._drawnPaths[this._pathIndex + 1].pathCoords.push([...coords, false]);
    this._stroke(...coords);
    this._lastCoords = coords;
  }

  _strokeEnd = () => {
    if (this._strokeHappening) {
      this.canvas.removeEventListener('mousemove', this._strokeEventListener);
      this._lastCoords = null;

      if (this._drawnPaths[this._pathIndex + 1].pathCoords.length === 0) this._drawnPaths.splice(-1, 1);
      else {
        this._drawnPaths = this._drawnPaths.slice(0, this._pathIndex + 2); // Overwrite further paths to prevent wrong redos
        this._pathIndex++;
      }

      this._strokeHappening = false;
    }
  }

  startRender() {
    this._addMouseEvents();
    this._isDrawing = true;

    return this;
  }

  stopRender() {
    this._removeMouseEvents();
    this._isDrawing = false;

    return this;
  }

  reset() {
    this._resetBoard();
    super.reset();

    return this;
  }
}
