import type { AnyObject } from '@/types';

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
