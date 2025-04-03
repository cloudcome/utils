import { objectEach } from './object';
import { isArray, isBoolean, isDate, isNull, isNullish, isNumber, isString, isUndefined } from './type';
import type { AnyObject } from './types';

/**
 * 查询字符串解析函数，返回 undefined 或者 null 则不会添加到对象中。
 */
export type QSReader<T extends AnyObject> = (value: string, key: string, qsObject: T) => unknown;

/**
 * 基于 URLSearchParams 解析查询字符串并将其转换为键值对对象。
 * 查询字符串格式为 `key1=value1&key2=value2`，支持重复键的情况。
 *
 * @param {string} queryString - 要解析的查询字符串。
 * @returns {QSStrictObject} - 解析后的键值对对象。
 * @example
 * ```typescript
 * const params = qsParse('?name=John&age=30&name=Doe');
 * console.log(params); // 输出: { name: ['John', 'Doe'], age: '30' }
 * ```
 */
export function qsParse<T extends AnyObject>(queryString: string, parser?: QSReader<T>): T {
  const qsObject = {} as T;
  const params = queryString.replace(/^\?/, '').split('&');

  for (const param of params) {
    const pairs = param.split('=');
    const key = decodeURIComponent(pairs[0]);
    const val = pairs.length > 1 ? decodeURIComponent(pairs[1]) : '';
    const valFinal = parser ? parser(val, key, qsObject) : val;

    if (isNullish(valFinal)) continue;

    if (Object.hasOwn(qsObject, key)) {
      // @ts-expect-error
      if (!isArray(qsObject[key])) qsObject[key] = [qsObject[key]];
      (qsObject[key] as unknown[]).push(valFinal);
    } else {
      // @ts-expect-error
      qsObject[key] = valFinal;
    }
  }

  return qsObject;
}

export type QSWriter<T extends AnyObject = AnyObject> = (value: unknown, key: string, query: T) => string | null;
const defaultWriter: QSWriter<AnyObject> = (val: unknown) => {
  if (isString(val)) return val;
  if (isNumber(val)) return String(val);
  if (isBoolean(val)) return val ? 'true' : 'false';
  if (isDate(val)) return val.toISOString();
  return null;
};

/**
 * 字符化查询对象，内部使用的是浏览器内置的 URLSearchParams 进行处理
 *
 * @param {AnyObject} qsObject - 要字符化的查询对象。
 * @param {QSWriter} [stringify=defaultReplacer] - 用于替换值的函数，默认为 `defaultReplacer`。
 * @returns {string} - 字符化后的查询字符串。
 * @example
 * ```typescript
 * const query = { name: 'John', age: 30 };
 * const result = qsStringify(query);
 * console.log(result); // 输出: 'name=John&age=30'
 * ```
 */
export function qsStringify<T extends AnyObject>(qsObject: T, stringify: QSWriter<T> = defaultWriter): string {
  const pairs: string[] = [];
  const stringifyPair = (val: unknown, key: string) => {
    const valFinal = stringify(val, String(key), qsObject);

    if (isNullish(valFinal)) return;

    if (isArray(valFinal)) {
      for (const val of valFinal) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(valFinal)}`);
    }
  };

  objectEach(qsObject, (val, key: string) => {
    if (isArray(val)) {
      for (const it of val) {
        stringifyPair(it, key);
      }
    } else {
      stringifyPair(val, key);
    }
  });

  return pairs.join('&');
}
