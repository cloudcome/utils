import { createEasingFn } from '@/easing';
import { describe, expect, it } from 'vitest';

describe('createEasingFn', () => {
  it('应正确创建线性缓动函数', () => {
    const linearEasing = createEasingFn(0, 0, 1, 1);
    expect(linearEasing(0)).toBe(0);
    expect(linearEasing(0.5)).toBe(0.5);
    expect(linearEasing(1)).toBe(1);
  });

  it('应正确创建自定义缓动函数', () => {
    const customEasing = createEasingFn(0.25, 0.1, 0.25, 1);
    expect(customEasing(0)).toBe(0);
    expect(customEasing(0.5)).toBeCloseTo(0.8, 1);
    expect(customEasing(1)).toBe(1);
  });

  it('应抛出错误当 mX1 或 mX2 不在 [0, 1] 范围内', () => {
    expect(() => createEasingFn(-0.1, 0.5, 0.5, 1)).toThrow('bezier x values must be in [0, 1] range');
    expect(() => createEasingFn(1.1, 0.5, 0.5, 1)).toThrow('bezier x values must be in [0, 1] range');
    expect(() => createEasingFn(0.5, 0.5, -0.1, 1)).toThrow('bezier x values must be in [0, 1] range');
    expect(() => createEasingFn(0.5, 0.5, 1.1, 1)).toThrow('bezier x values must be in [0, 1] range');
  });

  it('应返回 LinearEasing 当 mX1=mY1 且 mX2=mY2', () => {
    const linearEasing = createEasingFn(0, 0, 1, 1);
    const customLinearEasing = createEasingFn(0.5, 0.5, 0.5, 0.5);
    expect(customLinearEasing(0)).toBe(linearEasing(0));
    expect(customLinearEasing(0.5)).toBe(linearEasing(0.5));
    expect(customLinearEasing(1)).toBe(linearEasing(1));
  });
});
