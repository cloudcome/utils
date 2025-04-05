import { rgbToXyz, xyzToRgb } from './rgb-xyz';
import type { LAB, RGB } from './types';
import { labToXyz, xyzToLab } from './xyz-lab';

/**
 * 将RGB颜色转换为Lab颜色空间（CIE 1976标准）
 * @param rgb RGB颜色对象（分量范围0-255）
 * @returns {LAB} Lab颜色对象：
 *   l: 明度（0-100）
 *   a: 绿-红分量（-128到127）
 *   b: 蓝-黄分量（-128到127）
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 * @example
 * rgbToLab({r: 255, g: 0, b: 0}) // {l: 53.24, a: 80.09, b: 67.20}
 */
export function rgbToLab(rgb: RGB): LAB {
  return xyzToLab(rgbToXyz(rgb));
}

/**
 * 将Lab颜色转换回RGB颜色空间
 * @param lab Lab颜色对象
 * @param lab.l 明度（0-100）
 * @param lab.a 绿-红分量（-128到127）
 * @param lab.b 蓝-黄分量（-128到127）
 * @returns {RGB} RGB颜色对象（分量可能超出0-255范围）
 * @see https://www.easyrgb.com/en/math.php
 * @example
 * labToRgb({l: 53.24, a: 80.09, b: 67.20}) // {r: 255, g: 0, b: 0}
 */
export function labToRgb(lab: LAB): RGB {
  return xyzToRgb(labToXyz(lab));
}
