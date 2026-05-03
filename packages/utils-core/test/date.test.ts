import {
  DATE_DAY_MS,
  DATE_HOUR_MS,
  DATE_MINUTE_MS,
  DATE_SECOND_MS,
  type DateRelativeTemplates,
  dateDaysInMonth,
  dateDaysInYear,
  dateEndInDay,
  dateEndInHour,
  dateEndInMinute,
  dateEndInMonth,
  dateEndInSecond,
  dateEndInWeek,
  dateEndInYear,
  dateFormat,
  dateParse,
  dateRelative,
  dateStartInDay,
  dateStartInHour,
  dateStartInMinute,
  dateStartInMonth,
  dateStartInSecond,
  dateStartInWeek,
  dateStartInYear,
  isLeapYear,
  isSameDateInDay,
  isSameDateInHour,
  isSameDateInMinute,
  isSameDateInMonth,
  isSameDateInSecond,
  isSameDateInYear,
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
    expect(dateFormat(date)).toBe('2023-01-01 00:00:00');
  });

  it('12/24 小时制', () => {
    const date = new Date('2023-01-01T15:22:33');
    expect(dateFormat(date, 'hh/HH')).toBe('03/15');
  });

  it('12小时制午夜应显示 12 而非 0', () => {
    const midnight = new Date('2023-01-01T00:05:09');
    expect(dateFormat(midnight, 'hh')).toBe('12');
    expect(dateFormat(midnight, 'h')).toBe('12');
  });

  it('12小时制正午应显示 12', () => {
    const noon = new Date('2023-01-01T12:05:09');
    expect(dateFormat(noon, 'hh')).toBe('12');
    expect(dateFormat(noon, 'h')).toBe('12');
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

describe('dateOfStart', () => {
  it('应正确返回指定时间单位的起始时间', () => {
    const date = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500

    // 测试秒级起始时间
    const secondStart = dateStartInSecond(date);
    expect(secondStart.getMilliseconds()).toBe(0);
    expect(secondStart.getSeconds()).toBe(45);
    expect(secondStart.getMinutes()).toBe(30);
    expect(secondStart.getHours()).toBe(12);
    expect(secondStart.getDate()).toBe(15);
    expect(secondStart.getMonth()).toBe(5);
    expect(secondStart.getFullYear()).toBe(2023);

    // 测试分钟级起始时间
    const minuteStart = dateStartInMinute(date);
    expect(minuteStart.getMilliseconds()).toBe(0);
    expect(minuteStart.getSeconds()).toBe(0);
    expect(minuteStart.getMinutes()).toBe(30);
    expect(minuteStart.getHours()).toBe(12);
    expect(minuteStart.getDate()).toBe(15);
    expect(minuteStart.getMonth()).toBe(5);
    expect(minuteStart.getFullYear()).toBe(2023);

    // 测试小时级起始时间
    const hourStart = dateStartInHour(date);
    expect(hourStart.getMilliseconds()).toBe(0);
    expect(hourStart.getSeconds()).toBe(0);
    expect(hourStart.getMinutes()).toBe(0);
    expect(hourStart.getHours()).toBe(12);
    expect(hourStart.getDate()).toBe(15);
    expect(hourStart.getMonth()).toBe(5);
    expect(hourStart.getFullYear()).toBe(2023);

    // 测试天级起始时间
    const dayStart = dateStartInDay(date);
    expect(dayStart.getMilliseconds()).toBe(0);
    expect(dayStart.getSeconds()).toBe(0);
    expect(dayStart.getMinutes()).toBe(0);
    expect(dayStart.getHours()).toBe(0);
    expect(dayStart.getDate()).toBe(15);
    expect(dayStart.getMonth()).toBe(5);
    expect(dayStart.getFullYear()).toBe(2023);

    // 测试月级起始时间
    const monthStart = dateStartInMonth(date);
    expect(monthStart.getMilliseconds()).toBe(0);
    expect(monthStart.getSeconds()).toBe(0);
    expect(monthStart.getMinutes()).toBe(0);
    expect(monthStart.getHours()).toBe(0);
    expect(monthStart.getDate()).toBe(1);
    expect(monthStart.getMonth()).toBe(5);
    expect(monthStart.getFullYear()).toBe(2023);

    // 测试年级起始时间
    const yearStart = dateStartInYear(date);
    expect(yearStart.getMilliseconds()).toBe(0);
    expect(yearStart.getSeconds()).toBe(0);
    expect(yearStart.getMinutes()).toBe(0);
    expect(yearStart.getHours()).toBe(0);
    expect(yearStart.getDate()).toBe(1);
    expect(yearStart.getMonth()).toBe(0);
    expect(yearStart.getFullYear()).toBe(2023);

    // 测试周级起始时间（2023-06-15 周四，当周周一为 2023-06-12）
    const weekStart = dateStartInWeek(date);
    expect(weekStart.getMilliseconds()).toBe(0);
    expect(weekStart.getSeconds()).toBe(0);
    expect(weekStart.getMinutes()).toBe(0);
    expect(weekStart.getHours()).toBe(0);
    expect(weekStart.getDate()).toBe(12);
    expect(weekStart.getMonth()).toBe(5);
    expect(weekStart.getFullYear()).toBe(2023);
  });
});

describe('dateOfEnd', () => {
  it('应正确返回指定时间单位的结束时间', () => {
    const date = new Date(2023, 1, 15, 12, 30, 45, 500); // 2023-02-15 12:30:45.500

    // 测试秒级结束时间
    const secondEnd = dateEndInSecond(date);
    expect(secondEnd.getMilliseconds()).toBe(999);
    expect(secondEnd.getSeconds()).toBe(45);
    expect(secondEnd.getMinutes()).toBe(30);
    expect(secondEnd.getHours()).toBe(12);
    expect(secondEnd.getDate()).toBe(15);
    expect(secondEnd.getMonth()).toBe(1);
    expect(secondEnd.getFullYear()).toBe(2023);

    // 测试分钟级结束时间
    const minuteEnd = dateEndInMinute(date);
    expect(minuteEnd.getMilliseconds()).toBe(999);
    expect(minuteEnd.getSeconds()).toBe(59);
    expect(minuteEnd.getMinutes()).toBe(30);
    expect(minuteEnd.getHours()).toBe(12);
    expect(minuteEnd.getDate()).toBe(15);
    expect(minuteEnd.getMonth()).toBe(1);
    expect(minuteEnd.getFullYear()).toBe(2023);

    // 测试小时级结束时间
    const hourEnd = dateEndInHour(date);
    expect(hourEnd.getMilliseconds()).toBe(999);
    expect(hourEnd.getSeconds()).toBe(59);
    expect(hourEnd.getMinutes()).toBe(59);
    expect(hourEnd.getHours()).toBe(12);
    expect(hourEnd.getDate()).toBe(15);
    expect(hourEnd.getMonth()).toBe(1);
    expect(hourEnd.getFullYear()).toBe(2023);

    // 测试天级结束时间
    const dayEnd = dateEndInDay(date);
    expect(dayEnd.getMilliseconds()).toBe(999);
    expect(dayEnd.getSeconds()).toBe(59);
    expect(dayEnd.getMinutes()).toBe(59);
    expect(dayEnd.getHours()).toBe(23);
    expect(dayEnd.getDate()).toBe(15);
    expect(dayEnd.getMonth()).toBe(1);
    expect(dayEnd.getFullYear()).toBe(2023);

    // 测试月级结束时间
    const monthEnd = dateEndInMonth(date);
    expect(monthEnd.getMilliseconds()).toBe(999);
    expect(monthEnd.getSeconds()).toBe(59);
    expect(monthEnd.getMinutes()).toBe(59);
    expect(monthEnd.getHours()).toBe(23);
    expect(monthEnd.getDate()).toBe(28);
    expect(monthEnd.getMonth()).toBe(1);
    expect(monthEnd.getFullYear()).toBe(2023);

    // 测试年级结束时间
    const yearEnd = dateEndInYear(date);
    expect(yearEnd.getMilliseconds()).toBe(999);
    expect(yearEnd.getSeconds()).toBe(59);
    expect(yearEnd.getMinutes()).toBe(59);
    expect(yearEnd.getHours()).toBe(23);
    expect(yearEnd.getDate()).toBe(31);
    expect(yearEnd.getMonth()).toBe(11);
    expect(yearEnd.getFullYear()).toBe(2023);

    // 测试周级结束时间（2023-02-15 周三，当周周日为 2023-02-19）
    const weekEnd = dateEndInWeek(date);
    expect(weekEnd.getMilliseconds()).toBe(999);
    expect(weekEnd.getSeconds()).toBe(59);
    expect(weekEnd.getMinutes()).toBe(59);
    expect(weekEnd.getHours()).toBe(23);
    expect(weekEnd.getDate()).toBe(19);
    expect(weekEnd.getMonth()).toBe(1);
    expect(weekEnd.getFullYear()).toBe(2023);
  });
});

describe('dateDaysInMonth', () => {
  it('应正确计算指定日期所在月的天数', () => {
    expect(dateDaysInMonth(new Date('2023-02-15'))).toBe(28); // 非闰年2月
    expect(dateDaysInMonth(new Date('2024-02-15'))).toBe(29); // 闰年2月
    expect(dateDaysInMonth(new Date('2023-04-15'))).toBe(30); // 4月
    expect(dateDaysInMonth(new Date('2023-07-15'))).toBe(31); // 7月
  });

  it('默认应计算指定日期所在月的天数', () => {
    expect(dateDaysInMonth(new Date('2023-02-15'))).toBe(28); // 默认计算月天数
  });
});

describe('dateDaysInYear', () => {
  it('应正确计算指定日期所在年的天数', () => {
    expect(dateDaysInYear(new Date('2023-02-15'))).toBe(365); // 非闰年
    expect(dateDaysInYear(new Date('2024-02-15'))).toBe(366); // 闰年
  });
});

describe('isSameDate', () => {
  const date1 = new Date(2023, 5, 15, 12, 30, 45, 500); // 2023-06-15 12:30:45.500
  const date2 = new Date(2023, 5, 15, 13, 30, 45, 500); // 2023-06-15 13:30:45.500
  const date3 = new Date(2023, 5, 16, 12, 30, 45, 500); // 2023-06-16 12:30:45.500
  const date4 = new Date(2023, 6, 15, 12, 30, 45, 500); // 2023-07-15 12:30:45.500
  const date5 = new Date(2024, 5, 15, 12, 30, 45, 500); // 2024-06-15 12:30:45.500

  it('应正确比较年份', () => {
    expect(isSameDateInYear(date1, date2)).toBe(true);
    expect(isSameDateInYear(date1, date5)).toBe(false);
  });

  it('应正确比较月份', () => {
    expect(isSameDateInMonth(date1, date2)).toBe(true);
    expect(isSameDateInMonth(date1, date4)).toBe(false);
  });

  it('应正确比较天数', () => {
    expect(isSameDateInDay(date1, date2)).toBe(true);
    expect(isSameDateInDay(date1, date3)).toBe(false);
  });

  it('应正确比较小时', () => {
    expect(isSameDateInHour(date1, date2)).toBe(false);
    expect(isSameDateInHour(date1, new Date(2023, 5, 15, 12, 0, 0, 0))).toBe(true);
  });

  it('应正确比较分钟', () => {
    expect(isSameDateInMinute(date1, date2)).toBe(false);
    expect(isSameDateInMinute(date1, new Date(2023, 5, 15, 12, 30, 0, 0))).toBe(true);
  });

  it('应正确比较秒', () => {
    expect(isSameDateInSecond(date1, date2)).toBe(false);
    expect(isSameDateInSecond(date1, '2023-06-15 12:30:45.0')).toBe(true);
  });

  it('应正确处理字符串和数值作为日期值', () => {
    expect(isSameDateInDay('2023-06-15', '2023-06-15')).toBe(true);
    expect(isSameDateInDay(1686814245500, 1686814245511)).toBe(true);
    expect(isSameDateInDay('2023-06-15', '2023-06-16')).toBe(false);
  });
});

describe('isLeapYear', () => {
  it('应正确判断闰年', () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
  });

  it('应正确判断平年', () => {
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(1999)).toBe(false);
  });
});
