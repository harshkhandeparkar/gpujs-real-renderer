(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GPUjsRealRenderer = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var display = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getDisplayKernel = void 0;
	/**
	 * @param gpu GPU.js Instance
	 * @param dimensions Dimensions of the Output Graph
	 */
	function getDisplayKernel(gpu, dimensions) {
	    return gpu.createKernel(function (graphPixels) {
	        var color = graphPixels[this.thread.y][this.thread.x];
	        this.color(color[0], color[1], color[2]);
	    }, {
	        output: dimensions,
	        graphical: true
	    });
	}
	exports.getDisplayKernel = getDisplayKernel;
	});

	var blankGraph = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getBlankGraphKernel = void 0;
	/**
	 * @param gpu GPU.js instance
	 * @param dimensions Dimensions of Graph
	 * @param xOffset
	 * @param yOffset
	 * @param bgColor
	 * @param axesColor
	 */
	function getBlankGraphKernel(gpu, dimensions, xOffset, yOffset, bgColor, axesColor) {
	    return gpu.createKernel(function () {
	        var outX = this.output.x, outY = this.output.y;
	        var X = Math.floor(outY * (this.constants.xOffset / 100));
	        var Y = Math.floor(outX * (this.constants.yOffset / 100));
	        if (this.thread.x === Y || this.thread.y === X)
	            return this.constants.axesColor;
	        else
	            return this.constants.bgColor;
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            xOffset: xOffset,
	            yOffset: yOffset,
	            bgColor: bgColor,
	            axesColor: axesColor
	        },
	        constantTypes: {
	            bgColor: 'Array(3)',
	            axesColor: 'Array(3)',
	            xOffset: 'Float',
	            yOffset: 'Float'
	        }
	    });
	}
	exports.getBlankGraphKernel = getBlankGraphKernel;
	});

	var cloneTexture = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getCloneTextureKernel = void 0;
	/**
	 * @param gpu GPU.js instance
	 * @param dimensions Dimensions of Graph
	 */
	function getCloneTextureKernel(gpu, dimensions) {
	    return gpu.createKernel(function (graphPixels) {
	        return graphPixels[this.thread.y][this.thread.x];
	    }, {
	        output: dimensions,
	        pipeline: true
	    });
	}
	exports.getCloneTextureKernel = getCloneTextureKernel;
	});

	var RealRendererTypes = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	});

	var RealRendererDefaults = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealRendererDefaults = void 0;
	exports.RealRendererDefaults = {
	    dimensions: { x: 1000, y: 1000 },
	    xScaleFactor: 10,
	    yScaleFactor: 1,
	    bgColor: [0, 0, 0],
	    axesColor: [1, 1, 1],
	    drawsPerFrame: 1,
	    timeStep: 1 / 60,
	    initTime: 0,
	    xOffset: 50,
	    yOffset: 50,
	    GPU: window.GPU
	};
	});

	var RealRenderer_1 = createCommonjsModule(function (module, exports) {
	var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
	    __assign = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealRenderer = exports.RealRendererTypes = void 0;



	exports.RealRendererTypes = RealRendererTypes;

	__exportStar(RealRendererDefaults, exports);
	var RealRenderer = /** @class */ (function () {
	    function RealRenderer(options) {
	        // *****DEFAULTS*****
	        options = __assign(__assign({}, RealRendererDefaults.RealRendererDefaults), options);
	        this.canvas = this._canvas = options.canvas;
	        this.dimensions = options.dimensions;
	        this.xScaleFactor = options.xScaleFactor;
	        this.yScaleFactor = options.yScaleFactor;
	        this.bgColor = options.bgColor;
	        this.axesColor = options.axesColor;
	        this.drawsPerFrame = options.drawsPerFrame;
	        this.timeStep = options.timeStep;
	        this.time = options.initTime;
	        this.xOffset = options.xOffset; // %age offset
	        this.yOffset = options.yOffset; // %age offset
	        options.GPU = options.GPU;
	        this.xOffset = Math.max(0, Math.min(100, this.xOffset)); // Between 0 and 100
	        this.yOffset = Math.max(0, Math.min(100, this.yOffset)); // Between 0 and 100
	        // *****DEFAULTS*****
	        if (this.canvas === undefined) {
	            throw 'No Canvas Element Found';
	        }
	        this.gpu = new options.GPU({
	            canvas: this._canvas,
	            mode: 'gpu'
	        });
	        this._blankGraph = blankGraph.getBlankGraphKernel(this.gpu, this.dimensions, this.xOffset, this.yOffset, this.bgColor, this.axesColor);
	        this._cloneTexture = cloneTexture.getCloneTextureKernel(this.gpu, this.dimensions);
	        this.graphPixels = this._blankGraph();
	        this._display = display.getDisplayKernel(this.gpu, this.dimensions);
	        this._doRender = false;
	    }
	    RealRenderer.prototype._drawFunc = function (graphPixels, time) {
	        return graphPixels;
	    };
	    RealRenderer.prototype._overlayFunc = function (graphPixels) {
	        return graphPixels;
	    };
	    RealRenderer.prototype._draw = function () {
	        this.time += this.timeStep;
	        this.graphPixels = this._drawFunc(this.graphPixels, this.time);
	        return this.graphPixels;
	    };
	    RealRenderer.prototype.draw = function (numDraws) {
	        if (numDraws === void 0) { numDraws = 1; }
	        for (var i = 0; i < numDraws; i++)
	            this._draw();
	        this._display(this._overlayFunc(this.graphPixels));
	        return this;
	    };
	    RealRenderer.prototype._render = function () {
	        var _this = this;
	        if (this._doRender) {
	            this.draw(this.drawsPerFrame);
	            window.requestAnimationFrame(function () { _this._render(); });
	        }
	    };
	    RealRenderer.prototype.startRender = function () {
	        if (!this._doRender) {
	            this._doRender = true;
	            this._render();
	            return this;
	        }
	    };
	    RealRenderer.prototype.stopRender = function () {
	        this._doRender = false;
	        return this;
	    };
	    RealRenderer.prototype.toggleRender = function () {
	        this._doRender = !this._doRender;
	        if (this._doRender)
	            this._render();
	        return this;
	    };
	    RealRenderer.prototype.resetTime = function () {
	        this.time = 0;
	        return this;
	    };
	    RealRenderer.prototype.reset = function () {
	        this.graphPixels = this._blankGraph();
	        this.resetTime();
	        this._display(this.graphPixels);
	        return this;
	    };
	    return RealRenderer;
	}());
	exports.RealRenderer = RealRenderer;
	});

	var progressGraph = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getProgressGraphKernel = void 0;
	/**
	 * @param gpu GPU.js instance
	 * @param dimensions Dimensions of Graph
	 * @param progressiveAxis The axis which progresses.
	 * @param xOffset
	 * @param yOffset
	 * @param axesColor
	 * @param bgColor
	 */
	function getProgressGraphKernel(gpu, dimensions, progressiveAxis, xOffset, yOffset, axesColor, bgColor) {
	    return gpu.createKernel(function (graphPixels, // making this Texture throws an error
	    numProgress) {
	        var outX = this.output.x, outY = this.output.y;
	        if ((this.thread.x * Math.abs(this.constants.progressiveAxis - 1) >= (outX - numProgress)) ||
	            (this.thread.y * this.constants.progressiveAxis >= (outY + numProgress))) {
	            var X = Math.floor(outY * (this.constants.xOffset / 100));
	            var Y = Math.floor(outX * (this.constants.yOffset / 100));
	            if (this.thread.x === Y || this.thread.y === X)
	                return this.constants.axesColor;
	            else
	                return this.constants.bgColor;
	        }
	        else {
	            return graphPixels[this.thread.y +
	                numProgress * this.constants.progressiveAxis][this.thread.x +
	                numProgress * Math.abs(this.constants.progressiveAxis - 1)];
	        }
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            progressiveAxis: progressiveAxis == 'y' ? 1 : 0,
	            xOffset: xOffset,
	            yOffset: yOffset,
	            axesColor: axesColor,
	            bgColor: bgColor
	        },
	        constantTypes: {
	            progressiveAxis: 'Integer',
	            xOffset: 'Float',
	            yOffset: 'Float',
	            axesColor: 'Array(3)',
	            bgColor: 'Array(3)'
	        }
	    });
	}
	exports.getProgressGraphKernel = getProgressGraphKernel;
	});

	var squeezeGraph = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getSqueezeGraphKernel = void 0;
	/**
	 * @param gpu GPU.js instance
	 * @param dimensions Dimensions of Graph
	 * @param progressiveAxis The axis which progresses.
	 * @param xOffset
	 * @param yOffset
	 * @param axesColor
	 * @param bgColor
	 */
	function getSqueezeGraphKernel(gpu, dimensions, progressiveAxis, xOffset, yOffset, axesColor, bgColor) {
	    return gpu.createKernel(function (graphPixels, squeezingFactor) {
	        var outX = this.output.x, outY = this.output.y;
	        var X = Math.floor(outY * (this.constants.xOffset / 100));
	        var Y = Math.floor(outX * (this.constants.yOffset / 100));
	        if ((Math.floor(this.thread.x * (1 - this.constants.progressiveAxis) / squeezingFactor) >= outX) ||
	            (Math.floor(this.thread.y * this.constants.progressiveAxis / squeezingFactor) >= outY)) {
	            if (this.thread.x === Y || this.thread.y === X)
	                return this.constants.axesColor;
	            else
	                return this.constants.bgColor;
	        }
	        else {
	            var newY = this.constants.progressiveAxis == 1 ? Math.floor(this.thread.y / squeezingFactor) : Math.floor(this.thread.y);
	            var newX = this.constants.progressiveAxis == 0 ? Math.floor(this.thread.x / squeezingFactor) : Math.floor(this.thread.x);
	            return graphPixels[newY][newX];
	        }
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            progressiveAxis: progressiveAxis == 'y' ? 1 : 0,
	            xOffset: xOffset,
	            yOffset: yOffset,
	            axesColor: axesColor,
	            bgColor: bgColor
	        },
	        constantTypes: {
	            progressiveAxis: 'Integer',
	            xOffset: 'Float',
	            yOffset: 'Float',
	            axesColor: 'Array(3)',
	            bgColor: 'Array(3)'
	        }
	    });
	}
	exports.getSqueezeGraphKernel = getSqueezeGraphKernel;
	});

	var addData = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getAddDataKernel = void 0;
	/**
	 *
	 * @param gpu
	 * @param dimensions
	 * @param brushSize
	 * @param brushColor
	 * @param xScaleFactor
	 * @param yScaleFactor
	 * @param xOffset
	 * @param yOffset
	 * @param lineThickness
	 * @param lineColor
	 * @param progressiveAxis
	 */
	function getAddDataKernel(gpu, dimensions, brushSize, brushColor, xOffset, yOffset, lineThickness, lineColor, progressiveAxis) {
	    return gpu.createKernel(function (graphPixels, value, dataIndex, lastData, numProgress, xScaleFactor, yScaleFactor) {
	        var x = this.thread.x + numProgress * Math.abs(this.constants.progressiveAxis - 1), y = this.thread.y + numProgress * this.constants.progressiveAxis;
	        var val = value[0];
	        var last = lastData[0];
	        var outX = this.output.x, outY = this.output.y;
	        var X = x / xScaleFactor - (outX * (this.constants.yOffset / 100)) / xScaleFactor;
	        var Y = y / yScaleFactor - (outY * (this.constants.xOffset / 100)) / yScaleFactor;
	        var xDist = (X - dataIndex) * xScaleFactor;
	        var yDist = (Y - val) * yScaleFactor;
	        var dist = Math.sqrt(xDist * xDist + yDist * yDist);
	        var lineEqn = X * (val - last) - Y - dataIndex * (val - last) + val;
	        var lineDist = Math.abs(lineEqn) / Math.sqrt((val - last) * (val - last) + 1);
	        if (dist <= this.constants.brushSize)
	            return this.constants.brushColor;
	        else if (lineDist <= this.constants.lineThickness &&
	            X <= dataIndex &&
	            X >= dataIndex - 1 &&
	            Y <= Math.max(val, last) &&
	            Y >= Math.min(val, last))
	            return this.constants.lineColor;
	        else
	            return graphPixels[this.thread.y][this.thread.x];
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            brushSize: brushSize,
	            brushColor: brushColor,
	            lineThickness: lineThickness,
	            lineColor: lineColor,
	            xOffset: xOffset,
	            yOffset: yOffset,
	            progressiveAxis: progressiveAxis == 'y' ? 1 : 0
	        },
	        constantTypes: {
	            brushColor: 'Array(3)',
	            brushSize: 'Float',
	            lineThickness: 'Float',
	            lineColor: 'Array(3)',
	            xOffset: 'Float',
	            yOffset: 'Float',
	            progressiveAxis: 'Integer'
	        }
	    });
	}
	exports.getAddDataKernel = getAddDataKernel;
	});

	var RealLineGraphTypes = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	});

	var RealLineGraphDefaults = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealLineGraphDefaults = void 0;
	exports.RealLineGraphDefaults = {
	    progressiveAxis: 'x',
	    progressionMode: 'overflow',
	    progressInterval: 1,
	    brushSize: 1,
	    brushColor: [1, 1, 1],
	    lineThickness: 0.05,
	    lineColor: [0, 0.5, 0]
	};
	});

	var RealLineGraph_1 = createCommonjsModule(function (module, exports) {
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
	    __assign = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealLineGraph = exports.RealLineGraphTypes = exports.RealRendererTypes = void 0;




	exports.RealRendererTypes = RealRendererTypes;
	exports.RealLineGraphTypes = RealLineGraphTypes;

	__exportStar(RealLineGraphDefaults, exports);
	var RealLineGraph = /** @class */ (function (_super) {
	    __extends(RealLineGraph, _super);
	    function RealLineGraph(options) {
	        var _this = 
	        // *****DEFAULTS*****
	        _super.call(this, options) || this;
	        options = __assign(__assign({}, RealLineGraphDefaults.RealLineGraphDefaults), options);
	        _this.options = options;
	        _this.progressiveAxis = options.progressiveAxis; // Which axis progresses with time
	        _this.progressionMode = options.progressionMode; // overflow -> Only progresses when completely filled; continous -> Always progresses;
	        _this.progressInterval = options.progressInterval; // Progress once every interval time units; Only works with continous progressionMode
	        _this.brushSize = options.brushSize; // 1 unit radius
	        _this.brushColor = options.brushColor;
	        _this.lineThickness = options.lineThickness;
	        _this.lineColor = options.lineColor;
	        // *****DEFAULTS*****
	        _this._progressGraph = progressGraph.getProgressGraphKernel(_this.gpu, _this.dimensions, _this.progressiveAxis, _this.xOffset, _this.yOffset, _this.axesColor, _this.bgColor);
	        _this._squeezeGraph = squeezeGraph.getSqueezeGraphKernel(_this.gpu, _this.dimensions, _this.progressiveAxis, _this.xOffset, _this.yOffset, _this.axesColor, _this.bgColor);
	        _this._lastProgress = 0; // Time when the graph last progressed. Internal variable
	        _this._numProgress = 0; // Number of times the graph has progressed
	        _this._dataIndex = 1; // Number of plots
	        _this._lastData = [0]; // (Value) To display lines
	        _this._addData = addData.getAddDataKernel(_this.gpu, _this.dimensions, _this.brushSize, _this.brushColor, _this.xOffset, _this.yOffset, _this.lineThickness, _this.lineColor, _this.progressiveAxis);
	        _this.limits = {
	            x: [
	                0 - (_this.yOffset / 100) * (_this.dimensions[0] / _this.xScaleFactor),
	                _this.dimensions[0] / _this.xScaleFactor - (_this.yOffset / 100) * (_this.dimensions[0] / _this.xScaleFactor) // upper limit
	            ],
	            y: [
	                0 - (_this.xOffset / 100) * (_this.dimensions[1] / _this.yScaleFactor),
	                _this.dimensions[1] / _this.yScaleFactor - (_this.xOffset / 100) * (_this.dimensions[1] / _this.yScaleFactor)
	            ]
	        };
	        return _this;
	    }
	    RealLineGraph.prototype.addData = function (value) {
	        if (!isNaN(Number(value)))
	            value = [Number(value)]; // convert all forms to [number] or Texture
	        this.graphPixels = this._addData(this._cloneTexture(this.graphPixels), value, this._dataIndex++, this._lastData, this._numProgress, this.xScaleFactor, this.yScaleFactor);
	        this._lastData = value;
	        // Overflow
	        if (this._dataIndex >= this.limits.x[1] && this.progressionMode == 'overflow') {
	            var progress = Math.ceil(this.progressiveAxis == 'y' ? this.yScaleFactor : this.xScaleFactor);
	            this.graphPixels = this._progressGraph(this._cloneTexture(this.graphPixels), progress);
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
	        // Squeeze
	        if (this._dataIndex >= this.limits.x[1] && this.progressionMode == 'squeeze') {
	            var scalingFactor = (this._dataIndex / (this._dataIndex + 1));
	            this.graphPixels = this._squeezeGraph(this._cloneTexture(this.graphPixels), scalingFactor);
	            if (this.progressiveAxis == 'x') {
	                this.xScaleFactor *= scalingFactor;
	                this.limits.x[1] /= scalingFactor;
	            }
	            else {
	                this.yScaleFactor *= scalingFactor;
	                this.limits.y[1] /= scalingFactor;
	            }
	        }
	        this._display(this.graphPixels);
	        return this;
	    };
	    RealLineGraph.prototype._drawFunc = function (graphPixels, time) {
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
	        else
	            return graphPixels;
	    };
	    RealLineGraph.prototype.getLimits = function () {
	        return this.limits;
	    };
	    RealLineGraph.prototype.reset = function () {
	        _super.prototype.reset.call(this);
	        // Reset Inner Variables
	        this._dataIndex = 1;
	        this._lastData = [0];
	        this._lastProgress = 0;
	        this._numProgress = 0;
	        this.xScaleFactor = this.options.xScaleFactor;
	        this.yScaleFactor = this.options.yScaleFactor;
	        this.limits = {
	            x: [
	                0 - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor),
	                this.dimensions[0] / this.xScaleFactor - (this.yOffset / 100) * (this.dimensions[0] / this.xScaleFactor) // upper limit
	            ],
	            y: [
	                0 - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor),
	                this.dimensions[1] / this.yScaleFactor - (this.xOffset / 100) * (this.dimensions[1] / this.yScaleFactor)
	            ]
	        };
	        return this;
	    };
	    return RealLineGraph;
	}(RealRenderer_1.RealRenderer));
	exports.RealLineGraph = RealLineGraph;
	});

	var plot = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getPlotKernel = void 0;
	/**
	 * @param gpu
	 * @param dimensions
	 * @param brushSize
	 * @param brushColor
	 * @param xScaleFactor
	 * @param yScaleFactor
	 * @param xOffset
	 * @param yOffset
	 */
	function getPlotKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset) {
	    return gpu.createKernel(function (graphPixels, valX, valY) {
	        var x = this.thread.x, y = this.thread.y;
	        var outX = this.output.x, outY = this.output.y;
	        var X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
	        var Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;
	        var xDist = (X - valX) * this.constants.xScaleFactor;
	        var yDist = (Y - valY) * this.constants.yScaleFactor;
	        var dist = Math.sqrt(xDist * xDist + yDist * yDist);
	        if (dist <= this.constants.brushSize)
	            return this.constants.brushColor;
	        else
	            return graphPixels[this.thread.y][this.thread.x];
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            brushSize: brushSize,
	            brushColor: brushColor,
	            xScaleFactor: xScaleFactor,
	            yScaleFactor: yScaleFactor,
	            xOffset: xOffset,
	            yOffset: yOffset
	        },
	        constantTypes: {
	            brushColor: 'Array(3)',
	            brushSize: 'Float',
	            xScaleFactor: 'Float',
	            yScaleFactor: 'Float',
	            xOffset: 'Float',
	            yOffset: 'Float'
	        }
	    });
	}
	exports.getPlotKernel = getPlotKernel;
	});

	var interpolate = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getInterpolateKernel = void 0;
	/**
	 * @param gpu
	 * @param dimensions
	 * @param xScaleFactor
	 * @param yScaleFactor
	 * @param xOffset
	 * @param yOffset
	 * @param lineThickness
	 * @param lineColor
	 */
	function getInterpolateKernel(gpu, dimensions, xScaleFactor, yScaleFactor, xOffset, yOffset, lineThickness, lineColor) {
	    return gpu.createKernel(function (graphPixels, val1, val2) {
	        var x = this.thread.x, y = this.thread.y;
	        var lineHalfThickness = this.constants.lineThickness / 2;
	        var x1 = val1[0];
	        var y1 = val1[1];
	        var x2 = val2[0];
	        var y2 = val2[1];
	        var outX = this.output.x, outY = this.output.y;
	        var X = x / (this.constants.xScaleFactor) - (outX * (this.constants.yOffset / 100)) / (this.constants.xScaleFactor);
	        var Y = y / (this.constants.yScaleFactor) - (outY * (this.constants.xOffset / 100)) / (this.constants.yScaleFactor);
	        var lineEqn = X * (y1 - y2) - x1 * (y1 - y2) - Y * (x1 - x2) + y1 * (x1 - x2);
	        var lineDist = Math.abs(lineEqn) / Math.sqrt((y1 - y2) * (y1 - y2) + (x1 - x2) * (x1 - x2));
	        if (lineDist <= lineHalfThickness &&
	            X <= Math.max(x1, x2) + lineHalfThickness &&
	            X >= Math.min(x1, x2) - lineHalfThickness &&
	            Y <= Math.max(y1, y2) + lineHalfThickness &&
	            Y >= Math.min(y1, y2) - lineHalfThickness)
	            return this.constants.lineColor;
	        else
	            return graphPixels[this.thread.y][this.thread.x];
	    }, {
	        output: dimensions,
	        pipeline: true,
	        constants: {
	            lineThickness: lineThickness,
	            lineColor: lineColor,
	            xScaleFactor: xScaleFactor,
	            yScaleFactor: yScaleFactor,
	            xOffset: xOffset,
	            yOffset: yOffset
	        },
	        constantTypes: {
	            lineThickness: 'Float',
	            lineColor: 'Array(3)',
	            xScaleFactor: 'Float',
	            yScaleFactor: 'Float',
	            xOffset: 'Float',
	            yOffset: 'Float'
	        }
	    });
	}
	exports.getInterpolateKernel = getInterpolateKernel;
	});

	var convertForm = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.convertCartesianPolar = exports.convertPolarCartesian = void 0;
	/**
	 * Convert polar to Cartesian form.
	 * @param r Modulus
	 * @param theta Argument
	 */
	function convertPolarCartesian(r, theta) {
	    return [
	        r * Math.cos(theta),
	        r * Math.sin(theta)
	    ];
	}
	exports.convertPolarCartesian = convertPolarCartesian;
	/**
	 * Convert Cartesian to polar form.
	 * @param x Real Part
	 * @param theta Complex Part
	 */
	function convertCartesianPolar(x, y) {
	    return [
	        Math.sqrt(x * x + y * y),
	        Math.atan2(y, x)
	    ];
	}
	exports.convertCartesianPolar = convertCartesianPolar;
	});

	var complex = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Complex = void 0;
	// A Complex class to handle all complex stuff

	var Complex = /** @class */ (function () {
	    /**
	     * Constructor
	     * @param r Modulus
	     * @param theta Argument (radians)
	     */
	    function Complex(r, theta) {
	        this.r = r;
	        this.theta = theta;
	        this.x = convertForm.convertPolarCartesian(this.r, this.theta)[0];
	        this.y = convertForm.convertPolarCartesian(this.r, this.theta)[1];
	        return this;
	    }
	    Complex.prototype.getCartesianForm = function () {
	        return [this.x, this.y];
	    };
	    Complex.prototype.getPolarForm = function () {
	        return [this.r, this.theta];
	    };
	    /**
	     * @param addedNum Complex number (object) to be added.
	     */
	    Complex.prototype.add = function (addedNum) {
	        this.x += addedNum.x;
	        this.y += addedNum.y;
	        this.r = convertForm.convertCartesianPolar(this.x, this.y)[0];
	        this.theta = convertForm.convertCartesianPolar(this.x, this.y)[1];
	        return this;
	    };
	    /**
	     * @param subtractedNum Complex number (object) to be subtracted.
	     */
	    Complex.prototype.subtract = function (subtractedNum) {
	        this.x -= subtractedNum.x;
	        this.y -= subtractedNum.y;
	        this.r = convertForm.convertCartesianPolar(this.x, this.y)[0];
	        this.theta = convertForm.convertCartesianPolar(this.x, this.y)[1];
	        return this;
	    };
	    /**
	     * @param multipliedNum Complex number (object) to be multiplied.
	     */
	    Complex.prototype.multiply = function (multipliedNum) {
	        this.r *= multipliedNum.r;
	        this.theta += multipliedNum.theta;
	        this.x = convertForm.convertPolarCartesian(this.r, this.theta)[0];
	        this.y = convertForm.convertPolarCartesian(this.r, this.theta)[1];
	        return this;
	    };
	    /**
	     * @param dividedNum Complex number (object) to be multiplied.
	     */
	    Complex.prototype.divide = function (dividedNum) {
	        this.r /= dividedNum.r;
	        this.theta -= dividedNum.theta;
	        this.x = convertForm.convertPolarCartesian(this.r, this.theta)[0];
	        this.y = convertForm.convertPolarCartesian(this.r, this.theta)[1];
	        return this;
	    };
	    /**
	     * @returns The complex conjugate (modified this).
	     */
	    Complex.prototype.conjugate = function () {
	        this.theta *= -1;
	        this.x = convertForm.convertPolarCartesian(this.r, this.theta)[0];
	        this.y = convertForm.convertPolarCartesian(this.r, this.theta)[1];
	        return this;
	    };
	    /**
	     * @returns The complex reciprocal (modified this).
	     */
	    Complex.prototype.reciprocal = function () {
	        this.r = 1 / this.r;
	        this.theta *= -1;
	        this.x = convertForm.convertPolarCartesian(this.r, this.theta)[0];
	        this.y = convertForm.convertPolarCartesian(this.r, this.theta)[1];
	        return this;
	    };
	    Complex.convertCartesianPolar = convertForm.convertCartesianPolar;
	    Complex.convertPolarCartesian = convertForm.convertPolarCartesian;
	    return Complex;
	}());
	exports.Complex = Complex;
	});

	var RealComplexSpaceTypes = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	});

	var RealComplexSpaceDefaults = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealComplexSpaceDefaults = void 0;
	exports.RealComplexSpaceDefaults = {
	    brushSize: 1,
	    brushColor: [1, 1, 1],
	    changeNumbers: function (watchedNumbers, time, timeStep) { return watchedNumbers; },
	    lineThickness: 0.5,
	    lineColor: [1, 1, 1]
	};
	});

	var RealComplexSpace_1 = createCommonjsModule(function (module, exports) {
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
	    __assign = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealComplexSpace = exports.RealComplexSpaceTypes = exports.RealRendererTypes = void 0;




	exports.RealRendererTypes = RealRendererTypes;
	exports.RealComplexSpaceTypes = RealComplexSpaceTypes;

	__exportStar(RealComplexSpaceDefaults, exports);
	var RealComplexSpace = /** @class */ (function (_super) {
	    __extends(RealComplexSpace, _super);
	    function RealComplexSpace(options) {
	        var _this = 
	        // *****DEFAULTS*****
	        _super.call(this, options) || this;
	        _this.Complex = complex.Complex;
	        options = __assign(__assign({}, RealComplexSpaceDefaults.RealComplexSpaceDefaults), options);
	        _this.brushSize = options.brushSize || 1; // 1 unit radius
	        _this.brushColor = options.brushColor || [1, 1, 1];
	        _this.changeNumbers = options.changeNumbers || function (watchedNumbers, time, timeStep) { return watchedNumbers; };
	        _this.lineThickness = options.lineThickness || 0.5;
	        _this.lineColor = options.lineColor || [1, 1, 1];
	        // *****DEFAULTS*****
	        _this.watchedNumbers = []; // Numbers that are plotted at all times (to dynamically update the numbers)
	        _this._plotComplex = plot.getPlotKernel(_this.gpu, _this.dimensions, _this.brushSize, _this.brushColor, _this.xScaleFactor, _this.yScaleFactor, _this.xOffset, _this.yOffset);
	        _this._plotComplexPersistent = plot.getPlotKernel(_this.gpu, _this.dimensions, _this.brushSize, _this.brushColor, _this.xScaleFactor, _this.yScaleFactor, _this.xOffset, _this.yOffset);
	        _this._interpolateKernel = interpolate.getInterpolateKernel(_this.gpu, _this.dimensions, _this.xScaleFactor, _this.yScaleFactor, _this.xOffset, _this.yOffset, _this.lineThickness, _this.lineColor);
	        return _this;
	    }
	    /**
	     * Watch a new number
	     * @param name Name for the watched number.
	     * @param number Complex number to watch.
	     * @param show Whether to display the number or not.
	     * @param persistent Whether the number should remain at the same place each time.
	     * @param interpolate Whether to interpolate (make a line) between this number and another or not.
	     * @param interpolateTo The second complex number to interpolate between.
	     * @param attributes optional attributes object.
	     * @returns this
	     */
	    RealComplexSpace.prototype.watch = function (name, number, show, persistent, interpolate, interpolateTo, attributes) {
	        if (show === void 0) { show = true; }
	        if (persistent === void 0) { persistent = true; }
	        if (interpolate === void 0) { interpolate = false; }
	        if (interpolateTo === void 0) { interpolateTo = null; }
	        if (attributes === void 0) { attributes = {}; }
	        this.watchedNumbers.push({
	            name: name,
	            number: number,
	            show: show,
	            persistent: persistent,
	            interpolate: interpolate,
	            interpolateTo: interpolateTo,
	            attributes: attributes
	        });
	        return this;
	    };
	    RealComplexSpace.prototype.clearWatched = function () {
	        this.watchedNumbers = [];
	        return this;
	    };
	    RealComplexSpace.prototype._interpolate = function (graphPixels, n1, n2) {
	        graphPixels = this._interpolateKernel(this._cloneTexture(graphPixels), [n1.x, n1.y], [n2.x, n2.y]);
	        return graphPixels;
	    };
	    RealComplexSpace.prototype._overlayFunc = function (graphPixels) {
	        for (var num in this.watchedNumbers) {
	            if (!this.watchedNumbers[num].persistent && this.watchedNumbers[num].show)
	                graphPixels = this._plot(graphPixels, this.watchedNumbers[num].number);
	            if (this.watchedNumbers[num].interpolate)
	                graphPixels = this._interpolate(graphPixels, this.watchedNumbers[num].number, this.watchedNumbers[num].interpolateTo);
	        }
	        return graphPixels;
	    };
	    RealComplexSpace.prototype._drawFunc = function (graphPixels, time) {
	        this.watchedNumbers = this.changeNumbers(this.watchedNumbers, time, this.timeStep);
	        for (var num in this.watchedNumbers) {
	            if (this.watchedNumbers[num].persistent && this.watchedNumbers[num].show) {
	                graphPixels = this._plotPersistent(graphPixels, this.watchedNumbers[num].number);
	            }
	        }
	        return graphPixels;
	    };
	    RealComplexSpace.prototype._plot = function (graphPixels, number) {
	        return this._plotComplex(this._cloneTexture(graphPixels), number.x, number.y);
	    };
	    RealComplexSpace.prototype._plotPersistent = function (graphPixels, number) {
	        return this._plotComplexPersistent(this._cloneTexture(graphPixels), number.x, number.y);
	    };
	    /**
	     * @param number Complex number to be plotted.
	     */
	    RealComplexSpace.prototype.plot = function (number) {
	        this._persistentGraphPixels = this._plotPersistent(this._persistentGraphPixels, number);
	        this.graphPixels = this._cloneTexture(this._persistentGraphPixels);
	        this._display(this.graphPixels);
	        return this;
	    };
	    return RealComplexSpace;
	}(RealRenderer_1.RealRenderer));
	exports.RealComplexSpace = RealComplexSpace;
	});

	var RealDrawBoardDefaults = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealDrawBoardDefaults = void 0;
	exports.RealDrawBoardDefaults = {
	    brushSize: 1,
	    brushColor: [1, 1, 1]
	};
	});

	var RealDrawBoardTypes = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	});

	var RealDrawBoard_1 = createCommonjsModule(function (module, exports) {
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
	    __assign = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealDrawBoard = exports.RealDrawBoardTypes = exports.RealRendererTypes = void 0;




	exports.RealRendererTypes = RealRendererTypes;
	exports.RealDrawBoardTypes = RealDrawBoardTypes;
	__exportStar(RealDrawBoardDefaults, exports);
	var RealDrawBoard = /** @class */ (function (_super) {
	    __extends(RealDrawBoard, _super);
	    function RealDrawBoard(options) {
	        var _this = 
	        // *****DEFAULTS*****
	        _super.call(this, options) || this;
	        _this._isDrawing = false;
	        _this._lastCoords = null;
	        _this._mouseDownEventListener = function (e) {
	            if (e.button === 0) {
	                _this.canvas.addEventListener('mousemove', _this._drawEventListener);
	                _this._lastCoords = [e.offsetX, _this.dimensions[1] - e.offsetY];
	            }
	        };
	        _this._mouseUpEventListener = function (e) {
	            if (e.button === 0) {
	                _this.canvas.removeEventListener('mousemove', _this._drawEventListener);
	                _this._lastCoords = null;
	            }
	        };
	        _this._mouseLeaveEventListener = function (e) {
	            _this._lastCoords = null;
	        };
	        _this._drawEventListener = function (e) {
	            var x = e.offsetX;
	            var y = _this.dimensions[1] - e.offsetY;
	            _this.plot(x, y);
	            _this._lastCoords = [x, y];
	        };
	        options = __assign(__assign({}, RealDrawBoardDefaults.RealDrawBoardDefaults), options);
	        _this.options = options;
	        _this.brushSize = options.brushSize; // 1 unit radius
	        _this.brushColor = options.brushColor;
	        // *****DEFAULTS*****
	        _this._plot = plot.getPlotKernel(_this.gpu, _this.dimensions, _this.brushSize, _this.brushColor, _this.xScaleFactor, _this.yScaleFactor, _this.xOffset, _this.yOffset);
	        _this._interpolate = interpolate.getInterpolateKernel(_this.gpu, _this.dimensions, _this.xScaleFactor, _this.yScaleFactor, _this.xOffset, _this.yOffset, _this.brushSize, _this.brushColor);
	        return _this;
	    }
	    RealDrawBoard.prototype._addMouseEvents = function () {
	        document.addEventListener('mousedown', this._mouseDownEventListener);
	        document.addEventListener('mouseup', this._mouseUpEventListener);
	        this.canvas.addEventListener('mouseleave', this._mouseLeaveEventListener);
	    };
	    RealDrawBoard.prototype._removeMouseEvents = function () {
	        document.removeEventListener('mousedown', this._mouseDownEventListener);
	        document.removeEventListener('mouseup', this._mouseUpEventListener);
	        this.canvas.removeEventListener('mouseleave', this._mouseLeaveEventListener);
	    };
	    RealDrawBoard.prototype._drawFunc = function (graphPixels, time) {
	        return graphPixels;
	    };
	    RealDrawBoard.prototype.plot = function (x, y) {
	        if (this._lastCoords === null)
	            this.graphPixels = this._plot(this._cloneTexture(this.graphPixels), x, y);
	        else
	            this.graphPixels = this._interpolate(this._cloneTexture(this.graphPixels), this._lastCoords, [x, y]);
	        this._display(this.graphPixels);
	    };
	    RealDrawBoard.prototype.startRender = function () {
	        this._addMouseEvents();
	        return this;
	    };
	    RealDrawBoard.prototype.stopRender = function () {
	        this._removeMouseEvents();
	        return this;
	    };
	    RealDrawBoard.prototype.reset = function () {
	        _super.prototype.reset.call(this);
	        this.xScaleFactor = this.options.xScaleFactor;
	        this.yScaleFactor = this.options.yScaleFactor;
	        return this;
	    };
	    return RealDrawBoard;
	}(RealRenderer_1.RealRenderer));
	exports.RealDrawBoard = RealDrawBoard;
	});

	var build = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RealDrawBoard = exports.RealComplexSpace = exports.RealLineGraph = exports.RealRenderer = void 0;

	Object.defineProperty(exports, "RealRenderer", { enumerable: true, get: function () { return RealRenderer_1.RealRenderer; } });

	Object.defineProperty(exports, "RealLineGraph", { enumerable: true, get: function () { return RealLineGraph_1.RealLineGraph; } });

	Object.defineProperty(exports, "RealComplexSpace", { enumerable: true, get: function () { return RealComplexSpace_1.RealComplexSpace; } });

	Object.defineProperty(exports, "RealDrawBoard", { enumerable: true, get: function () { return RealDrawBoard_1.RealDrawBoard; } });
	});

	var index = /*@__PURE__*/getDefaultExportFromCjs(build);

	return index;

})));
