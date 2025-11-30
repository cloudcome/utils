import { objectEach } from '@/object';
import { isDate, isString } from '@/type';
import { TimezoneDate } from './timezone';

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
export function isValidDate(unknown: unknown): unknown is Date | TimezoneDate {
  return (
    (unknown instanceof Date && !Number.isNaN(unknown.getTime())) ||
    (unknown instanceof TimezoneDate && !Number.isNaN(unknown.getTime()))
  );
}

export type DateLike = Date | TimezoneDate;
export type DateValue = number | string | DateLike;

function _guessDateSeparator(value: DateValue): Date | undefined {
  if (!isString(value)) return;

  const value2 = value.replace(/-/g, '/');

  return new Date(value2);
}

function _guessDateTimezone(value: DateValue): Date | undefined {
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
}

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
export function dateParse(dateValue: DateValue): DateLike {
  // 传入的 Date 对象有 Date、TimezoneDate
  // @ts-ignore
  const d1 = isDate(dateValue)
    ? new Date(dateValue)
    : dateValue instanceof TimezoneDate
      ? new TimezoneDate(dateValue)
      : new Date(dateValue);
  if (isValidDate(d1)) return d1;

  // safari 浏览器的日期解析有问题
  // new Date('2020-06-26 18:06:15') 返回值是一个非法日期对象
  const d2 = _guessDateSeparator(dateValue);
  if (isValidDate(d2)) return d2;

  // safari 浏览器的日期解析有问题
  // new Date('2020-06-26T18:06:15.000+0800') 返回值是一个非法日期对象
  const d3 = _guessDateTimezone(dateValue);
  if (isValidDate(d3)) return d3;

  throw new SyntaxError(`${dateValue.toString()} 不是一个合法的日期值`);
}

function _pad(num: number, len = 2) {
  return `${num}`.padStart(len, '0');
}

const rules: [RegExp, (date: DateLike) => number | string][] = [
  [/Y{4}/gi, (date) => date.getFullYear()],
  [/Y{2}/gi, (date) => date.getFullYear() % 100],
  [/M{2}/g, (date) => _pad(date.getMonth() + 1)],
  [/M{1}/g, (date) => date.getMonth() + 1],
  [/D{2}/gi, (date) => _pad(date.getDate())],
  [/D{1}/gi, (date) => date.getDate()],
  [/H{2}/g, (date) => _pad(date.getHours())],
  [/H{1}/g, (date) => date.getHours()],
  [
    /h{2}/g,
    (date) => {
      const h = date.getHours();
      return _pad(h > 12 ? h - 12 : h);
    },
  ],
  [
    /h{1}/g,
    (date) => {
      const h = date.getHours();
      return h > 12 ? h - 12 : h;
    },
  ],
  [/m{2}/g, (date) => _pad(date.getMinutes())],
  [/m{1}/g, (date) => date.getMinutes()],
  [/s{2}/g, (date) => _pad(date.getSeconds())],
  [/s{1}/g, (date) => date.getSeconds()],
  [/S{3}/g, (date) => _pad(date.getMilliseconds(), 3)],
  [/S{2}/g, (date) => _pad(date.getMilliseconds(), 2)],
  [/S{1}/g, (date) => date.getMilliseconds()],
];

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
 * dateFormat(new Date(), 'YYYY-MM-DD'); // '2023-01-01'
 * dateFormat(1672531200000, 'YYYY/MM/DD HH:mm:ss'); // '2023/01/01 00:00:00'
 * dateFormat('2023-01-01', 'YYYY年MM月DD日'); // '2023年01月01日'
 * ```
 */
export function dateFormat(dateValue: DateValue, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = dateParse(dateValue);
  let result = format;

  for (const rule of rules) {
    result = result.replace(rule[0], String(rule[1](date)));
  }

  return result;
}
