import { GPU } from 'gpu.js';

export type GraphDimensions = [number, number] | {x: number, y: number};
export type Color = [number, number, number];

export interface RealRendererOptions {
  canvas?: HTMLCanvasElement,
  dimensions?: GraphDimensions,
  xScaleFactor?: number,
  yScaleFactor?: number,
  bgColor?: Color,
  drawAxes?: boolean,
  axesColor?: Color,
  drawsPerFrame?: number,
  timeStep?: number,
  initTime?: number,
  xOffset?: number,
  yOffset?: number,
  GPU?: GPU
}
