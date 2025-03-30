import { hexToRgb, rgbToHex } from './hex-rgb';
import { hsvToRgb, rgbToHsv } from './rgb-hsv';
import type { HEX, HSV } from './types';

export function hexToHsv(hex: HEX): HSV {
  return rgbToHsv(hexToRgb(hex));
}

export function hsvToHex(hsv: HSV): HEX {
  return rgbToHex(hsvToRgb(hsv));
}
