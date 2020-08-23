import { RealRenderer } from './RealRenderer';
import { getProgressGraphKernel } from '../kernels/progressGraph';
import { getSqueezeGraphKernel } from '../kernels/squeezeGraph';
import { getAddDataKernel } from '../kernels/addData';

import { Color } from '../types/RealRendererTypes';
import { Axis, ProgressionMode, GraphLimits, RealLineGraphOptions } from '../types/RealLineGraphTypes';
import { IKernelRunShortcut, Texture } from 'gpu.js';
export * as RealRendererTypes from '../types/RealRendererTypes';
export * as RealLineGraphTypes from '../types/RealLineGraphTypes';

import { RealLineGraphDefaults } from '../constants/defaults/RealLineGraphDefaults';
export * from '../constants/defaults/RealLineGraphDefaults';

export class RealLineGraph extends RealRenderer {
  options: RealLineGraphOptions;
  progressiveAxis: Axis;
  progressionMode: ProgressionMode;
  progressInterval: number;
  brushSize: number;
  brushColor: Color;
  lineThickness: number;
  lineColor: Color;
  _progressGraph: IKernelRunShortcut;
  _squeezeGraph: IKernelRunShortcut;
  _lastProgress: number;
  _numProgress: number;
  _dataIndex: number;
  _lastData: [number] | Texture;
  _addData: IKernelRunShortcut;
  limits: GraphLimits;

  constructor(options: RealLineGraphOptions) {
    // *****DEFAULTS*****
    super(options);

    options = {
      ...RealLineGraphDefaults,
      ...options
    }

    this.options = options;

    this.progressiveAxis = options.progressiveAxis; // Which axis progresses with time
    this.progressionMode = options.progressionMode; // overflow -> Only progresses when completely filled; continous -> Always progresses;
    this.progressInterval = options.progressInterval; // Progress once every interval time units; Only works with continous progressionMode

    this.brushSize = options.brushSize; // 1 unit radius
    this.brushColor = options.brushColor;

    this.lineThickness = options.lineThickness;
    this.lineColor = options.lineColor;
    // *****DEFAULTS*****

    this._progressGraph = getProgressGraphKernel(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);
    this._squeezeGraph = getSqueezeGraphKernel(this.gpu, this.dimensions, this.progressiveAxis, this.xOffset, this.yOffset, this.axesColor, this.bgColor);
    this._lastProgress = 0; // Time when the graph last progressed. Internal variable
    this._numProgress = 0; // Number of times the graph has progressed

    this._dataIndex = 1; // Number of plots
    this._lastData = [0]; // (Value) To display lines

    this._addData = getAddDataKernel(this.gpu, this.dimensions, this.brushSize, this.brushColor, this.xOffset, this.yOffset, this.lineThickness, this.lineColor, this.progressiveAxis);

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

  addData(value: [number] | number | Texture) {
    if (!isNaN(Number(value))) value = [Number(value)]; // convert all forms to [number] or Texture
    
    this.graphPixels = this._addData(
      this._cloneTexture(this.graphPixels),
      value,
      this._dataIndex++,
      this._lastData,
      this._numProgress,
      this.xScaleFactor,
      this.yScaleFactor
    ) as Texture;

    this._lastData = value as [number] | Texture;

    // Overflow
    if (this._dataIndex >= this.limits.x[1] && this.progressionMode == 'overflow') {
      let progress = Math.ceil(this.progressiveAxis == 'y' ? this.yScaleFactor : this.xScaleFactor);

      this.graphPixels = this._progressGraph(
        this._cloneTexture(this.graphPixels),
        progress
      ) as Texture;

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
      const scalingFactor = (this._dataIndex / (this._dataIndex + 1));

      this.graphPixels = this._squeezeGraph(
        this._cloneTexture(this.graphPixels),
        scalingFactor
      ) as Texture;


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
  }

  _drawFunc(
    graphPixels: Texture,
    time: number
  ) {
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

      return this._progressGraph(this._cloneTexture(graphPixels), 1) as Texture;
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
    this._lastData = [0];
    this._lastProgress = 0;
    this._numProgress = 0;

    this.xScaleFactor = this.options.xScaleFactor;
    this.yScaleFactor = this.options.yScaleFactor;

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