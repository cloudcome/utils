import type { HEX, RGB } from './types';

/**
 * 将HEX颜色字符串转换为RGB颜色对象
 * @param hex HEX颜色字符串，支持3位或6位格式（例如#f00或#ff0000）
 * @returns {RGB} 对应的RGB颜色对象
 * @throws {SyntaxError} 当颜色格式不符合规范时抛出
 * @example
 * hexToRgb('#f00') // returns {r: 255, g: 0, b: 0}
 */
export function hexToRgb(hex: HEX): RGB {
  const reg = hex.length === 4 ? /^#(.)(.)(.)$/ : /^#(.{2})(.{2})(.{2})$/;
  const result = reg.exec(hex);

  if (!result) throw new SyntaxError(`颜色（${hex}）表达式有误`);

  const [_, r, g, b] = result;

  return {
    r: Number.parseInt(r.padEnd(2, r), 16),
    g: Number.parseInt(g.padEnd(2, g), 16),
    b: Number.parseInt(b.padEnd(2, b), 16),
  };
}

function to16(n: number) {
  return Math.round(n).toString(16).padStart(2, '0');
}

/**
 * 将RGB颜色对象转换为HEX颜色字符串
 * @param rgb RGB颜色对象
 * @returns {HEX} 6位HEX颜色字符串（带#前缀）
 * @example
 * rgbToHex({r: 255, g: 0, b: 0}) // returns '#ff0000'
 */
export function rgbToHex(rgb: RGB) {
  return `#${to16(rgb.r)}${to16(rgb.g)}${to16(rgb.b)}`;
}
