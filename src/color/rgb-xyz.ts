// https://stackoverflow.com/a/73998199

import type { RGB, XYZ } from './types';

export function rgbToXyz(rgb: RGB): XYZ {
  const { r, g, b } = rgb;
  const [var_R, var_G, var_B] = [r, g, b]
    .map((x) => x / 255)
    .map((x) => (x > 0.04045 ? ((x + 0.055) / 1.055) ** 2.4 : x / 12.92))
    .map((x) => x * 100);

  return {
    // Observer. = 2°, Illuminant = D65
    x: var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805,
    y: var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722,
    z: var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505,
  };
}

export function xyzToRgb(xyz: XYZ): RGB {
  const { x, y, z } = xyz;

  //X, Y and Z input refer to a D65/2° standard illuminant.
  //sR, sG and sB (standard RGB) output range = 0 ÷ 255

  const var_X = x / 100;
  const var_Y = y / 100;
  const var_Z = z / 100;

  const var_R = var_X * 3.2406 + var_Y * -1.5372 + var_Z * -0.4986;
  const var_G = var_X * -0.9689 + var_Y * 1.8758 + var_Z * 0.0415;
  const var_B = var_X * 0.0557 + var_Y * -0.204 + var_Z * 1.057;

  const [r, g, b] = [var_R, var_G, var_B]
    .map((n) => (n > 0.0031308 ? 1.055 * n ** (1 / 2.4) - 0.055 : 12.92 * n))
    .map((n) => n * 255);

  return {
    r,
    g,
    b,
  };
}
