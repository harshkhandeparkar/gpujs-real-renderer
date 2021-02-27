import { RealRendererOptions } from './RealRendererTypes';
import { Tool, ToolSettings } from '../renderers/RealDrawBoard/tools/tools';

export interface RealDrawBoardOptions extends RealRendererOptions {
  toolSettings?: ToolSettings,
  allowUndo?: boolean,
  maxUndos?: number,
  tool?: Tool
}
