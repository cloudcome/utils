import type { AnyObject, MaybePromise } from '@/types';

/**
 * 遍历对象的每个键值对，并对每个键值对执行提供的回调函数。
 *
 * @param obj - 要遍历的对象。
 * @param iterator - 对每个键值对执行的回调函数。如果回调函数返回 false，则提前终止遍历。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const results: [string, number][] = [];
 * objectEach(obj, (val, key) => {
 *   results.push([key, val]);
 * });
 * console.log(results); // [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export function objectEach<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => false | unknown,
): void {
  for (const [key, val] of Object.entries(obj)) {
    if (iterator.call(obj, val as O[K], key as K) === false) {
      break;
    }
  }
}

/**
 * 异步遍历对象的每个键值对，并对每个键值对执行提供的回调函数。
 *
 * @param obj - 要遍历的对象。
 * @param iterator - 对每个键值对执行的异步回调函数。如果回调函数返回 false，则提前终止遍历。
 * @returns 返回一个 Promise，当所有异步操作完成后，Promise 会被 resolve。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const results: [string, number][] = [];
 * await objectEachAsync(obj, async (val, key) => {
 *   results.push([key, val]);
 * });
 * console.log(results); // [['a', 1], ['b', 2], ['c', 3]]
 * ```
 */
export async function objectEachAsync<O extends AnyObject, K extends keyof O & (string | number)>(
  obj: O,
  iterator: (this: O, val: O[K], key: K) => MaybePromise<false | unknown>,
): Promise<void> {
  for (const [key, val] of Object.entries(obj)) {
    if ((await iterator.call(obj, val as O[K], key as K)) === false) {
      break;
    }
  }
}
