import type { AnyArray, AnyAsyncFunction, AnyFunction, AnyObject } from './types';

/**
 * 获取未知类型的类型名称
 * @param unknown - 未知类型的值
 * @returns 类型名称字符串
 */
export function typeIs(
  unknown: unknown,
):
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'function'
  | 'null'
  | 'undefined'
  | 'symbol'
  | 'bigint'
  | 'error'
  | 'promise'
  | string {
  return Object.prototype.toString.call(unknown).slice(8, -1).toLowerCase();
}

/**
 * 检查值是否为字符串
 * @param unknown - 未知类型的值
 * @returns 如果值为字符串则返回 true，否则返回 false
 */
export function isString(unknown: unknown): unknown is string {
  return typeof unknown === 'string';
}

/**
 * 检查值是否为布尔值
 * @param unknown - 未知类型的值
 * @returns 如果值为布尔值则返回 true，否则返回 false
 */
export function isBoolean(unknown: unknown): unknown is boolean {
  return typeof unknown === 'boolean';
}

/**
 * 检查值是否为符号
 * @param unknown - 未知类型的值
 * @returns 如果值为符号则返回 true，否则返回 false
 */
export function isSymbol(unknown: unknown): unknown is symbol {
  return typeof unknown === 'symbol';
}

/**
 * 检查值是否为大整数
 * @param unknown - 未知类型的值
 * @returns 如果值为大整数则返回 true，否则返回 false
 */
export function isBigInt(unknown: unknown): unknown is bigint {
  return typeof unknown === 'bigint';
}

/**
 * 检查值是否为数字
 * @param unknown - 未知类型的值
 * @returns 如果值为数字且不是 NaN 则返回 true，否则返回 false
 */
export function isNumber(unknown: unknown): unknown is number {
  return typeof unknown === 'number' && !Number.isNaN(unknown);
}

/**
 * 检查值是否为 undefined
 * @param unknown - 未知类型的值
 * @returns 如果值为 undefined 则返回 true，否则返回 false
 */
export function isUndefined(unknown: unknown): unknown is undefined {
  return typeof unknown === 'undefined';
}

/**
 * 检查值是否为 void
 * @param unknown - 未知类型的值
 * @returns 如果值为 undefined 则返回 true，否则返回 false
 */
// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
export function isVoid(unknown: unknown): unknown is void {
  return isUndefined(unknown);
}

/**
 * 永不执行，用于 switch-case/if-else 类型断言
 * @param unknown - 永远不会执行的值
 */
export function isNever(unknown: never) {
  //
}

/**
 * 检查值是否为 null
 * @param unknown - 未知类型的值
 * @returns 如果值为 null 则返回 true，否则返回 false
 */
export function isNull(unknown: unknown): unknown is null {
  return unknown === null;
}

/**
 * 检查值是否为 nullish（null 或 undefined 或 void）
 * @param unknown - 未知类型的值
 * @returns 如果值为 null 或 undefined 或 void 则返回 true，否则返回 false
 */
// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
export function isNullish(unknown: unknown): unknown is null | undefined | void {
  return isNull(unknown) || isUndefined(unknown) || isVoid(unknown);
}

/**
 * 检查值是否为原始类型（null 或 非对象）
 * @param unknown - 未知类型的值
 * @returns 如果值为原始类型则返回 true，否则返回 false
 */
export function isPrimitive(
  unknown: unknown,
): unknown is string | number | boolean | symbol | bigint | null | undefined {
  return isNull(unknown) || !(typeof unknown === 'object' || typeof unknown === 'function');
}

/**
 * 检查值是否为对象
 * @param unknown - 未知类型的值
 * @returns 如果值为对象则返回 true，否则返回 false
 */
export function isObject(unknown: unknown): unknown is AnyObject {
  return typeIs(unknown) === 'object';
}

/**
 * 检查值是否为数组
 * @param unknown - 未知类型的值
 * @returns 如果值为数组则返回 true，否则返回 false
 */
export function isArray(unknown: unknown): unknown is AnyArray {
  return Array.isArray(unknown);
}

/**
 * 检查值是否为函数
 * @param unknown - 未知类型的值
 * @returns 如果值为函数则返回 true，否则返回 false
 */
export function isFunction(unknown: unknown): unknown is AnyFunction {
  return typeof unknown === 'function';
}

/**
 * 检查值是否为异步函数
 * @param unknown - 需要检查的值
 * @returns 如果值为异步函数则返回 true，否则返回 false
 * @example
 * ```typescript
 * async function example() {}
 *
 * isAsyncFunction(example); // true
 * isAsyncFunction(() => {}); // false
 * ```
 */
export function isAsyncFunction(unknown: unknown): unknown is AnyAsyncFunction {
  return isFunction(unknown) && unknown.constructor.name === 'AsyncFunction';
}

/**
 * 检查值是否为 Error 类型
 * @param unknown - 未知类型的值
 * @returns 如果值为 Error 类型则返回 true，否则返回 false
 */
export function isError(unknown: unknown): unknown is Error {
  return unknown instanceof Error;
}

/**
 * 检查值是否为 Promise 类型
 * @param unknown - 未知类型的值
 * @returns 如果值为 Promise 类型则返回 true，否则返回 false
 */
export function isPromise<T>(unknown: unknown): unknown is Promise<T> {
  return typeIs(unknown) === 'promise';
}

/**
 * 检查值是否为 Date 类型
 * @param unknown - 未知类型的值
 * @returns 如果值为 Date 类型则返回 true，否则返回 false
 */
export function isDate(unknown: unknown): unknown is Date {
  return unknown instanceof Date;
}
