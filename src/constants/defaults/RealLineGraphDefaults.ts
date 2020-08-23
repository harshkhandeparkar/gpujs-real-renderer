import { RealLineGraphOptions } from '../../types/RealLineGraphTypes';

export const RealLineGraphDefaults: RealLineGraphOptions = {
  canvas: new HTMLCanvasElement(),
  progressiveAxis: 'x',
  progressionMode: 'overflow',
  progressInterval: 1,
  brushSize: 1,
  brushColor: [1, 1, 1],
  lineThickness: 0.05,
  lineColor: [0, 0.5, 0]
}