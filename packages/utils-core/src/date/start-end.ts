import { type DateLike, type DateValue, dateParse } from './core';

/**
 * 时间单位符号枚举
 * - 'Y': 年
 * - 'M': 月
 * - 'D': 天
 * - 'W': 周
 * - 'h': 小时
 * - 'm': 分钟
 * - 's': 秒
 */
type _TDateOfSymbol = 'Y' | 'M' | 'D' | 'W' | 'h' | 'm' | 's';

/**
 * 各时间单位起始时间映射表
 * 包含将日期设置到单位起始时间的函数
 */
const dateOfStartMap: [_TDateOfSymbol, (date: DateLike) => unknown][] = [
  ['s', (d) => d.setMilliseconds(0)],
  ['m', (d) => d.setSeconds(0)],
  ['h', (d) => d.setMinutes(0)],
  ['D', (d) => d.setHours(0)],
  ['W', (d) => d.setDate(d.getDate() - ((d.getDay() + 6) % 7))],
  ['M', (d) => d.setDate(1)],
  ['Y', (d) => d.setMonth(0)],
];

/**
 * 返回指定时间单位的起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @param symbol - 时间单位符号，可选值为 'Y'（年）、'M'（月）、'W'（周）、'D'（天）、'h'（小时）、'm'（分钟）、's'（秒），默认为 'D'
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
 * // 返回周级起始时间（周一）
 * dateOfStart(date, 'W'); // 2023-06-12 00:00:00.000
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
function _dateStart(dateValue: DateValue, symbol: _TDateOfSymbol = 'D') {
  const date = dateParse(dateValue);

  for (const [sym, fn] of dateOfStartMap) {
    fn(date);
    if (symbol === sym) break;
  }

  return date;
}

/**
 * 返回秒级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回秒级起始时间，毫秒部分为 0
 */
export function dateStartInSecond(dateValue: DateValue) {
  return _dateStart(dateValue, 's');
}

/**
 * 返回分钟级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回分钟级起始时间，秒和毫秒部分为 0
 */
export function dateStartInMinute(dateValue: DateValue) {
  return _dateStart(dateValue, 'm');
}

/**
 * 返回小时级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回小时级起始时间，分钟、秒和毫秒部分为 0
 */
export function dateStartInHour(dateValue: DateValue) {
  return _dateStart(dateValue, 'h');
}

/**
 * 返回天级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回天级起始时间，小时、分钟、秒和毫秒部分为 0
 */
export function dateStartInDay(dateValue: DateValue) {
  return _dateStart(dateValue, 'D');
}

/**
 * 返回周级起始时间（周一 00:00:00.000）
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回当周周一的起始时间，时间部分为 0
 */
export function dateStartInWeek(dateValue: DateValue) {
  return _dateStart(dateValue, 'W');
}

/**
 * 返回月级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回月级起始时间，日期为当月第一天，时间部分为 0
 */
export function dateStartInMonth(dateValue: DateValue) {
  return _dateStart(dateValue, 'M');
}

/**
 * 返回年级起始时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回年级起始时间，月份为 1 月，日期为 1 日，时间部分为 0
 */
export function dateStartInYear(dateValue: DateValue) {
  return _dateStart(dateValue, 'Y');
}

/**
 * 各时间单位结束时间映射表
 * 包含将日期设置到单位结束时间的函数
 */
const dateOfEndMap: [_TDateOfSymbol, (date: DateLike) => unknown][] = [
  ['s', (d) => d.setMilliseconds(999)],
  ['m', (d) => d.setSeconds(59)],
  ['h', (d) => d.setMinutes(59)],
  ['D', (d) => d.setHours(23)],
  ['W', (d) => d.setDate(d.getDate() + ((7 - d.getDay()) % 7))],
  [
    'M',
    (d) => {
      const d2 = dateParse(d);
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
 * @param symbol - 时间单位符号，可选值为 'Y'（年）、'M'（月）、'W'（周）、'D'（天）、'h'（小时）、'm'（分钟）、's'（秒），默认为 'D'
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
 * // 返回周级结束时间（周日）
 * dateOfEnd(date, 'W'); // 2023-06-18 23:59:59.999
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
function _dateEnd(dateValue: DateValue, symbol: _TDateOfSymbol = 'D') {
  const date = dateParse(dateValue);

  for (const [sym, fn] of dateOfEndMap) {
    fn(date);
    if (symbol === sym) break;
  }

  return date;
}

/**
 * 返回秒级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回秒级结束时间，毫秒部分为 999
 */
export function dateEndInSecond(dateValue: DateValue) {
  return _dateEnd(dateValue, 's');
}

/**
 * 返回分钟级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回分钟级结束时间，秒为 59，毫秒为 999
 */
export function dateEndInMinute(dateValue: DateValue) {
  return _dateEnd(dateValue, 'm');
}

/**
 * 返回小时级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回小时级结束时间，分钟为 59，秒为 59，毫秒为 999
 */
export function dateEndInHour(dateValue: DateValue) {
  return _dateEnd(dateValue, 'h');
}

/**
 * 返回天级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回天级结束时间，小时为 23，分钟为 59，秒为 59，毫秒为 999
 */
export function dateEndInDay(dateValue: DateValue) {
  return _dateEnd(dateValue, 'D');
}

/**
 * 返回周级结束时间（周日 23:59:59.999）
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回当周周日的结束时间，时间为 23:59:59.999
 */
export function dateEndInWeek(dateValue: DateValue) {
  return _dateEnd(dateValue, 'W');
}

/**
 * 返回月级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回月级结束时间，日期为当月最后一天，时间为 23:59:59.999
 */
export function dateEndInMonth(dateValue: DateValue) {
  return _dateEnd(dateValue, 'M');
}

/**
 * 返回年级结束时间
 * @param dateValue - 可以是数值、字符串或 Date 对象
 * @returns 返回年级结束时间，月份为 12 月，日期为 31 日，时间为 23:59:59.999
 */
export function dateEndInYear(dateValue: DateValue) {
  return _dateEnd(dateValue, 'Y');
}
