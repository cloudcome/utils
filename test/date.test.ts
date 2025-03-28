import { dateParse, dateStringify, isValidDate } from '@/date';
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
