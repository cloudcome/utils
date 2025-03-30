import { regexpEscape } from '@/regexp';

test('reEscape', () => {
  const str = 'a*';
  const re = new RegExp(regexpEscape(str), 'i');

  expect(re.source).toEqual('a\\*');
  expect(re.test('a*')).toEqual(true);
  expect(re.test('A*')).toEqual(true);
});
