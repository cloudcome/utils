import { describe, expect, test } from 'vitest';
import { tryPromise } from '@/try/promise';
import { assertError, assertNumber, assertUndefined } from './helpers';

describe('tryPromiseFlatten', () => {
  test('resolved', async () => {
    const [err, res] = await tryPromise(Promise.resolve(1));

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
      assertNumber(res);
    }

    expect(err).toBeUndefined();
    expect(res).toBe(1);
  });

  test('rejected', async () => {
    const [err, res] = await tryPromise(Promise.reject(1));

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
      assertNumber(res);
    }

    expect(err?.message).toBe('1');
    expect(res).toBeUndefined();
  });
});
