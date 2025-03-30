import type { HEX, RGB } from './types';

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

export function rgbToHex(rgb: RGB) {
  return `#${to16(rgb.r)}${to16(rgb.g)}${to16(rgb.b)}`;
}
