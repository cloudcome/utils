import { rgbToHue } from './helpers';
import type { HSV, RGB } from './types';

const { abs, min, max, round } = Math;

// @ref https://www.30secondsofcode.org/js/s/rgb-to-hsb/
export function rgbToHsv(rgb: RGB): HSV {
  const [hue, max, min, diff] = rgbToHue(rgb);

  return {
    h: hue,
    s: max && (diff / max) * 100,
    v: max * 100,
  };
}

// @ref https://www.30secondsofcode.org/js/s/hsb-to-rgb/
export function hsvToRgb({ h, s, v }: HSV): RGB {
  s /= 100;
  v /= 100;

  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => v * (1 - s * max(0, min(k(n), 4 - k(n), 1)));

  return {
    r: 255 * f(5),
    g: 255 * f(3),
    b: 255 * f(1),
  };
}
