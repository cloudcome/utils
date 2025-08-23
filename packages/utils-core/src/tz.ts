import { isNumber } from './type';

export type TZDateOptions = {
  /**
   * 时间戳
   * @default Date.now()
   */
  timestamp?: number;

  /**
   * 日期值
   */
  value?: readonly [
    year?: number,
    month?: number,
    day?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    milliseconds?: number,
  ];

  /**
   * 时区偏移量，单位为分钟
   * @default 0
   */
  offsetMinutes?: number;
};

export class TZDate extends Date {
  tzOffset = 0;

  #timestamp: number;
  #valueDate: Date;

  #localTZOffsetMS = TZDate.toGmtOffset() * 60 * 1000;
  #targetTZOffset = 0;
  #targetTZOffsetMS = 0;

  constructor(options?: TZDateOptions) {
    super();
    const { offsetMinutes = 0, timestamp, value } = options || {};
    this.#targetTZOffset = offsetMinutes;
    this.#targetTZOffsetMS = offsetMinutes * 60 * 1000;

    if (Array.isArray(value) && value.length > 0) {
      const [fullYear, month, day, hours, minutes, seconds, milliseconds] = value;
      const timestamp = Date.UTC(
        fullYear ?? 0,
        month ?? 0,
        day ?? 1,
        hours ?? 0,
        minutes ?? 0,
        seconds ?? 0,
        milliseconds ?? 0,
      );

      this.#timestamp = timestamp + this.#targetTZOffsetMS;
    } else {
      this.#timestamp = timestamp || Date.now();
    }

    this.#valueDate = new Date(this.#timestamp + this.#localTZOffsetMS - this.#targetTZOffsetMS);
  }

  getTimezoneOffset() {
    return this.#targetTZOffset;
  }

  getFullYear() {
    return this.#valueDate.getFullYear();
  }

  getMonth() {
    return this.#valueDate.getMonth();
  }

  getDate() {
    return this.#valueDate.getDate();
  }

  getHours() {
    return this.#valueDate.getHours();
  }

  getMinutes() {
    return this.#valueDate.getMinutes();
  }

  getSeconds() {
    return this.#valueDate.getSeconds();
  }

  getMilliseconds() {
    return this.#valueDate.getMilliseconds();
  }

  setFullYear(year: number, month?: number, date?: number) {
    this.#valueDate.setFullYear(year);
    if (isNumber(month)) this.#valueDate.setMonth(month);
    if (isNumber(date)) this.#valueDate.setDate(date);

    return this.getTime();
  }

  setMonth(month: number, date?: number) {
    this.#valueDate.setMonth(month);
    if (isNumber(date)) this.#valueDate.setDate(date);

    return this.getTime();
  }

  setDate(date: number) {
    this.#valueDate.setDate(date);

    return this.getTime();
  }

  setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number) {
    this.#valueDate.setHours(hours);
    if (isNumber(minutes)) this.#valueDate.setMinutes(minutes);
    if (isNumber(seconds)) this.#valueDate.setSeconds(seconds);
    if (isNumber(milliseconds)) this.#valueDate.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setMinutes(minutes: number, seconds?: number, milliseconds?: number) {
    this.#valueDate.setMinutes(minutes);
    if (isNumber(seconds)) this.#valueDate.setSeconds(seconds);
    if (isNumber(milliseconds)) this.#valueDate.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setSeconds(seconds: number, milliseconds?: number) {
    this.#valueDate.setSeconds(seconds);
    if (isNumber(milliseconds)) this.#valueDate.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setMilliseconds(milliseconds: number) {
    this.#valueDate.setMilliseconds(milliseconds);

    return this.getTime();
  }

  getTime() {
    return this.#timestamp;
  }

  /**
   * 创建一个 TZDate 对象
   * @param td - 需要转换的日期对象
   * @param timeZoneOffset - 目标时区偏移量，默认为 0 时区
   * @returns 返回一个 TZDate 对象
   * @example
   * ```js
   * const tzDate = TZDate.from(new TZDate());
   * ```
   */
  static from(td: TZDate, timeZoneOffset = 0) {
    return new TZDate({
      offsetMinutes: timeZoneOffset,
      timestamp: td.getTime(),
    });
  }

  /**
   * 获取时区小时偏移量
   * @param offset - 默认使用当前时区分钟偏移量
   */
  static toGmtOrder(offset = new Date().getTimezoneOffset()) {
    return offset / -60;
  }

  /**
   * 获取时区分钟偏移量
   * @param gmtOrder - 默认使用当前时区小时偏移量
   */
  static toGmtOffset(gmtOrder?: number) {
    return isNumber(gmtOrder) ? gmtOrder * -60 : new Date().getTimezoneOffset();
  }
}

// export function createTZDate(tzOffset: number) {}
