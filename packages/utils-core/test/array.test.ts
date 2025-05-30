import { promiseDelay } from '@/promise';
import { describe, expect, it, vi } from 'vitest';
import { arrayDiff, arrayEach, arrayEachAsync, arrayMove, arrayOmit, arrayPick, isArrayLike } from '../src/array';

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
    expect(arrayPick([1, 2, 3, 4], [2, 0])).toEqual([1, 3]);
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

describe('arrayMove', () => {
  it('应正确移动数组中的元素', () => {
    const arr = [1, 2, 3, 4];
    expect(arrayMove(arr, 1, 3)).toEqual([1, 3, 4, 2]);
    expect(arrayMove(arr, 2, 0)).toEqual([3, 1, 2, 4]);
  });

  it('应处理移动到数组开头的情况', () => {
    const arr = [1, 2, 3, 4];
    expect(arrayMove(arr, 2, 0)).toEqual([3, 1, 2, 4]);
  });

  it('应处理移动到数组末尾的情况', () => {
    const arr = [1, 2, 3, 4];
    expect(arrayMove(arr, 1, 3)).toEqual([1, 3, 4, 2]);
  });

  it('应处理无效索引的情况', () => {
    const arr = [1, 2, 3, 4];
    expect(arrayMove(arr, 5, 0)).toEqual([1, 2, 3, 4]);
    expect(arrayMove(arr, 0, 5)).toEqual([1, 2, 3, 4]);
  });

  it('应处理空数组的情况', () => {
    const arr: number[] = [];
    expect(arrayMove(arr, 0, 1)).toEqual([]);
  });
});

describe('arrayEach', () => {
  it('应正确遍历数组中的每个元素', () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    arrayEach(arr, (item) => {
      results.push(item);
    });

    expect(results).toEqual([1, 2, 3]);
  });

  it('应支持提前终止遍历', () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    arrayEach(arr, (item) => {
      results.push(item);
      if (item === 2) return false;
    });

    expect(results).toEqual([1, 2]);
  });

  it('应正确反向遍历数组', () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    arrayEach(
      arr,
      (item) => {
        results.push(item);
      },
      true,
    );

    expect(results).toEqual([3, 2, 1]);
  });

  it('应支持反向遍历时提前终止', () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    arrayEach(
      arr,
      (item) => {
        results.push(item);
        if (item === 2) return false;
      },
      true,
    );

    expect(results).toEqual([3, 2]);
  });

  it('应支持在遍历过程中删除元素', () => {
    const arr = ['a', 'b', 'c'];
    const fn = vi.fn();

    arrayEach(arr, (val, idx) => {
      if (val === 'b') {
        arr.splice(idx, 1);
      }

      fn(val, idx);
    });

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, 'a', 0);
    expect(fn).toHaveBeenNthCalledWith(2, 'b', 1);
    expect(fn).toHaveBeenNthCalledWith(3, 'c', 2);
    expect(arr).toEqual(['a', 'c']);
  });
});

describe('arrayEachAsync', () => {
  it('应正确异步遍历数组中的每个元素', async () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    await arrayEachAsync(arr, async (item) => {
      await promiseDelay(1);
      results.push(item);
    });

    expect(results).toEqual([1, 2, 3]);
  });

  it('应支持提前终止异步遍历', async () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    await arrayEachAsync(arr, async (item) => {
      await promiseDelay(1);
      results.push(item);

      if (item === 2) return false;
    });

    expect(results).toEqual([1, 2]);
  });

  it('应正确反向异步遍历数组', async () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    await arrayEachAsync(
      arr,
      async (item) => {
        await promiseDelay(1);
        results.push(item);
      },
      true,
    );

    expect(results).toEqual([3, 2, 1]);
  });

  it('应支持反向异步遍历时提前终止', async () => {
    const arr = [1, 2, 3];
    const results: number[] = [];

    await arrayEachAsync(
      arr,
      async (item) => {
        await promiseDelay(1);
        results.push(item);

        if (item === 2) return false;
      },
      true,
    );

    expect(results).toEqual([3, 2]);
  });
});

describe('arrayDiff', () => {
  it('应正确识别新增和删除的元素', () => {
    const ref = [1, 2, 3];
    const cur = [2, 3, 4];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValue: 1 }]);
    expect(diff.adds).toEqual([{ curIndexes: [2], curValue: 4 }]);
    expect(diff.equals).toEqual([
      { refIndexes: [1], curIndexes: [0], refValue: 2, curValue: 2 },
      { refIndexes: [2], curIndexes: [1], refValue: 3, curValue: 3 },
    ]);
  });

  it('应正确处理完全不同的数组', () => {
    const ref = [1, 2, 3];
    const cur = [4, 5, 6];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      { refIndexes: [0], refValue: 1 },
      { refIndexes: [1], refValue: 2 },
      { refIndexes: [2], refValue: 3 },
    ]);
    expect(diff.adds).toEqual([
      { curIndexes: [0], curValue: 4 },
      { curIndexes: [1], curValue: 5 },
      { curIndexes: [2], curValue: 6 },
    ]);
    expect(diff.equals).toEqual([]);
  });

  it('应正确处理完全相同的数组', () => {
    const ref = [1, 2, 3];
    const cur = [1, 2, 3];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([]);
    expect(diff.adds).toEqual([]);
    expect(diff.equals).toEqual([
      { refIndexes: [0], curIndexes: [0], refValue: 1, curValue: 1 },
      { refIndexes: [1], curIndexes: [1], refValue: 2, curValue: 2 },
      { refIndexes: [2], curIndexes: [2], refValue: 3, curValue: 3 },
    ]);
  });

  it('应正确处理重复元素的差异', () => {
    const ref = [1, 2, 2, 3];
    const cur = [2, 3, 3, 4];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValue: 1 }]);
    expect(diff.adds).toEqual([{ curIndexes: [3], curValue: 4 }]);
    expect(diff.equals).toEqual([
      { refIndexes: [1, 2], curIndexes: [0], refValue: 2, curValue: 2 },
      { refIndexes: [3], curIndexes: [1, 2], refValue: 3, curValue: 3 },
    ]);
  });

  it('应正确处理空数组的情况', () => {
    expect(arrayDiff([], [1, 2])).toEqual({
      deletes: [],
      adds: [
        { curIndexes: [0], curValue: 1 },
        { curIndexes: [1], curValue: 2 },
      ],
      equals: [],
    });

    expect(arrayDiff([1, 2], [])).toEqual({
      deletes: [
        { refIndexes: [0], refValue: 1 },
        { refIndexes: [1], refValue: 2 },
      ],
      adds: [],
      equals: [],
    });

    expect(arrayDiff([], [])).toEqual({
      deletes: [],
      adds: [],
      equals: [],
    });
  });

  it('应正确处理包含引用类型的数组', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };

    const ref = [obj1, obj2];
    const cur = [obj2, obj3];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValue: obj1 }]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValue: obj3 }]);
    expect(diff.equals).toEqual([{ refIndexes: [1], curIndexes: [0], refValue: obj2, curValue: obj2 }]);
  });

  it('应正确处理包含特殊值的数组', () => {
    const ref = [null, undefined, Number.NaN];
    const cur = [undefined, null];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [2], refValue: Number.NaN }]);
    expect(diff.adds).toEqual([]);
    expect(diff.equals).toEqual([
      { refIndexes: [0], curIndexes: [1], refValue: null, curValue: null },
      { refIndexes: [1], curIndexes: [0], refValue: undefined, curValue: undefined },
    ]);
  });

  it('应正确处理包含NaN的情况', () => {
    const ref = [1, Number.NaN, 2];
    const cur = [Number.NaN, 3];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      { refIndexes: [0], refValue: 1 },
      { refIndexes: [2], refValue: 2 },
    ]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValue: 3 }]);
    expect(diff.equals).toEqual([{ refIndexes: [1], curIndexes: [0], refValue: Number.NaN, curValue: Number.NaN }]);
  });
});
