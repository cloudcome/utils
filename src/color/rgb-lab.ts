import { rgbToXyz, xyzToRgb } from './rgb-xyz';
import type { LAB, RGB } from './types';
import { labToXyz, xyzToLab } from './xyz-lab';

export function rgbToLab(rgb: RGB): LAB {
  return xyzToLab(rgbToXyz(rgb));
}

export function labToRgb(lab: LAB): RGB {
  return xyzToRgb(labToXyz(lab));
}
