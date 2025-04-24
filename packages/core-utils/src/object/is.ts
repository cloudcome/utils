import { typeIs } from '@/type';
import type { AnyFunction, AnyObject } from '@/types';

/**
 * 检查一个对象是否为空对象（不包含任何自有属性，包括符号属性）。
 *
 * @param obj - 要检查的对象
 * @returns 如果对象没有自有属性（包括符号属性）则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isEmptyObject({}); // true
 * isEmptyObject({ a: 1 }); // false
 * isEmptyObject(Object.create(null)); // true
 * isEmptyObject({ [Symbol('key')]: 'value' }); // false
 * ```
 */
export function isEmptyObject(obj: AnyObject): boolean {
  return Object.getOwnPropertyNames(obj).length === 0 && Object.getOwnPropertySymbols(obj).length === 0;
}

/**
 * 检查一个对象是否为纯对象（通过对象字面量或Object构造函数创建，而非其他构造函数的实例）。
 *
 * @param obj - 要检查的对象
 * @returns 如果是纯对象则返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isPlainObject({}); // true
 * isPlainObject(Object.create(null)); // true
 * isPlainObject(new Date()); // false
 * isPlainObject([]); // false
 * isPlainObject(() => {}); // false
 * ```
 */
export function isPlainObject(obj: AnyObject): boolean {
  const proto: unknown = Object.getPrototypeOf(obj);

  // 对象无原型
  if (!proto) return true;

  // 是否对象直接实例
  return proto === Object.prototype;
}

/**
 * 精确对象，常用于联合类型判断
 * 相关 bug：https://l.ydr.me/Zp88vFKc
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ExactObject<T = any> = T extends AnyFunction ? never : T extends object ? T : never;

// 这里的 ExactObject 类型是为了解决以下场景的兼容性
// interface Cache {
//   id?: string | (() => string);
// }

// interface Options {
//   cache?: string | (() => string) | Cache;
// }

// function isObject(unknown: unknown): unknown is object {
//   return true;
// }

// function isString(unknown: unknown): unknown is string {
//   return true;
// }

// function test(options: Options) {
//   // string | (() => string) | Cache | undefined
//   const cache = options.cache;

//   // Cache
//   if (isObject(cache)) {
//     cache.id;
//   }
//   // string
//   else if (isString(cache)) {
//     cache.length;
//   }
//   // (() => string) | undefined
//   else {
//     cache?.();
//   }

//   // Cache
//   if (isExactObject(cache)) {
//     cache.id;
//   }
//   // string
//   else if (isString(cache)) {
//     cache.length;
//   }
//   // (() => string) | undefined
//   else {
//     cache?.();
//   }
// }

/**
 * 检查值是否为对象
 * @param unknown - 未知类型的值
 * @returns 如果值为对象则返回 true，否则返回 false
 */
export function isExactObject<T>(unknown: T): unknown is ExactObject<T> {
  return typeIs(unknown) === 'object';
}
