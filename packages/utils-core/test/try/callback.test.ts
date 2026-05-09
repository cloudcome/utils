import { describe, expect, test } from 'vitest';
import { tryCallback } from '@/try/callback';
import type {
  CallbackFunction0,
  CallbackFunction1,
  CallbackFunction2,
} from '@/try/curry';
import { assertError, assertNumber, assertUndefined } from './helpers';

describe('tryCallbackFlatten 0 input + 0 result', () => {
  test('resolved', async () => {
    const callbackFunction = (callback: (err: Error | null) => void) => {
      setTimeout(() => {
        callback(null);
      });
    };
    const [err, res] = await tryCallback(callbackFunction);

    if (err) {
      assertError(err);
    } else {
      assertUndefined(err);
    }

    expect(err).toBeUndefined();
    expect(res).toBe(undefined);
  });

  test('rejected', async () => {
    const callbackFunction = (callback: (err: Error | null) => void) => {
      setTimeout(() => {
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryCallback(callbackFunction);

    if (err) {
      assertError(err);
    } else {
      assertUndefined(err);
    }

    expect(err?.message).toBe('1');
    expect(res).toBeUndefined();
  });
});

describe('tryCallbackFlatten 0 input + 1 result', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction0<number> = (callback) => {
      setTimeout(() => {
        callback(null, 1);
      });
    };
    const [err, res] = await tryCallback(callbackFunction);

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
    const [err, res] = await tryCallback(callbackFunction);

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

describe('tryCallbackFlatten 1 input + 0 result', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction1<string> = (_a, callback) => {
      setTimeout(() => {
        callback(null);
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '');

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
    }

    expect(err).toBeUndefined();
    expect(res).toBeUndefined();
  });

  test('rejected', async () => {
    const callbackFunction: CallbackFunction1<string> = (_a, callback) => {
      setTimeout(() => {
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '');

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
    }

    expect(err?.message).toBe('1');
    expect(res).toBeUndefined();
  });
});

describe('tryCallbackFlatten 1 input + 1 result', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction1<string, number> = (
      _a,
      callback,
    ) => {
      setTimeout(() => {
        callback(null, 1);
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '');

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
    const callbackFunction: CallbackFunction1<string, number> = (
      _a,
      callback,
    ) => {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '');

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

describe('tryCallbackFlatten 2 input + 0 result', () => {
  test('resolved', async () => {
    const callbackFunction = (
      _a: string,
      _b: 'b1' | 'b2',
      callback: (err: Error | null) => void,
    ) => {
      setTimeout(() => {
        callback(null);
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '', 'b1');

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
    }

    expect(err).toBeUndefined();
    expect(res).toBeUndefined();
  });

  test('rejected', async () => {
    const callbackFunction = (
      _a: string,
      _b: 'b1' | 'b2',
      callback: (err: Error | null) => void,
    ) => {
      setTimeout(() => {
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '', 'b1');

    if (err) {
      assertError(err);
      assertUndefined(res);
    } else {
      assertUndefined(err);
    }

    expect(err?.message).toBe('1');
    expect(res).toBeUndefined();
  });
});

describe('tryCallbackFlatten 2 input + 1 result', () => {
  test('resolved', async () => {
    const callbackFunction: CallbackFunction2<string, 'b1' | 'b2', number> = (
      _a,
      _b,
      callback,
    ) => {
      setTimeout(() => {
        callback(null, 1);
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '', 'b1');

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
    const callbackFunction: CallbackFunction2<string, 'b1' | 'b2', number> = (
      _a,
      _b,
      callback,
    ) => {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        callback(new Error('1'));
      });
    };
    const [err, res] = await tryCallback(callbackFunction, '', 'b1');

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
