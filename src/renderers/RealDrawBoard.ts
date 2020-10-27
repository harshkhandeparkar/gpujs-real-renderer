import { RealRenderer } from './RealRenderer';
import { getPlotKernel } from '../kernels/plot';

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

    this._plot = getPlotKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
  }

  _drawFunc(
    graphPixels: Texture,
    time: number
  ) {
    return graphPixels;
  }

  plot(x: number, y: number) {
    this.graphPixels = <Texture>this._plot(this._cloneTexture(this.graphPixels), x, y);

    this._display(this.graphPixels);
  }

  reset() {
    super.reset();

    this.xScaleFactor = this.options.xScaleFactor;
    this.yScaleFactor = this.options.yScaleFactor;

    return this;
  }
}
