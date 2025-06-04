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
  offset?: number;
};

export class TZDate {
  tzOffset = 0;

  #timestamp: number;
  #valueDate: Date;

  #localTZOffsetMS = new Date().getTimezoneOffset() * 60 * 1000;
  #targetTZOffsetMS = 0;

  constructor(options?: TZDateOptions) {
    const { offset = 0, timestamp, value } = options || {};
    this.#targetTZOffsetMS = offset * 60 * 1000;

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

  setFullYear(value: number) {
    this.#valueDate.setFullYear(value);
  }

  setMonth(value: number) {
    this.#valueDate.setMonth(value);
  }

  setDate(value: number) {
    this.#valueDate.setDate(value);
  }

  setHours(value: number) {
    this.#valueDate.setHours(value);
  }

  setMinutes(value: number) {
    this.#valueDate.setMinutes(value);
  }

  setSeconds(value: number) {
    this.#valueDate.setSeconds(value);
  }

  setMilliseconds(value: number) {
    this.#valueDate.setMilliseconds(value);
  }

  getTime() {
    return this.#timestamp;
  }

  static from(td: TZDate, timeZoneOffset = 0) {
    return new TZDate({
      offset: timeZoneOffset,
      timestamp: td.getTime(),
    });
  }

  static GMT(gmt: number) {
    return -1 * gmt * 60;
  }
}

// export function createTZDate(tzOffset: number) {}
