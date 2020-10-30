import { RealRendererOptions } from '../../types/RealRendererTypes';
import { GPU } from 'gpu.js';

export const RealRendererDefaults: RealRendererOptions = {
  dimensions: [1000, 1000],
  xScaleFactor: 10,
  yScaleFactor: 1,
  bgColor: [0, 0, 0],
  drawAxes: true,
  axesColor: [1, 1, 1],
  drawsPerFrame: 1,
  timeStep: 1 / 60,
  initTime: 0,
  xOffset: 50,
  yOffset: 50,
  GPU: (<any>window).GPU as GPU
}
