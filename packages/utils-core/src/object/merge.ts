import { isArray, isObject, typeIs } from '@/type';
import type { AnyArray, AnyObject } from '@/types';
import { objectEach } from './each';

export type ObjectMergeRule = {
  /**
   * 处理冲突
   * @param target - 目标对象
   * @param source - 源对象
   * @param key - 键名
   * @returns 返回 true 表示继续处理，否则返回 false
   */
  next: (info: { target: AnyObject | AnyArray; source: AnyObject | AnyArray; key: string | number }) => boolean;

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
    merge: () => unknown;
  }) => unknown;
};

function _objectMerge(mergeRule: ObjectMergeRule, target: AnyObject | AnyArray, ...sources: (AnyObject | AnyArray)[]) {
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
  const each = (
    source: AnyObject | AnyArray,
    // biome-ignore lint/suspicious/noExplicitAny: 内部使用 any
    iterator: (val: any, key: string | number) => void,
  ) => {
    if (isObject(source)) {
      objectEach(source, iterator);
    } else {
      source.forEach(iterator);
    }
  };

  const merge = (target: AnyObject | AnyArray, source: AnyObject | AnyArray): AnyObject | AnyArray => {
    // 如果循环引用了，则直接返回目标对象
    if (seen.has(source)) {
      // biome-ignore lint/style/noNonNullAssertion: 必须存在
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
  return _objectMerge(
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
 * @param defaults - 默认对象或数组。
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
export function objectDefaults<T extends AnyObject | AnyArray>(target: T, defaults: T): T {
  return _objectMerge(
    {
      next({ target, key }) {
        return (
          // @ts-expect-error
          target[key] === undefined ||
          // @ts-expect-error
          isObject(target[key]) ||
          // @ts-expect-error
          isArray(target[key])
        );
      },
      assign({ merge }) {
        return merge();
      },
    },
    target,
    defaults,
  ) as T;
}
