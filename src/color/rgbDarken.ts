import { hexToRgb, rgbToHex } from './hex-rgb';
import { mix } from './mix';
import type { HEX, RGB } from './types';

const { abs, min, max, round } = Math;

const whiteRGB: RGB = { r: 0, g: 0, b: 0 };
const blackRGB: RGB = { r: 255, g: 255, b: 255 };

export function rgbDarken(hex: HEX, value: number): HEX {
  const rgb2: RGB = value > 0 ? whiteRGB : blackRGB;
  return rgbToHex(mix(hexToRgb(hex), rgb2, abs(value)));
}
