import { TZDate } from '@/tz';

describe('默认 0 时区', () => {
  it('空入参', () => {
    // 时间戳与时区无关
    expect(new TZDate().getTime()).toBe(new Date().getTime());
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
    expect(new TZDate({ offset: timeZoneOffset }).getTime()).toBe(new Date().getTime());
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    expect(new TZDate({ offset: timeZoneOffset, timestamp: now }).getTime()).toBe(new Date(now).getTime());
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = timeZoneOffset * 60 * 1000;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;

    // 默认 0 时区与 UTC 时间戳一致
    expect(new TZDate({ offset: timeZoneOffset, value: [...value] }).getTime()).toBe(Date.UTC(...value) + targetOffset);
    expect(new TZDate({ offset: timeZoneOffset, value: [...value] }).getTime()).toBe(
      new Date(...value).getTime() - localOffset + targetOffset,
    );

    const td = new TZDate({ offset: timeZoneOffset, value: [...value] });
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
    const gmt8Td = new TZDate({
      offset: TZDate.GMT(8),
      timestamp,
    });
    const gmt0Td = TZDate.from(gmt8Td, 0);

    expect(gmt8Td.getHours() - gmt0Td.getHours()).toBe(8);
    expect(gmt0Td.getTime()).toBe(gmt0Td.getTime());
  });

  it('日期', () => {
    const value = [2024, 5, 10, 12, 30, 45, 100] as const;
    const gmt8Td = new TZDate({
      offset: TZDate.GMT(8),
      value,
    });
    const gmt0Td = TZDate.from(gmt8Td, 0);

    expect(gmt8Td.getHours()).toBe(12);
    expect(gmt0Td.getHours()).toBe(4);
    expect(gmt0Td.getTime()).toBe(gmt0Td.getTime());
  });
});
