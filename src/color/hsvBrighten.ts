import { hexToHsv, hsvToHex } from './hex-hsv';
import type { HEX } from './types';

export function hsvBrighten(hex: HEX, value: number): HEX {
  const hsv = hexToHsv(hex);
  hsv.v = hsv.v * (1 + value);
  return hsvToHex(hsv);
}
