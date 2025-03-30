import type { HSL, HSV, RGB } from './types';

/**
 * 颜色混合
 * @param {T} a
 * @param {T} b
 * @param {number} weight 第二个颜色占比
 * @returns {T}
 */
export function mix<T extends RGB | HSV | HSL>(a: T, b: T, weight = 0.5): T {
  return Object.keys(a).reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[key] = (b[key] - a[key]) * weight + a[key];
    return acc;
  }, {} as T);
}
