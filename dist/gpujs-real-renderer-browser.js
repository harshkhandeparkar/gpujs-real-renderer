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

    _overlayFunc(graphPixels) { // Non-persistent overlays at the end of a frame
      return graphPixels;
    }

    _draw() {
      this.time += this.timeStep;

      this.graphPixels = this._drawFunc(this.graphPixels, this.time);
      return this.graphPixels;
    }

    draw(numDraws = 1) {
      for (let i = 0; i < numDraws; i++) this._draw();

      this._display(this._overlayFunc(this.graphPixels));
      
      return this;
    }

    _render() {
      if (this._doRender) {
        this.draw(this.drawsPerFrame);

        window.requestAnimationFrame(() => {this._render();});
      }
    }

    startRender() {
      if (!this._doRender) {
        this._doRender = true;
        this._render();
        return this;
      }
    }

    stopRender() {
      this._doRender = false;
      return this;
    }

    toggleRender() {
      this._doRender = !this._doRender;
      if (this._doRender) this._render();
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

      const val = value[0];
      const last = lastData[0];
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
      const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

      const xDist = (X - dataIndex) * this.constants.xScaleFactor;
      const yDist = (Y - val) * this.constants.yScaleFactor;

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      let lineEqn = X * (val - last) - Y - dataIndex * (val - last) + val;
      let lineDist = Math.abs(lineEqn) / Math.sqrt((val - last)*(val - last) + 1);

      if (dist <= this.constants.brushSize) return this.constants.brushColor;
      else if (
        lineDist <= this.constants.lineThickness &&
        X <= dataIndex &&
        X >= dataIndex - 1 &&
        Y <= Math.max(val, last) &&
        Y >= Math.min(val, last)
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
      this._lastData = [0]; // (Value) To display lines

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
      if (!isNaN(parseFloat(value))) value = [parseFloat(value)];
      else if (!value.texture) throw 'Input invalid.';

      console.log(value, this._lastData);
      
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

    getLimits() {
      return this.limits;
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

  /**
   * @param {Object} gpu 
   * @param {Float32Array} dimensions 
   * @param {Number} brushSize 
   * @param {Float32Array} brushColor
   * @param {Number} xScaleFactor
   * @param {Number} yScaleFactor
   * @param {Number} xOffset
   * @param {Number} yOffset
   */
  function getPlotComplexKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset) {
    return gpu.createKernel(function(graphPixels, valX, valY) {
      const x = this.thread.x,
        y = this.thread.y;
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
      const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

      const xDist = (X - valX) * this.constants.xScaleFactor;
      const yDist = (Y - valY) * this.constants.yScaleFactor;

      const dist = Math.sqrt(xDist*xDist + yDist*yDist);

      if (dist <= this.constants.brushSize) return this.constants.brushColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        brushSize,
        brushColor,
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset,
      },
      constantTypes: {
        brushColor: 'Array(3)',
        brushSize: 'Float',
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    })
  }

  var plotComplex = getPlotComplexKernel;

  /**
   * @param {Object} gpu 
   * @param {Float32Array} dimensions 
   * @param {Number} xScaleFactor
   * @param {Number} yScaleFactor
   * @param {Number} xOffset
   * @param {Number} yOffset
   * @param {Number} lineThickness
   * @param {Number} lineColor
   */
  function getInterpolateKernel(gpu, dimensions, xScaleFactor, yScaleFactor, xOffset, yOffset, lineThickness, lineColor) {
    return gpu.createKernel(function(graphPixels, val1, val2) {
      const x = this.thread.x,
        y = this.thread.y;

      const x1 = val1[0];
      const y1 = val1[1];

      const x2 = val2[0];
      const y2 = val2[1];
        
      const outX = this.output.x, outY = this.output.y;

      const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
      const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

      let lineEqn = X * (y1 - y2) - x1 * (y1 - y2) - Y * (x1 - x2) + y1 * (x1 -x2);
      let lineDist = Math.abs(lineEqn) / Math.sqrt((y1 - y2)*(y1 - y2) + (x1 - x2)*(x1 - x2));

      if (
        lineDist <= this.constants.lineThickness &&
        X <= Math.max(x1, x2) &&
        X >= Math.min(x1, x2) &&
        Y <= Math.max(y1, y2) &&
        Y >= Math.min(y1, y2)
      ) return this.constants.lineColor;
      else return graphPixels[this.thread.y][this.thread.x];
    },
    {
      output: dimensions,
      pipeline: true,
      constants: {
        lineThickness,
        lineColor,
        xScaleFactor,
        yScaleFactor,
        xOffset,
        yOffset
      },
      constantTypes: {
        lineThickness: 'Float',
        lineColor: 'Array(3)',
        xScaleFactor: 'Float',
        yScaleFactor: 'Float',
        xOffset: 'Float',
        yOffset: 'Float'
      }
    })
  }

  var interpolate = getInterpolateKernel;

  /**
   * Convert polar to Cartesian form.
   * @param {Number} r Modulus
   * @param {Number} theta Argument
   * @returns {Float32Array} [x, y]
   */
  function convertPolarCartesian(r, theta) {
    return [
      r * Math.cos(theta),
      r * Math.sin(theta)
    ]
  }

  /**
   * Convert Cartesian to polar form.
   * @param {Number} x Real Part
   * @param {Number} theta Complex Part
   * @returns {Float32Array} [r, theta]
   */
  function convertCartesianPolar(x, y) {
    return [
      Math.sqrt(x*x + y*y),
      Math.atan2(y, x)
    ]
  }

  var convertForm = {
    convertPolarCartesian,
    convertCartesianPolar
  };

  // A Complex class to handle all complex stuff
  const {convertCartesianPolar: convertCartesianPolar$1, convertPolarCartesian: convertPolarCartesian$1} = convertForm;

  class Complex {
    /**
     * Constructor
     * @param {Number} r Modulus
     * @param {Number} theta Argument (radians)
     */
    constructor(r, theta) {
      this.r = r;
      this.theta = theta;

      this.x = convertPolarCartesian$1(this.r, this.theta)[0];
      this.y = convertPolarCartesian$1(this.r, this.theta)[1];


      this.convertCartesianPolar = convertCartesianPolar$1;
      this.convertPolarCartesian = convertPolarCartesian$1;

      return this;
    }

    /**
     * @returns {Float32Array} [x, y]
     */
    getCartesianForm() {
      return [this.x, this.y];
    }

    /**
     * @returns {Float32Array} [r, theta]
     */
    getPolarForm() {
      return [this.r, this.theta];
    }

    /**
     * @param {"Complex"} addedNum Complex number (object) to be added.
     * @returns {"Complex"} this
     */
    add(addedNum) {
      this.x += addedNum.x;
      this.y += addedNum.y;

      this.r = convertCartesianPolar$1(this.x, this.y)[0];
      this.theta = convertCartesianPolar$1(this.x, this.y)[1];

      return this;
    }

    /**
     * @param {"Complex"} subtractedNum Complex number (object) to be subtracted.
     * @returns {"Complex"} this
     */
    subtract(subtractedNum) {
      this.x -= subtractedNum.x;
      this.y -= subtractedNum.y;

      this.r = convertCartesianPolar$1(this.x, this.y)[0];
      this.theta = convertCartesianPolar$1(this.x, this.y)[1];
      return this;
    }

    /**
     * @param {"Complex"} multipliedNum Complex number (object) to be multiplied.
     * @returns {"Complex"} this 
     */
    multiply(multipliedNum) {
      this.r *= multipliedNum.r;
      this.theta += multipliedNum.theta;

      this.x = convertPolarCartesian$1(this.r, this.theta)[0];
      this.y = convertPolarCartesian$1(this.r, this.theta)[1];

      return this;
    }

    /**
     * @param {"Complex"} dividedNum Complex number (object) to be multiplied.
     * @returns {"Complex"} this 
     */
    divide(dividedNum) {
      this.r /= dividedNum.r;
      this.theta -= dividedNum.theta;

      this.x = convertPolarCartesian$1(this.r, this.theta)[0];
      this.y = convertPolarCartesian$1(this.r, this.theta)[1];

      return this;
    }

    /**
     * @returns {"Complex"} The complex conjugate (modified this).
     */
    conjugate() {
      this.theta *= -1;
      this.x = convertPolarCartesian$1(this.r, this.theta)[0];
      this.y = convertPolarCartesian$1(this.r, this.theta)[1];

      return this;
    }

    /**
     * @returns {"Complex"} The complex reciprocal (modified this).
     */
    reciprocal() {
      this.r = 1 / this.r;
      this.theta *= -1;
      this.x = convertPolarCartesian$1(this.r, this.theta)[0];
      this.y = convertPolarCartesian$1(this.r, this.theta)[1];

      return this;
    }
  }

  var complex = Complex;

  class RealComplexSpace extends RealRenderer_1 {
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

      this._plotComplex = plotComplex(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
      this._plotComplexPersistent = plotComplex(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset);
      this.Complex = complex;

      this.interpolate = interpolate(this.gpu, this.dimensions, this.xScaleFactor, this.yScaleFactor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor);
    }

    /**
     * Watch a new number
     * @param {String} name Name for the watched number.
     * @param {"Complex"} number Complex number to watch.
     * @param {Boolean} persistent Whether the number should remain at the same place each time.
     * @param {Boolean} interpolate Whether to interpolate (make a line) between this number and another or not.
     * @param {"Complex"} interpolateTo The second complex number to interpolate between.
     * @param {Object} attributes optional attributes object.
     * @returns this
     */
    watch(name, number, persistent = true, interpolate, interpolateTo, attributes = {}) {
      this.watchedNumbers[name] = {
        number,
        persistent,
        interpolate,
        interpolateTo,
        attributes
      };

      return this;
    }

    _interpolate(graphPixels, n1, n2) {
      graphPixels = this.interpolate(this._cloneTexture(graphPixels), [n1.x, n1.y], [n2.x, n2.y]);

      return graphPixels;
    }

    _overlayFunc(graphPixels) {
      for (let num in this.watchedNumbers) {
        if (!this.watchedNumbers[num].persistent) graphPixels = this._plot(graphPixels, this.watchedNumbers[num].number);

        if (this.watchedNumbers[num].interpolate) graphPixels = this._interpolate(graphPixels, this.watchedNumbers[num].number, this.watchedNumbers[num].interpolateTo);
      }

      return graphPixels;
    }

    _drawFunc(graphPixels, time) {
      this.watchedNumbers = this.changeNumbers(this.watchedNumbers, time, this.timeStep);

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

  var RealComplexSpace_1 = RealComplexSpace;

  var gpujsRealRenderer = {
    RealRenderer: RealRenderer_1,
    RealLineGraph: RealLineGraph_1,
    RealComplexSpace: RealComplexSpace_1
  };
  var gpujsRealRenderer_1 = gpujsRealRenderer.RealRenderer;
  var gpujsRealRenderer_2 = gpujsRealRenderer.RealLineGraph;
  var gpujsRealRenderer_3 = gpujsRealRenderer.RealComplexSpace;

  exports.RealComplexSpace = gpujsRealRenderer_3;
  exports.RealLineGraph = gpujsRealRenderer_2;
  exports.RealRenderer = gpujsRealRenderer_1;
  exports.default = gpujsRealRenderer;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
