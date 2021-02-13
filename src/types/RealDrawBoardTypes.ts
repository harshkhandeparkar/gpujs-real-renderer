import { RealRendererOptions, Color } from './RealRendererTypes';
import { Tool } from '../renderers/RealDrawBoard/tools/tools';

export interface RealDrawBoardOptions extends RealRendererOptions {
  brushSize?: number,
  brushColor?: Color,
  eraserSize?: number,
  allowUndo?: boolean,
  maxUndos?: number,
  tool?: Tool
}
