import { mix } from './mix';
import type { RGB } from './types';

const { abs, min, max, round } = Math;

const whiteRGB: RGB = { r: 0, g: 0, b: 0 };
const blackRGB: RGB = { r: 255, g: 255, b: 255 };

/**
 * 通过混合颜色调整明暗度
 * @param rgb 原始RGB颜色对象
 * @param value 调整强度（-1到1之间）：
 *   - 正值时与黑色混合（增加暗度）
 *   - 负值时与白色混合（增加亮度）
 * @returns {RGB} 调整后的RGB颜色对象
 * @example
 * rgbDarken({r: 100, g: 150, b: 200}, 0.2) // 变暗20%
 */
export function rgbWhiter(rgb: RGB, value: number): RGB {
  const rgb2: RGB = value > 0 ? whiteRGB : blackRGB;
  return mix(rgb, rgb2, abs(value));
}
