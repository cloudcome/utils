import { isError, isNullish } from './type';
import type { AnyObject } from './types';

/**
 * 标准化处理 Error 对象，适用于 try-catch
 * @param throwError 接收抛出的错误字符串或者 Error 对象或字符串
 * @returns {Error}
 * @example
 * const error = errorNormalize('这是一个错误');
 * console.log(error.message); // 输出: 这是一个错误
 */
export function errorNormalize<E extends Error | unknown = unknown>(throwError: E) {
  return (
    isError(throwError) ? throwError : new Error(String(isNullish(throwError) ? '' : throwError))
  ) as E extends Error ? E : Error;
}

/**
 * 分配对象到 Error 对象上，适用于扩展 Error 实例，不影响原型和构造函数
 * @param {Error} error
 * @param {E} source
 * @returns {Error & E}
 * @example
 * const error = new Error('原始错误');
 * const extendedError = errorAssign(error, { code: 404, message: '未找到资源' });
 * console.log(extendedError.code); // 输出: 404
 * console.log(extendedError.message); // 输出: 未找到资源
 */
export function errorAssign<E extends AnyObject>(error: Error, source: E): Error & E {
  return Object.assign(error, source) as Error & E;
}
