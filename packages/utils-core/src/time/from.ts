// @rer https://day.js.org/docs/en/durations/creating

import { DATE_DAY_MS, DATE_HOUR_MS, DATE_MINUTE_MS, DATE_SECOND_MS } from '@/date';

/**
 * 时间转换规则数组
 * @type {Array<[RegExp, (match: RegExpMatchArray) => number]>}
 * @property {RegExp} 0 - 匹配时间单位正则表达式
 * @property {function} 1 - 将匹配结果转换为毫秒数的函数
 */
const rules: [RegExp, (match: RegExpMatchArray) => number][] = [
  [/(\d+)y/i, (match) => Number(match[1]) * DATE_DAY_MS * 365],
  [/(\d+)M/, (match) => Number(match[1]) * DATE_DAY_MS * 30],
  [/(\d+)d/i, (match) => Number(match[1]) * DATE_DAY_MS],
  [/(\d+)h/i, (match) => Number(match[1]) * DATE_HOUR_MS],
  [/(\d+)m/, (match) => Number(match[1]) * DATE_MINUTE_MS],
  [/(\d+)s/, (match) => Number(match[1]) * DATE_SECOND_MS],
];

/**
 * 将时间字符串转换为毫秒数
 * @param {string} duration - 时间字符串，例如 '1d2h30m'
 * @returns {number} 对应的毫秒数
 * @example
 * timeFrom('1d2h30m') // 返回 95400000
 */
export function timeFrom(duration: string) {
  let ms = 0;

  for (const [regex, fn] of rules) {
    const match = duration.match(regex);
    if (match) ms += fn(match);
  }

  return ms;
}
