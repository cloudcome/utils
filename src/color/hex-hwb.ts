import { hexToRgb, rgbToHex } from './hex-rgb';
import { hwbToRgb, rgbToHwb } from './rgb-hwb';
import type { HEX, HWB } from './types';

/**
 * 将HWB颜色转换为HEX字符串
 * @param hwb HWB颜色对象
 * @param hwb.h 色相（0-360度）
 * @param hwb.w 白度（0-100%）
 * @param hwb.b 黑度（0-100%）
 * @returns {HEX} 6位HEX颜色字符串（带#前缀）
 * @example
 * hwbToHex({h: 0, w: 0, b: 0}) // returns '#ff0000'
 */
export function hwbToHex(hwb: HWB): HEX {
  return rgbToHex(hwbToRgb(hwb));
}

/**
 * 将HEX颜色转换为HWB颜色空间
 * @param hex HEX颜色字符串（支持3位或6位格式）
 * @returns {HWB} HWB颜色对象，包含：
 *   h: 色相（0-360度）
 *   w: 白度（0-100%）
 *   b: 黑度（0-100%）
 * @example
 * hexToHwb('#ff0000') // returns {h: 0, w: 0, b: 0}
 */
export function hexToHwb(hex: HEX): HWB {
  return rgbToHwb(hexToRgb(hex));
}
