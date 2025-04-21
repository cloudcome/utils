import { DATE_DAY_MS } from './const';
import { type TDateValue, dateParse } from './core';

export enum EWeekStart {
  /**
   * 周日作为一周的起始日
   */
  sunday = 0,
  /**
   * 周一作为一周的起始日
   */
  monday = 1,
  /**
   * 周二作为一周的起始日
   */
  tuesday = 2,
  /**
   * 周三作为一周的起始日
   */
  wednesday = 3,
  /**
   * 周四作为一周的起始日
   */
  thursday = 4,
  /**
   * 周五作为一周的起始日
   */
  friday = 5,
  /**
   * 周六作为一周的起始日
   */
  saturday = 6,
  // /**
  //  * 1号所在的周为第一周
  //  */
  // firstDate = 7,
  // /**
  //  * 完整7天表示第一周
  //  */
  // firstFullWeek = 8,
}

/**
 * 计算指定日期所在年份或月份的周数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param type - 计算范围，'Y' 表示年份，'M' 表示月份
 * @param weekStart - 一周的起始日，默认为 0（周日）
 * @returns 返回指定日期所在年份或月份的周数
 * @example
 * ```typescript
 * const date = new Date(2023, 0, 1); // 2023-01-01
 * _dateWeeks(date, 'Y'); // 1 (计算年份的周数)
 * _dateWeeks(date, 'M'); // 1 (计算月份的周数)
 * _dateWeeks(date, 'Y', 1); // 1 (周一作为一周的起始日，计算年份的周数)
 * ```
 */
export function _dateWeeks(dateValue: TDateValue, type: 'Y' | 'M', weekStart: EWeekStart = 0) {
  const date = dateParse(dateValue);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDate = type === 'Y' ? new Date(year, 0, 1) : new Date(year, month, 1);
  const firstWeek = firstDate.getDay();
  const days = Math.ceil((date.getTime() - firstDate.getTime()) / DATE_DAY_MS);

  return Math.ceil((firstWeek + days - weekStart) / 7);
}

/**
 * 计算指定日期所在年份的周数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param weekStart - 一周的起始日，默认为 0（周日）
 * @returns 返回指定日期所在年份的周数
 * @example
 * ```typescript
 * const date = new Date(2023, 0, 1); // 2023-01-01
 * weeksOfYear(date); // 1
 * weeksOfYear(date, 1); // 1 (周一作为一周的起始日)
 * ```
 */
export function weeksOfYear(dateValue: TDateValue, weekStart: EWeekStart = 0) {
  return _dateWeeks(dateValue, 'Y', weekStart);
}

/**
 * 计算指定日期所在月份的周数
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param weekStart - 一周的起始日，默认为 0（周日）
 * @returns 返回指定日期所在月份的周数
 * @example
 * ```typescript
 * const date = new Date(2023, 0, 1); // 2023-01-01
 * weeksOfMonth(date); // 1
 * weeksOfMonth(date, 1); // 1 (周一作为一周的起始日)
 * ```
 */
export function weeksOfMonth(dateValue: TDateValue, weekStart: EWeekStart = 0) {
  return _dateWeeks(dateValue, 'M', weekStart);
}
