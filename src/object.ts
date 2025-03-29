import { isArray, isObject, typeIs } from './is';
import type { AnyArray, AnyObject, MaybePromise } from './types';

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

export interface MergeRule {
  /**
   * 处理冲突
   * @param target - 目标对象
   * @param source - 源对象
   * @param key - 键名
   * @returns 返回 true 表示继续处理，否则返回 false
   */
  next: (info: {
    target: AnyObject | AnyArray;
    source: AnyObject | AnyArray;
    key: string | number;
  }) => boolean;

  /**
   * 处理赋值
   * @param target - 目标对象
   * @param source - 源对象
   * @param key - 键名
   * @returns 返回处理后的值
   */
  assign: (info: {
    target: AnyObject | AnyArray;
    source: AnyObject | AnyArray;
    key: string | number;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    merge: () => any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  }) => any;
}

function internal_objectMerge(
  mergeRule: MergeRule,
  target: AnyObject | AnyArray,
  ...sources: (AnyObject | AnyArray)[]
) {
  const seen = new WeakMap<AnyObject | AnyArray, AnyObject | AnyArray>();
  const { assign, next } = mergeRule;
  const align = (target: AnyObject | AnyArray, source: AnyObject | AnyArray) => {
    const targetType = typeIs(target);
    const sourceType = typeIs(source);

    if (targetType === sourceType) {
      return target;
    }

    return sourceType === 'array' ? [] : {};
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const each = (source: AnyObject | AnyArray, iterator: (val: any, key: string | number) => void) => {
    if (isObject(source)) {
      objectEach(source, iterator);
    } else {
      source.forEach(iterator);
    }
  };

  const merge = (target: AnyObject | AnyArray, source: AnyObject | AnyArray): AnyObject | AnyArray => {
    // 如果循环引用了，则直接返回目标对象
    if (seen.has(source)) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      return seen.get(source)!;
    }

    // 对齐目标对象和源对象
    const merged = align(target, source);

    // 存储循环引用
    seen.set(source, merged);

    // 遍历源对象
    each(source, (value, key) => {
      if (!next({ target: merged, source, key })) {
        return;
      }

      if (isObject(value) || isArray(value)) {
        // @ts-expect-error
        merged[key] = assign({
          target: merged,
          source,
          key,
          // @ts-expect-error
          merge: () => merge(merged[key], value),
        });
      } else {
        // @ts-expect-error
        merged[key] = assign({
          target: merged,
          source,
          key,
          merge: () => value,
        });
      }
    });

    return merged;
  };

  let returnTarget = target;

  for (const source of sources) {
    returnTarget = merge(target, source);
  }

  return returnTarget;
}

/**
 * 合并多个对象或数组。如果遇到循环引用，则直接返回目标对象。
 *
 * @param target - 目标对象或数组。
 * @param sources - 要合并的源对象或数组。
 * @returns 合并后的对象或数组。
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { x: 10 } };
 * const obj2 = { b: { y: 20 }, c: 3 };
 * const merged = objectMerge(obj1, obj2);
 * console.log(merged); // { a: 1, b: { x: 10, y: 20 }, c: 3 }
 * ```
 */
export function objectMerge(target: AnyObject | AnyArray, ...sources: (AnyObject | AnyArray)[]) {
  return internal_objectMerge(
    {
      next() {
        return true;
      },
      assign({ merge }) {
        return merge();
      },
    },
    target,
    ...sources,
  );
}

/**
 * 为对象设置默认值。如果目标对象中的属性为 `undefined`，则使用默认对象中的属性值。
 * 支持多个默认对象，优先级从左到右依次降低。
 * 如果目标对象中的属性已经是对象或数组，则递归地设置默认值。
 *
 * @param target - 目标对象或数组。
 * @param sources - 默认对象或数组。
 * @returns 合并后的对象或数组。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: undefined };
 * const defaults = { a: 4, b: 2, c: 3 };
 * const result = objectDefaults(obj, defaults);
 * console.log(result); // { a: 1, b: 2, c: 3 }
 *
 * const obj2 = { a: 1, b: 2 };
 * const defaults2 = { a: 5, b: 3, c: 4 };
 * const result2 = objectDefaults(obj2, defaults2);
 * console.log(result2); // { a: 1, b: 2, c: 4 }
 *
 * const obj3 = { a: { x: 1 }, b: undefined };
 * const defaults3 = { a: { x: 4, z: 3 }, b: { y: 2 } };
 * const result3 = objectDefaults(obj3, defaults3);
 * console.log(result3); // { a: { x: 1, z: 3 }, b: { y: 2 } }
 * ```
 */
export function objectDefaults(target: AnyObject | AnyArray, ...sources: (AnyObject | AnyArray)[]) {
  return internal_objectMerge(
    {
      next({ target, source, key }) {
        // @ts-expect-error
        return target[key] === undefined || isObject(target[key]) || isArray(target[key]);
      },
      assign({ merge }) {
        return merge();
      },
    },
    target,
    ...sources,
  );
}

/**
 * 从对象中选择指定键的属性，返回一个新的对象。
 *
 * @param object - 要从中选择属性的对象。
 * @param keys - 要选择的键数组。
 * @returns 包含指定键属性的新对象。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = objectPick(obj, ['a', 'c']);
 * console.log(result); // { a: 1, c: 3 }
 * ```
 */
export function objectPick<T extends AnyObject, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * 从对象中排除指定键的属性，返回一个新的对象。
 *
 * @param object - 要从中排除属性的对象。
 * @param keys - 要排除的键数组。
 * @returns 排除指定键属性后的新对象。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3, d: 4 };
 * const result = objectOmit(obj, ['a', 'd']);
 * console.log(result); // { b: 2, c: 3 }
 * ```
 */
export function objectOmit<T extends AnyObject, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key in object) {
    if (!keys.includes(key as unknown as K)) {
      // @ts-expect-error
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * 遍历对象的每个键值对，并对每个键值对执行提供的映射函数，返回一个新的对象。
 *
 * @param object - 要遍历的对象。
 * @param mapper - 对每个键值对执行的映射函数。
 * @returns 返回一个新的对象，其中每个值都是通过映射函数处理后的结果。
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = objectMap(obj, (val, key) => String(val * 2));
 * console.log(result); // { a: '2', b: '4', c: '6' }
 * ```
 */
export function objectMap<T extends AnyObject, V>(
  object: T,
  mapper: (value: T[keyof T], key: keyof T) => V,
): Record<keyof T, V> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      mapper(
        // @ts-expect-error
        value,
        key as keyof T,
      ),
    ]),
  ) as Record<keyof T, V>;
}
