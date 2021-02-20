import { getDisplayKernel } from '../kernels/display';
import { getBlankGraphKernel } from '../kernels/blankGraph';
import { getCloneTextureKernel } from '../kernels/cloneTexture';
import { getLoadDataKernel } from '../kernels/loadData';

import { GraphDimensions, Color, RealRendererOptions } from '../types/RealRendererTypes';
export * as RealRendererTypes from '../types/RealRendererTypes';

import { RealRendererDefaults } from '../constants/defaults/RealRendererDefaults';
export * from '../constants/defaults/RealRendererDefaults';

import { GPU, Texture, IKernelRunShortcut } from 'gpu.js';

export class RealRenderer {
  canvas: HTMLCanvasElement;
  _canvas: HTMLCanvasElement;
  dimensions: GraphDimensions;
  xScaleFactor: number;
  yScaleFactor: number;
  bgColor: Color;
  drawAxes: boolean;
  axesColor: Color;
  drawsPerFrame: number;
  timeStep: number;
  time: number;
  xOffset: number;
  yOffset: number;
  gpu: GPU;
  graphPixels: Texture;
  _blankGraph: IKernelRunShortcut;
  _cloneTexture: IKernelRunShortcut;
  _loadData: IKernelRunShortcut;
  _display: IKernelRunShortcut;
  _doRender: boolean;


  constructor(options: RealRendererOptions) {
    // *****DEFAULTS*****
    options = {
      ...RealRendererDefaults,
      ...options
    }

    this.canvas = this._canvas = options.canvas;
    this.dimensions = options.dimensions;
    this.xScaleFactor = options.xScaleFactor;
    this.yScaleFactor = options.yScaleFactor;
    this.bgColor = options.bgColor;
    this.drawAxes = options.drawAxes;
    this.axesColor = options.axesColor;
    this.drawsPerFrame = options.drawsPerFrame;
    this.timeStep = options.timeStep;
    this.time = options.initTime;

    this.xOffset = options.xOffset; // %age offset
    this.yOffset = options.yOffset; // %age offset

    options.GPU = options.GPU;

    this.xOffset = Math.max(0, Math.min(100, this.xOffset)) // Between 0 and 100
    this.yOffset = Math.max(0, Math.min(100, this.yOffset)) // Between 0 and 100
    // *****DEFAULTS*****

    if (this.canvas === undefined) {
      throw 'No Canvas Element Found';
    }

    this.gpu = new (options.GPU as any)({
      canvas: this._canvas,
      mode: 'gpu'
    })

    this._blankGraph = getBlankGraphKernel(
      this.gpu,
      this.dimensions,
      this.xOffset,
      this.yOffset,
      this.bgColor,
      this.axesColor,
      this.drawAxes
    )
    this._cloneTexture = getCloneTextureKernel(this.gpu, this.dimensions);

    this.graphPixels = this._blankGraph() as Texture;

    this._loadData = getLoadDataKernel(this.gpu, this.dimensions);

    this._display = getDisplayKernel(this.gpu, this.dimensions);

    this._doRender = false;
  }

  _drawFunc(graphPixels: Texture, time: number) { // Can be overridden
    return graphPixels;
  }

  _overlayFunc(graphPixels: Texture) { // Non-persistent overlays at the end of a frame
    return graphPixels;
  }

  _draw() {
    this.time += this.timeStep;

    this.graphPixels = this._drawFunc(this.graphPixels, this.time);
    return this.graphPixels;
  }

  draw(numDraws: number = 1) {
    for (let i = 0; i < numDraws; i++) this._draw();

    this._display(this._overlayFunc(this.graphPixels));

    return this;
  }

  _render() {
    if (this._doRender) {
      this.draw(this.drawsPerFrame);

      window.requestAnimationFrame(() => {this._render()});
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

  getData() {
    return <number[][][]>this.graphPixels.toArray();
  }

  loadData(pixels: number[][][]) {
    this.graphPixels = <Texture>this._loadData(pixels);
    this._display(this.graphPixels);
  }

  reset() {
    this.graphPixels = this._blankGraph() as Texture;
    this.resetTime();

    this._display(this.graphPixels);

    return this;
  }
}
