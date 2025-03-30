import { luminance } from './luminance';
import type { RGB } from './types';

export function contrast(rgb1: RGB, rgb2: RGB) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}
