import { RealRendererOptions, Color } from './RealRendererTypes';

export type Axis = 'y' | 'x';
export type ProgressionMode = 'overflow' | 'squeeze' | 'continous';
export type GraphLimits = {
  x: [number, number],
  y: [number, number]
}

export interface RealLineGraphOptions extends RealRendererOptions {
  progressiveAxis: Axis,
  progressionMode: ProgressionMode,
  progressInterval: number,
  brushSize: number,
  brushColor: Color,
  lineThickness: number,
  lineColor: Color
}