import { isArray, isObject, isString, typeIs } from '@/type';
import type { AnyArray, AnyFunction, AnyObject } from '@/types';

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

// 移除，原因是，定义对象尽可能的使用 type 关键字即可避开此问题
// /**
//  * 精确对象，常用于联合类型判断
//  * 相关 bug：https://l.ydr.me/Zp88vFKc
//  */
// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// export type ExactObject<T = any> = T extends AnyFunction
//   ? never
//   : T extends AnyArray
//     ? never
//     : T extends object
//       ? T
//       : never;
//
// /**
//  * 检查值是否为精确接口对象
//  * @param object - 传入对象，必须是一个对象与其他类型的联合
//  * @returns 如果值为对象则返回 true，否则返回 false
//  * @example
//  * ```typescript
//  * type Id = string | string[] | (() => string);
//  *
//  * interface Cache {
//  *   id?: Id;
//  * }
//  *
//  * type Share = {
//  *   id?: Id;
//  * }
//  *
//  * interface Options {
//  *   cache?: Id | Cache;
//  *   share?: Id | Share;
//  * }
//  *
//  * function test(options: Options) {
//  *   // string | string[] | (() => string) | Cache | undefined
//  *   const cache = options.cache;
//  *
//  *   // Cache
//  *   // 需要使用
//  *   if (isExactObject(cache)) {
//  *     cache.id;
//  *   }
//  *   // string[]
//  *   else if (isArray(cache)) {
//  *     cache.push();
//  *   }
//  *   // string
//  *   else if (isString(cache)) {
//  *     cache.charCodeAt(0);
//  *   }
//  *   // (() => string) | undefined
//  *   else {
//  *     cache?.();
//  *   }
//  *
//  *   // string | string[] | (() => string) | Share | undefined
//  *   const share = options.share;
//  *
//  *   // Share
//  *   if (isObject(share)) {
//  *     share.id;
//  *   }
//  *   // string[]
//  *   else if (isArray(share)) {
//  *     share.push();
//  *   }
//  *   // string
//  *   else if (isString(share)) {
//  *     share.charCodeAt(0);
//  *   }
//  *   // (() => string) | undefined
//  *   else {
//  *     share?.();
//  *   }
//  * }
//  * ```
//  */
// export function isExactObject<T>(object: T): object is ExactObject<T> {
//   return typeIs(object) === 'object';
// }
