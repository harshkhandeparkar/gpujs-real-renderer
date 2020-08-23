import { RealComplexSpaceOptions, WatchedNumbers } from '../../types/RealComplexSpaceTypes';

export const RealComplexSpaceDefaults: RealComplexSpaceOptions = {
  brushSize: 1,
  brushColor: [1, 1, 1],
  changeNumbers: (watchedNumbers: WatchedNumbers, time: number, timeStep: number) => watchedNumbers,
  lineThickness: 0.5,
  lineColor: [1, 1, 1]
}