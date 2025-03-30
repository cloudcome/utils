// https://stackoverflow.com/a/73998199

import type { LAB, XYZ } from './types';

const ref_X = 95.047;
const ref_Y = 100.0;
const ref_Z = 108.883;

/**
 * 将XYZ颜色转换为Lab颜色空间（CIE 1976 L*a*b*，D65白点）
 * @param xyz XYZ颜色对象（参考值：D65白点X=95.047,Y=100,Z=108.883）
 * @returns {LAB} Lab颜色对象：
 *   l: 明度（0-100）
 *   a: 绿-红分量（典型范围-128到127）
 *   b: 蓝-黄分量（典型范围-128到127）
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 * @example
 * xyzToLab({x: 95.047, y: 100.0, z: 108.883}) // {l: 100, a: 0, b: 0}
 */
export function xyzToLab(xyz: XYZ): LAB {
  const { x, y, z } = xyz;
  const [var_X, var_Y, var_Z] = [x / ref_X, y / ref_Y, z / ref_Z].map((a) =>
    a > 0.008856 ? a ** (1 / 3) : 7.787 * a + 16 / 116,
  );

  const l = 116 * var_Y - 16;
  const a = 500 * (var_X - var_Y);
  const b = 200 * (var_Y - var_Z);

  return { l, a, b };
}

/**
 * 将Lab颜色转换回XYZ颜色空间
 * @param lab Lab颜色对象
 * @param lab.l 明度（0-100）
 * @param lab.a 绿-红分量（典型范围-128到127）
 * @param lab.b 蓝-黄分量（典型范围-128到127）
 * @returns {XYZ} XYZ颜色对象（基于D65白点）
 * @see https://www.easyrgb.com/en/math.php
 * @example
 * labToXyz({l: 100, a: 0, b: 0}) // {x: 95.047, y: 100.0, z: 108.883}
 */
export function labToXyz(lab: LAB): XYZ {
  const { l, a, b } = lab;

  const var_Y = (l + 16) / 116;
  const var_X = a / 500 + var_Y;
  const var_Z = var_Y - b / 200;

  const [X, Y, Z] = [var_X, var_Y, var_Z].map((n) => (n ** 3 > 0.008856 ? n ** 3 : (n - 16 / 116) / 7.787));

  return { x: X * ref_X, y: Y * ref_Y, z: Z * ref_Z };
}
