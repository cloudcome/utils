import { isNumber } from '../type';
import { dateFormat } from './core';

export type TTzDateOptions = {
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
   * 时区偏移量，单位为分钟，默认为当前时区
   */
  offset?: number;
};

const TZ_OFFSET_MS = 60 * 1000;

export class TzDate {
  #timestamp: number;
  #targetDate: Date;
  #utcDate: Date;

  #localTZOffset = TzDate.getOffset();
  #localTzOffsetMS = this.#localTZOffset * TZ_OFFSET_MS;

  #targetTzOffset = 0;
  #targetTzOffsetMS = 0;

  #options: TTzDateOptions;

  constructor(options?: TTzDateOptions | TzDate) {
    this.#options = (options instanceof TzDate ? options.#options : options) || {};
    const { offset, timestamp, value } = this.#options;
    this.#targetTzOffset = isNumber(offset) ? offset : this.#localTZOffset;
    this.#targetTzOffsetMS = this.#targetTzOffset * TZ_OFFSET_MS;

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

      this.#timestamp = timestamp + this.#targetTzOffsetMS;
    } else {
      this.#timestamp = timestamp || Date.now();
    }

    this.#targetDate = new Date(this.#timestamp + this.#localTzOffsetMS - this.#targetTzOffsetMS);
    this.#utcDate = new Date(this.#timestamp + this.#localTzOffsetMS);
  }

  #updateTimestamp() {
    this.#timestamp = this.#targetDate.getTime() + this.#targetTzOffsetMS - this.#localTzOffsetMS;
    this.#utcDate = new Date(this.#timestamp + this.#localTzOffsetMS);
  }

  getTimezoneOffset() {
    return this.#targetTzOffset;
  }

  getTimezoneOrder() {
    return TzDate.getOrder(this.#targetTzOffset);
  }

  getFullYear() {
    return this.#targetDate.getFullYear();
  }

  getMonth() {
    return this.#targetDate.getMonth();
  }

  getDate() {
    return this.#targetDate.getDate();
  }

  getHours() {
    return this.#targetDate.getHours();
  }

  getMinutes() {
    return this.#targetDate.getMinutes();
  }

  getSeconds() {
    return this.#targetDate.getSeconds();
  }

  getMilliseconds() {
    return this.#targetDate.getMilliseconds();
  }

  setFullYear(year: number, month?: number, date?: number) {
    this.#targetDate.setFullYear(year);
    this.#updateTimestamp();

    if (isNumber(month)) this.setMonth(month);
    if (isNumber(date)) this.setDate(date);

    return this.getTime();
  }

  setMonth(month: number, date?: number) {
    this.#targetDate.setMonth(month);
    this.#updateTimestamp();

    if (isNumber(date)) this.setDate(date);

    return this.getTime();
  }

  setDate(date: number) {
    this.#targetDate.setDate(date);
    this.#updateTimestamp();

    return this.getTime();
  }

  setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number) {
    this.#targetDate.setHours(hours);
    this.#updateTimestamp();

    if (isNumber(minutes)) this.setMinutes(minutes);
    if (isNumber(seconds)) this.setSeconds(seconds);
    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setMinutes(minutes: number, seconds?: number, milliseconds?: number) {
    this.#targetDate.setMinutes(minutes);
    this.#updateTimestamp();

    if (isNumber(seconds)) this.setSeconds(seconds);
    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setSeconds(seconds: number, milliseconds?: number) {
    this.#targetDate.setSeconds(seconds);
    this.#updateTimestamp();

    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  setMilliseconds(milliseconds: number) {
    this.#targetDate.setMilliseconds(milliseconds);
    this.#updateTimestamp();

    return this.getTime();
  }

  getTime() {
    return this.#timestamp;
  }

  getDay() {
    return this.#targetDate.getDay();
  }

  toISOString() {
    return dateFormat(this.#utcDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
  }

  /**
   * 创建一个 TzDate 对象
   * @param td - 需要转换的日期对象
   * @param offset - 目标时区分钟偏移量，默认为当前时区
   * @returns 返回一个 TzDate 对象
   * @example
   * ```js
   * const tzDate = TzDate.from(new TzDate());
   * ```
   */
  static from(td: TzDate, offset = TzDate.getOffset()) {
    return new TzDate({
      offset: offset,
      timestamp: td.getTime(),
    });
  }

  /**
   * 获取时区序号
   * @param offset - 默认使用当前时区分钟偏移量
   */
  static getOrder(offset = TzDate.getOffset()) {
    return offset / -60;
  }

  /**
   * 获取时区分钟偏移量
   * @param gmtOrder - 默认使用当前时区序号
   */
  static getOffset(gmtOrder?: number) {
    return isNumber(gmtOrder) ? gmtOrder * -60 : new Date().getTimezoneOffset();
  }
}
