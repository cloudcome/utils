import { hexToRgb, rgbToHex } from './hex-rgb';
import { hwbToRgb, rgbToHwb } from './rgb-hwb';
import type { HEX, HWB } from './types';

export function hwbToHex(hwb: HWB): HEX {
  return rgbToHex(hwbToRgb(hwb));
}

export function hexToHwb(hex: HEX): HWB {
  return rgbToHwb(hexToRgb(hex));
}
