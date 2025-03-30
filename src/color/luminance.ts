import type { RGB } from './types';

export function luminance({ r, g, b }: RGB) {
  const a = [r, g, b].map((v) => {
    const vFinal = v / 255;
    return vFinal <= 0.03928 ? vFinal / 12.92 : ((vFinal + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
