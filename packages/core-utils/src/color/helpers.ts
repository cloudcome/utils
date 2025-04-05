import type { RGB } from './types';

const { abs, min, max, round } = Math;

export function rgbToHue({ r, g, b }: RGB): [number, number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const rgbMax = max(r, g, b);
  const rgbMin = min(r, g, b);
  const rgbDiff = rgbMax - rgbMin;
  const h =
    rgbDiff === 0
      ? 0
      : rgbDiff && rgbMax === r
        ? (g - b) / rgbDiff
        : rgbMax === g
          ? 2 + (b - r) / rgbDiff
          : 4 + (r - g) / rgbDiff;

  return [60 * (h < 0 ? h + 6 : h), rgbMax, rgbMin, rgbDiff];
}
