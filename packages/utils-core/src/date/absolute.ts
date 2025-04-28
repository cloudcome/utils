import { DATE_DAY_MS, DATE_HOUR_MS, DATE_MINUTE_MS, DATE_SECOND_MS } from './const';

export type TDateAbsoluteObject = {
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

type _TAbsolutePoint = 'D' | 'h' | 'm' | 's' | 'S';

/**
 * 解析时间毫秒数为绝对时间对象
 * @param timeMs - 时间毫秒数
 * @param absoluteRange - 可选的时间范围，指定解析的最小和最大时间单位
 * @returns 返回解析后的时间对象，包含天、小时、分钟、秒和毫秒
 * @example
 * ```typescript
 * // 默认解析精度为毫秒-天
 * timeParse(123456789);
 * // { days: 1, hours: 10, minutes: 17, seconds: 36, milliseconds: 789 }
 *
 * // 指定解析精度为小时和分钟，
 * // 小时数 = 1天(24小时) + 10小时 = 34小时
 * timeParse(123456789, ['m', 'h']);
 * // { days: 0, hours: 34, minutes: 17, seconds: 0, milliseconds: 0 }
 * ```
 */
function _dateAbsolute(timeMs: number, maxPoint: _TAbsolutePoint): TDateAbsoluteObject {
  const minPoint: _TAbsolutePoint = 'S';

  const defines: [point: _TAbsolutePoint, key: keyof TDateAbsoluteObject, base: number][] = [
    ['D', 'days', DATE_DAY_MS],
    ['h', 'hours', DATE_HOUR_MS],
    ['m', 'minutes', DATE_MINUTE_MS],
    ['s', 'seconds', DATE_SECOND_MS],
    ['S', 'milliseconds', 1],
  ] as const;

  const minIndex = defines.findIndex((item) => item[0] === maxPoint);
  const maxIndex = defines.findIndex((item) => item[0] === minPoint);

  let timeMsFinal = timeMs;
  const dao: TDateAbsoluteObject = {
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
