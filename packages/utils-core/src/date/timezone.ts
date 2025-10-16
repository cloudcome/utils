import { isNumber } from '../type';
import { dateFormat } from './core';

export type TzDateOptions = {
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

/**
 * 时区偏移量毫秒常量（1分钟 = 60 * 1000 毫秒）
 */
const TZ_OFFSET_MS = 60 * 1000;

/**
 * 时区日期类，用于处理不同时区的日期时间
 */
export class TzDate {
  /**
   * 内部时间戳
   */
  #timestamp: number;

  /**
   * 目标时区的日期对象
   */
  #targetDate: Date;

  /**
   * UTC 日期对象
   */
  #utcDate: Date;

  /**
   * 本地时区偏移量（分钟）
   */
  #localTZOffset = TzDate.getOffset();

  /**
   * 本地时区偏移量（毫秒）
   */
  #localTzOffsetMS = this.#localTZOffset * TZ_OFFSET_MS;

  /**
   * 目标时区偏移量（分钟）
   */
  #targetTzOffset = 0;

  /**
   * 目标时区偏移量（毫秒）
   */
  #targetTzOffsetMS = 0;

  /**
   * 构造函数选项
   */
  #options: TzDateOptions;

  /**
   * 构造一个 TzDate 实例
   * @param options - 配置选项
   */
  constructor(options?: TzDateOptions | TzDate) {
    this.#options =
      (options instanceof TzDate
        ? {
            timestamp: options.getTime(),
            offset: options.getTimezoneOffset(),
          }
        : options) || {};
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

  /**
   * 更新内部时间戳
   */
  #updateTimestamp() {
    this.#timestamp = this.#targetDate.getTime() + this.#targetTzOffsetMS - this.#localTzOffsetMS;
    this.#utcDate = new Date(this.#timestamp + this.#localTzOffsetMS);
  }

  /**
   * 获取时区偏移量（分钟）
   * @returns 时区偏移量
   */
  getTimezoneOffset() {
    return this.#targetTzOffset;
  }

  /**
   * 获取时区序号
   * @returns 时区序号
   */
  getTimezoneOrder() {
    return TzDate.getOrder(this.#targetTzOffset);
  }

  /**
   * 获取年份
   * @returns 年份
   */
  getFullYear() {
    return this.#targetDate.getFullYear();
  }

  /**
   * 获取月份
   * @returns 月份 (0-11)
   */
  getMonth() {
    return this.#targetDate.getMonth();
  }

  /**
   * 获取日期
   * @returns 日期 (1-31)
   */
  getDate() {
    return this.#targetDate.getDate();
  }

  /**
   * 获取小时
   * @returns 小时 (0-23)
   */
  getHours() {
    return this.#targetDate.getHours();
  }

  /**
   * 获取分钟
   * @returns 分钟 (0-59)
   */
  getMinutes() {
    return this.#targetDate.getMinutes();
  }

  /**
   * 获取秒数
   * @returns 秒数 (0-59)
   */
  getSeconds() {
    return this.#targetDate.getSeconds();
  }

  /**
   * 获取毫秒
   * @returns 毫秒 (0-999)
   */
  getMilliseconds() {
    return this.#targetDate.getMilliseconds();
  }

  /**
   * 设置年份
   * @param year - 年份
   * @param month - 月份
   * @param date - 日期
   * @returns 时间戳
   */
  setFullYear(year: number, month?: number, date?: number) {
    this.#targetDate.setFullYear(year);
    this.#updateTimestamp();

    if (isNumber(month)) this.setMonth(month);
    if (isNumber(date)) this.setDate(date);

    return this.getTime();
  }

  /**
   * 设置月份
   * @param month - 月份
   * @param date - 日期
   * @returns 时间戳
   */
  setMonth(month: number, date?: number) {
    this.#targetDate.setMonth(month);
    this.#updateTimestamp();

    if (isNumber(date)) this.setDate(date);

    return this.getTime();
  }

  /**
   * 设置日期
   * @param date - 日期
   * @returns 时间戳
   */
  setDate(date: number) {
    this.#targetDate.setDate(date);
    this.#updateTimestamp();

    return this.getTime();
  }

  /**
   * 设置小时
   * @param hours - 小时
   * @param minutes - 分钟
   * @param seconds - 秒数
   * @param milliseconds - 毫秒
   * @returns 时间戳
   */
  setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number) {
    this.#targetDate.setHours(hours);
    this.#updateTimestamp();

    if (isNumber(minutes)) this.setMinutes(minutes);
    if (isNumber(seconds)) this.setSeconds(seconds);
    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  /**
   * 设置分钟
   * @param minutes - 分钟
   * @param seconds - 秒数
   * @param milliseconds - 毫秒
   * @returns 时间戳
   */
  setMinutes(minutes: number, seconds?: number, milliseconds?: number) {
    this.#targetDate.setMinutes(minutes);
    this.#updateTimestamp();

    if (isNumber(seconds)) this.setSeconds(seconds);
    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  /**
   * 设置秒数
   * @param seconds - 秒数
   * @param milliseconds - 毫秒
   * @returns 时间戳
   */
  setSeconds(seconds: number, milliseconds?: number) {
    this.#targetDate.setSeconds(seconds);
    this.#updateTimestamp();

    if (isNumber(milliseconds)) this.setMilliseconds(milliseconds);

    return this.getTime();
  }

  /**
   * 设置毫秒
   * @param milliseconds - 毫秒
   * @returns 时间戳
   */
  setMilliseconds(milliseconds: number) {
    this.#targetDate.setMilliseconds(milliseconds);
    this.#updateTimestamp();

    return this.getTime();
  }

  /**
   * 获取时间戳
   * @returns 时间戳
   */
  getTime() {
    return this.#timestamp;
  }

  /**
   * 获取星期几
   * @returns 星期几 (0-6, 0表示周日)
   */
  getDay() {
    return this.#targetDate.getDay();
  }

  /**
   * 转换为 ISO 格式的字符串
   * @returns ISO 格式的时间字符串
   */
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
   * @returns 时区序号
   */
  static getOrder(offset = TzDate.getOffset()) {
    return offset / -60;
  }

  /**
   * 获取时区分钟偏移量
   * @param gmtOrder - 默认使用当前时区序号
   * @returns 时区分钟偏移量
   */
  static getOffset(gmtOrder?: number) {
    return isNumber(gmtOrder) ? gmtOrder * -60 : new Date().getTimezoneOffset();
  }
}
