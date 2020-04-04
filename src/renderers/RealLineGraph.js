const RealRenderer = require('./RealRenderer');
const getDrawKernel = require('./kernels/draw');

class RealLineGraph extends RealRenderer {
  constructor(options) {
    super(options);

    this.progressiveAxis = options.progressiveAxis.toLowerCase() || 'x'; // Which axis remains static
    this.progressionMode = options.progressionMode || 'overflow'; // overflow -> Only progresses when completely filled; continous -> Always progresses;
    this.progressionRatio = options.progressionRatio || 1; // One time unit = progressionRatio coordinate units
    this.brushSize = options.brushSize;

    this.graphInputFunc = gpu.createKernel(options.graphInputFunc, {output: this.dimensions.x, pipeline: true});

    const drawKernel = getDrawKernel(
      this.gpu,
      this.dimensions,
      this.xScaleFactor,
      this.yScaleFactor,
      function(x, y, pix, time, data) {
        x += (time*progressionRatio) / xScaleFactor;

        if (Math.abs(y - data[this.thread.x + Math.floor(time*this.constants.progressionRatio)]) <= this.constants.brushSize) return [1, 0, 0];
      },
      {
        brushSize: this.brushSize,
        progressionRatio: this.progressionRatio
      }
    )

    this.drawFunc = (graphPixels, time) => {
      this.data = this.graphInputFunc(time);

      return drawKernel(graphPixels, time, data);
    }
  }
}

module.exports = RealLineGraph;