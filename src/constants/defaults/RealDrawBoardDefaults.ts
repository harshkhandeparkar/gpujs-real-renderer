import { RealDrawBoardOptions } from '../../types/RealDrawBoardTypes';
import { ToolDefaults } from '../../renderers/RealDrawBoard/tools/tools';

export const RealDrawBoardDefaults: RealDrawBoardOptions = {
  toolSettings: ToolDefaults,
  allowUndo: false,
  maxUndos: 10,
  tool: 'brush'
}
