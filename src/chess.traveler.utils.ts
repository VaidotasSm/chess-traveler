/* eslint-disable no-param-reassign */

export function incrementLast(cords: number[]): number[] {
  return replaceLast(cords, cords[cords.length - 1] + 1);
}

export function replaceLast(cords: number[], last: number): number[] {
  cords[cords.length - 1] = last;
  return cords;
}

export function getLast<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function replaceArrayItems<T>(original: T[], values: T[]) {
  original.length = 0;
  original.push(...values);
}
