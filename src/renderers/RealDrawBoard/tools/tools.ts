import * as brush from './brush';
import * as eraser from './eraser';
import * as line from './line';

export const tools = {
  brush,
  eraser,
  line
}

export type Tool = 'brush' | 'eraser' | 'line';
