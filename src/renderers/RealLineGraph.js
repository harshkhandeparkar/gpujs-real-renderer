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

    this.brushSize = options.brushSize || 1; // 1 unit radius
    this.brushColor = options.brushColor || [1, 1, 1];

    this.lineThickness = options.lineThickness || 0.05;
    this.lineColor = options.lineColor || [0, 0.5, 0];
    // *****DEFAULTS*****

    this._progressGraph = getProgressGraphKernel(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);
    this._lastProgress = 0; // Time when the graph last progressed. Internal variable
    this._numProgress = 0; // Number of times the graph has progressed

    this._dataIndex = 1; // Number of plots
    this._lastData = 0; // (Value) To display lines

    this._addData = getAddDataKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor, this.progressiveAxis);

    this.limits = { // Final ranges of x and y
      x: [
        0 - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor), // lower limit
        this.dimensions[0] / this.xScaleFactor - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor) // upper limit
      ],
      y: [
        0 - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor),
        this.dimensions[1] / this.yScaleFactor - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor)
      ]
    }
  }

  addData(value) {
    value = parseFloat(value);
    
    if (isNaN(value)) throw 'Data value not a number.'

    this.graphPixels = this._addData(this._cloneTexture(this.graphPixels), value, this._dataIndex++, this._lastData, this._numProgress);
    this._lastData = value;

    // Overflow
    if (this._dataIndex >= this.limits.x[1] && this.progressionMode != 'continous') {
      let progress = Math.ceil(this.progressiveAxis == 'y' ? this.yScaleFactor : this.xScaleFactor);

      this.graphPixels = this._progressGraph(
        this._cloneTexture(this.graphPixels),
        progress
      )

      this._numProgress += progress;

      if (this.progressiveAxis == 'y') {
        this.limits.y[0] += progress / this.yScaleFactor;
        this.limits.y[1] += progress / this.yScaleFactor;
      }
      else {
        this.limits.x[1] += progress / this.xScaleFactor;
        this.limits.x[0] += progress / this.xScaleFactor;
      }
    }

    this._display(this.graphPixels);
    return this;
  }

  _drawFunc(graphPixels, time) {
    if (this.progressionMode == 'continous' && (time - this._lastProgress >= this.progressInterval)) {
      this._lastProgress = time;
      this._numProgress++;

      if (this.progressiveAxis == 'y') {
        this.limits.y[0] += 1 / this.yScaleFactor;
        this.limits.y[1] += 1 / this.yScaleFactor;
      }
      else {
        this.limits.x[0] += 1 / this.xScaleFactor;
        this.limits.x[1] += 1 / this.xScaleFactor;
      }

      return this._progressGraph(this._cloneTexture(graphPixels), 1);
    }
    else return graphPixels;
  }

  reset() {
    super.reset();

    // Reset Inner Variables
    this._dataIndex = 1;
    this._lastData = 0;
    this._lastProgress = 0;
    this._numProgress = 0;

    this.limits = { // Final ranges of x and y
      x: [
        0 - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor), // lower limit
        this.dimensions[0] / this.xScaleFactor - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor) // upper limit
      ],
      y: [
        0 - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor),
        this.dimensions[1] / this.yScaleFactor - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor)
      ]
    }

    return this;
  }
}

module.exports = RealLineGraph;