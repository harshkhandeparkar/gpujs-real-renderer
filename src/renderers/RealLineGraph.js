const RealRenderer = require('./RealRenderer');
const getProgressGraphKernel = require('../kernels/progressGraph');

class RealLineGraph extends RealRenderer {
  constructor(options) {
    super(options);

    this.progressiveAxis = options.progressiveAxis || 'x'; // Which axis progresses with time
    this.progressiveAxis = this.progressiveAxis.toLowerCase();
    this.progressionMode = options.progressionMode || 'overflow'; // overflow -> Only progresses when completely filled; continous -> Always progresses;
    this.progressInterval = options.progressInterval || 1; // Progress once every interval time units; Only works with continous progressionMode
    this.brushSize = options.brushSize;

    this._progressGraph = getProgressGraphKernel(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);

    this.lastProgress = 0; // Time when the graph last progressed. Internal variable
  }

  _drawFunc(graphPixels, time) {
    if (time - this.lastProgress >= this.progressInterval) {
      this.lastProgress = time;
      return this._progressGraph(this._cloneTexture(graphPixels));
    }
    else return graphPixels;
  }
}

module.exports = RealLineGraph;