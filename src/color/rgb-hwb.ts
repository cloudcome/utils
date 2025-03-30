import { rgbToHue } from './helpers';
import { hslToRgb } from './rgb-hsl';
import type { HWB, RGB } from './types';

export function rgbToHwb(rgb: RGB): HWB {
  const [hue, max, min, diff] = rgbToHue(rgb);
  return {
    h: hue,
    w: min * 100,
    b: (1 - max) * 100,
  };
}

// @ref https://www.w3schools.com/lib/w3color.js
export function hwbToRgb({ h, w: white, b: black }: HWB) {
  white /= 100;
  black /= 100;

  const { r, g, b } = hslToRgb({ h, s: 100, l: 50 });
  const tot = white + black;

  if (tot > 1) {
    white = white / tot;
    black = black / tot;
  }

  const f = (n: number) => ((n / 255) * (1 - white - black) + white) * 255;

  return {
    r: f(r),
    g: f(g),
    b: f(b),
  };
}
