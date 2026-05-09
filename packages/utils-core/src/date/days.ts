import { DATE_DAY_MS } from './const';
import { type DateValue, dateParse } from './core';
import {
  dateEndInMonth,
  dateEndInYear,
  dateStartInMonth,
  dateStartInYear,
} from './start-end';

/**
 * 计算指定日期所在年或月的天数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param unit - 时间单位符号，可选值为 'Y'（年）、'M'（月），默认为 'M'
 * @returns 返回指定日期所在年或月的天数
 * @example
 * ```typescript
 * dateDays(new Date('2023-02-15')); // 28
 * dateDays(new Date('2024-02-15')); // 29 (闰年)
 * dateDays(new Date('2023-02-15'), 'Y'); // 365
 * dateDays(new Date('2024-02-15'), 'Y'); // 366 (闰年)
 * ```
 */
function _dateDays(dateValue: DateValue, unit: 'Y' | 'M') {
  const d = dateParse(dateValue);
  const ds = unit === 'M' ? dateStartInMonth(d) : dateStartInYear(d);
  const de = unit === 'M' ? dateEndInMonth(d) : dateEndInYear(d);
  return Math.ceil((de.getTime() - ds.getTime()) / DATE_DAY_MS);
}

/**
 * 计算指定日期所在月份的天数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回指定日期所在月份的天数
 * @example
 * ```typescript
 * dateDaysInMonth(new Date('2023-02-15')); // 28
 * dateDaysInMonth(new Date('2024-02-15')); // 29 (闰年)
 * ```
 */
export function dateDaysInMonth(dateValue: DateValue) {
  return _dateDays(dateValue, 'M');
}

/**
 * 计算指定日期所在年份的天数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回指定日期所在年份的天数
 * @example
 * ```typescript
 * dateDaysInYear(new Date('2023-02-15')); // 365
 * dateDaysInYear(new Date('2024-02-15')); // 366 (闰年)
 * ```
 */
export function dateDaysInYear(dateValue: DateValue) {
  return _dateDays(dateValue, 'Y');
}
