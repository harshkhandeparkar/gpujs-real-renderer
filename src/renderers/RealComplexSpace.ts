import { RealRenderer } from './RealRenderer';
import { getPlotComplexKernel } from '../kernels/plotComplex';
import { getInterpolateKernel } from '../kernels/interpolate';
import { Complex } from '../util/complex';

import { Color } from '../types/RealRendererTypes';
import { IKernelRunShortcut, Texture } from 'gpu.js';
export * from '../types/RealRendererTypes';

import { WatchedNumbers, RealComplexSpaceOptions } from '../types/RealComplexSpaceTypes';
export * as RealComplexSpaceTypes from '../types/RealComplexSpaceTypes';

import { RealComplexSpaceDefaults } from '../constants/defaults/RealComplexSpaceDefaults';
export * from '../constants/defaults/RealComplexSpaceDefaults';

export class RealComplexSpace extends RealRenderer {
  brushSize: number;
  brushColor: Color;
  changeNumbers: (watchedNumbers: WatchedNumbers, time: number, timeStep: number) => WatchedNumbers
  lineThickness: number;
  lineColor: Color;
  watchedNumbers: WatchedNumbers;
  Complex = Complex;
  _plotComplex: IKernelRunShortcut;
  _plotComplexPersistent: IKernelRunShortcut;
  _interpolateKernel: IKernelRunShortcut;
  _persistentGraphPixels: Texture;

  constructor(options: RealComplexSpaceOptions) {
    // *****DEFAULTS*****
    super(options);

    options = {
      ...RealComplexSpaceDefaults,
      ...options
    }

    this.brushSize = options.brushSize || 1; // 1 unit radius
    this.brushColor = options.brushColor || [1, 1, 1];

    this.changeNumbers = options.changeNumbers || function(watchedNumbers: WatchedNumbers, time: number, timeStep: number) {return watchedNumbers};

    this.lineThickness = options.lineThickness || 0.5;
    this.lineColor = options.lineColor || [1, 1, 1];
    // *****DEFAULTS*****

    this.watchedNumbers = []; // Numbers that are plotted at all times (to dynamically update the numbers)

    this._plotComplex = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
    this._plotComplexPersistent = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);

    this._interpolateKernel = getInterpolateKernel(this.gpu, this.dimensions, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor);
  }

  /**
   * Watch a new number
   * @param name Name for the watched number.
   * @param number Complex number to watch.
   * @param show Whether to display the number or not.
   * @param persistent Whether the number should remain at the same place each time.
   * @param interpolate Whether to interpolate (make a line) between this number and another or not.
   * @param interpolateTo The second complex number to interpolate between.
   * @param attributes optional attributes object.
   * @returns this
   */
  watch(
    name: string,
    number: Complex,
    show = true,
    persistent = true,
    interpolate = false,
    interpolateTo = null,
    attributes: any = {}
  ) {
    this.watchedNumbers.push({
      name,
      number,
      show,
      persistent,
      interpolate,
      interpolateTo,
      attributes
    })

    return this;
  }
  
  clearWatched() {
    this.watchedNumbers = [];

    return this;
  }

  _interpolate(graphPixels: Texture, n1: Complex, n2: Complex) {
    graphPixels = this._interpolateKernel(this._cloneTexture(graphPixels), [n1.x, n1.y], [n2.x, n2.y]) as Texture;

    return graphPixels;
  }

  _overlayFunc(graphPixels: Texture) {
    for (let num in this.watchedNumbers) {
      if (!this.watchedNumbers[num].persistent && this.watchedNumbers[num].show) graphPixels = this._plot(graphPixels, this.watchedNumbers[num].number) as Texture;

      if (this.watchedNumbers[num].interpolate) graphPixels = this._interpolate(graphPixels, this.watchedNumbers[num].number, this.watchedNumbers[num].interpolateTo);
    }

    return graphPixels;
  }

  _drawFunc(graphPixels: Texture, time: number) {
    this.watchedNumbers = this.changeNumbers(this.watchedNumbers, time, this.timeStep);

    for (let num in this.watchedNumbers) {
      if (this.watchedNumbers[num].persistent && this.watchedNumbers[num].show) {
        graphPixels = this._plotPersistent(graphPixels, this.watchedNumbers[num].number) as Texture;
      }
    }

    return graphPixels;
  }

  _plot(graphPixels: Texture, number: Complex) {
    return this._plotComplex(this._cloneTexture(graphPixels), number.x, number.y);
  }

  _plotPersistent(graphPixels: Texture, number: Complex) {
    return this._plotComplexPersistent(this._cloneTexture(graphPixels), number.x, number.y);
  }

  /**
   * @param {"Complex"} number Complex number to be plotted.
   */
  plot(number: Complex) {
    this._persistentGraphPixels = this._plot(this._persistentGraphPixels, number) as Texture;
    this.graphPixels = this._cloneTexture(this._persistentGraphPixels) as Texture;
    this._display(this.graphPixels);

    return this;
  }
}