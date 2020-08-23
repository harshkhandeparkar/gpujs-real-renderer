import getDisplayKernel from '../kernels/display';
import { getBlankGraphKernel } from '../kernels/blankGraph';
import getCloneTextureKernel from '../kernels/cloneTexture';

import { GraphDimensions, Color, RealRendererOptions } from '../types/RealRendererTypes';
export * from '../types/RealRendererTypes';

import { GPU, Texture, IKernelRunShortcut } from 'gpu.js';

export class RealRenderer {
  canvas: HTMLCanvasElement;
  _canvas: HTMLCanvasElement;
  dimensions: GraphDimensions;
  xScaleFactor: number;
  yScaleFactor: number;
  bgColor: Color;
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
  _display: IKernelRunShortcut;
  _doRender: boolean;
  

  constructor(options: RealRendererOptions) {
    // *****DEFAULTS*****
    this.canvas = this._canvas = options.canvas;
    this.dimensions = options.dimensions || {x: 1000, y:1000};
    this.xScaleFactor = options.xScaleFactor || 10;
    this.yScaleFactor = options.yScaleFactor || 1;
    this.bgColor = options.bgColor || [0, 0, 0];
    this.axesColor = options.axesColor || [1, 1, 1];
    this.drawsPerFrame = options.drawsPerFrame || 1;
    this.timeStep = options.timeStep || (1 / 60);
    this.time = options.initTime || 0;

    this.xOffset = options.xOffset || 50; // %age offset
    this.yOffset = options.yOffset || 50; // %age offset

    options.GPU = options.GPU || (<any>window).GPU as GPU;

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

    this._blankGraph = getBlankGraphKernel(this.gpu, this.dimensions, this.xOffset, this.yOffset, this.bgColor, this.axesColor);
    this._cloneTexture = getCloneTextureKernel(this.gpu, this.dimensions);

    this.graphPixels = this._blankGraph() as Texture;

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

  reset() {
    this.graphPixels = this._blankGraph() as Texture;
    this.resetTime();

    this._display(this.graphPixels);

    return this;
  }
}