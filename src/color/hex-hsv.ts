import { hexToRgb, rgbToHex } from './hex-rgb';
import { hsvToRgb, rgbToHsv } from './rgb-hsv';
import type { HEX, HSV } from './types';

/**
 * 将HEX颜色转换为HSV颜色空间
 * @param hex HEX颜色字符串（支持3位或6位格式）
 * @returns {HSV} HSV颜色对象，包含：
 *   h: 色相（0-360度）
 *   s: 饱和度（0-100%）
 *   v: 明度（0-100%）
 * @example
 * hexToHsv('#ff0000') // returns {h: 0, s: 100, v: 100}
 */
export function hexToHsv(hex: HEX): HSV {
  return rgbToHsv(hexToRgb(hex));
}

/**
 * 将HSV颜色转换回HEX字符串
 * @param hsv HSV颜色对象
 * @returns {HEX} 6位HEX颜色字符串（带#前缀）
 * @example
 * hsvToHex({h: 0, s: 100, v: 100}) // returns '#ff0000'
 */
export function hsvToHex(hsv: HSV): HEX {
  return rgbToHex(hsvToRgb(hsv));
}
