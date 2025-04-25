import { rgbToHue } from './helpers';
import { hslToRgb } from './rgb-hsl';
import type { HWB, RGB } from './types';

/**
 * 将RGB颜色转换为HWB颜色空间
 * @param rgb RGB颜色对象（分量范围0-255）
 * @returns {HWB} HWB颜色对象：
 *   h: 色相（0-360度）
 *   w: 白度（0-100%）
 *   b: 黑度（0-100%）
 * @see https://www.w3.org/TR/css-color-4/#hwb-to-rgb
 * @example
 * rgbToHwb({r: 255, g: 0, b: 0}) // {h: 0, w: 0, b: 0}
 */
export function rgbToHwb(rgb: RGB): HWB {
  const [hue, max, min, diff] = rgbToHue(rgb);
  return {
    h: hue,
    w: min * 100,
    b: (1 - max) * 100,
  };
}

// @ref https://www.w3schools.com/lib/w3color.js
/**
 * 将HWB颜色转换回RGB颜色空间
 * @param hwb HWB颜色对象
 * @param hwb.h 色相（0-360度）
 * @param hwb.w 白度（0-100%）
 * @param hwb.b 黑度（0-100%）
 * @returns {RGB} RGB颜色对象（分量范围0-255）
 * @see https://en.wikipedia.org/wiki/HWB_color_model
 * @example
 * hwbToRgb({h: 0, w: 0, b: 0}) // {r: 255, g: 0, b: 0}
 */
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
