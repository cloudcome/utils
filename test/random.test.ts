import { describe, expect, it } from 'vitest';
import { randomNumber } from '../src/random';

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
