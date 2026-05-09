import {
  DATE_DAY_MS,
  DATE_HOUR_MS,
  DATE_MINUTE_MS,
  DATE_SECOND_MS,
} from '../date';

export type TimeDuration = {
  years: number;
  months: number;
  /** 天数 */
  days: number;
  /** 小时数 */
  hours: number;
  /** 分钟数 */
  minutes: number;
  /** 秒数 */
  seconds: number;
  /** 毫秒数 */
  milliseconds: number;
};

type _TTimeParsePoint = 'D' | 'h' | 'm' | 's' | 'S';

/**
 * 解析时间毫秒数为绝对时间对象
 * @param timeMs 时间毫秒数
 * @param maxPoint 最大时间单位（决定分解的起始单位）
 * @returns 包含时间单位分解结果的对象
 * @example
 * ```typescript
 * // 默认以天为最大单位分解
 * timeInDay(123456789);
 * // { days: 1, hours: 10, minutes: 17, seconds: 36, milliseconds: 789 }
 *
 * // 指定最大单位为分钟，分解到分钟及以下单位
 * timeInMinute(123456789);
 * // { days: 0, hours: 0, minutes: 2057, seconds: 36, milliseconds: 789 }
 * ```
 */
function _timeAbsolute(
  timeMs: number,
  maxPoint: _TTimeParsePoint,
): TimeDuration {
  const minPoint: _TTimeParsePoint = 'S';

  const defines: [
    point: _TTimeParsePoint,
    key: keyof TimeDuration,
    base: number,
  ][] = [
    ['D', 'days', DATE_DAY_MS],
    ['h', 'hours', DATE_HOUR_MS],
    ['m', 'minutes', DATE_MINUTE_MS],
    ['s', 'seconds', DATE_SECOND_MS],
    ['S', 'milliseconds', 1],
  ] as const;

  const minIndex = defines.findIndex((item) => item[0] === maxPoint);
  const maxIndex = defines.findIndex((item) => item[0] === minPoint);

  let timeMsFinal = timeMs;
  const dao: TimeDuration = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };

  for (let i = minIndex; i <= maxIndex; i++) {
    const mode = defines[i];
    const base = mode[2];
    const value = Math.floor(timeMsFinal / base);
    timeMsFinal = timeMsFinal - value * base;
    dao[mode[1]] = value;
  }

  return dao;
}

/**
 * 将时间毫秒数解析为以天为最大单位的绝对时间对象
 * @param timeMs 时间毫秒数
 * @returns 包含天/小时/分钟/秒/毫秒分解结果的对象
 */
export function timeToDays(timeMs: number) {
  return _timeAbsolute(timeMs, 'D');
}

/**
 * 将时间毫秒数解析为以小时为最大单位的绝对时间对象
 * @param timeMs 时间毫秒数
 * @returns 包含小时/分钟/秒/毫秒分解结果的对象
 */
export function timeToHours(timeMs: number) {
  return _timeAbsolute(timeMs, 'h');
}

/**
 * 将时间毫秒数解析为以分钟为最大单位的绝对时间对象
 * @param timeMs 时间毫秒数
 * @returns 包含分钟/秒/毫秒分解结果的对象
 */
export function timeToMinutes(timeMs: number) {
  return _timeAbsolute(timeMs, 'm');
}

/**
 * 将时间毫秒数解析为以秒为最大单位的绝对时间对象
 * @param timeMs 时间毫秒数
 * @returns 包含秒/毫秒分解结果的对象
 */
export function timeToSeconds(timeMs: number) {
  return _timeAbsolute(timeMs, 's');
}
