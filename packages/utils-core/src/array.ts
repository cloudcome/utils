import { isArray, isObject } from './type';
import type { MaybePromise } from './types';

/**
 * 检查给定的值是否为类数组对象。
 *
 * 类数组对象是指具有 `length` 属性且 `length` 属性为非负数的对象。
 *
 * @param unknown - 要检查的值。
 * @returns 如果值是类数组对象，则返回 `true`，否则返回 `false`。
 */
export function isArrayLike(unknown: unknown) {
  if (isArray(unknown)) return true;

  if (isObject(unknown)) {
    const arrayLike = unknown as { length: unknown };
    return typeof arrayLike.length === 'number' && arrayLike.length >= 0;
  }

  return false;
}

/**
 * 从数组中选择指定索引的元素。
 *
 * @param array - 要从中选择元素的数组。
 * @param indexes - 要选择的元素的索引数组。
 * @returns 包含指定索引元素的新数组。
 */
export function arrayPick<T>(array: T[], indexes: number[]) {
  const indexes2 = [...indexes];
  return array.filter((_, i) => {
    const index = indexes2.indexOf(i);
    if (index === -1) return false;
    indexes2.splice(index, 1);
    return true;
  });
}

/**
 * 从数组中排除指定索引的元素。
 *
 * @param array - 要从中排除元素的数组。
 * @param indexes - 要排除的元素的索引数组。
 * @returns 包含排除指定索引元素后的新数组。
 */
export function arrayOmit<T>(array: T[], indexes: number[]) {
  const indexes2 = [...indexes];
  return array.filter((_, i) => {
    const index = indexes2.indexOf(i);
    if (index === -1) return true;
    indexes2.splice(index, 1);
    return false;
  });
}

/**
 * 遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param array - 要遍历的数组。
 * @param iterator - 对每个元素执行的回调函数。如果回调函数返回 `false`，则提前终止遍历。
 * @param reverse - 是否以相反的顺序遍历数组。默认为 `false`。
 * @returns 无返回值。
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * arrayEach(arr, (item, index) => {
 *   console.log(item, index);
 *   if (index === 1) return false; // 提前终止遍历
 * });
 * ```
 */
export function arrayEach<T>(array: T[], iterator: (item: T, index: number) => false | unknown, reverse = false) {
  const _array = [...array];
  const length = array.length;

  if (reverse) {
    for (let i = length - 1; i >= 0; i--) {
      if (iterator(_array[i], i) === false) {
        break;
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      if (iterator(_array[i], i) === false) {
        break;
      }
    }
  }
}

/**
 * 异步遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param array - 要遍历的数组。
 * @param iterator - 对每个元素执行的异步回调函数。如果回调函数返回 `false`，则提前终止遍历。
 * @param reverse - 是否以相反的顺序遍历数组。默认为 `false`。
 * @returns 无返回值。
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3];
 * await arrayEachAsync(arr, async (item, index) => {
 *   await someAsyncOperation(item);
 *   if (index === 1) return false; // 提前终止遍历
 * });
 * ```
 */
export async function arrayEachAsync<T>(
  array: T[],
  iterator: (item: T, index: number) => MaybePromise<false | unknown>,
  reverse = false,
) {
  const _array = [...array];
  const length = array.length;

  if (reverse) {
    for (let i = length - 1; i >= 0; i--) {
      if ((await iterator(_array[i], i)) === false) {
        break;
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      if ((await iterator(_array[i], i)) === false) {
        break;
      }
    }
  }
}

/**
 * 将数组中的元素移动到指定位置。
 *
 * @param array - 要移动元素的数组。
 * @param from - 要移动的元素的起始位置。
 * @param to - 要移动的元素的目标位置。
 * @returns 新的数组，其中包含移动后的元素。
 *
 * @example
 * ```typescript
 * const arr = [1, 2, 3, 4, 5];
 * const newArr = arrayMove(arr, 1, 3);
 * // 返回 [1, 3, 4, 2, 5]
 * ```
 */
export function arrayMove<T>(array: T[], from: number, to: number) {
  const array2 = [...array];

  if (from < 0 || from >= array2.length || to < 0 || to >= array2.length) {
    return array2;
  }

  const item = array2[from];

  array2.splice(from, 1);
  array2.splice(to, 0, item);

  return array2;
}

/**
 * 比较两个数组的差异，返回包含删除、新增和相同元素信息的对象
 *
 * @template T - 数组元素的类型
 * @param {T[]} refArray - 参考数组（原始数组）
 * @param {T[]} curArray - 当前数组（比较数组）
 * @returns {ArrayDiffs<T>} 包含差异信息的对象
 *
 * @example
 * ```typescript
 * const ref = [1, 2, 3];
 * const cur = [2, 3, 4];
 * const diff = arrayDiff(ref, cur);
 * // 返回结果:
 * // {
 * //   deletes: [{refIndexes: [0], refValue: 1}],
 * //   adds: [{curIndexes: [2], curValue: 4}],
 * //   equals: [
 * //     {refIndexes: [1], curIndexes: [0], refValue: 2, curValue: 2},
 * //     {refIndexes: [2], curIndexes: [1], refValue: 3, curValue: 3}
 * //   ]
 * // }
 * ```
 */
export type ArrayDiffs<T> = {
  /**
   * 被删除的元素列表
   * @type {Array}
   * @property {number[]} refIndexes - 元素在参考数组中的所有索引位置
   * @property {T} refValue - 被删除的元素值
   */
  deletes: {
    /**
     * 元素在参考数组中的所有索引位置
     * @type {number[]}
     */
    refIndexes: number[];
    /**
     * 被删除的元素值
     * @type {T}
     */
    refValue: T;
  }[];

  /**
   * 新增的元素列表
   * @type {Array}
   * @property {number[]} curIndexes - 元素在当前数组中的所有索引位置
   * @property {T} curValue - 新增的元素值
   */
  adds: {
    /**
     * 元素在当前数组中的所有索引位置
     * @type {number[]}
     */
    curIndexes: number[];
    /**
     * 新增的元素值
     * @type {T}
     */
    curValue: T;
  }[];

  /**
   * 相同的元素列表
   * @type {Array}
   * @property {number[]} refIndexes - 元素在参考数组中的所有索引位置
   * @property {number[]} curIndexes - 元素在当前数组中的所有索引位置
   * @property {T} refValue - 参考数组中的元素值
   * @property {T} curValue - 当前数组中的元素值
   */
  equals: {
    /**
     * 元素在参考数组中的所有索引位置
     * @type {number[]}
     */
    refIndexes: number[];
    /**
     * 元素在当前数组中的所有索引位置
     * @type {number[]}
     */
    curIndexes: number[];
    /**
     * 参考数组中的元素值
     * @type {T}
     */
    refValue: T;
    /**
     * 当前数组中的元素值
     * @type {T}
     */
    curValue: T;
  }[];
};

export type ArrayDiffOptions<T> = {
  getItemKey: (item: T) => unknown;
};

export function arrayDiff<T>(refArray: T[], curArray: T[], options?: ArrayDiffOptions<T>): ArrayDiffs<T> {
  const { getItemKey = (item: T) => item } = options || {};

  const buildMap = (arr: T[]) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const map = new Map<any, number[]>();

    arr.forEach((item, index) => {
      const key = getItemKey(item);
      const indexes = map.get(key) || [];
      indexes.push(index);
      map.set(key, indexes);
    });

    return map;
  };
  const map1 = buildMap(refArray);
  const map2 = buildMap(curArray);
  const deletes = new Set<T>();
  const adds = new Set<T>();
  const equals = new Set<T>();

  for (const key of map1.keys()) {
    if (map2.has(key)) {
      equals.add(key);
    } else {
      deletes.add(key);
    }
  }

  for (const key of map2.keys()) {
    if (!map1.has(key)) {
      adds.add(key);
    }
  }

  return {
    deletes: [...deletes].map((it) => ({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      refIndexes: map1.get(it)!,
      refValue: it,
    })),

    adds: [...adds].map((it) => ({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      curIndexes: map2.get(it)!,
      curValue: it,
    })),

    equals: [...equals].map((it) => ({
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      refIndexes: map1.get(it)!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      curIndexes: map2.get(it)!,
      refValue: it,
      curValue: it,
    })),
  };
}
