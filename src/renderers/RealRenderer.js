const getDisplayKernel = require('../kernels/display');
const getBlankGraphKernel = require('../kernels/blankGraph');
const getCloneTextureKernel = require('../kernels/cloneTexture')

class RealRenderer {
  constructor(options) {
    // *****DEFAULTS*****
    this.canvasTag = options.canvasTag;
    this.dimensions = options.dimensions || {x: 1000, y:1000};
    this.xScaleFactor = options.xScaleFactor || 10;
    this.yScaleFactor = options.yScaleFactor || 1;
    this.bgColor = options.bgColor || [0, 0, 0];
    this.axesColor = options.axesColor || [1, 1, 1];
    this.drawsPerFrame = options.drawsPerFrame || 1;
    this.timeStep = options.timeStep || (1 / 60);
    this.time = options.initTime || 0;

    this.xOffset = options.xOffset; // %age offset
    this.yOffset = options.yOffset; // %age offset

    options.GPU = options.GPU || window.GPU;

    if (typeof this.xOffset != 'number') this.xOffset = 50;
    if (typeof this.yOffset != 'number') this.yOffset = 50;

    this.xOffset = Math.max(0, Math.min(100, this.xOffset)) // Between 0 and 100
    this.yOffset = Math.max(0, Math.min(100, this.yOffset)) // Between 0 and 100
    // *****DEFAULTS*****

    if (document.getElementById(this.canvasTag) === undefined) {
      throw 'No Canvas Element Found';
    }

    this._canvas = document.getElementById(this.canvasTag);

    this.gpu = new options.GPU({
      canvas: this._canvas,
      mode: 'gpu',
      tactic: 'precision'
    })

    this._blankGraph = getBlankGraphKernel(this.gpu, this.dimensions, this.xOffset, this.yOffset, this.bgColor, this.axesColor);
    this._cloneTexture = getCloneTextureKernel(this.gpu, this.dimensions);

    this.graphPixels = this._blankGraph();

    this._display = getDisplayKernel(this.gpu, this.dimensions);

    this._doRender = false;
  }

  _drawFunc(graphPixels /*, time*/) { // Can be overridden
    return graphPixels;
  }

  _draw() {
    this.time += this.timeStep;

    this.graphPixels = this._drawFunc(this.graphPixels, this.time);
  }

  draw(numDraws = 1) {
    for (let i = 0; i < numDraws; i++) this._draw();
    this._display(this.graphPixels);

    return this;
  }

  _render() {
    for (let i = 0; i < this.drawsPerFrame; i++) this._draw();
    this._display(this.graphPixels);

    if (this._doRender) window.requestAnimationFrame(() => {this._render()});
  }

  startRender() {
    this._doRender = true;
    this._render();
    return this;
  }

  stopRender() {
    this._doRender = false;
    return this;
  }

  resetTime() {
    this.time = 0;
    return this;
  }

  reset() {
    this.graphPixels = this._blankGraph();
    this.resetTime();

    this._display(this.graphPixels);

    return this;
  }
}

module.exports = RealRenderer;