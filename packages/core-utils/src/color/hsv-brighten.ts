import type { HSV } from './types';

/**
 * 通过HSV颜色空间调整颜色明度
 * @param hsv 原始HSV颜色对象
 * @param value 明度调整系数（-1到1之间）：
 *   - 正值增加明度（如0.2表示+20%）
 *   - 负值降低明度（如-0.1表示-10%）
 * @returns {HSV} 调整后的HSV颜色对象（v值范围0-100%）
 * @example
 * hsvBrighten({h: 0, s: 100, v: 50}, 0.3) // 返回{h: 0, s: 100, v: 65}
 */
export function hsvBrighten(hsv: HSV, value: number): HSV {
  const hsvFinal = { ...hsv };
  hsvFinal.v = hsvFinal.v * (1 + value);
  return hsvFinal;
}
