import { type Callback, callbackCurry } from '@/try/curry';
import { assertNumber } from './helpers';

test('0 input + 0 result', () => {
  const cf = (cb: Callback) => {
    cb(null);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf);
  cc((_err, res) => {
    fn(res);
  });

  expect(fn.mock.calls[0][0]).toBe(undefined);
});

test('0 input + 1 result', () => {
  const cf = (cb: Callback<number>) => {
    cb(null, 0);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf);
  cc((_err, res) => {
    assertNumber(res);
    fn(res);
  });
  expect(fn.mock.calls[0][0]).toBe(0);
});

test('1 input + 0 result', async () => {
  const cf = (_a: string, cb: Callback) => {
    cb(undefined);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf, '');
  cc(() => {
    fn();
  });
  expect(fn.mock.calls[0][0]).toBe(undefined);
});

test('1 input + 1 result', async () => {
  const cf = (_a: string, cb: Callback<number>) => {
    cb(null, 0);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf, '');
  cc((_err, res) => {
    assertNumber(res);
    fn(res);
  });
  expect(fn.mock.calls[0][0]).toBe(0);
});

test('2 input + 0 result', async () => {
  const cf = (_a: string, _b: 'ba' | 'bb', cb: Callback) => {
    cb(undefined);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf, '', 'ba');
  cc(() => {
    fn();
  });
  expect(fn.mock.calls[0][0]).toBe(undefined);
});

test('2 input + 1 result', async () => {
  const cf = (_a: string, _b: 'ba' | 'bb', cb: Callback<number>) => {
    cb(null, 0);
  };
  const fn = vi.fn<() => void>();
  const cc = callbackCurry(cf, '', 'ba');
  cc((_err, res) => {
    assertNumber(res);
    fn(res);
  });
  expect(fn.mock.calls[0][0]).toBe(0);
});
