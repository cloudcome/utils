// @ref https://www.w3schools.com/lib/w3color.js
import { rgbToHue } from './helpers';
import type { HSL, RGB } from './types';

const { abs, min, max, round } = Math;

export function rgbToHsl(rgb: RGB): HSL {
  const [hue, max, min, diff] = rgbToHue(rgb);
  const l = (2 * max - diff) / 2;
  const s = min === max ? 0 : l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);

  return {
    h: hue,
    s: s * 100,
    l: l * 100,
  };
}

// @ref https://www.30secondsofcode.org/js/s/hsl-to-rgb/
export function hslToRgb({ h, s, l }: HSL): RGB {
  s /= 100;
  l /= 100;

  const a = s * min(l, 1 - l);
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) => l - a * max(-1, min(k(n) - 3, min(9 - k(n), 1)));

  return {
    r: 255 * f(0),
    g: 255 * f(8),
    b: 255 * f(4),
  };
}
