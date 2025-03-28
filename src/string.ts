import { randomNumber } from './number';

export const STRING_ARABIC_NUMERALS = '0123456789';
export const STRING_LOWERCASE_ALPHA = 'abcdefghijklmnopqrstuvwxyz';
export const STRING_UPPERCASE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
  const dictFinal = dict || STRING_ARABIC_NUMERALS + STRING_LOWERCASE_ALPHA + STRING_UPPERCASE_ALPHA;
  const dictLength = dictFinal.length;

  let result = '';

  for (let i = 0; i < length; i++) {
    result += dictFinal.charAt(randomNumber(0, dictLength - 1));
  }

  return result;
}
