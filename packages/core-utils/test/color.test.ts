import type { HEX, HSL, HSV, HWB, RGB } from '@/color';
import {
  distance,
  hexToHsl,
  hexToHsv,
  hexToHwb,
  hexToRgb,
  hslToHex,
  hslToRgb,
  hsvToHex,
  hsvToRgb,
  hwbToHex,
  hwbToRgb,
  mix,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToHwb,
  rgbToXyz,
  xyzToLab,
} from '@/color';
import { expect } from 'vitest';

test('颜色值转换', () => {
  expect(hexToRgb('#00ff00')).toEqual<RGB>({ r: 0, g: 255, b: 0 });
  expect(hexToRgb('#f5222d')).toEqual<RGB>({ r: 245, g: 34, b: 45 });
  expect(rgbToHex({ r: 245, g: 34, b: 45 })).toEqual('#f5222d');

  expect(rgbToHsv({ r: 245, g: 34, b: 45 })).toEqual<HSV>({
    h: 356.87203791469193,
    s: 86.12244897959184,
    v: 96.07843137254902,
  });
  expect(hsvToRgb({ h: 357, s: 86, v: 96 })).toEqual<RGB>({
    r: 244.79999999999998,
    g: 34.272000000000006,
    b: 44.79839999999996,
  });

  expect(hexToHsv('#f5222d')).toEqual<HSV>({
    h: 356.87203791469193,
    s: 86.12244897959184,
    v: 96.07843137254902,
  });
  expect(
    hsvToHex({
      h: 356.87203791469193,
      s: 86.12244897959184,
      v: 96.07843137254902,
    }),
  ).toEqual('#f5222d');

  expect(
    rgbToHsl({
      r: 245,
      g: 34,
      b: 45,
    }),
  ).toEqual<HSL>({
    h: 356.87203791469193,
    l: 54.70588235294118,
    s: 91.34199134199136,
  });
  expect(
    hslToRgb({
      h: 356.87203791469193,
      l: 54.70588235294118,
      s: 91.34199134199136,
    }),
  ).toEqual<RGB>({
    r: 245.00000000000003,
    g: 34.00000000000001,
    b: 45.00000000000001,
  });

  expect(
    rgbToHsl({
      r: 0,
      g: 100,
      b: 213,
    }),
  ).toEqual<HSL>({
    h: 211.83098591549296,
    s: 100,
    l: 41.76470588235294,
  });
  expect(hexToHsl('#123456')).toEqual<HSL>({
    h: 210,
    s: 65.3846153846154,
    l: 20.392156862745097,
  });
  expect(
    hslToHex({
      h: 210,
      s: 65,
      l: 20,
    }),
  ).toEqual<HEX>('#123354');

  expect(
    rgbToHwb({
      r: 12,
      g: 34,
      b: 56,
    }),
  ).toEqual<HWB>({
    h: 210,
    w: 4.705882352941177,
    b: 78.03921568627452,
  });
  expect(
    hwbToRgb({
      h: 210,
      w: 4.705882352941177,
      b: 78.03921568627452,
    }),
  ).toEqual<RGB>({
    r: 12,
    g: 33.99999999999998,
    b: 55.99999999999996,
  });

  expect(hexToHwb('#fedcba')).toEqual<HWB>({
    h: 30.000000000000014,
    w: 72.94117647058823,
    b: 0.39215686274509665,
  });
  expect(
    hwbToHex({
      h: 30.000000000000014,
      w: 72.94117647058823,
      b: 0.39215686274509665,
    }),
  ).toEqual<HEX>('#fedcba');
});

test('mix', () => {
  expect(rgbToHex(mix(hexToRgb('#00ff00'), hexToRgb('#ff0000')))).toEqual('#808000');
  expect(hsvToHex(mix(hexToHsv('#00ff00'), hexToHsv('#ff0000')))).toEqual('#ffff00');
});

test('lab', () => {
  const color1 = '#9ea9b5';
  const color2 = '#8592a1';

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const xyz1 = rgbToXyz(rgb1);
  const xyz2 = rgbToXyz(rgb2);

  const lab1 = xyzToLab(xyz1);
  const lab2 = xyzToLab(xyz2);

  const d = distance(lab1, lab2);

  // console.log(lab1);
  // console.log(lab2);
  // console.log(d);

  expect(d).toBeLessThan(1);
  expect(d).toBeGreaterThan(0);
});
