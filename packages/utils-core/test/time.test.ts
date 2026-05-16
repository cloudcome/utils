import { type TimeDuration, timeFrom, timeParse, timeToDays, timeToHours, timeToMinutes, timeToSeconds } from '@/time';

describe('timeToDays', () => {
  test('解析123456789毫秒', () => {
    expect(timeToDays(123456789)).toMatchObject({
      days: 1,
      hours: 10,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('0毫秒', () => {
    expect(timeToDays(0)).toMatchObject({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  test('精确1天', () => {
    expect(timeToDays(86400000)).toMatchObject({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeToHours', () => {
  test('解析123456789毫秒', () => {
    expect(timeToHours(123456789)).toMatchObject({
      days: 0,
      hours: 34,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('精确3小时', () => {
    expect(timeToHours(3 * 3600000)).toMatchObject({
      days: 0,
      hours: 3,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeToMinutes', () => {
  test('解析123456789毫秒', () => {
    expect(timeToMinutes(123456789)).toMatchObject({
      hours: 0,
      minutes: 2057,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('精确5分钟', () => {
    expect(timeToMinutes(5 * 60000)).toMatchObject({
      hours: 0,
      minutes: 5,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeToSeconds', () => {
  test('解析123456789毫秒', () => {
    expect(timeToSeconds(123456789)).toMatchObject({
      seconds: 123456,
      milliseconds: 789,
    });
  });

  test('精确10秒', () => {
    expect(timeToSeconds(10000)).toMatchObject({
      seconds: 10,
      milliseconds: 0,
    });
  });
});

describe('timeFrom', () => {
  test('解析简单时间字符串', () => {
    expect(timeFrom('1d2h30m')).toBe(95400000);
  });

  test('解析复杂时间字符串', () => {
    expect(timeFrom('1y2M3d4h5m6s')).toBe(36993906000);
  });

  test('解析单个时间单位', () => {
    expect(timeFrom('1h')).toBe(3600000);
    expect(timeFrom('30m')).toBe(1800000);
    expect(timeFrom('10s')).toBe(10000);
  });

  test('解析大小写不敏感', () => {
    expect(timeFrom('1D2H30M')).toBe(77853600000);
  });

  test('解析空字符串', () => {
    expect(timeFrom('')).toBe(0);
  });

  test('解析无效字符串', () => {
    expect(timeFrom('invalid')).toBe(0);
  });

  it('应正确计算完整时间对象的毫秒数', () => {
    const duration: TimeDuration = {
      years: 1,
      months: 2,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      milliseconds: 0,
    };
    expect(timeFrom(duration)).toBe(
      1 * 31536000000 + // 1年
        2 * 2592000000 + // 2个月
        3 * 86400000 + // 3天
        4 * 3600000 + // 4小时
        5 * 60000 + // 5分钟
        6 * 1000, // 6秒
    );
  });

  it('应处理部分时间单位', () => {
    const duration: TimeDuration = {
      years: 0,
      months: 0,
      days: 2,
      hours: 3,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    expect(timeFrom(duration)).toBe(
      2 * 86400000 + // 2天
        3 * 3600000, // 3小时
    );
  });

  it('应处理空对象', () => {
    const duration: TimeDuration = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    expect(timeFrom(duration)).toBe(0);
  });
});

describe('timeParse', () => {
  it('应正确解析完整时间字符串', () => {
    expect(timeParse('1y2M3d4h5m6s')).toEqual({
      years: 1,
      months: 2,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
    });
  });

  it('应处理部分时间单位', () => {
    expect(timeParse('2d3h')).toEqual({
      years: 0,
      months: 0,
      days: 2,
      hours: 3,
      minutes: 0,
      seconds: 0,
    });
  });

  it('应处理空字符串', () => {
    expect(timeParse('')).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('应忽略无效格式', () => {
    expect(timeParse('invalid')).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
