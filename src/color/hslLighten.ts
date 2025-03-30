import { hexToHsl, hslToHex } from './hex-hsl';
import type { HEX } from './types';

export function hslLighten(hex: HEX, value: number): HEX {
  const hsl = hexToHsl(hex);
  hsl.l = hsl.l * (1 + value);
  return hslToHex(hsl);
}
