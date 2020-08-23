import { Complex } from '../util/complex';
import { RealRendererOptions, Color } from './RealRendererTypes';

export type WatchedNumber = {
  name: string,
  number: Complex,
  show: boolean,
  persistent: boolean,
  interpolate: boolean,
  interpolateTo: Complex | null,
  attributes: any
}

export type WatchedNumbers = WatchedNumber[];

export interface RealComplexSpaceOptions extends RealRendererOptions {
  brushSize?: number,
  brushColor?: [1, 1, 1],
  changeNumbers?: (WatchedNumbers: WatchedNumbers, time: number, timeStep: number) => WatchedNumbers,
  lineThickness: number,
  lineColor: Color
}