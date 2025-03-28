import { isArray, isString } from './is';
import { objectEach } from './object';
import { stringFormat } from './string';

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
export function dateFormat(dateValue: DateValue, format = 'YYYY-MM-DD HH:mm:ss'): string {
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
 *   [0, 1, '刚刚'],
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
      relative = unitFinal === 0 ? dateFormat(dateValue, template) : stringFormat(template, { n: length });
      break;
    }
  }

  return relative;
}
