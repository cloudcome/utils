// https://stackoverflow.com/a/73998199

import type { LAB, XYZ } from './types';

const ref_X = 95.047;
const ref_Y = 100.0;
const ref_Z = 108.883;

export function xyzToLab(xyz: XYZ): LAB {
  const { x, y, z } = xyz;
  const [var_X, var_Y, var_Z] = [x / ref_X, y / ref_Y, z / ref_Z].map((a) =>
    a > 0.008856 ? a ** (1 / 3) : 7.787 * a + 16 / 116,
  );

  const l = 116 * var_Y - 16;
  const a = 500 * (var_X - var_Y);
  const b = 200 * (var_Y - var_Z);

  return { l, a, b };
}

export function labToXyz(lab: LAB): XYZ {
  const { l, a, b } = lab;

  const var_Y = (l + 16) / 116;
  const var_X = a / 500 + var_Y;
  const var_Z = var_Y - b / 200;

  const [X, Y, Z] = [var_X, var_Y, var_Z].map((n) => (n ** 3 > 0.008856 ? n ** 3 : (n - 16 / 116) / 7.787));

  return { x: X * ref_X, y: Y * ref_Y, z: Z * ref_Z };
}
