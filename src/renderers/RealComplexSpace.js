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
    this.Complex = Complex;
  }

  /**
   * Watch a new number
   * @param {"Complex"} number Complex number to watch
   * @param {String} name Name for the watched number.
   * @returns this
   */
  watch(number, name) {
    this.watchedNumbers[name] = number;

    return this;
  }

  _drawFunc(graphPixels, time) {
    this.change

    for (let num in this.watchedNumbers) this.plot(this.watchedNumbers[num])

    return graphPixels;
  }

  /**
   * @param {"Complex"} number Complex number to be plotted.
   */
  plot(number) {
    console.log(number.x, number.y)
    this.graphPixels = this._plotComplex(this._cloneTexture(this.graphPixels), number.x, number.y);
    this._display(this.graphPixels);

    return this;
  }
}

module.exports = RealComplexSpace;