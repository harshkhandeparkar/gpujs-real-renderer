import * as brush from './brush';
import * as eraser from './eraser';
import * as line from './line';
import * as rainbow_brush from './rainbow_brush';

export const tools = {
  brush,
  rainbow_brush,
  eraser,
  line
}

export type Tool = 'brush' | 'rainbow_brush' | 'eraser' | 'line';
