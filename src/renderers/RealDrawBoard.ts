import { RealRenderer } from './RealRenderer';
import { getPlotKernel } from '../kernels/plot';
import { getInterpolateKernel } from '../kernels/interpolate';

import { Color } from '../types/RealRendererTypes';
import { RealDrawBoardOptions } from '../types/RealDrawBoardTypes';
import { RealDrawBoardDefaults } from '../constants/defaults/RealDrawBoardDefaults';

import { IKernelRunShortcut, Texture } from 'gpu.js';

export * as RealRendererTypes from '../types/RealRendererTypes';
export * as RealDrawBoardTypes from '../types/RealDrawBoardTypes';
export * from '../constants/defaults/RealDrawBoardDefaults';

export class RealDrawBoard extends RealRenderer {
  options: RealDrawBoardOptions;
  brushSize: number;
  brushColor: Color;
  _plot: IKernelRunShortcut;
  _interpolate: IKernelRunShortcut;
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

    this.brushSize = options.brushSize; // 1 unit radius
    this.brushColor = options.brushColor;
    // *****DEFAULTS*****

    this._plot = getPlotKernel(
      this.gpu,
      this.dimensions,
      this.brushSize,
      this.brushColor,
      this.xScaleFactor,
      this.yScaleFactor,
      this.xOffset,
      this.yOffset
    )

    this._interpolate = getInterpolateKernel(
      this.gpu,
      this.dimensions,
      this.xScaleFactor,
      this.yScaleFactor,
      this.xOffset,
      this.yOffset,
      this.brushSize,
      this.brushColor
    )
  }

  _getCoords = (e: MouseEvent): [number, number] => [e.offsetX, this.dimensions[1] - e.offsetY];

  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0) {
      this.canvas.addEventListener('mousemove', this._strokeEventListener);
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
        this.plot(...this._getCoords(e));
      }
    }
  }

  _mouseEnterEventListener = (e: MouseEvent) => {
    this._lastCoords = this._getCoords(e);
  }

  _strokeEventListener = (e: MouseEvent) => {
    const coords = this._getCoords(e);

    this.stroke(...coords);
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

  _drawFunc(
    graphPixels: Texture,
    time: number
  ) {
    return graphPixels;
  }

  stroke(x: number, y: number) {
    if (this._lastCoords === null) this._lastCoords = [x, y];

    this.graphPixels = <Texture>this._interpolate(
      this._cloneTexture(this.graphPixels),
      this._lastCoords,
      [x, y]
    )

    this._display(this.graphPixels);
  }

  plot(x: number, y: number) {
    this.graphPixels = <Texture>this._plot(
      this._cloneTexture(this.graphPixels),
      x,
      y
    )

    this._display(this.graphPixels);
  }

  startRender() {
    this._addMouseEvents();

    return this;
  }

  stopRender() {
    this._removeMouseEvents();

    return this;
  }

  changeBrushColor(color: Color) {
  }

  reset() {
    super.reset();

    this.xScaleFactor = this.options.xScaleFactor;
    this.yScaleFactor = this.options.yScaleFactor;

    return this;
  }
}
