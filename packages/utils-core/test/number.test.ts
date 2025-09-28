import { fileSizeAbbr, numberClamp } from '@/number';
import {
  numberAbbr,
  numberConvert,
  numberDecimals,
  numberFixed,
  numberFormat,
  numberUnit,
  randomNumber,
} from '@/number';
import { describe, expect, it } from 'vitest';

describe('randomNumber', () => {
  it('应在指定范围内生成随机整数', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('应处理 min 大于 max 的情况', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(10, 1);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('应处理边界情况', () => {
    expect(randomNumber(0, 0)).toBe(0);
    expect(randomNumber(5, 5)).toBe(5);
  });

  it('应处理负数范围', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(-10, -1);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
    }
  });

  it('应处理负数和正数混合范围', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  it('应处理带有小数的参数', () => {
    // 测试带有1位小数的范围
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(1.5, 5.5);
      expect(result).toBeGreaterThanOrEqual(1.5);
      expect(result).toBeLessThanOrEqual(5.5);
      expect(numberDecimals(result)).toBeLessThanOrEqual(1);
    }

    // 测试带有2位小数的范围
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(0.15, 0.25);
      expect(result).toBeGreaterThanOrEqual(0.15);
      expect(result).toBeLessThanOrEqual(0.25);
      expect(numberDecimals(result)).toBeLessThanOrEqual(2);
    }

    // 测试整数和小数混合范围
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(1, 2.5);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(2.5);
      expect(numberDecimals(result)).toBeLessThanOrEqual(1);
    }

    // 测试负数小数范围
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(-2.5, -1.1);
      expect(result).toBeGreaterThanOrEqual(-2.5);
      expect(result).toBeLessThanOrEqual(-1.1);
      expect(numberDecimals(result)).toBeLessThanOrEqual(1);
    }
  });
});

describe('numberAbbr', () => {
  it('应正确转换数字为带单位的缩写', () => {
    expect(numberAbbr(1500, ['', 'K', 'M'], { base: 1000 })).toBe('1K');
    expect(numberAbbr(123456, ['B', 'KB', 'MB'], { decimals: 1 })).toBe('123.4KB');
    expect(numberAbbr(500, ['B', 'KB'])).toBe('500B');
  });

  it('应处理单位数组为空的情况', () => {
    expect(() => numberAbbr(1000, [])).toThrow('数字单位组不能为空');
  });

  it('应处理自定义进制基数', () => {
    expect(numberAbbr(1024, ['B', 'KB', 'MB'], { base: 1024 })).toBe('1KB');
    expect(numberAbbr(1048576, ['B', 'KB', 'MB'], { base: 1024 })).toBe('1MB');
    expect(numberAbbr(1048576, ['', '万', '亿'], { base: 10000 })).toBe('104万');
    expect(numberAbbr(10485769, ['', '万', '亿'], { base: 10000 })).toBe('1048万');
    expect(numberAbbr(10485769012, ['', '万', '亿'], { base: 10000 })).toBe('104亿');
  });

  it('应处理小数位数', () => {
    expect(numberAbbr(1234, ['', 'K', 'M'], { decimals: 2 })).toBe('1.23K');
    expect(numberAbbr(1234567, ['', 'K', 'M'], { decimals: 3 })).toBe('1.234M');
  });

  it('应处理不足基数的情况', () => {
    expect(numberAbbr(999, ['', 'K', 'M'])).toBe('999');
    expect(numberAbbr(999999, ['', 'K', 'M'])).toBe('999K');
  });
});

describe('numberFixed', () => {
  it('应正确执行四舍五入', () => {
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: <explanation>
    expect(numberFixed(3.1415, { decimals: 2 })).toBe(3.14);
    expect(numberFixed(3.145, { decimals: 2 })).toBe(3.15);
    expect(numberFixed(3.5)).toBe(4);
  });

  it('应正确执行向上取整', () => {
    expect(numberFixed(3.1, { round: 1 })).toBe(4);
    expect(numberFixed(-3.1, { round: 1 })).toBe(-3);
  });

  it('应正确执行向下取整', () => {
    expect(numberFixed(3.9, { round: -1 })).toBe(3);
    expect(numberFixed(-3.9, { round: -1 })).toBe(-4);
  });

  it('应处理负数和小数位', () => {
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: <explanation>
    expect(numberFixed(-3.1415, { decimals: 3 })).toBe(-3.141);
    expect(numberFixed(-3.149, { decimals: 2, round: -1 })).toBe(-3.15);
  });

  it('应支持默认参数', () => {
    expect(numberFixed(2.5)).toBe(3);
    expect(numberFixed(2.5, {})).toBe(3);
  });

  it('应处理精度为0的情况', () => {
    expect(numberFixed(99.9, { decimals: 0 })).toBe(100);
    expect(numberFixed(99.4, { decimals: 0, round: -1 })).toBe(99);
  });
});

describe('fileSizeAbbr', () => {
  it('应正确转换基础文件大小', () => {
    expect(fileSizeAbbr(1024)).toBe('1KB');
    expect(fileSizeAbbr(1048576)).toBe('1MB');
    expect(fileSizeAbbr(500)).toBe('500B');
    expect(fileSizeAbbr(1073741824)).toBe('1GB');
  });

  it('应处理自定义小数位', () => {
    expect(fileSizeAbbr(123456, 1)).toBe('120.5KB');
    expect(fileSizeAbbr(1050000, 2)).toBe('1MB');
  });

  it('应处理不足基数的情况', () => {
    expect(fileSizeAbbr(999)).toBe('999B');
    expect(fileSizeAbbr(1023)).toBe('1023B');
  });

  it('应处理大单位转换', () => {
    expect(fileSizeAbbr(1099511627776)).toBe('1TB');
    expect(fileSizeAbbr(2199023255552)).toBe('2TB');
  });

  it('应处理零值', () => {
    expect(fileSizeAbbr(0)).toBe('0B');
  });

  it('应处理边界情况', () => {
    expect(fileSizeAbbr(1024 * 1024 - 1)).toBe('1023KB');
    expect(fileSizeAbbr(1024 ** 3)).toBe('1GB');
  });
});

describe('numberConvert', () => {
  it('应正确将十进制数转换为默认 62 进制字符串', () => {
    expect(numberConvert(123456789)).toBe('8M0kX');
  });

  it('应正确将十进制数转换为自定义 16 进制字符串', () => {
    expect(numberConvert(255, '0123456789ABCDEF')).toBe('FF');
  });

  it('应正确处理大整数', () => {
    expect(numberConvert(9007199254740991n)).toBe('fFgnDxSe7');
  });

  it('应处理字符字典长度小于 2 的情况', () => {
    expect(() => numberConvert(123, 'A')).toThrow('进制转换字典长度不能小于 2');
  });

  it('应处理字符字典为空的情况', () => {
    expect(() => numberConvert(123, 'a')).toThrow('进制转换字典长度不能小于 2');
  });

  it('应处理负数', () => {
    expect(numberConvert(-123)).toBe('-1z');
  });

  it('应处理零', () => {
    expect(numberConvert(0)).toBe('0');
  });
});

describe('numberFormat', () => {
  it('应支持默认分隔符和步长', () => {
    expect(numberFormat(123456.789)).toBe('123,456.789');
    expect(numberFormat(1000)).toBe('1,000');
    expect(numberFormat(0)).toBe('0');
    expect(numberFormat(-123456)).toBe('-123,456');
  });

  it('应支持自定义分隔符', () => {
    expect(numberFormat(123456, '_')).toBe('123_456');
    expect(numberFormat(123456.789, '_')).toBe('123_456.789');
  });

  it('应支持自定义步长', () => {
    expect(numberFormat(123456, 2)).toBe('12,34,56');
    expect(numberFormat(123456.789, 2)).toBe('12,34,56.789');
    expect(numberFormat(100000, 3)).toBe('100,000');
  });

  it('应支持对象配置', () => {
    expect(numberFormat(123456, { separator: '.', step: 4 })).toBe('12.3456');
    expect(numberFormat(123456.789, { separator: ' ', step: 3 })).toBe('123 456.789');
  });

  it('应处理小数部分', () => {
    expect(numberFormat(1234.5678)).toBe('1,234.5678');
    expect(numberFormat(0.1234)).toBe('0.1234');
    expect(numberFormat(123456.789, { step: 3 })).toBe('123,456.789');
  });

  it('应处理特殊数值', () => {
    expect(numberFormat(999)).toBe('999');
    expect(numberFormat(1000)).toBe('1,000');
    expect(numberFormat(1000000)).toBe('1,000,000');
    expect(numberFormat(-123456.789)).toBe('-123,456.789');
  });

  it('应处理非整数步长参数', () => {
    expect(numberFormat(123456, 4)).toBe('12,3456');
    expect(numberFormat(123456, { step: 4 })).toBe('12,3456');
  });
});

describe('numberClamp', () => {
  it('应将数字限制在指定范围内', () => {
    expect(numberClamp(0, 5, 10)).toBe(5);
    expect(numberClamp(0, -5, 10)).toBe(0);
    expect(numberClamp(0, 15, 10)).toBe(10);
  });

  it('应处理边界情况', () => {
    expect(numberClamp(0, 0, 10)).toBe(0);
    expect(numberClamp(0, 10, 10)).toBe(10);
  });

  it('应处理负数范围', () => {
    expect(numberClamp(-10, -5, 0)).toBe(-5);
    expect(numberClamp(-10, -15, 0)).toBe(-10);
    expect(numberClamp(-10, 5, 0)).toBe(0);
  });

  it('应处理小数', () => {
    expect(numberClamp(0.1, 0.5, 0.9)).toBe(0.5);
    expect(numberClamp(0.1, 0.05, 0.9)).toBe(0.1);
    expect(numberClamp(0.1, 0.95, 0.9)).toBe(0.9);
  });

  it('应处理相等的最小值和最大值', () => {
    expect(numberClamp(5, 3, 5)).toBe(5);
    expect(numberClamp(5, 7, 5)).toBe(5);
  });
});

describe('numberUnit', () => {
  it('应为数字添加单位', () => {
    expect(numberUnit(123, 'px')).toBe('123px');
    expect(numberUnit(0, 'px')).toBe('0px');
    expect(numberUnit(-456, 'px')).toBe('-456px');
    expect(numberUnit(123.45, 'px')).toBe('123.45px');
  });

  it('应为纯数字字符串添加单位', () => {
    expect(numberUnit('123', 'px')).toBe('123px');
    expect(numberUnit('0', 'px')).toBe('0px');
    expect(numberUnit('-456', 'px')).toBe('-456px');
    expect(numberUnit('123.45', 'px')).toBe('123.45px');
  });

  it('应处理非数字字符串', () => {
    expect(numberUnit('abc', 'px')).toBe('abc');
    expect(numberUnit('123abc', 'px')).toBe('123abc');
    expect(numberUnit('', 'px')).toBe('');
  });

  it('应处理默认单位为空字符串的情况', () => {
    expect(numberUnit(123)).toBe('123');
    expect(numberUnit('456')).toBe('456');
  });

  it('应处理自定义单位', () => {
    expect(numberUnit(100, 'kg')).toBe('100kg');
    expect(numberUnit(200, '%')).toBe('200%');
    expect(numberUnit(300, 'rem')).toBe('300rem');
  });
});

describe('numberDecimals', () => {
  it('应正确计算普通数字的小数位数', () => {
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: <explanation>
    expect(numberDecimals(3.1415)).toBe(4);
    expect(numberDecimals('3.1415')).toBe(4);
    expect(numberDecimals(100)).toBe(0);
    expect(numberDecimals('100')).toBe(0);
    expect(numberDecimals(0)).toBe(0);
    expect(numberDecimals('0')).toBe(0);
    expect(numberDecimals(-3.14)).toBe(2);
    expect(numberDecimals('-3.14')).toBe(2);
  });

  it('应正确处理科学计数法', () => {
    expect(numberDecimals('1.23e-4')).toBe(6);
    expect(numberDecimals('1.23e-6')).toBe(8);
    expect(numberDecimals('1.23E-4')).toBe(6);
    expect(numberDecimals('5e-2')).toBe(2);
    expect(numberDecimals('1e-10')).toBe(10);
  });

  it('应处理整数和没有小数部分的数字', () => {
    expect(numberDecimals(123)).toBe(0);
    expect(numberDecimals('123')).toBe(0);
    expect(numberDecimals(0.0)).toBe(0);
    expect(numberDecimals('0.0')).toBe(1);
    expect(numberDecimals(1.0)).toBe(0);
    expect(numberDecimals('1.0')).toBe(1);
  });

  it('应处理多位小数', () => {
    expect(numberDecimals(0.123456789)).toBe(9);
    expect(numberDecimals('0.123456789')).toBe(9);
    // biome-ignore lint/suspicious/noApproximativeNumericConstant: <explanation>
    expect(numberDecimals(3.14159265359)).toBe(11);
    expect(numberDecimals('3.14159265359')).toBe(11);
  });
});
