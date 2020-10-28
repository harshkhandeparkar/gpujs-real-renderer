import { RealRenderer } from './RealRenderer';
import { getPlotKernel } from '../kernels/plot';
import { getInterpolateKernel } from '../kernels/interpolate';

import { Color } from '../types/RealRendererTypes';
import { RealDrawBoardOptions, DrawMode } from '../types/RealDrawBoardTypes';
import { RealDrawBoardDefaults } from '../constants/defaults/RealDrawBoardDefaults';

import { IKernelRunShortcut, Texture } from 'gpu.js';

export * as RealRendererTypes from '../types/RealRendererTypes';
export * as RealDrawBoardTypes from '../types/RealDrawBoardTypes';
export * from '../constants/defaults/RealDrawBoardDefaults';

export class RealDrawBoard extends RealRenderer {
  options: RealDrawBoardOptions;
  brushSize: number;
  brushColor: Color;
  eraserSize: number;
  mode: DrawMode;
  _isDrawing: boolean = false;
  _drawnPaths: {
    pathCoords: [number, number][], // [x, y][]
    color: Color,
    mode: DrawMode,
    brushSize: number,
    eraserSize: number
  }[] = [];
  _pathIndex: number = -1; // Index of path in _drawnPaths
  _plotKernel: IKernelRunShortcut;
  _strokeKernel: IKernelRunShortcut;
  _lastCoords: null | [number, number] = null;
  _clickStartCoords: null | [number, number] = null;

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

  _initializeKernels() {
    this._plotKernel = getPlotKernel(
      this.gpu,
      this.dimensions,
      this.xScaleFactor,
      this.yScaleFactor,
      this.xOffset,
      this.yOffset
    )

    this._strokeKernel = getInterpolateKernel(
      this.gpu,
      this.dimensions,
      this.xScaleFactor,
      this.yScaleFactor,
      this.xOffset,
      this.yOffset
    )
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

      this._drawnPaths[this._pathIndex + 1] = {
        pathCoords: [],
        color: <Color>this.brushColor.map(x => x),
        mode: this.mode,
        brushSize: this.brushSize,
        eraserSize: this.eraserSize
      }
      this._lastCoords = this._getCoords(e);
      this._clickStartCoords = this._getCoords(e);
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0) {
      this.canvas.removeEventListener('mousemove', this._strokeEventListener);
      this._lastCoords = null;
      const currentCoords = this._getCoords(e);

      if (
        this._clickStartCoords[0] === currentCoords[0] &&
        this._clickStartCoords[1] === currentCoords[1]
      ) { // A single point instead of a stroke
        this.plot(...currentCoords);
        this._drawnPaths[this._drawnPaths.length - 1].pathCoords.push(currentCoords);
      }

      if (this._drawnPaths[this._drawnPaths.length - 1].pathCoords.length === 0) this._drawnPaths.splice(-1, 1);
      else this._pathIndex++;
    }
  }

  _mouseEnterEventListener = (e: MouseEvent) => {
    this._lastCoords = this._getCoords(e);
  }

  _strokeEventListener = (e: MouseEvent) => {
    const coords = this._getCoords(e);

    this._drawnPaths[this._drawnPaths.length - 1].pathCoords.push(coords);
    this._stroke(...coords);
    this._lastCoords = coords;
  }

  _addMouseEvents() {
    document.addEventListener('mousedown', this._mouseDownEventListener);
    document.addEventListener('mouseup', this._mouseUpEventListener);
    this.canvas.addEventListener('mouseenter', this._mouseEnterEventListener);
  }

  _removeMouseEvents() {
    document.removeEventListener('mousedown', this._mouseDownEventListener);
    document.removeEventListener('mouseup', this._mouseUpEventListener);
    this.canvas.removeEventListener('mouseenter', this._mouseEnterEventListener);
  }

  _stroke(x: number, y: number) {
    if (this._lastCoords === null) this._lastCoords = [x, y];

    this.graphPixels = <Texture>this._strokeKernel(
      this._cloneTexture(this.graphPixels),
      this._lastCoords,
      [x, y],
      this.mode === 'paint' ? this.brushSize : this.eraserSize,
      this.mode === 'paint' ? this.brushColor : this.bgColor
    )

    this._display(this.graphPixels);
  }

  plot(x: number, y: number) {
    this.graphPixels = <Texture>this._plotKernel(
      this._cloneTexture(this.graphPixels),
      x,
      y,
      this.mode === 'paint' ? this.brushSize : this.eraserSize,
      this.mode === 'paint' ? this.brushColor : this.bgColor
    )

    this._display(this.graphPixels);
  }

  undo(numUndo: number = 1) {
    if (this._pathIndex >= numUndo - 1) {
      this.graphPixels = <Texture>this._blankGraph();
      this._display(this.graphPixels);
      const originalMode = this.mode,
      originalBrushColor = this.brushColor,
      originalBrushSize = this.brushSize,
      originalEraserSize = this.eraserSize;

      this._removeMouseEvents();

      this._drawnPaths.slice(0, this._pathIndex - numUndo + 1).forEach(path => {
        this.mode = path.mode;
        this.brushColor = path.color;
        this.brushSize = path.brushSize;
        this.eraserSize = path.eraserSize;

        this._lastCoords = null;
        path.pathCoords.forEach(coord => {
          this._stroke(...coord)
          this._lastCoords = coord;
        })
      })

      this.mode = originalMode;
      this.brushColor = originalBrushColor;
      this.brushSize = originalBrushSize;
      this.eraserSize = originalEraserSize;

      this._pathIndex -= numUndo;

      this._lastCoords = null;
      this._display(this.graphPixels);

      if (this._isDrawing) this.startRender();
    }

    return this;
  }

  redo(numRedo: number = 1) {
    this.undo(-numRedo);

    return this;
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

  changeBrushColor(color: Color) {
    this.brushColor = color;
  }

  changeBrushSize(newSize: number) {
    this.brushSize = newSize;
  }

  changeEraserSize(newSize: number) {
    this.eraserSize = newSize;
  }

  changeMode(newMode: DrawMode) {
    this.mode = newMode;
  }

  reset() {
    super.reset();

    this.xScaleFactor = this.options.xScaleFactor;
    this.yScaleFactor = this.options.yScaleFactor;

    return this;
  }
}
