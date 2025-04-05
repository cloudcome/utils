import { dateStringify } from '@/date';
import { type QSReader, type QSWriter, qsParse, qsStringify } from '@/qs';
import { isArray, isBoolean, isDate, isFunction, isNull, isNumber, isString, isUndefined } from '@/type';

describe('qsParse', () => {
  it('默认 reader', () => {
    expect(qsParse('?a=1')).toEqual({ a: '1' });
    expect(qsParse('?a=1&b=2')).toEqual({ a: '1', b: '2' });
    expect(qsParse('?a=1&b=1&b=2')).toEqual({ a: '1', b: ['1', '2'] });
    expect(qsParse('?a=1&a=2&b=1')).toEqual({ a: ['1', '2'], b: '1' });
    expect(qsParse('?a=1&a=2&a=3&a=4')).toEqual({ a: ['1', '2', '3', '4'] });
  });

  it('自定义 reader', () => {
    const qsReader: QSReader<Record<string, string | number | boolean | Array<string | number | boolean>>> = (
      value,
      key,
      qsObject,
    ) => {
      if (value === '1') {
        return 1;
      }

      if (value === 'true') {
        return true;
      }

      if (value.includes(',')) {
        if (Object.hasOwn(qsObject, key)) {
          if (!isArray(qsObject[key])) qsObject[key] = [qsObject[key]];
        } else {
          qsObject[key] = [];
        }

        qsObject[key].push(...value.split(','));
        return;
      }

      return value;
    };

    expect(qsParse('?a=1', qsReader)).toEqual({ a: 1 });
    expect(qsParse('?a=1&b=2', qsReader)).toEqual({ a: 1, b: '2' });
    expect(qsParse('?a=1&b=2&a=3', qsReader)).toEqual({ a: [1, '3'], b: '2' });
    expect(qsParse('?a=1&b=2&a=3&b=4,5', qsReader)).toEqual({ a: [1, '3'], b: ['2', '4', '5'] });
    expect(qsParse('?a=1&b=2&a=3&c=4,5', qsReader)).toEqual({ a: [1, '3'], b: '2', c: ['4', '5'] });
    expect(qsParse('?x=true', qsReader)).toEqual({ x: true });
  });
});

describe('qsStringify', () => {
  it('qsStringify 默认 writer', () => {
    const i = new Date(2020, 0, 1, 0, 0, 0, 0);
    const query = { a: 1, b: [2, 3], c: '4', d: undefined, e: null, f: true, g: false, i };
    const string = 'a=1&b=2&b=3&c=4&f=true&g=false&i=2019-12-31T16%3A00%3A00.000Z';
    expect(qsStringify(query)).toBe(string);
  });

  it('qsStringify 复写 writer', () => {
    const qsWriter: QSWriter = (value, key, qsObject) => {
      if (isString(value)) return `string-${value}`;
      if (isNumber(value)) return `number-${value}`;
      if (isBoolean(value)) return `boolean-${value ? 'true' : 'false'}`;
      if (isUndefined(value)) return 'undefined';
      if (isNull(value)) return 'null';
      if (isDate(value)) return `date-${dateStringify(value, 'YYYY-MM-DD HH:mm:ss')}`;
      return null;
    };
    const i = new Date(2020, 0, 1, 0, 0, 0, 0);
    const query = { a: 1, b: [2, 3], c: '4', d: undefined, e: null, f: true, g: false, i };
    const string =
      'a=number-1&b=number-2&b=number-3&c=string-4&d=undefined&e=null&' +
      'f=boolean-true&g=boolean-false&i=date-2020-01-01%2000%3A00%3A00';
    expect(qsStringify(query, qsWriter)).toBe(string);
  });
});
