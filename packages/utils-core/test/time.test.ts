import { timeInDay, timeInHour, timeInMinute, timeInSecond } from '@/time';

describe('timeInDay', () => {
  test('解析123456789毫秒', () => {
    expect(timeInDay(123456789)).toEqual({
      days: 1,
      hours: 10,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('0毫秒', () => {
    expect(timeInDay(0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  test('精确1天', () => {
    expect(timeInDay(86400000)).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeInHour', () => {
  test('解析123456789毫秒', () => {
    expect(timeInHour(123456789)).toEqual({
      days: 0,
      hours: 34,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('精确3小时', () => {
    expect(timeInHour(3 * 3600000)).toEqual({
      days: 0,
      hours: 3,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeInMinute', () => {
  test('解析123456789毫秒', () => {
    expect(timeInMinute(123456789)).toMatchObject({
      hours: 0,
      minutes: 2057,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('精确5分钟', () => {
    expect(timeInMinute(5 * 60000)).toMatchObject({
      hours: 0,
      minutes: 5,
      seconds: 0,
      milliseconds: 0,
    });
  });
});

describe('timeInSecond', () => {
  test('解析123456789毫秒', () => {
    expect(timeInSecond(123456789)).toMatchObject({
      seconds: 123456,
      milliseconds: 789,
    });
  });

  test('精确10秒', () => {
    expect(timeInSecond(10000)).toMatchObject({
      seconds: 10,
      milliseconds: 0,
    });
  });
});
