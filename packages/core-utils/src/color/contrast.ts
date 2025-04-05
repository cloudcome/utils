import { luminance } from './luminance';
import type { RGB } from './types';

/**
 * 计算两个颜色之间的对比度比率（符合WCAG 2.1标准）
 * @param rgb1 第一个RGB颜色对象（分量范围0-255）
 * @param rgb2 第二个RGB颜色对象（分量范围0-255）
 * @returns {number} 对比度比率，范围1-21（1:1 到 21:1）
 * @example
 * contrast({r: 0, g: 0, b: 0}, {r: 255, g: 255, b: 255}) // 返回21
 */
export function contrast(rgb1: RGB, rgb2: RGB) {
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}
