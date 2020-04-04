const { GPU } = require('gpu.js');
const getDisplayKernel = require('./kernels/display');

class RealRenderer {
  constructor(options) {
    this.canvasTag = options.canvasTag;
    this.dimensions = options.dimensions || {x: 1000, y:1000};
    this.xScaleFactor = options.xScaleFactor || 1;
    this.yScaleFactor = options.yScaleFactor || 1;
    this.bgColor = options.bgColor || [0, 0, 0];
    this.axesColor = options.axesColor || [1, 1, 1];
    this.drawsPerFrame = options.drawsPerFrame || 1;
    this.timeStep = options.timeStep || (1 / 60);

    this.xOffset = options.xOffset || 50; // %age offset
    this.yOffset = options.yOffset || 50; // %age offset

    if (document.getElementById(this.canvasTag) === undefined) {
      throw 'No Canvas Element Found';
    }

    this.canvas = document.getElementById(this.canvasTag);

    this.gpu = new GPU({
      canvas: this.canvas,
      mode: 'gpu'
    })
    this.graphPixels = blankGraph();

    this.display = getDisplayKernel(this.gpu, this.dimensions);

    this.time = options.time || 0;

    this.doRender = true;
  }

  _draw() {
    this.time += this.timeStep;
    this.graphPixels = this.drawFunc(this.graphPixels, this.time); // drawFunc defined by child class
  }

  draw(numDraws) {
    for (let i = 0; i < numDraws; i++) this._draw();
    this.display(this.graphPixels);
  }

  _render() {
    for (let i = 0; i < this.drawsPerFrame; i++) this._draw();
    this.display(this.graphPixels);

    if (this.doRender) window.requestAnimationFrame(this.startRender);
  }

  startRender() {
    this.doRender = true;
    this._render;
  }

  stopRender() {
    this.doRender = false;
  }

  resetTime() {
    this.stopRender();
    this.time = 0;
    this.startRender();
  }

  clearPixels() {
    this.stopRender();
    this.graphPixels.delete();
    this.graphPixels = blankGraph();
    this.startRender();
  }
}

module.exports = RealRenderer;