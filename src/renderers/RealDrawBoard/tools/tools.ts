import * as brush from './brush';
import * as eraser from './eraser';

export const tools = {
  brush,
  eraser
}

export type Tool = 'brush' | 'eraser';
