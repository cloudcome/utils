import type { RGB } from './types';

/**
 * 计算RGB颜色的相对亮度（符合WCAG 2.1标准）
 * @param rgb RGB颜色对象（分量范围0-255）
 * @returns {number} 相对亮度值（0-1之间）
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @example
 * luminance({r: 255, g: 255, b: 255}) // 返回1
 */
export function luminance({ r, g, b }: RGB) {
  const a = [r, g, b].map((v) => {
    const vFinal = v / 255;
    return vFinal <= 0.03928 ? vFinal / 12.92 : ((vFinal + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
