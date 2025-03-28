import { isString } from './is';
import { objectEach } from './object';

/**
 * 判断一个值是否为有效的日期对象
 * @param unknown - 需要判断的值
 * @returns 如果值是有效的日期对象则返回 true，否则返回 false
 * @example
 * ```typescript
 * isValidDate(new Date()); // true
 * isValidDate('2023-01-01'); // false
 * isValidDate(NaN); // false
 * ```
 */
export function isValidDate(unknown: unknown): unknown is Date {
  return unknown instanceof Date && !Number.isNaN(unknown.getTime());
}

export type DateValue = number | string | Date;

const guessDateSeparator = (value: DateValue): Date | undefined => {
  if (!isString(value)) return;

  const value2 = value.replace(/-/g, '/');

  return new Date(value2);
};

const guessDateTimezone = (value: DateValue): Date | undefined => {
  if (!isString(value)) return;

  const re = /([+-])(\d\d)(\d\d)$/;

  const matches = re.exec(value);

  if (!matches) return;

  const value2 = value.replace(re, 'Z');
  const d = new Date(value2);

  if (!isValidDate(d)) return;

  const [, flag, hours, minutes] = matches;
  const hours2 = Number.parseInt(hours, 10);
  const minutes2 = Number.parseInt(minutes, 10);
  const offset = (a: number, b: number): number => (flag === '+' ? a - b : a + b);

  d.setHours(offset(d.getHours(), hours2));
  d.setMinutes(offset(d.getMinutes(), minutes2));

  return d;
};

/**
 * 解析为Date对象
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 解析后的 Date 对象
 * @throws {SyntaxError} 如果无法解析为有效的日期对象，则抛出错误
 * @example
 * ```typescript
 * dateParse('2023-01-01'); // Date对象
 * dateParse(1672531200000); // Date对象
 * dateParse(new Date()); // Date对象
 * dateParse('invalid date'); // 抛出 SyntaxError
 * ```
 */
export function dateParse(dateValue: DateValue): Date {
  const d1 = new Date(dateValue);
  if (isValidDate(d1)) return d1;

  // safari 浏览器的日期解析有问题
  // new Date('2020-06-26 18:06:15') 返回值是一个非法日期对象
  const d2 = guessDateSeparator(dateValue);
  if (isValidDate(d2)) return d2;

  // safari 浏览器的日期解析有问题
  // new Date('2020-06-26T18:06:15.000+0800') 返回值是一个非法日期对象
  const d3 = guessDateTimezone(dateValue);
  if (isValidDate(d3)) return d3;

  throw new SyntaxError(`${dateValue.toString()} 不是一个合法的日期值`);
}

/**
 * 格式化为日期字符串(带自定义格式化模板)
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param format - 模板，默认是 'YYYY-MM-DD HH:mm:ss'，模板字符：
 * - YYYY：年
 * - yyyy: 年
 * - MM：月
 * - DD：日
 * - dd: 日
 * - HH：时（24 小时制）
 * - hh：时（12 小时制）
 * - mm：分
 * - ss：秒
 * - SSS：毫秒
 * @returns 格式化后的日期字符串
 * @example
 * ```typescript
 * dateStringify(new Date(), 'YYYY-MM-DD'); // '2023-01-01'
 * dateStringify(1672531200000, 'YYYY/MM/DD HH:mm:ss'); // '2023/01/01 00:00:00'
 * dateStringify('2023-01-01', 'YYYY年MM月DD日'); // '2023年01月01日'
 * ```
 */
export function dateStringify(dateValue: DateValue, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = dateParse(dateValue);
  const dfns = {
    'Y+': date.getFullYear(), // 年
    'y+': date.getFullYear(), // 年
    'M+': date.getMonth() + 1, // 月
    'D+': date.getDate(), // 日
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'S+': date.getMilliseconds(), // 豪秒
  };
  let result = format;

  objectEach(dfns, (val, key) => {
    const reg = new RegExp(`${key}`, 'g');
    result = result.replace(reg, (source) => String(val).padStart(source.length, '0'));
  });

  return result;
}
