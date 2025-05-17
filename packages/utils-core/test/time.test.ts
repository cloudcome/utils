import { timeToDays, timeToHours, timeToMinutes, timeToSeconds } from '@/time';

describe('timeToDays', () => {
  test('解析123456789毫秒', () => {
    expect(timeToDays(123456789)).toEqual({
      days: 1,
      hours: 10,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('0毫秒', () => {
    expect(timeToDays(0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  test('精确1天', () => {
    expect(timeToDays(86400000)).toEqual({
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
    expect(timeToHours(123456789)).toEqual({
      days: 0,
      hours: 34,
      minutes: 17,
      seconds: 36,
      milliseconds: 789,
    });
  });

  test('精确3小时', () => {
    expect(timeToHours(3 * 3600000)).toEqual({
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
