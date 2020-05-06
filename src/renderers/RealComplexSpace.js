const RealRenderer = require('./RealRenderer');
const getPlotComplexKernel = require('../kernels/plotComplex');
const Complex = require('../util/complex');

class RealComplexSpace extends RealRenderer {
  constructor(options) {
    // *****DEFAULTS*****
    super(options);

    this.brushSize = options.brushSize || 1; // 1 unit radius
    this.brushColor = options.brushColor || [1, 1, 1];

    this.changeNumbers = options.changeNumbers || function(watchedNumbers, time) {return watchedNumbers};
    // *****DEFAULTS*****

    this.watchedNumbers = {}; // Numbers that are plotted at all times (to dynamically update the numbers)

    this._plotComplex = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
    this._plotComplexPersistent = getPlotComplexKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
    this.Complex = Complex;
  }

  /**
   * Watch a new number
   * @param {String} name Name for the watched number.
   * @param {"Complex"} number Complex number to watch.
   * @param {Boolean} persistent Whether the number should remain at the same place each time.
   * @param {Object} attributes optional attributes object.
   * @returns this
   */
  watch(name, number, persistent = true, attributes = {}) {
    this.watchedNumbers[name] = {
      number,
      persistent,
      attributes
    };

    return this;
  }

  _overlayFunc(graphPixels) {
    for (let num in this.watchedNumbers) {
      if (!this.watchedNumbers[num].persistent) {
        graphPixels = this._plot(graphPixels, this.watchedNumbers[num].number);
      }
    }

    return graphPixels;
  }

  _drawFunc(graphPixels, time) {
    this.watchedNumbers = this.changeNumbers(this.watchedNumbers, time);

    for (let num in this.watchedNumbers) {
      if (this.watchedNumbers[num].persistent) {
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