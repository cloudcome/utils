import { describe, expect, it } from 'vitest';
import { arrayOmit, arrayPick, isArrayLike } from '../src/array';

describe('isArrayLike', () => {
  it('应正确判断类数组对象', () => {
    expect(isArrayLike({ length: 0 })).toBe(true);
    expect(isArrayLike({ length: 1, 0: 'a' })).toBe(true);
    expect(isArrayLike({ length: -1 })).toBe(false);
    expect(isArrayLike({ length: '1' })).toBe(false);
    expect(isArrayLike([])).toBe(true);
    expect(isArrayLike([1, 2, 3])).toBe(true);
    expect(isArrayLike({})).toBe(false);
    expect(isArrayLike(null)).toBe(false);
    expect(isArrayLike(undefined)).toBe(false);
    expect(isArrayLike('string')).toBe(false);
    expect(isArrayLike(123)).toBe(false);
  });
});

describe('arrayPick', () => {
  it('应从数组中选择指定索引的元素', () => {
    expect(arrayPick([1, 2, 3, 4], [0, 2])).toEqual([1, 3]);
    expect(arrayPick(['a', 'b', 'c'], [1])).toEqual(['b']);
    expect(arrayPick([true, false, true], [0, 1, 2])).toEqual([true, false, true]);
    expect(arrayPick([], [0, 1])).toEqual([]);
    expect(arrayPick([1, 2, 3], [])).toEqual([]);
  });
});

describe('arrayOmit', () => {
  it('应从数组中排除指定索引的元素', () => {
    expect(arrayOmit([1, 2, 3, 4], [0, 2])).toEqual([2, 4]);
    expect(arrayOmit(['a', 'b', 'c'], [1])).toEqual(['a', 'c']);
    expect(arrayOmit([true, false, true], [0, 1, 2])).toEqual([]);
    expect(arrayOmit([], [0, 1])).toEqual([]);
    expect(arrayOmit([1, 2, 3], [])).toEqual([1, 2, 3]);
  });
});
