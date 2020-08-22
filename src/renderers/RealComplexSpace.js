const RealRenderer = require('./RealRenderer');
const getPlotComplexKernel = require('../kernels/plotComplex');
const getInterpolateKernel = require('../kernels/interpolate');
const Complex = require('../util/complex');

class RealComplexSpace extends RealRenderer {
  constructor(options) {
    // *****DEFAULTS*****
    super(options);

    this.brushSize = options.brushSize || 1; // 1 unit radius
    this.brushColor = options.brushColor || [1, 1, 1];

    this.changeNumbers = options.changeNumbers || function(watchedNumbers, time) {return watchedNumbers};

    this.lineThickness = options.lineThickness || 0.5;
    this.lineColor = options.lineColor || [1, 1, 1];
    // *****DEFAULTS*****

    this.watchedNumbers = {}; // Numbers that are plotted at all times (to dynamically update the numbers)

    this._plotComplex = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
    this._plotComplexPersistent = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
    this.Complex = Complex;

    this._interpolateKernel = getInterpolateKernel(this.gpu, this.dimensions, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor);
  }

  /**
   * Watch a new number
   * @param {String} name Name for the watched number.
   * @param {"Complex"} number Complex number to watch.
   * @param {Boolean} show Whether to display the number or not.
   * @param {Boolean} persistent Whether the number should remain at the same place each time.
   * @param {Boolean} interpolate Whether to interpolate (make a line) between this number and another or not.
   * @param {"Complex"} interpolateTo The second complex number to interpolate between.
   * @param {Object} attributes optional attributes object.
   * @returns this
   */
  watch(name, number, show = true, persistent = true, interpolate = false, interpolateTo = null, attributes = {}) {
    this.watchedNumbers[name] = {
      number,
      show,
      persistent,
      interpolate,
      interpolateTo,
      attributes
    };

    return this;
  }
  
  clearWatched() {
    this.watchedNumbers = {};

    return this;
  }

  _interpolate(graphPixels, n1, n2) {
    graphPixels = this._interpolateKernel(this._cloneTexture(graphPixels), [n1.x, n1.y], [n2.x, n2.y]);

    return graphPixels;
  }

  _overlayFunc(graphPixels) {
    for (let num in this.watchedNumbers) {
      if (!this.watchedNumbers[num].persistent && this.watchedNumbers[num].show) graphPixels = this._plot(graphPixels, this.watchedNumbers[num].number);

      if (this.watchedNumbers[num].interpolate) graphPixels = this._interpolate(graphPixels, this.watchedNumbers[num].number, this.watchedNumbers[num].interpolateTo);
    }

    return graphPixels;
  }

  _drawFunc(graphPixels, time) {
    this.watchedNumbers = this.changeNumbers(this.watchedNumbers, time, this.timeStep);

    for (let num in this.watchedNumbers) {
      if (this.watchedNumbers[num].persistent && this.watchedNumbers[num].show) {
        graphPixels = this._plotPersistent(graphPixels, this.watchedNumbers[num].number);
      }
    }

    return graphPixels;
  }

  _plot(graphPixels, number) {
    return this._plotComplex(this._cloneTexture(graphPixels), number.x, number.y);
  }

  _plotPersistent(graphPixels, number) {
    return this._plotComplexPersistent(this._cloneTexture(graphPixels), number.x, number.y);
  }

  /**
   * @param {"Complex"} number Complex number to be plotted.
   */
  plot(number) {
    this._persistentGraphPixels = this._plot(this._persistentGraphPixels, number);
    this.graphPixels = this._cloneTexture(this._persistentGraphPixels);
    this._display(this.graphPixels);

    return this;
  }
}

module.exports = RealComplexSpace;