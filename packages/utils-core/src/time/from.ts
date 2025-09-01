// @rer https://day.js.org/docs/en/durations/creating

import { DATE_DAY_MS, DATE_HOUR_MS, DATE_MINUTE_MS, DATE_MONTH_MS, DATE_SECOND_MS, DATE_YEAR_MS } from '@/date';
import { isString } from '@/type';
import type { TimeDuration } from './to';

/**
 * 时间转换规则数组
 * @type {Array<[RegExp, (match: RegExpMatchArray) => number]>}
 * @property {RegExp} 0 - 匹配时间单位正则表达式
 * @property {function} 1 - 将匹配结果转换为毫秒数的函数
 */
const rules: [key: keyof TimeDuration, time: number][] = [
  ['years', DATE_YEAR_MS],
  ['months', DATE_MONTH_MS],
  ['days', DATE_DAY_MS],
  ['hours', DATE_HOUR_MS],
  ['minutes', DATE_MINUTE_MS],
  ['seconds', DATE_SECOND_MS],
];

/**
 * 将时间持续时间字符串或对象转换为毫秒数
 *
 * @param duration - 可以是时间持续时间字符串（如 '1d2h'）或 TimeDuration 对象
 * @returns 计算得到的总毫秒数
 */
export function timeFrom(duration: string | TimeDuration) {
  const td = isString(duration) ? timeParse(duration) : duration;
  return rules.reduce((acc, [key, time]) => acc + (td[key] || 0) * time, 0);
}

const durationMatchRules: [RegExp, key: keyof TimeDuration][] = [
  [/(\d+)y/i, 'years'],
  [/(\d+)M/, 'months'],
  [/(\d+)d/i, 'days'],
  [/(\d+)h/i, 'hours'],
  [/(\d+)m/, 'minutes'],
  [/(\d+)s/, 'seconds'],
];

/**
 * 将时长字符串解析为时间对象
 * @param duration - 时长字符串（例如 "1h30m"）
 * @returns 包含解析后时间单位的对象（小时、分钟等）
 */
export function timeParse(duration: string) {
  const result = {} as TimeDuration;

  for (const [regex, key] of durationMatchRules) {
    const match = duration.match(regex);
    if (match) result[key] = Number(match[1]);
    else result[key] = 0;
  }

  return result;
}
