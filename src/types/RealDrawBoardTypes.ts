import { RealRendererOptions, Color } from './RealRendererTypes';

export type DrawMode = 'paint' | 'erase';

export interface RealDrawBoardOptions extends RealRendererOptions {
  brushSize?: number,
  brushColor?: Color,
  eraserSize?: number,
  maxUndos?: number,
  mode?: 'paint' | 'erase'
}
