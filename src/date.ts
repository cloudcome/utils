import { objectEach } from './object';
import { stringFormat } from './string';
import { isArray, isString } from './type';

export const DATE_SECOND_MS = 1000;
export const DATE_MINUTE_MS = 60 * DATE_SECOND_MS;
export const DATE_HOUR_MS = 60 * DATE_MINUTE_MS;
export const DATE_DAY_MS = 24 * DATE_HOUR_MS;
export const DATE_MONTH_MS = 30 * DATE_DAY_MS;
export const DATE_YEAR_MS = 365 * DATE_DAY_MS;

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
    'M+': date.getMonth() + 1, // 月
    'D+': date.getDate(), // 日
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

export type DateRelativeTemplate = [
  number /*单位时间差，为 0 表示不计算单位差值，单位秒*/,
  number /*最大时间差，单位：秒*/,
  string /*过去模板字符串，%d 表述单位差值*/,
  string? /*将来模板字符串，%d 表述单位差值，可选*/,
];
export type DateRelativeTemplates = DateRelativeTemplate[];

const defaultDiffTemplates: DateRelativeTemplates = [
  [0, 10, '刚刚'],
  [1, 60, '{n} 秒前', '{n} 秒后'],
  [60, 60 * 60, '{n} 分钟前', '{n} 分钟后'],
  [60 * 60, 60 * 60 * 24, '{n} 小时前', '{n} 小时后'],
  [0, 60 * 60 * 24 * 2, '昨天', '明天'],
  [0, 60 * 60 * 24 * 3, '前天', '后天'],
  [60 * 60 * 24, 60 * 60 * 24 * 30, '{n} 天前', '{n} 天后'],
  [0, Number.POSITIVE_INFINITY, 'YYYY年MM月DD日'],
];

/**
 * 相对时间
 * @param {DateValue} dateValue 比较的时间
 * @param {DateValue} [refDateValue] 相对的时间，默认为当前
 * @param {DateRelativeTemplates} [templates] 模板
 * @returns {string} 格式化后的相对时间字符串
 * @example
 * ```typescript
 * // 默认模板
 * dateRelative(new Date('2023-01-01')); // '刚刚'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-02')); // '昨天'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-04')); // '3 天前'
 * dateRelative(new Date('2023-01-01'), new Date('2023-02-01')); // '2023年01月01日'
 * ```
 * @example
 * ```typescript
 * // 自定义模板
 * const templates: DateRelativeTemplates = [
 *   [0, 10, '刚刚'],
 *   [1, 60, '{n} 秒前', '{n} 秒后'],
 *   [60, 60 * 60, '{n} 分钟前', '{n} 分钟后'],
 *   [60 * 60, 60 * 60 * 24, '{n} 小时前', '{n} 小时后'],
 *   [0, 60 * 60 * 24 * 2, '昨天', '明天'],
 *   [0, 60 * 60 * 24 * 3, '前天', '后天'],
 *   [60 * 60 * 24, 60 * 60 * 24 * 30, '{n} 天前', '{n} 天后'],
 *   [0, Number.POSITIVE_INFINITY, 'YYYY年MM月DD日'],
 * ];
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-02'), templates); // '昨天'
 * dateRelative(new Date('2023-01-01'), new Date('2023-01-04'), templates); // '3 天前'
 * dateRelative(new Date('2023-01-01'), new Date('2023-02-01'), templates); // '2023年01月01日'
 * ```
 */
export function dateRelative(dateValue: DateValue, refDateValue: DateValue, templates: DateRelativeTemplates): string;
export function dateRelative(dateValue: DateValue, refDateValue: DateValue): string;
export function dateRelative(dateValue: DateValue, templates: DateRelativeTemplates): string;
export function dateRelative(dateValue: DateValue): string;
export function dateRelative(
  dateValue: DateValue,
  refDateValue?: DateValue | DateRelativeTemplates,
  templates?: DateRelativeTemplates,
): string {
  const now = Date.now();
  const refDateValueFinal = isArray(refDateValue) ? now : refDateValue || now;
  const templatesFinal = isArray(templates) ? templates : isArray(refDateValue) ? refDateValue : defaultDiffTemplates;
  const d1 = dateParse(dateValue);
  const d2 = dateParse(refDateValueFinal);
  const diff = d1.getTime() - d2.getTime();
  const isAgo = diff < 0;
  const absDiff = Math.abs(diff);
  let relative = '';

  for (const [base, max, agoTemplate, featureTemplate] of templatesFinal) {
    const unitFinal = base * 1000;
    const maxFinal = max * 1000;

    if (absDiff < maxFinal) {
      const template = isAgo ? agoTemplate : featureTemplate || agoTemplate;
      const length = unitFinal === 0 ? 0 : Math.max(Math.floor(absDiff / unitFinal), 1);
      relative = unitFinal === 0 ? dateStringify(dateValue, template) : stringFormat(template, { n: length });
      break;
    }
  }

  return relative;
}

export type DateOfSymbol = 'Y' | 'M' | 'D' | 'h' | 'm' | 's';

const dateOfStartMap: [DateOfSymbol, (date: Date) => unknown][] = [
  ['s', (d) => d.setMilliseconds(0)],
  ['m', (d) => d.setSeconds(0)],
  ['h', (d) => d.setMinutes(0)],
  ['D', (d) => d.setHours(0)],
  ['M', (d) => d.setDate(1)],
  ['Y', (d) => d.setMonth(0)],
];

/**
 * 返回指定时间单位的起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param symbol - 时间单位符号，可选值为 'Y'（年）、'M'（月）、'D'（天）、'h'（小时）、'm'（分钟）、's'（秒），默认为 'D'
 * @returns 返回指定时间单位的起始时间
 * @example
 * ```typescript
 * const date = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500
 *
 * // 返回秒级起始时间
 * dateOfStart(date, 's'); // 2023-06-15 12:30:45.000
 *
 * // 返回分钟级起始时间
 * dateOfStart(date, 'm'); // 2023-06-15 12:30:00.000
 *
 * // 返回小时级起始时间
 * dateOfStart(date, 'h'); // 2023-06-15 12:00:00.000
 *
 * // 返回天级起始时间
 * dateOfStart(date, 'D'); // 2023-06-15 00:00:00.000
 *
 * // 返回月级起始时间
 * dateOfStart(date, 'M'); // 2023-06-01 00:00:00.000
 *
 * // 返回年级起始时间
 * dateOfStart(date, 'Y'); // 2023-01-01 00:00:00.000
 *
 * // 默认返回天级起始时间
 * dateOfStart(date); // 2023-06-15 00:00:00.000
 * ```
 */
export function dateOfStart(dateValue: DateValue, symbol: DateOfSymbol = 'D') {
  const date = dateParse(dateValue);

  for (const [sym, fn] of dateOfStartMap) {
    fn(date);
    if (symbol === sym) break;
  }

  return date;
}

const dateOfEndMap: [DateOfSymbol, (date: Date) => unknown][] = [
  ['s', (d) => d.setMilliseconds(999)],
  ['m', (d) => d.setSeconds(59)],
  ['h', (d) => d.setMinutes(59)],
  ['D', (d) => d.setHours(23)],
  [
    'M',
    (d) => {
      const d2 = new Date(d);
      d2.setMonth(d.getMonth() + 1);
      d2.setDate(0);
      d.setDate(d2.getDate());
    },
  ],
  [
    'Y',
    (d) => {
      d.setMonth(11);
      d.setDate(31);
    },
  ],
];

/**
 * 返回指定时间单位的结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param symbol - 时间单位符号，可选值为 'Y'（年）、'M'（月）、'D'（天）、'h'（小时）、'm'（分钟）、's'（秒），默认为 'D'
 * @returns 返回指定时间单位的结束时间
 * @example
 * ```typescript
 * const date = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500
 *
 * // 返回秒级结束时间
 * dateOfEnd(date, 's'); // 2023-06-15 12:30:45.999
 *
 * // 返回分钟级结束时间
 * dateOfEnd(date, 'm'); // 2023-06-15 12:30:59.999
 *
 * // 返回小时级结束时间
 * dateOfEnd(date, 'h'); // 2023-06-15 12:59:59.999
 *
 * // 返回天级结束时间
 * dateOfEnd(date, 'D'); // 2023-06-15 23:59:59.999
 *
 * // 返回月级结束时间
 * dateOfEnd(date, 'M'); // 2023-06-30 23:59:59.999
 *
 * // 返回年级结束时间
 * dateOfEnd(date, 'Y'); // 2023-12-31 23:59:59.999
 *
 * // 默认返回天级结束时间
 * dateOfEnd(date); // 2023-06-15 23:59:59.999
 * ```
 */
export function dateOfEnd(dateValue: DateValue, symbol: DateOfSymbol = 'D') {
  const date = dateParse(dateValue);

  for (const [sym, fn] of dateOfEndMap) {
    fn(date);
    if (symbol === sym) break;
  }

  return date;
}

/**
 * 计算指定日期所在年或月的天数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param symbol - 时间单位符号，可选值为 'Y'（年）、'M'（月），默认为 'M'
 * @returns 返回指定日期所在年或月的天数
 * @example
 * ```typescript
 * dateDays(new Date('2023-02-15')); // 28
 * dateDays(new Date('2024-02-15')); // 29 (闰年)
 * dateDays(new Date('2023-02-15'), 'Y'); // 365
 * dateDays(new Date('2024-02-15'), 'Y'); // 366 (闰年)
 * ```
 */
export function dateDays(dateValue: DateValue, symbol: 'Y' | 'M' = 'M') {
  const d = dateParse(dateValue);
  const ds = dateOfStart(d, symbol);
  const de = dateOfEnd(d, symbol);
  return Math.ceil((de.getTime() - ds.getTime()) / DATE_DAY_MS);
}
