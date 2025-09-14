import { tryAsync, trySync } from '@/try';
import { describe, expect, test } from 'vitest';
import { assertError, assertNull, assertNumber, assertUndefined } from './helpers';

describe('trySyncFlatten', () => {
  test('resolved', () => {
    const [err, res] = trySync(() => 1);

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

  test('rejected', () => {
    const [err, res] = trySync(() => {
      throw 1;
    });

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

describe('tryAsyncFlatten', () => {
  test('resolved', async () => {
    const [err, res] = await tryAsync(async () => 1);

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
    const [err, res] = await tryAsync(async () => {
      throw 1;
    });

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
