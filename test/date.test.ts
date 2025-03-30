import {
  type DateRelativeTemplates,
  dateDays,
  dateOfEnd,
  dateOfStart,
  dateParse,
  dateRelative,
  dateStringify,
  isValidDate,
} from '@/date';
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
    expect(dateStringify(date)).toBe('2023-01-01 00:00:00');
  });

  it('应正确格式化日期为自定义模板', () => {
    const date = new Date('2023-01-01T12:34:56');
    expect(dateStringify(date, 'YYYY/MM/DD HH:mm:ss')).toBe('2023/01/01 12:34:56');
    expect(dateStringify(date, 'YYYY年MM月DD日')).toBe('2023年01月01日');
  });

  it('应正确处理数值和字符串作为日期值', () => {
    expect(dateStringify(1672531200000, 'YYYY-MM-DD')).toBe('2023-01-01');
    expect(dateStringify('2023-01-01', 'YYYY/MM/DD')).toBe('2023/01/01');
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

describe('dateOfStart', () => {
  it('应正确返回指定时间单位的起始时间', () => {
    const date = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500

    // 测试秒级起始时间
    const secondStart = dateOfStart(date, 's');
    expect(secondStart.getMilliseconds()).toBe(0);
    expect(secondStart.getSeconds()).toBe(45);
    expect(secondStart.getMinutes()).toBe(30);
    expect(secondStart.getHours()).toBe(12);
    expect(secondStart.getDate()).toBe(15);
    expect(secondStart.getMonth()).toBe(5);
    expect(secondStart.getFullYear()).toBe(2023);

    // 测试分钟级起始时间
    const minuteStart = dateOfStart(date, 'm');
    expect(minuteStart.getMilliseconds()).toBe(0);
    expect(minuteStart.getSeconds()).toBe(0);
    expect(minuteStart.getMinutes()).toBe(30);
    expect(minuteStart.getHours()).toBe(12);
    expect(minuteStart.getDate()).toBe(15);
    expect(minuteStart.getMonth()).toBe(5);
    expect(minuteStart.getFullYear()).toBe(2023);

    // 测试小时级起始时间
    const hourStart = dateOfStart(date, 'h');
    expect(hourStart.getMilliseconds()).toBe(0);
    expect(hourStart.getSeconds()).toBe(0);
    expect(hourStart.getMinutes()).toBe(0);
    expect(hourStart.getHours()).toBe(12);
    expect(hourStart.getDate()).toBe(15);
    expect(hourStart.getMonth()).toBe(5);
    expect(hourStart.getFullYear()).toBe(2023);

    // 测试天级起始时间
    const dayStart = dateOfStart(date, 'D');
    expect(dayStart.getMilliseconds()).toBe(0);
    expect(dayStart.getSeconds()).toBe(0);
    expect(dayStart.getMinutes()).toBe(0);
    expect(dayStart.getHours()).toBe(0);
    expect(dayStart.getDate()).toBe(15);
    expect(dayStart.getMonth()).toBe(5);
    expect(dayStart.getFullYear()).toBe(2023);

    // 测试月级起始时间
    const monthStart = dateOfStart(date, 'M');
    expect(monthStart.getMilliseconds()).toBe(0);
    expect(monthStart.getSeconds()).toBe(0);
    expect(monthStart.getMinutes()).toBe(0);
    expect(monthStart.getHours()).toBe(0);
    expect(monthStart.getDate()).toBe(1);
    expect(monthStart.getMonth()).toBe(5);
    expect(monthStart.getFullYear()).toBe(2023);

    // 测试年级起始时间
    const yearStart = dateOfStart(date, 'Y');
    expect(yearStart.getMilliseconds()).toBe(0);
    expect(yearStart.getSeconds()).toBe(0);
    expect(yearStart.getMinutes()).toBe(0);
    expect(yearStart.getHours()).toBe(0);
    expect(yearStart.getDate()).toBe(1);
    expect(yearStart.getMonth()).toBe(0);
    expect(yearStart.getFullYear()).toBe(2023);
  });

  it('默认应返回天级起始时间', () => {
    const date = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500
    const defaultStart = dateOfStart(date);
    expect(defaultStart.getMilliseconds()).toBe(0);
    expect(defaultStart.getSeconds()).toBe(0);
    expect(defaultStart.getMinutes()).toBe(0);
    expect(defaultStart.getHours()).toBe(0);
    expect(defaultStart.getDate()).toBe(15);
    expect(defaultStart.getMonth()).toBe(5);
    expect(defaultStart.getFullYear()).toBe(2023);
  });
});

describe('dateOfEnd', () => {
  it('应正确返回指定时间单位的结束时间', () => {
    const date = new Date(2023, 1, 15, 12, 30, 45, 500); // 2023-02-15 12:30:45.500

    // 测试秒级结束时间
    const secondEnd = dateOfEnd(date, 's');
    expect(secondEnd.getMilliseconds()).toBe(999);
    expect(secondEnd.getSeconds()).toBe(45);
    expect(secondEnd.getMinutes()).toBe(30);
    expect(secondEnd.getHours()).toBe(12);
    expect(secondEnd.getDate()).toBe(15);
    expect(secondEnd.getMonth()).toBe(1);
    expect(secondEnd.getFullYear()).toBe(2023);

    // 测试分钟级结束时间
    const minuteEnd = dateOfEnd(date, 'm');
    expect(minuteEnd.getMilliseconds()).toBe(999);
    expect(minuteEnd.getSeconds()).toBe(59);
    expect(minuteEnd.getMinutes()).toBe(30);
    expect(minuteEnd.getHours()).toBe(12);
    expect(minuteEnd.getDate()).toBe(15);
    expect(minuteEnd.getMonth()).toBe(1);
    expect(minuteEnd.getFullYear()).toBe(2023);

    // 测试小时级结束时间
    const hourEnd = dateOfEnd(date, 'h');
    expect(hourEnd.getMilliseconds()).toBe(999);
    expect(hourEnd.getSeconds()).toBe(59);
    expect(hourEnd.getMinutes()).toBe(59);
    expect(hourEnd.getHours()).toBe(12);
    expect(hourEnd.getDate()).toBe(15);
    expect(hourEnd.getMonth()).toBe(1);
    expect(hourEnd.getFullYear()).toBe(2023);

    // 测试天级结束时间
    const dayEnd = dateOfEnd(date, 'D');
    expect(dayEnd.getMilliseconds()).toBe(999);
    expect(dayEnd.getSeconds()).toBe(59);
    expect(dayEnd.getMinutes()).toBe(59);
    expect(dayEnd.getHours()).toBe(23);
    expect(dayEnd.getDate()).toBe(15);
    expect(dayEnd.getMonth()).toBe(1);
    expect(dayEnd.getFullYear()).toBe(2023);

    // 测试月级结束时间
    const monthEnd = dateOfEnd(date, 'M');
    expect(monthEnd.getMilliseconds()).toBe(999);
    expect(monthEnd.getSeconds()).toBe(59);
    expect(monthEnd.getMinutes()).toBe(59);
    expect(monthEnd.getHours()).toBe(23);
    expect(monthEnd.getDate()).toBe(28);
    expect(monthEnd.getMonth()).toBe(1);
    expect(monthEnd.getFullYear()).toBe(2023);

    // 测试年级结束时间
    const yearEnd = dateOfEnd(date, 'Y');
    expect(yearEnd.getMilliseconds()).toBe(999);
    expect(yearEnd.getSeconds()).toBe(59);
    expect(yearEnd.getMinutes()).toBe(59);
    expect(yearEnd.getHours()).toBe(23);
    expect(yearEnd.getDate()).toBe(31);
    expect(yearEnd.getMonth()).toBe(11);
    expect(yearEnd.getFullYear()).toBe(2023);
  });

  it('默认应返回天级结束时间', () => {
    const date = new Date(2023, 4, 15, 12, 30, 45, 500); // 2023-05-15 12:30:45.500
    const defaultEnd = dateOfEnd(date);
    expect(defaultEnd.getMilliseconds()).toBe(999);
    expect(defaultEnd.getSeconds()).toBe(59);
    expect(defaultEnd.getMinutes()).toBe(59);
    expect(defaultEnd.getHours()).toBe(23);
    expect(defaultEnd.getDate()).toBe(15);
    expect(defaultEnd.getMonth()).toBe(4);
    expect(defaultEnd.getFullYear()).toBe(2023);
  });
});

describe('dateDays', () => {
  it('应正确计算指定日期所在月的天数', () => {
    expect(dateDays(new Date('2023-02-15'))).toBe(28); // 非闰年2月
    expect(dateDays(new Date('2024-02-15'))).toBe(29); // 闰年2月
    expect(dateDays(new Date('2023-04-15'))).toBe(30); // 4月
    expect(dateDays(new Date('2023-07-15'))).toBe(31); // 7月
  });

  it('应正确计算指定日期所在年的天数', () => {
    expect(dateDays(new Date('2023-02-15'), 'Y')).toBe(365); // 非闰年
    expect(dateDays(new Date('2024-02-15'), 'Y')).toBe(366); // 闰年
  });

  it('默认应计算指定日期所在月的天数', () => {
    expect(dateDays(new Date('2023-02-15'))).toBe(28); // 默认计算月天数
  });
});
