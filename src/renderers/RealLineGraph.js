const RealRenderer = require('./RealRenderer');
const getProgressGraphKernel = require('../kernels/progressGraph');
const getAddDataKernel = require('../kernels/addData');

class RealLineGraph extends RealRenderer {
  constructor(options) {
    // *****DEFAULTS*****
    super(options);

    this.progressiveAxis = options.progressiveAxis || 'x'; // Which axis progresses with time
    this.progressiveAxis = this.progressiveAxis.toLowerCase();
    this.progressionMode = options.progressionMode || 'overflow'; // overflow -> Only progresses when completely filled; continous -> Always progresses;
    this.progressInterval = options.progressInterval || 1; // Progress once every interval time units; Only works with continous progressionMode
    this.brushSize = options.brushSize || 2; // 1 unit radius
    this.brushColor = options.brushColor || [1, 1, 1];
    // *****DEFAULTS*****
    
    this._progressGraph = getProgressGraphKernel(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);
    this._lastProgress = 0; // Time when the graph last progressed. Internal variable

    this._dataIndex = 0; // Number of plots
    this._lastData = 0; // (Value) To display lines

    this._addData = getAddDataKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
  }

  addData(value) {
    this.graphPixels = this._addData(this._cloneTexture(this.graphPixels), value, this._dataIndex++, this._lastData);
    this._display(this.graphPixels);

    this._lastData = value;
    return this;
  }

  _drawFunc(graphPixels, time) {
    if (this.progressionMode == 'continous' && (time - this._lastProgress >= this.progressInterval)) {
      this._lastProgress = time;
      return this._progressGraph(this._cloneTexture(graphPixels));
    }
    else return graphPixels;
  }
}

module.exports = RealLineGraph;