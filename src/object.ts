import { isArray, isObject, typeIs } from './is';
import type { AnyArray, AnyObject } from './types';

type ToDict<O extends AnyObject> = {
  [K in `${keyof O & (string | number)}`]: O[K];
};

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
  iterator: (this: O, val: O[K], key: K) => unknown,
): void {
  for (const [key, val] of Object.entries(obj)) {
    if (
      iterator.call(
        obj,
        // @ts-expect-error
        val,
        key,
      ) === false
    ) {
      break;
    }
  }
}

export interface MergeRule {
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
      assign(info) {
        return info.merge();
      },
      next(info) {
        return true;
      },
    },
    target,
    ...sources,
  );
}
