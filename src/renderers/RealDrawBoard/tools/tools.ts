import * as brush from './brush';
import * as eraser from './eraser';
import * as line from './line';
import * as gradientBrush from './gradientBrush';

export const tools = {
  brush,
  gradientBrush,
  eraser,
  line
}

export type Tool = 'brush' | 'gradientBrush' | 'eraser' | 'line';
