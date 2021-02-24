import * as brush from './brush';
import * as eraser from './eraser';
import * as line from './line';
import * as gradient_brush from './gradient_brush';

export const tools = {
  brush,
  gradient_brush,
  eraser,
  line
}

export type Tool = 'brush' | 'gradient_brush' | 'eraser' | 'line';
