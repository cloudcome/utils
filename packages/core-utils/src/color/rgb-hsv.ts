import { rgbToHue } from './helpers';
import type { HSV, RGB } from './types';

const { abs, min, max, round } = Math;

// @ref https://www.30secondsofcode.org/js/s/rgb-to-hsb/
/**
 * 将RGB颜色转换为HSV颜色空间
 * @param rgb RGB颜色对象（分量范围0-255）
 * @returns {HSV} HSV颜色对象：
 *   h: 色相（0-360度）
 *   s: 饱和度（0-100%）
 *   v: 明度（0-100%）
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 * @example
 * rgbToHsv({r: 255, g: 0, b: 0}) // {h: 0, s: 100, v: 100}
 */
export function rgbToHsv(rgb: RGB): HSV {
  const [hue, max, min, diff] = rgbToHue(rgb);

  return {
    h: hue,
    s: max && (diff / max) * 100,
    v: max * 100,
  };
}

// @ref https://www.30secondsofcode.org/js/s/hsb-to-rgb/
/**
 * 将HSV颜色转换回RGB颜色空间
 * @param hsv HSV颜色对象
 * @param hsv.h 色相（0-360度）
 * @param hsv.s 饱和度（0-100%）
 * @param hsv.v 明度（0-100%）
 * @returns {RGB} RGB颜色对象（分量范围0-255）
 * @see https://www.rapidtables.com/convert/color/hsv-to-rgb.html
 * @example
 * hsvToRgb({h: 0, s: 100, v: 100}) // {r: 255, g: 0, b: 0}
 */
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
