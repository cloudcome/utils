import { numberAbbr, numberConvert, randomNumber } from '@/number';
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
});

describe('numberAbbr', () => {
  it('应正确转换数字为带单位的缩写', () => {
    expect(numberAbbr(1500, ['', 'K', 'M'], { base: 1000 })).toBe('2K');
    expect(numberAbbr(123456, ['B', 'KB', 'MB'], { fractionDigits: 1 })).toBe('123.5KB');
    expect(numberAbbr(500, ['B', 'KB'])).toBe('500B');
  });

  it('应处理单位数组为空的情况', () => {
    expect(() => numberAbbr(1000, [])).toThrow('数字单位组不能为空');
  });

  it('应处理自定义进制基数', () => {
    expect(numberAbbr(1024, ['B', 'KB', 'MB'], { base: 1024 })).toBe('1KB');
    expect(numberAbbr(1048576, ['B', 'KB', 'MB'], { base: 1024 })).toBe('1MB');
    expect(numberAbbr(1048576, ['', '万', '亿'], { base: 10000 })).toBe('105万');
    expect(numberAbbr(10485769, ['', '万', '亿'], { base: 10000 })).toBe('1049万');
    expect(numberAbbr(10485769012, ['', '万', '亿'], { base: 10000 })).toBe('105亿');
  });

  it('应处理小数位数', () => {
    expect(numberAbbr(1234, ['', 'K', 'M'], { fractionDigits: 2 })).toBe('1.23K');
    expect(numberAbbr(1234567, ['', 'K', 'M'], { fractionDigits: 3 })).toBe('1.235M');
  });

  it('应处理不足基数的情况', () => {
    expect(numberAbbr(999, ['', 'K', 'M'])).toBe('999');
    expect(numberAbbr(999999, ['', 'K', 'M'])).toBe('1000K');
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
