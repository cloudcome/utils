import { objectEach } from './object';
import { isArray, isBoolean, isDate, isNumber, isString, isUndefined } from './type';
import type { AnyObject } from './types';

export type QSValue = string | number;

export interface QSParams {
  [key: string]: QSValue | Array<QSValue>;
}

/**
 * 基于 URLSearchParams 解析查询字符串并将其转换为键值对对象。
 * 查询字符串格式为 `key1=value1&key2=value2`，支持重复键的情况。
 *
 * @param {string} queryString - 要解析的查询字符串。
 * @returns {QSParams} - 解析后的键值对对象。
 * @example
 * ```typescript
 * const params = qsParse('?name=John&age=30&name=Doe');
 * console.log(params); // 输出: { name: ['John', 'Doe'], age: '30' }
 * ```
 */
export function qsParse(queryString: string): QSParams {
  const sp = new URLSearchParams(queryString);
  const result: QSParams = {};

  for (const [key, val] of sp.entries()) {
    if (isUndefined(result[key])) {
      result[key] = val;
      continue;
    }

    if (isArray(result[key])) {
      continue;
    }

    result[key] = sp.getAll(key);
  }

  return result;
}

export type QSStringifyReplacer = (value: unknown) => string | null;
const defaultReplacer: QSStringifyReplacer = (val: unknown) => {
  if (isString(val)) return val;
  if (isNumber(val)) return String(val);
  if (isBoolean(val)) return val ? 'true' : 'false';
  if (isDate(val)) return val.toISOString();
  return null;
};

/**
 * 字符化查询对象，内部使用的是浏览器内置的 URLSearchParams 进行处理
 *
 * @param {AnyObject} query - 要字符化的查询对象。
 * @param {QSStringifyReplacer} [replacer=defaultReplacer] - 用于替换值的函数，默认为 `defaultReplacer`。
 * @returns {string} - 字符化后的查询字符串。
 * @example
 * ```typescript
 * const query = { name: 'John', age: 30 };
 * const result = qsStringify(query);
 * console.log(result); // 输出: 'name=John&age=30'
 * ```
 */
export function qsStringify(query: AnyObject, replacer: QSStringifyReplacer = defaultReplacer): string {
  const sp = new URLSearchParams();

  objectEach(query, (val, key) => {
    if (isArray(val)) {
      for (const item of val) {
        const replaced = replacer(item);

        if (replaced === null) return;

        sp.append(key.toString(), replaced);
      }
    } else {
      const replaced = replacer(val);

      if (replaced === null) return;

      sp.set(key.toString(), replaced);
    }
  });

  return sp.toString();
}
