// @ref https://www.w3schools.com/lib/w3color.js
import { rgbToHue } from './helpers';
import type { HSL, RGB } from './types';

const { abs, min, max, round } = Math;

/**
 * 将RGB颜色转换为HSL颜色空间
 * @param rgb RGB颜色对象（分量范围0-255）
 * @returns {HSL} HSL颜色对象，其中：
 *   h: 色相（0-360度）
 *   s: 饱和度（0-100%）
 *   l: 亮度（0-100%）
 * @example
 * rgbToHsl({r: 255, g: 0, b: 0}) // returns {h: 0, s: 100, l: 50}
 */
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
/**
 * 将HSL颜色转换回RGB颜色空间
 * @param hsl HSL颜色对象
 * @param hsl.h 色相（0-360度）
 * @param hsl.s 饱和度（0-100%）
 * @param hsl.l 亮度（0-100%）
 * @returns {RGB} RGB颜色对象（分量范围0-255）
 * @example
 * hslToRgb({h: 0, s: 100, l: 50}) // returns {r: 255, g: 0, b: 0}
 */
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
