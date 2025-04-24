import { type TDateValue, dateParse } from './core';

/**
 * 判断给定的年份是否为闰年
 * @param year - 需要判断的年份
 * @returns 如果年份是闰年则返回 true，否则返回 false
 * @example
 * ```typescript
 * isLeapYear(2020); // true
 * isLeapYear(2021); // false
 * isLeapYear(2000); // true
 * isLeapYear(1900); // false
 * ```
 */
export function isLeapYear(year: number): boolean {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  if (year % 400 !== 0) return false;
  return true;
}

/**
 * 日期比较精度枚举类型
 * - Y = 年
 * - M = 月
 * - D = 天
 * - h = 小时
 * - m = 分钟
 * - s = 秒
 * - S = 毫秒
 */
type _DateSameSymbol = 'Y' | 'M' | 'D' | 'h' | 'm' | 's' | 'S';

/**
 * 比较两个日期在指定精度下是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @param sameSymbol - 比较精度，默认为 'D'（天，即年月日天都相同）
 * @returns 如果两个日期在指定精度下相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15, 12, 30, 45, 500);
 * const date2 = new Date(2023, 5, 15, 13, 30, 45, 500);
 *
 * // 比较年份
 * isSameDate(date1, date2, 'Y'); // true
 *
 * // 比较月份（年份也要相同）
 * isSameDate(date1, date2, 'M'); // true
 *
 * // 比较日期（默认，年份、月份也要相同）
 * isSameDate(date1, date2); // true
 *
 * // 比较小时（年、月、日也要相同）
 * isSameDate(date1, date2, 'h'); // false
 *
 * // 比较分钟（年、月、日、小时也要相同）
 * isSameDate(date1, date2, 'm'); // false
 *
 * // 比较秒（年、月、日、小时、分钟也要相同）
 * isSameDate(date1, date2, 's'); // false
 *
 * // 比较毫秒（年、月、日、小时、分钟、秒数也要相同）
 * isSameDate(date1, date2, 'S'); // false
 * ```
 */
function _isSameDateOf(date1: TDateValue, date2: TDateValue, sameSymbol: _DateSameSymbol = 'D') {
  const defines = [
    ['Y', (d: Date) => d.getFullYear()],
    ['M', (d: Date) => d.getMonth()],
    ['D', (d: Date) => d.getDate()],
    ['h', (d: Date) => d.getHours()],
    ['m', (d: Date) => d.getMinutes()],
    ['s', (d: Date) => d.getSeconds()],
    ['S', (d: Date) => d.getMilliseconds()],
  ] as const;

  const d1 = dateParse(date1);
  const d2 = dateParse(date2);

  for (const [sym, fn] of defines) {
    if (fn(d1) !== fn(d2)) {
      return false;
    }

    if (sym === sameSymbol) break;
  }

  return true;
}

/**
 * 比较两个日期的年份是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15);
 * const date2 = new Date(2023, 6, 20);
 * isSameDateOfYear(date1, date2); // true
 * ```
 */
export function isSameDateOfYear(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'Y');
}

/**
 * 比较两个日期的年份和月份是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份和月份相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15);
 * const date2 = new Date(2023, 5, 20);
 * isSameDateOfMonth(date1, date2); // true
 * ```
 */
export function isSameDateOfMonth(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'M');
}

/**
 * 比较两个日期的年份、月份和天数是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份、月份和天数相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15);
 * const date2 = new Date(2023, 5, 15);
 * isSameDateOfDay(date1, date2); // true
 * ```
 */
export function isSameDateOfDay(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'D');
}

/**
 * 比较两个日期的年份、月份、天数和小时是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份、月份、天数和小时相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15, 12);
 * const date2 = new Date(2023, 5, 15, 12);
 * isSameDateOfHour(date1, date2); // true
 * ```
 */
export function isSameDateOfHour(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'h');
}

/**
 * 比较两个日期的年份、月份、天数、小时和分钟是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份、月份、天数、小时和分钟相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15, 12, 30);
 * const date2 = new Date(2023, 5, 15, 12, 30);
 * isSameDateOfMinute(date1, date2); // true
 * ```
 */
export function isSameDateOfMinute(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'm');
}

/**
 * 比较两个日期的年份、月份、天数、小时、分钟和秒数是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份、月份、天数、小时、分钟和秒数相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15, 12, 30, 45);
 * const date2 = new Date(2023, 5, 15, 12, 30, 45);
 * isSameDateOfSecond(date1, date2); // true
 * ```
 */
export function isSameDateOfSecond(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 's');
}

/**
 * 比较两个日期的年份、月份、天数、小时、分钟、秒数和毫秒数是否相同
 * @param date1 - 第一个日期，可以是数值、字符串或 Date 对象
 * @param date2 - 第二个日期，可以是数值、字符串或 Date 对象
 * @returns 如果两个日期的年份、月份、天数、小时、分钟、秒数和毫秒数相同则返回 true，否则返回 false
 * @example
 * ```typescript
 * const date1 = new Date(2023, 5, 15, 12, 30, 45, 500);
 * const date2 = new Date(2023, 5, 15, 12, 30, 45, 500);
 * isSameDateOfMillisecond(date1, date2); // true
 * ```
 */
export function isSameDateOfMillisecond(date1: TDateValue, date2: TDateValue) {
  return _isSameDateOf(date1, date2, 'S');
}
