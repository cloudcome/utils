import { dateFormat, TimezoneDate } from '@/date';

const utcOrder = TimezoneDate.getUTCOffset();
console.log(`当前时区 GMT${utcOrder > 0 ? '+' : ''}${utcOrder}`);

describe('0 时区', () => {
  const utcOffset = 0;

  it('空入参', () => {
    // 时间戳与时区无关
    const tzNow = new TimezoneDate({ utcOffset }).getTime();
    const now = Date.now();
    expect(tzNow).toBeLessThanOrEqual(now);
    // 误差小于 10ms
    expect(tzNow).toBeGreaterThanOrEqual(now - 10);
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    const td = new TimezoneDate({ utcOffset, timestamp: now });
    const dt = new Date(now);

    expect(td.getTime()).toBe(dt.getTime());
    expect(td.getUTCOffset()).toBe(0);
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = 0;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;
    const td = new TimezoneDate({ utcOffset, value });

    expect(td.toISOString()).toEqual('2025-06-03T12:34:56.789Z');

    // 0 时区与 UTC 时间戳一致
    expect(td.getTime()).toBe(Date.UTC(...value) + targetOffset);
    expect(td.getTime()).toBe(
      new Date(...value).getTime() - localOffset + targetOffset,
    );

    expect([
      td.getFullYear(),
      td.getMonth(),
      td.getDate(),
      td.getHours(),
      td.getMinutes(),
      td.getSeconds(),
      td.getMilliseconds(),
    ]).toEqual(value);

    td.setFullYear(2024);
    expect(td.getFullYear()).toBe(2024);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setMonth(5);
    expect(td.getMonth()).toBe(5);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setDate(10);
    expect(td.getDate()).toBe(10);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setHours(12);
    expect(td.getHours()).toBe(12);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setMinutes(30);
    expect(td.getMinutes()).toBe(30);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setSeconds(45);
    expect(td.getSeconds()).toBe(45);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));

    td.setMilliseconds(100);
    expect(td.getMilliseconds()).toBe(100);
    expect(td.getTime()).toEqual(getUtcTimestamp(td));
  });
});

describe('东 8 时区', () => {
  const utcOffset = 8;

  it('空入参', () => {
    // 时间戳与时区无关
    const tzNow = new TimezoneDate({ utcOffset }).getTime();
    const now = Date.now();
    expect(tzNow).toBeLessThanOrEqual(now);
    // 误差小于 10ms
    expect(tzNow).toBeGreaterThanOrEqual(now - 10);
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    const td = new TimezoneDate({ utcOffset, timestamp: now });
    const dt = new Date(now);

    expect(td.getTime()).toBe(dt.getTime());
    expect(td.getUTCOffset()).toBe(8);
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = TimezoneDate.getTimezoneOffset(utcOffset) * 60 * 1000;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;
    const td = new TimezoneDate({ utcOffset, value });

    expect(td.toISOString()).toEqual('2025-06-03T04:34:56.789Z');

    // 0 时区与 UTC 时间戳一致
    expect(td.getTime()).toBe(Date.UTC(...value) + targetOffset);
    expect(td.getTime()).toBe(
      new Date(...value).getTime() - localOffset + targetOffset,
    );

    expect([
      td.getFullYear(),
      td.getMonth(),
      td.getDate(),
      td.getHours(),
      td.getMinutes(),
      td.getSeconds(),
      td.getMilliseconds(),
    ]).toEqual(value);

    td.setFullYear(2024);
    expect(td.getFullYear()).toBe(2024);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setMonth(5);
    expect(td.getMonth()).toBe(5);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setDate(10);
    expect(td.getDate()).toBe(10);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setHours(12);
    expect(td.getHours()).toBe(12);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setMinutes(30);
    expect(td.getMinutes()).toBe(30);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setSeconds(45);
    expect(td.getSeconds()).toBe(45);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));

    td.setMilliseconds(100);
    expect(td.getMilliseconds()).toBe(100);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, utcOffset));
  });
});

describe('时区转换', () => {
  it('时间戳', () => {
    const timestamp = Date.now();
    const utc8Date = new TimezoneDate({
      utcOffset: 8,
      timestamp,
    });
    const utc0Date = TimezoneDate.changeUtcOffset(utc8Date, 0);

    console.log('utc8:', dateFormat(utc8Date));
    console.log('utc0:', dateFormat(utc0Date));

    let utc8Hours = utc8Date.getHours();
    const utc0Hours = utc0Date.getHours();

    // 不是同一天
    if (utc8Date.getDate() !== utc0Date.getDate()) {
      utc8Hours += 24;
    }

    expect(utc8Hours - utc0Hours).toBe(8);
    expect(utc0Date.getTime()).toBe(utc0Date.getTime());
  });

  it('日期', () => {
    const value = [2024, 5, 10, 12, 30, 45, 100] as const;
    const utc8Td = new TimezoneDate({
      utcOffset: 8,
      value,
    });
    const utc0Td = TimezoneDate.changeUtcOffset(utc8Td, 0);

    expect(utc8Td.getHours()).toBe(12);
    expect(utc0Td.getHours()).toBe(4);
    expect(utc0Td.getTime()).toBe(utc0Td.getTime());
  });
});

describe('时间转换', () => {
  it('new 时间转换后', () => {
    const td1 = new TimezoneDate({
      utcOffset: 8,
      value: [2024, 5, 10, 12, 30, 45, 100] as const,
    });

    td1.setDate(td1.getDate() - 1);
    expect(td1.getDate()).toBe(9);

    const td2 = new TimezoneDate(td1);
    expect(td2.getDate()).toBe(9);
  });
});

function getUtcTimestamp(td: TimezoneDate, utcOffset = 0) {
  return (
    Date.UTC(
      td.getFullYear(),
      td.getMonth(),
      td.getDate(),
      td.getHours(),
      td.getMinutes(),
      td.getSeconds(),
      td.getMilliseconds(),
    ) +
    TimezoneDate.getTimezoneOffset(utcOffset) * 60 * 1000
  );
}
