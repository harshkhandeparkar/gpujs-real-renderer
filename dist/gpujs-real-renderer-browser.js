(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.GPUjsRealRenderer = {}));
}(this, (function (exports) { 'use strict';

  /**
   * @param {Object} gpu GPU.js Instance
   * @param {Object} dimensions Dimensions of the Output Graph
   */
  function getDisplayKernel(gpu, dimensions) {
    return gpu.createKernel(function(graphPixels) {
      const color = graphPixels[this.thread.y][this.thread.x];

      this.color(color[0], color[1], color[2]);
    },
    {
      output: dimensions,
      graphical: true
    })
  }

  var display = getDisplayKernel;

  /**
   * @param {Object} gpu GPU.js instance
   * @param {Object} dimensions Dimensions of Graph
   * @param {Number} xOffset 
   * @param {Number} yOffset 
   * @param {Float32Array} bgColor 
   * @param {Float32Array} axesColor 
   */
  function getBlankGraphKernel(gpu, dimensions, xOffset, yOffset, bgColor, axesColor) {
    return gpu.createKernel(function() {
      const outX = this.output.x, outY = this.output.y;

      const X = Math.floor(outY * (this.constants.xOffset / 100));
      const Y = Math.floor(outX * (this.constants.yOffset / 100));

      if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
      else return this.constants.bgColor; 
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        xOffset,
        yOffset,
        bgColor,
        axesColor
      },
      constantTypes: {
        bgColor: 'Array(3)',
        axesColor: 'Array(3)',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    })
  }

  var blankGraph = getBlankGraphKernel;

  /**
   * @param {Object} gpu GPU.js instance
   * @param {Object} dimensions Dimensions of Graph
   */
  function getCloneTextureKernel(gpu, dimensions) {
    return gpu.createKernel(function(graphPixels) {
      return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true
    })
  }

  var cloneTexture = getCloneTextureKernel;

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

      this.xOffset = Math.max(0, Math.min(100, this.xOffset)); // Between 0 and 100
      this.yOffset = Math.max(0, Math.min(100, this.yOffset)); // Between 0 and 100
      // *****DEFAULTS*****

      if (document.getElementById(this.canvasTag) === undefined) {
        throw 'No Canvas Element Found';
      }

      this._canvas = document.getElementById(this.canvasTag);

      this.gpu = new options.GPU({
        canvas: this._canvas,
        mode: 'gpu',
        tactic: 'precision'
      });

      this._blankGraph = blankGraph(this.gpu, this.dimensions, this.xOffset, this.yOffset, this.bgColor, this.axesColor);
      this._cloneTexture = cloneTexture(this.gpu, this.dimensions);

      this.graphPixels = this._blankGraph();

      this._display = display(this.gpu, this.dimensions);

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

      if (this._doRender) window.requestAnimationFrame(() => {this._render();});
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

  var RealRenderer_1 = RealRenderer;

  /**
   * @param {Object} gpu GPU.js instance
   * @param {Object} dimensions Dimensions of Graph
   * @param {String} progressiveAxis The axis which progresses.
   * @param {Number} xOffset
   * @param {Number} yOffset
   * @param {Float32Array} axesColor
   * @param {Float32Array} bgColor
   */
  function getProgressGraphKernel(gpu, dimensions, progressiveAxis, xOffset, yOffset, axesColor, bgColor) {
    return gpu.createKernel(function(graphPixels, numProgress) {
      const outX = this.output.x, outY = this.output.y;
      if (
        (this.thread.x * Math.abs(this.constants.progressiveAxis - 1) >= (outX - numProgress)) || 
        (this.thread.y * this.constants.progressiveAxis >= (outY + numProgress))
      ) {
        const X = Math.floor(outY * (this.constants.xOffset / 100));
        const Y = Math.floor(outX * (this.constants.yOffset / 100));

        if (this.thread.x === Y || this.thread.y === X) return this.constants.axesColor;
        else return this.constants.bgColor; 
      }
      else {
        return graphPixels[
          this.thread.y +
          numProgress*this.constants.progressiveAxis
        ][
          this.thread.x +
          numProgress*Math.abs(this.constants.progressiveAxis - 1)
        ]
      }
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        progressiveAxis: progressiveAxis == 'y' ? 1 : 0,
        xOffset,
        yOffset,
        axesColor,
        bgColor
      },
      constantTypes: {
        progressiveAxis: 'Integer',
        xOffset: 'Float',
        yOffset: 'Float',
        axesColor: 'Array(3)',
        bgColor: 'Array(3)'
      }
    })
  }

  var progressGraph = getProgressGraphKernel;

  /**
   * 
   * @param {Object} gpu 
   * @param {Float32Array} dimensions 
   * @param {Number} brushSize 
   * @param {Float32Array} brushColor
   * @param {Number} xScaleFactor
   * @param {Number} yScaleFactor
   * @param {Number} xOffset
   * @param {Number} yOffset
   * @param {Number} lineThickness
   * @param {Number} lineColor
   * @param {String} progressiveAxis
   */
  function getAddDataKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset, lineThickness, lineColor, progressiveAxis) {
    return gpu.createKernel(function(graphPixels, value, dataIndex, lastData, numProgress) {
      const x = this.thread.x + numProgress * Math.abs(this.constants.progressiveAxis - 1),
        y = this.thread.y + numProgress * this.constants.progressiveAxis;
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
      const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

      const xDist = (X - dataIndex) * this.constants.xScaleFactor;
      const yDist = (Y - value) * this.constants.yScaleFactor;

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      let lineEqn = X * (value - lastData) - Y - dataIndex * (value - lastData) + value;
      let lineDist = Math.abs(lineEqn) / Math.sqrt((value - lastData)*(value - lastData) + 1);

      if (dist <= this.constants.brushSize) return this.constants.brushColor;
      else if (
        lineDist <= this.constants.lineThickness &&
        X <= dataIndex &&
        X >= dataIndex - 1 &&
        Y <= Math.max(value, lastData) &&
        Y >= Math.min(value, lastData)
      ) return this.constants.lineColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        brushSize,
        brushColor,
        lineThickness,
        lineColor,
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset,
        progressiveAxis: progressiveAxis == 'y' ? 1 : 0
      },
      constantTypes: {
        brushColor: 'Array(3)',
        brushSize: 'Float',
        lineThickness: 'Float',
        lineColor: 'Array(3)',
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float',
        progressiveAxis: 'Integer'
      }
    })
  }

  var addData = getAddDataKernel;

  class RealLineGraph extends RealRenderer_1 {
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

      this._progressGraph = progressGraph(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);
      this._lastProgress = 0; // Time when the graph last progressed. Internal variable
      this._numProgress = 0; // Number of times the graph has progressed

      this._dataIndex = 1; // Number of plots
      this._lastData = 0; // (Value) To display lines

      this._addData = addData(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor, this.progressiveAxis);

      this.limits = { // Final ranges of x and y
        x: [
          0 - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor), // lower limit
          this.dimensions[0] / this.xScaleFactor - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor) // upper limit
        ],
        y: [
          0 - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor),
          this.dimensions[1] / this.yScaleFactor - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor)
        ]
      };
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
        );

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
      };

      return this;
    }
  }

  var RealLineGraph_1 = RealLineGraph;

  var gpujsRealRenderer = {
    RealRenderer: RealRenderer_1,
    RealLineGraph: RealLineGraph_1
  };
  var gpujsRealRenderer_1 = gpujsRealRenderer.RealRenderer;
  var gpujsRealRenderer_2 = gpujsRealRenderer.RealLineGraph;

  exports.RealLineGraph = gpujsRealRenderer_2;
  exports.RealRenderer = gpujsRealRenderer_1;
  exports.default = gpujsRealRenderer;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
