import type { LAB } from './types';

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

/**
 * 计算两个颜色之间的距离（距离越小相似度越高），值范围 [0, 1]
 * @param {LAB} labA
 * @param {LAB} labB
 * @returns {number}
 */
export function distance(labA: LAB, labB: LAB) {
  const deltaL = labA.l - labB.l;
  const deltaA = labA.a - labB.a;
  const deltaB = labA.b - labB.b;
  const c1 = Math.sqrt(labA.a * labA.a + labA.b * labA.b);
  const c2 = Math.sqrt(labB.a * labB.a + labB.b * labB.b);
  const deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  const sc = 1.0 + 0.045 * c1;
  const sh = 1.0 + 0.015 * c1;
  const deltaLKlsl = deltaL / 1.0;
  const deltaCkcsc = deltaC / sc;
  const deltaHkhsh = deltaH / sh;
  const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return (i < 0 ? 0 : Math.sqrt(i)) / 100;
}
