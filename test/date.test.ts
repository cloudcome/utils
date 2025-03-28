import { type DateRelativeTemplates, dateFormat, dateParse, dateRelative, isValidDate } from '@/date';
import { describe, expect, it } from 'vitest';

describe('isValidDate', () => {
  it('应正确判断有效的日期对象', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('2023-01-01'))).toBe(true);
  });

  it('应正确判断无效的日期对象', () => {
    expect(isValidDate('2023-01-01')).toBe(false);
    expect(isValidDate(Number.NaN)).toBe(false);
    expect(isValidDate(123456789)).toBe(false);
  });
});

describe('dateParse', () => {
  it('应正确解析数值为日期对象', () => {
    const date = dateParse(1672531200000);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it('应正确解析字符串为日期对象', () => {
    const date = dateParse('2023-01-01');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it('应正确解析 Date 对象', () => {
    const inputDate = new Date('2023-01-01');
    const date = dateParse(inputDate);
    expect(date.getTime()).toBe(inputDate.getTime());
  });

  it('应抛出 SyntaxError 当解析无效的日期字符串', () => {
    expect(() => dateParse('invalid date')).toThrow(SyntaxError);
  });
});

describe('dateStringify', () => {
  it('应正确格式化日期为默认模板', () => {
    const date = new Date('2023-01-01T00:00:00');
    expect(dateFormat(date)).toBe('2023-01-01 00:00:00');
  });

  it('应正确格式化日期为自定义模板', () => {
    const date = new Date('2023-01-01T12:34:56');
    expect(dateFormat(date, 'YYYY/MM/DD HH:mm:ss')).toBe('2023/01/01 12:34:56');
    expect(dateFormat(date, 'YYYY年MM月DD日')).toBe('2023年01月01日');
  });

  it('应正确处理数值和字符串作为日期值', () => {
    expect(dateFormat(1672531200000, 'YYYY-MM-DD')).toBe('2023-01-01');
    expect(dateFormat('2023-01-01', 'YYYY/MM/DD')).toBe('2023/01/01');
  });
});

describe('dateRelative', () => {
  const now = new Date(1999, 9, 9, 9, 9, 9, 9).getTime();

  it('前时间', () => {
    expect(dateRelative(now, now)).toEqual('刚刚');
    expect(dateRelative(now - 1000 * 9, now)).toEqual('刚刚');
    expect(dateRelative(now - 1000 * 10, now)).toEqual('10 秒前');
    expect(dateRelative(now - 1000 * 59, now)).toEqual('59 秒前');
    expect(dateRelative(now - 1000 * 59 - 999, now)).toEqual('59 秒前');
    expect(dateRelative(now - 1000 * 60, now)).toEqual('1 分钟前');
    expect(dateRelative(now - 1000 * 60 * 59, now)).toEqual('59 分钟前');
    expect(dateRelative(now - 1000 * 60 * 60, now)).toEqual('1 小时前');
    expect(dateRelative(now - 1000 * 60 * 60 * 23, now)).toEqual('23 小时前');
    expect(dateRelative(now - 1000 * 60 * 60 * 24, now)).toEqual('昨天');
    expect(dateRelative(now - 1000 * 60 * 60 * 24 * 2, now)).toEqual('前天');
    expect(dateRelative(now - 1000 * 60 * 60 * 24 * 3, now)).toEqual('3 天前');
    expect(dateRelative(now - 1000 * 60 * 60 * 24 * 29, now)).toEqual('29 天前');
    expect(dateRelative(now - 1000 * 60 * 60 * 24 * 30, now)).toEqual('1999年09月09日');
  });

  it('后时间', () => {
    expect(dateRelative(now, now)).toEqual('刚刚');
    expect(dateRelative(now + 1000 * 9, now)).toEqual('刚刚');
    expect(dateRelative(now + 1000 * 10, now)).toEqual('10 秒后');
    expect(dateRelative(now + 1000 * 59, now)).toEqual('59 秒后');
    expect(dateRelative(now + 1000 * 60, now)).toEqual('1 分钟后');
    expect(dateRelative(now + 1000 * 60 * 59, now)).toEqual('59 分钟后');
    expect(dateRelative(now + 1000 * 60 * 60, now)).toEqual('1 小时后');
    expect(dateRelative(now + 1000 * 60 * 60 * 23, now)).toEqual('23 小时后');
    expect(dateRelative(now + 1000 * 60 * 60 * 24, now)).toEqual('明天');
    expect(dateRelative(now + 1000 * 60 * 60 * 24 * 2, now)).toEqual('后天');
    expect(dateRelative(now + 1000 * 60 * 60 * 24 * 3, now)).toEqual('3 天后');
    expect(dateRelative(now + 1000 * 60 * 60 * 24 * 29, now)).toEqual('29 天后');
    expect(dateRelative(now + 1000 * 60 * 60 * 24 * 30, now)).toEqual('1999年11月08日');
  });

  it('自定义模板', () => {
    const myTemplates: DateRelativeTemplates = [
      [1, 100, 'in {n} seconds'],
      [0, Number.POSITIVE_INFINITY, 'YYYY-MM-DD HH:mm:ss'],
    ];
    expect(dateRelative(now - 1000 * 59, now, myTemplates)).toEqual('in 59 seconds');
    expect(dateRelative(now - 1000 * 99, now, myTemplates)).toEqual('in 99 seconds');
    expect(dateRelative(now - 1000 * 100, now, myTemplates)).toEqual('1999-10-09 09:07:29');
    expect(dateRelative(new Date(), myTemplates)).toEqual('in 1 seconds');
  });
});
