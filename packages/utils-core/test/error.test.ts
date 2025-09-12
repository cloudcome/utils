import { errorAssign, errorNormalize } from '@/error';
import { isError } from '@/type';

function shouldBeString(input: string) {
  return true;
}

function shouldOptionalString(input?: string) {
  return true;
}

function shouldBeUnknown(input: unknown) {
  return true;
}

test('errorNormalize', () => {
  const err1 = errorNormalize('abc');
  expect(isError(err1)).toBe(true);

  const err2 = errorNormalize(new Error('abc'));
  expect(isError(err2)).toBe(true);

  const err3 = new Error('abc');
  expect(errorNormalize(err3)).toBe(err3);

  let err4 = null;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    1();
  } catch (cause) {
    err4 = errorNormalize(cause);
  }

  if (err4) {
    shouldBeString(err4.name);
    shouldBeString(err4.message);
    shouldOptionalString(err4.stack);
    shouldBeUnknown(err4.cause);
  }

  expect(isError(err4)).toBe(true);

  const err5 = errorNormalize(errorAssign(new Error(), { aaa: '' }));
  shouldBeString(err5.name);
  shouldBeString(err5.message);
  shouldOptionalString(err5.stack);
  shouldBeUnknown(err5.cause);
  shouldBeString(err5.aaa);
  expect(isError(err5)).toBe(true);

  try {
    throw 1;
  } catch (err) {
    const err6 = errorNormalize(err);
    shouldBeString(err6.message);
  }

  const err7 = errorNormalize(new Error('') as Error & { bbb: string });
  shouldBeString(err7.bbb);
});

test('errorAssign', () => {
  const data = { xyz: 1, abc: new Date() };
  const error = errorAssign(new Error('abc'), data);
  expect(error.xyz).toBe(data.xyz);
  expect(error.abc).toBe(data.abc);
});
