import { describe, expect, test } from 'vitest';
import { tryFlatten } from '@/try';
import {
  type CallbackFunction0,
  type CallbackFunction1,
  callbackCurry,
} from '@/try/curry';
import { assertError, assertNumber, assertUndefined } from './helpers';

describe('tryFlatten + syncFunction', () => {
  test('resolved', () => {
    const [err, res] = tryFlatten(() => 1);

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
    const fn = () => {
      throw new Error('1');
    };
    const [err, res] = tryFlatten(() => {
      fn();
    });

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
      assertUndefined(res);
    }

    expect(err?.message).toBe('1');
    expect(res).toBeUndefined();
  });
});

describe('tryFlatten + callbackFunction 0', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction0<number> = (callback) => {
      setTimeout(() => {
        callback(null, 1);
      });
    };
    const [err, res] = await tryFlatten(callbackFunction);

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
    const callbackFunction: CallbackFunction0<number> = (callback) => {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryFlatten(callbackFunction);

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

describe('tryFlatten + callbackFunction 1', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction1<number, number> = (
      a,
      callback,
    ) => {
      setTimeout(() => {
        callback(null, a + 1);
      });
    };
    const [err, res] = await tryFlatten(callbackCurry(callbackFunction, 1));

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
      assertNumber(res);
    }

    expect(err).toBeUndefined();
    expect(res).toBe(2);
  });

  test('rejected', async () => {
    const callbackFunction: CallbackFunction1<number, number> = (
      _a,
      callback,
    ) => {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryFlatten(callbackCurry(callbackFunction, 1));

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

describe('tryFlatten + promiseLike', () => {
  test('resolved', async () => {
    const [err, res] = await tryFlatten(Promise.resolve(1));

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
    const [err, res] = await tryFlatten(Promise.reject(1));

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
