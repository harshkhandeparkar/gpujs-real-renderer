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
  _isDrawing: boolean = false;
  _lastCoords: null | [number, number] = null;

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

  _mouseDownEventListener = (e: MouseEvent) => {
    if (e.button === 0) {
      this.canvas.addEventListener('mousemove', this._drawEventListener);
      this._lastCoords = [e.offsetX, this.dimensions[1] - e.offsetY];
    }
  }

  _mouseUpEventListener = (e: MouseEvent) => {
    if (e.button === 0) {
      this.canvas.removeEventListener('mousemove', this._drawEventListener);
      this._lastCoords = null;
    }
  }

  _mouseEnterEventListener = (e: MouseEvent) => {
    this._lastCoords = [e.offsetX, this.dimensions[1] - e.offsetY];
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

  plot(x: number, y: number) {
    if (this._lastCoords === null) this._lastCoords = [x, y];

    this.graphPixels = <Texture>this._interpolate(
      this._cloneTexture(this.graphPixels),
      this._lastCoords,
      [x, y]
    )

    this._display(this.graphPixels);
  }

  _drawEventListener = (e: MouseEvent) => {
    const x = e.offsetX;
    const y = this.dimensions[1] - e.offsetY;

    this.plot(x, y);
    this._lastCoords = [x, y];
  }

  startRender() {
    this._addMouseEvents();

    return this;
  }

  stopRender() {
    this._removeMouseEvents();

    return this;
  }

  reset() {
    super.reset();

    this.xScaleFactor = this.options.xScaleFactor;
    this.yScaleFactor = this.options.yScaleFactor;

    return this;
  }
}
