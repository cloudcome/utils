import { dateFormat } from '@/date';
import { TzDate } from '@/date';

const gmtOrder = TzDate.getOrder();
console.log(`当前时区 GMT${gmtOrder > 0 ? '+' : ''}${gmtOrder}`);

describe('0 时区', () => {
  const offset = TzDate.getOffset(0);

  it('空入参', () => {
    // 时间戳与时区无关
    const tzNow = new TzDate({ offset }).getTime();
    const now = new Date().getTime();
    expect(tzNow).toBeLessThanOrEqual(now);
    // 误差小于 10ms
    expect(tzNow).toBeGreaterThanOrEqual(now - 10);
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    const td = new TzDate({ offset, timestamp: now });
    const dt = new Date(now);

    expect(td.getTime()).toBe(dt.getTime());
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = 0;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;
    const td = new TzDate({ offset, value });

    expect(td.toISOString()).toEqual('2025-06-03T12:34:56.789Z');

    // 0 时区与 UTC 时间戳一致
    expect(td.getTime()).toBe(Date.UTC(...value) + targetOffset);
    expect(td.getTime()).toBe(new Date(...value).getTime() - localOffset + targetOffset);

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
  const offset = TzDate.getOffset(8);

  it('空入参', () => {
    // 时间戳与时区无关
    const tzNow = new TzDate({ offset }).getTime();
    const now = new Date().getTime();
    expect(tzNow).toBeLessThanOrEqual(now);
    // 误差小于 10ms
    expect(tzNow).toBeGreaterThanOrEqual(now - 10);
  });

  it('时间戳', () => {
    // 时间戳与时区无关
    const now = Date.now();
    const td = new TzDate({ offset, timestamp: now });
    const dt = new Date(now);
    expect(td.getTime()).toBe(dt.getTime());
  });

  it('年月日', () => {
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = offset * 60 * 1000;
    const value = [2025, 5, 3, 12, 34, 56, 789] as const;
    const td = new TzDate({ offset, value: [...value] });

    expect(td.toISOString()).toEqual('2025-06-03T04:34:56.789Z');

    // 0 时区与 UTC 时间戳一致
    expect(td.getTime()).toBe(Date.UTC(...value) + targetOffset);
    expect(td.getTime()).toBe(new Date(...value).getTime() - localOffset + targetOffset);

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
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setMonth(5);
    expect(td.getMonth()).toBe(5);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setDate(10);
    expect(td.getDate()).toBe(10);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setHours(12);
    expect(td.getHours()).toBe(12);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setMinutes(30);
    expect(td.getMinutes()).toBe(30);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setSeconds(45);
    expect(td.getSeconds()).toBe(45);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));

    td.setMilliseconds(100);
    expect(td.getMilliseconds()).toBe(100);
    expect(td.getTime()).toEqual(getUtcTimestamp(td, offset));
  });
});

describe('时区转换', () => {
  it('时间戳', () => {
    const timestamp = Date.now();
    const gmt8Date = new TzDate({
      offset: TzDate.getOffset(8),
      timestamp,
    });
    const gmt0Date = TzDate.from(gmt8Date, 0);

    console.log('gmt8:', dateFormat(gmt8Date));
    console.log('gmt0:', dateFormat(gmt0Date));

    let gmt8Hours = gmt8Date.getHours();
    const gmt0Hours = gmt0Date.getHours();

    // 不是同一天
    if (gmt8Date.getDate() !== gmt0Date.getDate()) {
      gmt8Hours += 24;
    }

    expect(gmt8Hours - gmt0Hours).toBe(8);
    expect(gmt0Date.getTime()).toBe(gmt0Date.getTime());
  });

  it('日期', () => {
    const value = [2024, 5, 10, 12, 30, 45, 100] as const;
    const gmt8Td = new TzDate({
      offset: TzDate.getOffset(8),
      value,
    });
    const gmt0Td = TzDate.from(gmt8Td, 0);

    expect(gmt8Td.getHours()).toBe(12);
    expect(gmt0Td.getHours()).toBe(4);
    expect(gmt0Td.getTime()).toBe(gmt0Td.getTime());
  });
});

function getUtcTimestamp(td: TzDate, offset = 0) {
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
    offset * 60 * 1000
  );
}
