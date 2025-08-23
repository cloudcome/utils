import { dateFormat } from '@/date';
import { TZDate } from '@/tz';

const gmtOrder = TZDate.toGmtOrder();
console.log(`当前时区 GMT${gmtOrder > 0 ? '+' : ''}${gmtOrder}`);

describe('默认 0 时区', () => {
  it('空入参', () => {
    // 时间戳与时区无关
    const tzNow = new TZDate().getTime();
    const now = new Date().getTime();
    expect(tzNow).toBeLessThanOrEqual(now);
    // 误差小于 10ms
    expect(tzNow).toBeGreaterThanOrEqual(now - 10);
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    expect(new TZDate({ timestamp: now }).getTime()).toBe(new Date(now).getTime());
  });

  it('年月日', () => {
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;

    // 默认 0 时区与 UTC 时间戳一致
    expect(new TZDate({ value: [...value] }).getTime()).toBe(Date.UTC(...value));
    expect(new TZDate({ value: [...value] }).getTime()).toBe(new Date(...value).getTime() - offset);

    const td = new TZDate({ value: [...value] });
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

    td.setMonth(5);
    expect(td.getMonth()).toBe(5);

    td.setDate(10);
    expect(td.getDate()).toBe(10);

    td.setHours(12);
    expect(td.getHours()).toBe(12);

    td.setMinutes(30);
    expect(td.getMinutes()).toBe(30);

    td.setSeconds(45);
    expect(td.getSeconds()).toBe(45);

    td.setMilliseconds(100);
    expect(td.getMilliseconds()).toBe(100);
  });
});

describe('东 8 时区', () => {
  const timeZoneOffset = -8 * 60;

  it('空入参', () => {
    // 时间戳与时区无关
    expect(new TZDate({ offsetMinutes: timeZoneOffset }).getTime()).toBe(new Date().getTime());
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    expect(new TZDate({ offsetMinutes: timeZoneOffset, timestamp: now }).getTime()).toBe(new Date(now).getTime());
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = timeZoneOffset * 60 * 1000;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;

    // 默认 0 时区与 UTC 时间戳一致
    expect(new TZDate({ offsetMinutes: timeZoneOffset, value: [...value] }).getTime()).toBe(
      Date.UTC(...value) + targetOffset,
    );
    expect(new TZDate({ offsetMinutes: timeZoneOffset, value: [...value] }).getTime()).toBe(
      new Date(...value).getTime() - localOffset + targetOffset,
    );

    const td = new TZDate({ offsetMinutes: timeZoneOffset, value: [...value] });
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

    td.setMonth(5);
    expect(td.getMonth()).toBe(5);

    td.setDate(10);
    expect(td.getDate()).toBe(10);

    td.setHours(12);
    expect(td.getHours()).toBe(12);

    td.setMinutes(30);
    expect(td.getMinutes()).toBe(30);

    td.setSeconds(45);
    expect(td.getSeconds()).toBe(45);

    td.setMilliseconds(100);
    expect(td.getMilliseconds()).toBe(100);
  });
});

describe('时区转换', () => {
  it('时间戳', () => {
    const timestamp = Date.now();
    const gmt8Date = new TZDate({
      offsetMinutes: TZDate.toGmtOffset(8),
      timestamp,
    });
    console.log('gmt8:', dateFormat(gmt8Date.getTime()));
    const gmt0Date = TZDate.from(gmt8Date, 0);
    console.log('gmt0:', dateFormat(gmt0Date));

    expect(gmt8Date.getHours() - gmt0Date.getHours()).toBe(8);
    expect(gmt0Date.getTime()).toBe(gmt0Date.getTime());
  });

  it('日期', () => {
    const value = [2024, 5, 10, 12, 30, 45, 100] as const;
    const gmt8Td = new TZDate({
      offsetMinutes: TZDate.toGmtOffset(8),
      value,
    });
    const gmt0Td = TZDate.from(gmt8Td, 0);

    expect(gmt8Td.getHours()).toBe(12);
    expect(gmt0Td.getHours()).toBe(4);
    expect(gmt0Td.getTime()).toBe(gmt0Td.getTime());
  });
});
