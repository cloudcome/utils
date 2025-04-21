import { DATE_DAY_MS, DATE_HOUR_MS, DATE_MINUTE_MS, DATE_SECOND_MS } from './const';

/**
 * 时间单位枚举类型
 * - d = 天
 * - h = 小时
 * - m = 分钟
 * - s = 秒
 * - S = 毫秒
 */
export enum EDateAbsoluteSymbol {
  Day = 0,
  Hour = 1,
  Minute = 2,
  Second = 3,
  Millisecond = 4,
}

export interface DateAbsoluteObject {
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
}

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
export function dateAbsolute(
  timeMs: number,
  absoluteRange?: [EDateAbsoluteSymbol] | [EDateAbsoluteSymbol, EDateAbsoluteSymbol],
): DateAbsoluteObject {
  const minPoint: EDateAbsoluteSymbol = absoluteRange?.[0] || EDateAbsoluteSymbol.Millisecond;
  const maxPoint: EDateAbsoluteSymbol = absoluteRange?.[1] || EDateAbsoluteSymbol.Day;

  const defines: [point: EDateAbsoluteSymbol, key: keyof DateAbsoluteObject, base: number][] = [
    [EDateAbsoluteSymbol.Day, 'days', DATE_DAY_MS],
    [EDateAbsoluteSymbol.Hour, 'hours', DATE_HOUR_MS],
    [EDateAbsoluteSymbol.Minute, 'minutes', DATE_MINUTE_MS],
    [EDateAbsoluteSymbol.Second, 'seconds', DATE_SECOND_MS],
    [EDateAbsoluteSymbol.Millisecond, 'milliseconds', 1],
  ] as const;

  let minIndex = defines.findIndex((item) => item[0] === maxPoint);
  let maxIndex = defines.findIndex((item) => item[0] === minPoint);

  minIndex = minIndex === -1 ? 0 : minIndex;
  maxIndex = maxIndex === -1 ? defines.length - 1 : maxIndex;

  if (minIndex > maxIndex) {
    [minIndex, maxIndex] = [maxIndex, minIndex];
  }

  let timeMsFinal = timeMs;
  const dao: DateAbsoluteObject = {
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
