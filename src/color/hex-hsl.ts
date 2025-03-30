import { hexToRgb, rgbToHex } from './hex-rgb';
import { hslToRgb, rgbToHsl } from './rgb-hsl';
import type { HEX, HSL } from './types';

export function hslToHex(hsl: HSL): HEX {
  return rgbToHex(hslToRgb(hsl));
}

export function hexToHsl(hex: HEX): HSL {
  return rgbToHsl(hexToRgb(hex));
}
