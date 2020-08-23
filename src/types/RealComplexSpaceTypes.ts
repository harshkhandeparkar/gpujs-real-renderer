import { Complex } from '../util/complex';

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