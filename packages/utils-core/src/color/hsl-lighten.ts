import type { HSL } from './types';

/**
 * 通过HSL颜色空间调整颜色亮度
 * @param hsl 原始 HSL 颜色
 * @param value 亮度调整系数（0-1之间，0.1表示增加10%亮度）
 * @returns {HSL} 调整后的 HSL 颜色
 * @example
 * hslLighten({h: 300, s: 33, l: 44}, 0.2) // 返回亮度增加20%后的颜色
 */
export function hslLighten(hsl: HSL, value: number): HSL {
  const hslFinal = { ...hsl };
  hslFinal.l = hslFinal.l * (1 + value);
  return hslFinal;
}
