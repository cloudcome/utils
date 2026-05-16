import { objectEach } from './object';
import { isArray, isBoolean, isDate, isNullish, isNumber, isString } from './type';
import type { AnyObject } from './types';

/**
 * 查询字符串解析函数
 * @template T - 解析后返回的对象类型
 * @callback QSReader
 * @param {string} value - 查询字符串的值
 * @param {string} key - 查询字符串的键
 * @param {T} qsObject - 当前解析的对象
 * @returns {unknown} 解析后的值，如果返回 undefined 或 null 则不会添加到对象中
 * @example
 * const parser: QSReader<MyObject> = (value, key, obj) => {
 *   if (key === 'date') return new Date(value);
 *   return value;
 * };
 */
export type QSReader<T extends AnyObject> = (value: string, key: string, qsObject: T) => unknown;

/**
 * 解析查询字符串为对象
 * @template T - 返回的对象类型
 * @param {string} queryString - 要解析的查询字符串
 * @param {QSReader<T>} [parser] - 自定义解析函数
 * @returns {T} 解析后的对象
 * @example
 * const obj = qsParse('name=John&age=30');
 * // { name: 'John', age: '30' }
 *
 * const obj2 = qsParse('date=2023-01-01', (val, key) => {
 *   if (key === 'date') return new Date(val);
 *   return val;
 * });
 * // { date: Date('2023-01-01') }
 */
export function qsParse<T extends AnyObject>(queryString: string, parser?: QSReader<T>): T {
  // 添加 globalThis 是便于对接外部环境 URL 的自行实现
  // 例如在 uni-app、微信小程序等运行环境。
  const sp = new globalThis.URLSearchParams(queryString.replace(/^.*\?/, ''));
  const qsObject = {} as T;

  for (const [key, val] of sp.entries()) {
    const valFinal = parser ? parser(val, key, qsObject) : val;

    if (isNullish(valFinal)) continue;

    if (Object.hasOwn(qsObject, key)) {
      // @ts-expect-error
      if (!isArray(qsObject[key])) qsObject[key] = [qsObject[key]];
      (qsObject[key] as unknown[]).push(val);
    } else {
      // @ts-expect-error
      qsObject[key] = valFinal;
    }
  }

  return qsObject;
}

/**
 * 查询字符串序列化函数
 * @template T - 要序列化的对象类型
 * @callback QSWriter
 * @param {unknown} value - 要序列化的值
 * @param {string} key - 对象的键
 * @param {T} query - 当前序列化的对象
 * @returns {string | null} 序列化后的字符串，如果返回 null 则忽略该键值对
 * @example
 * const writer: QSWriter<MyObject> = (val, key) => {
 *   if (val instanceof Date) return val.toISOString();
 *   return String(val);
 * };
 */
export type QSWriter<T extends AnyObject = AnyObject> = (value: unknown, key: string, query: T) => string | null;
const defaultWriter: QSWriter<AnyObject> = (val: unknown) => {
  if (isString(val)) return val;
  if (isNumber(val)) return String(val);
  if (isBoolean(val)) return val ? 'true' : 'false';
  if (isDate(val)) return val.toISOString();
  return null;
};

/**
 * 将对象序列化为查询字符串
 * @template T - 要序列化的对象类型
 * @param {T} qsObject - 要序列化的对象
 * @param {QSWriter<T>} [stringify=defaultWriter] - 自定义序列化函数
 * @returns {string} 序列化后的查询字符串
 * @example
 * const str = qsStringify({ name: 'John', age: 30 });
 * // 'name=John&age=30'
 *
 * const str2 = qsStringify({ date: new Date('2023-01-01') });
 * // 'date=2023-01-01T00:00:00.000Z'
 */
export function qsStringify<T extends AnyObject>(qsObject: T, stringify: QSWriter<T> = defaultWriter): string {
  // 添加 globalThis 是便于对接外部环境 URL 的自行实现
  // 例如在 uni-app、微信小程序等运行环境。
  const sp = new globalThis.URLSearchParams();
  const pushPairs = (val: unknown, key: string) => {
    const valFinal = stringify(val, String(key), qsObject);
    if (isNullish(valFinal)) return;

    sp.append(key, valFinal);
  };

  objectEach(qsObject, (val, key: string) => {
    if (isArray(val)) {
      for (const it of val) {
        pushPairs(it, key);
      }
    } else {
      pushPairs(val, key);
    }
  });

  return sp.toString();
}
