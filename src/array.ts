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
  return isArray(unknown) || (isObject(unknown) && typeof unknown.length === 'number' && unknown.length >= 0);
}

/**
 * 从数组中选择指定索引的元素。
 *
 * @param array - 要从中选择元素的数组。
 * @param indexes - 要选择的元素的索引数组。
 * @returns 包含指定索引元素的新数组。
 */
export function arrayPick<T>(array: T[], indexes: number[]) {
  return array.filter((_, i) => indexes.includes(i));
}

/**
 * 从数组中排除指定索引的元素。
 *
 * @param array - 要从中排除元素的数组。
 * @param indexes - 要排除的元素的索引数组。
 * @returns 包含排除指定索引元素后的新数组。
 */
export function arrayOmit<T>(array: T[], indexes: number[]) {
  return array.filter((_, i) => !indexes.includes(i));
}

/**
 * 遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param array - 要遍历的数组。
 * @param iterator - 对每个元素执行的回调函数。如果回调函数返回 `false`，则提前终止遍历。
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
export function arrayEach<T>(array: T[], iterator: (item: T, index: number) => false | unknown) {
  for (let i = 0; i < array.length; i++) {
    if (iterator(array[i], i) === false) {
      break;
    }
  }
}

/**
 * 异步遍历数组中的每个元素，并对每个元素执行提供的回调函数。
 *
 * @param array - 要遍历的数组。
 * @param iterator - 对每个元素执行的异步回调函数。如果回调函数返回 `false`，则提前终止遍历。
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
) {
  for (let i = 0; i < array.length; i++) {
    if ((await iterator(array[i], i)) === false) {
      break;
    }
  }
}
