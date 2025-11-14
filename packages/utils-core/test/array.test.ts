import { promiseDelay } from '@/promise';
import { describe, expect, it, vi } from 'vitest';
import {
  arrayDiff,
  arrayEach,
  arrayEachAsync,
  arrayMove,
  arrayOmit,
  arrayPick,
  arrayRemove,
  isArrayLike,
} from '../src/array';

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

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValues: [1] }]);
    expect(diff.adds).toEqual([{ curIndexes: [2], curValues: [4] }]);
    expect(diff.equals).toEqual([
      { refIndexes: [1], curIndexes: [0], refValues: [2], curValues: [2] },
      { refIndexes: [2], curIndexes: [1], refValues: [3], curValues: [3] },
    ]);
  });

  it('应正确处理完全不同的数组', () => {
    const ref = [1, 2, 3];
    const cur = [4, 5, 6];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      { refIndexes: [0], refValues: [1] },
      { refIndexes: [1], refValues: [2] },
      { refIndexes: [2], refValues: [3] },
    ]);
    expect(diff.adds).toEqual([
      { curIndexes: [0], curValues: [4] },
      { curIndexes: [1], curValues: [5] },
      { curIndexes: [2], curValues: [6] },
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
      { refIndexes: [0], curIndexes: [0], refValues: [1], curValues: [1] },
      { refIndexes: [1], curIndexes: [1], refValues: [2], curValues: [2] },
      { refIndexes: [2], curIndexes: [2], refValues: [3], curValues: [3] },
    ]);
  });

  it('应正确处理重复元素的差异', () => {
    const ref = [1, 2, 2, 3];
    const cur = [2, 3, 3, 4];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValues: [1] }]);
    expect(diff.adds).toEqual([{ curIndexes: [3], curValues: [4] }]);
    expect(diff.equals).toEqual([
      { refIndexes: [1, 2], curIndexes: [0], refValues: [2, 2], curValues: [2] },
      { refIndexes: [3], curIndexes: [1, 2], refValues: [3], curValues: [3, 3] },
    ]);
  });

  it('应正确处理空数组的情况', () => {
    expect(arrayDiff([], [1, 2])).toEqual({
      deletes: [],
      adds: [
        { curIndexes: [0], curValues: [1] },
        { curIndexes: [1], curValues: [2] },
      ],
      equals: [],
    });

    expect(arrayDiff([1, 2], [])).toEqual({
      deletes: [
        { refIndexes: [0], refValues: [1] },
        { refIndexes: [1], refValues: [2] },
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

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValues: [obj1] }]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValues: [obj3] }]);
    expect(diff.equals).toEqual([{ refIndexes: [1], curIndexes: [0], refValues: [obj2], curValues: [obj2] }]);
  });

  it('应正确处理包含特殊值的数组', () => {
    const ref = [null, undefined, Number.NaN];
    const cur = [undefined, null];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([{ refIndexes: [2], refValues: [Number.NaN] }]);
    expect(diff.adds).toEqual([]);
    expect(diff.equals).toEqual([
      { refIndexes: [0], curIndexes: [1], refValues: [null], curValues: [null] },
      { refIndexes: [1], curIndexes: [0], refValues: [undefined], curValues: [undefined] },
    ]);
  });

  it('应正确处理包含NaN的情况', () => {
    const ref = [1, Number.NaN, 2];
    const cur = [Number.NaN, 3];
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      { refIndexes: [0], refValues: [1] },
      { refIndexes: [2], refValues: [2] },
    ]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValues: [3] }]);
    expect(diff.equals).toEqual([
      { refIndexes: [1], curIndexes: [0], refValues: [Number.NaN], curValues: [Number.NaN] },
    ]);
  });

  // 新增的测试用例
  it('应正确使用 getItemKey 选项进行自定义比较', () => {
    const ref = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    const cur = [
      { id: 2, name: 'c' },
      { id: 3, name: 'd' },
    ];

    // 使用 id 作为比较键
    const diff = arrayDiff(ref, cur, {
      getItemKey: (item) => item.id,
    });

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValues: [{ id: 1, name: 'a' }] }]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValues: [{ id: 3, name: 'd' }] }]);
    expect(diff.equals).toEqual([
      {
        refIndexes: [1],
        curIndexes: [0],
        refValues: [{ id: 2, name: 'b' }],
        curValues: [{ id: 2, name: 'c' }],
      },
    ]);
  });

  it('相同的对象结构，不同的对象引用', () => {
    const ref = [
      { id: 1, details: { age: 20, city: 'Beijing' } },
      { id: 2, details: { age: 25, city: 'Shanghai' } },
    ];
    const cur = [
      { id: 2, details: { age: 25, city: 'Shanghai' } },
      { id: 3, details: { age: 30, city: 'Guangzhou' } },
    ];

    // 默认情况下使用对象引用进行比较
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      {
        refIndexes: [0],
        refValues: [{ id: 1, details: { age: 20, city: 'Beijing' } }],
      },
      {
        refIndexes: [1],
        refValues: [{ id: 2, details: { age: 25, city: 'Shanghai' } }],
      },
    ]);
    expect(diff.adds).toEqual([
      {
        curIndexes: [0],
        curValues: [{ id: 2, details: { age: 25, city: 'Shanghai' } }],
      },
      {
        curIndexes: [1],
        curValues: [{ id: 3, details: { age: 30, city: 'Guangzhou' } }],
      },
    ]);
    expect(diff.equals).toEqual([]);
  });

  it('相同的对象结构，相同的对象引用', () => {
    const ref = [
      { id: 1, details: { age: 20, city: 'Beijing' } },
      { id: 2, details: { age: 25, city: 'Shanghai' } },
    ];
    const cur = [ref[1], { id: 3, details: { age: 30, city: 'Guangzhou' } }];

    // 默认情况下使用对象引用进行比较
    const diff = arrayDiff(ref, cur);

    expect(diff.deletes).toEqual([
      {
        refIndexes: [0],
        refValues: [{ id: 1, details: { age: 20, city: 'Beijing' } }],
      },
    ]);
    expect(diff.adds).toEqual([
      {
        curIndexes: [1],
        curValues: [{ id: 3, details: { age: 30, city: 'Guangzhou' } }],
      },
    ]);
    expect(diff.equals).toEqual([
      {
        refIndexes: [1],
        curIndexes: [0],
        refValues: [ref[1]],
        curValues: [ref[1]],
      },
    ]);
  });

  it('应正确处理使用 getItemKey 进行复杂对象比较', () => {
    const ref = [
      { id: 1, details: { age: 20, city: 'Beijing' } },
      { id: 2, details: { age: 25, city: 'Shanghai' } },
    ];
    const cur = [
      { id: 2, details: { age: 26, city: 'Shanghai' } }, // 同样的id，但details不同
      { id: 3, details: { age: 30, city: 'Guangzhou' } },
    ];

    // 使用 id 作为比较键
    const diff = arrayDiff(ref, cur, {
      getItemKey: (item) => item.id,
    });

    expect(diff.deletes).toEqual([
      {
        refIndexes: [0],
        refValues: [{ id: 1, details: { age: 20, city: 'Beijing' } }],
      },
    ]);
    expect(diff.adds).toEqual([
      {
        curIndexes: [1],
        curValues: [{ id: 3, details: { age: 30, city: 'Guangzhou' } }],
      },
    ]);
    expect(diff.equals).toEqual([
      {
        refIndexes: [1],
        curIndexes: [0],
        refValues: [{ id: 2, details: { age: 25, city: 'Shanghai' } }],
        curValues: [{ id: 2, details: { age: 26, city: 'Shanghai' } }],
      },
    ]);
  });

  it('应正确处理字符串作为键的情况', () => {
    const ref = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ];
    const cur = [
      { key: 'b', value: 3 },
      { key: 'c', value: 4 },
    ];

    const diff = arrayDiff(ref, cur, {
      getItemKey: (item) => item.key,
    });

    expect(diff.deletes).toEqual([{ refIndexes: [0], refValues: [{ key: 'a', value: 1 }] }]);
    expect(diff.adds).toEqual([{ curIndexes: [1], curValues: [{ key: 'c', value: 4 }] }]);
    expect(diff.equals).toEqual([
      {
        refIndexes: [1],
        curIndexes: [0],
        refValues: [{ key: 'b', value: 2 }],
        curValues: [{ key: 'b', value: 3 }],
      },
    ]);
  });

  it('应正确处理多个相同键值的情况', () => {
    const ref = [
      { id: 1, type: 'A' },
      { id: 2, type: 'A' }, // 同样type
      { id: 3, type: 'B' },
    ];
    const cur = [
      { id: 4, type: 'A' }, // 同样type
      { id: 5, type: 'B' },
      { id: 6, type: 'C' },
    ];

    const diff = arrayDiff(ref, cur, {
      getItemKey: (item) => item.type,
    });

    expect(diff.deletes).toEqual([]);
    expect(diff.adds).toEqual([{ curIndexes: [2], curValues: [{ id: 6, type: 'C' }] }]);
    expect(diff.equals).toEqual([
      {
        refIndexes: [0, 1],
        curIndexes: [0],
        refValues: [
          { id: 1, type: 'A' },
          { id: 2, type: 'A' },
        ],
        curValues: [{ id: 4, type: 'A' }],
      },
      {
        refIndexes: [2],
        curIndexes: [1],
        refValues: [{ id: 3, type: 'B' }],
        curValues: [{ id: 5, type: 'B' }],
      },
    ]);
  });
});

describe('arrayRemove', () => {
  it('应从数组中移除指定索引的元素', () => {
    expect(arrayRemove([1, 2, 3, 4, 5], [3, 1])).toEqual([1, 3, 5]);
    expect(arrayRemove(['a', 'b', 'c', 'd'], [0, 2])).toEqual(['b', 'd']);
    expect(arrayRemove([true, false, true, false], [1])).toEqual([true, true, false]);
  });

  it('应正确处理移除单个元素的情况', () => {
    expect(arrayRemove([1, 2, 3], [0])).toEqual([2, 3]);
    expect(arrayRemove([1, 2, 3], [1])).toEqual([1, 3]);
    expect(arrayRemove([1, 2, 3], [2])).toEqual([1, 2]);
  });

  it('应正确处理移除多个元素的情况', () => {
    expect(arrayRemove([1, 2, 3, 4, 5], [0, 1, 2])).toEqual([4, 5]);
    expect(arrayRemove([1, 2, 3, 4, 5], [1, 3])).toEqual([1, 3, 5]);
    expect(arrayRemove(['a', 'b', 'c', 'd', 'e'], [0, 2, 4])).toEqual(['b', 'd']);
  });

  it('应正确处理移除重复索引的情况', () => {
    expect(arrayRemove([1, 2, 3, 4], [1, 1, 3])).toEqual([1, 3]);
    expect(arrayRemove([1, 2, 3, 4], [0, 0, 0])).toEqual([2, 3, 4]);
  });

  it('应正确处理空数组的情况', () => {
    expect(arrayRemove([], [0, 1])).toEqual([]);
    expect(arrayRemove([], [])).toEqual([]);
  });

  it('应正确处理空索引数组的情况', () => {
    expect(arrayRemove([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(arrayRemove(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c']);
  });

  it('应正确处理索引超出数组范围的情况', () => {
    expect(arrayRemove([1, 2, 3], [5, 6])).toEqual([1, 2, 3]);
    expect(arrayRemove([1, 2, 3], [0, 5])).toEqual([2, 3]);
    expect(arrayRemove([1, 2, 3], [-1, 0])).toEqual([2, 3]); // 负索引不匹配
  });

  it('应正确处理负索引的情况', () => {
    expect(arrayRemove([1, 2, 3, 4], [-1, -2])).toEqual([1, 2, 3, 4]); // 负索引不匹配
    expect(arrayRemove([1, 2, 3, 4], [1, -1])).toEqual([1, 3, 4]); // 只有正索引被移除
  });

  it('应保持原数组不变', () => {
    const originalArray = [1, 2, 3, 4, 5];
    const originalArrayCopy = [...originalArray];
    arrayRemove(originalArray, [1, 3]);
    expect(originalArray).toEqual(originalArrayCopy);
  });

  it('应正确处理不同类型的数组元素', () => {
    expect(arrayRemove([null, undefined, 0, false, ''], [1, 3])).toEqual([null, 0, '']);
    expect(arrayRemove([{ id: 1 }, { id: 2 }, { id: 3 }], [1])).toEqual([{ id: 1 }, { id: 3 }]);
    expect(arrayRemove([1, [2, 3], '4'], [1])).toEqual([1, '4']);
  });
});
