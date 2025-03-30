import type { HSV } from './types';

export function hsvBrighten(hsv: HSV, value: number): HSV {
  const hsvFinal = { ...hsv };
  hsvFinal.v = hsvFinal.v * (1 + value);
  return hsvFinal;
}
