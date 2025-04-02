import { numberConvert, randomNumber } from './number';
import { isNumber, isObject, isString, isUndefined } from './type';

export const STRING_ARABIC_NUMERALS = '0123456789';
export const STRING_HEXADECIMAL_NUMERALS = '0123456789ABCDEF';
export const STRING_LOWERCASE_ALPHA = 'abcdefghijklmnopqrstuvwxyz';
export const STRING_UPPERCASE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const STRING_DICT = `${STRING_ARABIC_NUMERALS + STRING_UPPERCASE_ALPHA + STRING_LOWERCASE_ALPHA}`;

/**
 * 将字符串转换为驼峰格式
 * @param {string} string - 要转换的字符串
 * @param {boolean} [bigger] - 是否大写第一个字母，默认为 false
 * @returns {string} - 转换后的驼峰格式字符串
 */
export function stringCamelCase(string: string, bigger?: boolean): string {
  const string2 = string.replace(/[\s_-](.)/g, (_, char) => (char as string).toUpperCase());
  return bigger ? string2.slice(0, 1).toUpperCase() + string2.slice(1) : string2;
}

/**
 * 将字符串转换为连字格式
 * @param {string} string - 要转换的字符串
 * @param {string} [separator] - 分隔符，默认是 "-"（短横线）
 * @returns {string} - 转换后的连字格式字符串
 */
export function stringKebabCase(string: string, separator = '-'): string {
  return string.replace(/[A-Z]/g, (origin) => `${separator}${origin.toLowerCase()}`);
}

/**
 * 生成随机字符串
 * @param {number} length - 生成的随机字符串长度
 * @param {string} [dict] - 用于生成随机字符串的字符字典，默认为数字、小写字母和大写字母的组合
 * @returns {string} - 生成的随机字符串
 * @example
 * randomString(10); // 生成一个长度为 10 的随机字符串
 * randomString(8, 'ABCDEF'); // 生成一个长度为 8 的随机字符串，仅包含字符 'ABCDEF'
 */
export function randomString(length: number, dict?: string): string {
  const dictFinal = dict || STRING_DICT;
  const dictLength = dictFinal.length;

  let result = '';

  for (let i = 0; i < length; i++) {
    result += dictFinal.charAt(randomNumber(0, dictLength - 1));
  }

  return result;
}

/**
 * 简单的模板引擎，类似于 Python 的 `.format()` 方法
 * 支持通过索引或对象/名称的方式传递变量
 * 当使用对象/名称方式时，可以传递一个回退值作为第三个参数
 *
 * @category 字符串
 * @example
 * ```
 * // 索引方式
 * const result = stringFormat(
 *   '你好 {0}！我的名字是 {1}。',
 *   '张三',
 *   '李四'
 * ); // 你好 张三！我的名字是 李四。
 * ```
 *
 * @example
 * ```
 * // 对象方式
 * const result = stringFormat(
 *   '{greet}！我的名字是 {name}。',
 *   { greet: '你好', name: '王五' }
 * ); // 你好！我的名字是 王五。
 * ```
 *
 * @example
 * ```
 * // 带回退值的对象方式
 * const result = stringFormat(
 *   '{greet}！我的名字是 {name}。',
 *   { greet: '你好' }, // name 未传递，因此会使用回退值
 *   '未知'
 * ); // 你好！我的名字是 未知。
 * ```
 */
export function stringFormat(
  str: string,
  object: Record<string | number, unknown>,
  fallback?: string | ((key: string) => string),
): string;
export function stringFormat(str: string, ...args: (string | number | bigint | undefined | null)[]): string;
export function stringFormat(str: string, ...args: unknown[]): string {
  const [firstArg, fallback] = args;

  if (isObject(firstArg) || isUndefined(firstArg)) {
    const vars = firstArg || {};
    return str.replace(
      /\{(\w+)\}/g,
      (_, key) => vars[key] || ((typeof fallback === 'function' ? fallback(key) : fallback) ?? key),
    );
  }

  return str.replace(/\{(\d+)\}/g, (_, key) => {
    const index = Number(key);
    if (Number.isNaN(index)) return key;
    return args[index];
  });
}

/**
 * 生成符合 [RFC 4122](https://www.ietf.org/rfc/rfc4122.txt) 版本 4 的 UUID 字符串
 * @returns {string} - 生成的 UUID 字符串
 * @example
 * const uuid = randomUUID4();
 * console.log(uuid); // 输出类似 '123e4567-e89b-12d3-a456-426614174000' 的 UUID 字符串
 */
export function randomUUID4(): string {
  const supportURLCreateObjectURL = typeof URL === 'function';
  const supportBlob = typeof Blob === 'function';
  const template = 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx';

  if (supportURLCreateObjectURL && supportBlob) {
    const blobURL = URL.createObjectURL(new Blob());
    URL.revokeObjectURL(blobURL);
    return blobURL.slice(-template.length);
  }

  let result = '';

  for (let i = 0; i < template.length; i++) {
    const rnd = randomNumber(0, 15);
    result += template[i] === '-' || template[i] === '4' ? template[i] : STRING_HEXADECIMAL_NUMERALS[rnd];
  }

  return result;
}

/**
 * 生成唯一字符串，结合时间戳和随机字符串
 * @param {number} [minLength] - 生成字符串的最小长度，默认为时间戳的长度
 * @param {string} [dict] - 用于生成随机字符串的字符字典，默认为数字、小写字母和大写字母的组合
 * @returns {string} - 生成的唯一字符串
 * @example
 * uniqueString(10); // 生成一个长度至少为 10 的唯一字符串
 * uniqueString(8, 'ABCDEF'); // 生成一个长度至少为 8 的唯一字符串，该字符串仅包含字符 'ABCDEF'
 */
export function uniqueString(minLength: number, dict: string): string;
export function uniqueString(minLength?: number): string;
export function uniqueString(dict?: string): string;
export function uniqueString(minLength?: number | string, dict?: string): string {
  const dictFinal = isString(minLength) ? minLength : dict || STRING_DICT;
  const timestamp = numberConvert(Date.now(), dictFinal);
  const minLengthFinal = isNumber(minLength) ? minLength : timestamp.length;
  const randomPart = randomString(Math.max(minLengthFinal - timestamp.length, 0), dictFinal);
  return timestamp + randomPart;
}
