import {
  isDigit,
  isEmail,
  isFloat,
  isIDNo,
  isIPV4,
  isInteger,
  isNumerical,
  isPhone,
  isURL,
  regexpEscape,
} from '@/regexp';

test('reEscape', () => {
  const str = 'a*';
  const re = new RegExp(regexpEscape(str), 'i');

  expect(re.source).toEqual('a\\*');
  expect(re.test('a*')).toEqual(true);
  expect(re.test('A*')).toEqual(true);
});

test('isURL', () => {
  expect(isURL('')).toBe(false);
  expect(isURL('http://aba.com')).toBe(true);
  expect(isURL("http://aba.com:8080/'1@!.+%a?a(x)")).toBe(true);
  expect(isURL("http://192.168.0.1/'1@!.+%a?a(x)")).toBe(true);
  expect(isURL("http://192.168.0.1:8080/'1@!.+%a?a(x)")).toBe(true);
});

test('isEmail', () => {
  expect(isEmail('')).toBe(false);
  expect(isEmail('http://aba.com')).toBe(false);
  expect(isEmail('http@aba.com')).toBe(true);
  expect(isEmail('ht.tp@aba.com')).toBe(true);
});

test('isPhone', () => {
  expect(isPhone('')).toBe(false);
  expect(isPhone('19912345678')).toBe(true);
});

test('isIPV4', () => {
  expect(isIPV4('')).toBe(false);
  expect(isIPV4('11.11.111.11')).toBe(true);
  expect(isIPV4('222.233.455.11')).toBe(false);
});

test('isIdNo', () => {
  // http://id.8684.cn/
  expect(isIDNo('350213197706189461')).toBe(true);
  expect(isIDNo('350213197706189462')).toBe(false);
});

test('isInteger', () => {
  expect(isInteger('1')).toBe(true);
  expect(isInteger('-1')).toBe(true);
  expect(isInteger('12300')).toBe(true);
  expect(isInteger('-12300')).toBe(true);
  expect(isInteger('0')).toBe(true);
  expect(isInteger('0.0')).toBe(false);
  expect(isInteger('0.1')).toBe(false);
  expect(isInteger('-0')).toBe(false);
  expect(isInteger('-0123')).toBe(false);
  expect(isInteger('0123')).toBe(false);
});

test('isFloat', () => {
  expect(isFloat('0')).toBe(false);
  expect(isFloat('0.1')).toBe(true);
  expect(isFloat('1.1')).toBe(true);
  expect(isFloat('1.01')).toBe(true);
  expect(isFloat('10.01')).toBe(true);
  expect(isFloat('-10.01')).toBe(true);
  expect(isFloat('010.01')).toBe(false);
  expect(isFloat('10.010')).toBe(true);
  expect(isFloat('10.0')).toBe(true);
  expect(isFloat('10.')).toBe(false);
  expect(isFloat('10')).toBe(false);
});

test('.isNumrical', () => {
  expect(isNumerical('0')).toBe(true);
  expect(isNumerical('0.0')).toBe(true);
  expect(isNumerical('0.1')).toBe(true);
  expect(isNumerical('1.1')).toBe(true);
  expect(isNumerical('-1.1')).toBe(true);
});

test('isDigit', () => {
  expect(isDigit('1')).toBe(true);
  expect(isDigit('12')).toBe(true);
  expect(isDigit('012')).toBe(true);
  expect(isDigit('+012')).toBe(false);
  expect(isDigit('-012')).toBe(false);
});
