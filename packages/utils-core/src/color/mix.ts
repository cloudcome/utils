import type { HSL, HSV, RGB } from './types';

/**
 * 颜色混合函数（支持RGB/HSL/HSV色彩模型）
 * @template T 颜色类型，支持RGB、HSL或HSV对象
 * @param {T} a 第一个颜色对象
 * @param {T} b 第二个颜色对象
 * @param {number} [weight=0.5] 混合权重（0-1之间）：
 *   - 0 表示完全使用第一个颜色
 *   - 1 表示完全使用第二个颜色
 * @returns {T} 线性混合后的新颜色对象
 * @example
 * // RGB混合示例
 * mix({r: 255, g: 0, b: 0}, {r: 0, g: 0, b: 255}, 0.5) // 返回紫色
 *
 * // HSL混合示例
 * mix({h: 0, s: 100, l: 50}, {h: 120, s: 100, l: 50}, 0.3)
 */
export function mix<T extends RGB | HSV | HSL>(a: T, b: T, weight = 0.5): T {
  return Object.keys(a).reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[key] = (b[key] - a[key]) * weight + a[key];
    return acc;
  }, {} as T);
}
