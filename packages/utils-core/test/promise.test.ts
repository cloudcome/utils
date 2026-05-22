import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMinDelayPromise,
  isPromiseLike,
  promiseDelay,
  promiseShared,
  promiseTimeout,
  promiseWhen,
} from '@/promise';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('promiseDelay', () => {
  it('应在指定时间后解决 Promise', async () => {
    const promise = promiseDelay(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });

  it('如果 ms 为 0，应立即解决 Promise', async () => {
    const promise = promiseDelay(0);
    vi.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();
  });

  it('应在调用 abort 后解决 Promise', async () => {
    const ctrl = new AbortController();
    const promise = promiseDelay(1000, ctrl);
    ctrl.abort();
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('promiseTimeout', () => {
  it('如果 Promise 在指定时间内解决，应返回其结果', async () => {
    const result = await promiseTimeout(Promise.resolve('success'), 100);
    expect(result).toBe('success');
  });

  it('如果 Promise 在指定时间内未解决，应抛出 "timeout" 错误', async () => {
    const promise = promiseTimeout(promiseDelay(100), 0);
    vi.advanceTimersByTime(1);
    await expect(promise).rejects.toThrow('timeout');
  });

  it('如果 Promise 在指定时间内恰好解决，应返回其结果', async () => {
    const result = await promiseTimeout(Promise.resolve('success'), 10);
    expect(result).toBe('success');
  });
});

describe('promiseWhen', () => {
  it('如果条件初始为真，应立即解决 Promise', async () => {
    const promise = promiseWhen(() => true, 100);
    await expect(promise).resolves.toBeUndefined();
  });

  it('应在条件变为真后解决 Promise', async () => {
    let conditionMet = false;
    setTimeout(() => {
      conditionMet = true;
    }, 100);
    const promise = promiseWhen(() => conditionMet, 10);
    vi.advanceTimersByTime(110);
    await expect(promise).resolves.toBeUndefined();
  });

  it('应使用较小的时间间隔检查条件', async () => {
    let conditionMet = false;
    setTimeout(() => {
      conditionMet = true;
    }, 50);
    const promise = promiseWhen(() => conditionMet, 10);
    vi.advanceTimersByTime(60);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('isPromiseLike', () => {
  it('应正确判断 Promise 类型', async () => {
    try {
      const p1 = Promise.resolve();
      expect(isPromiseLike(p1)).toBe(true);
      await p1;

      const p2 = Promise.reject();
      expect(isPromiseLike(p2)).toBe(true);
      // 这里需要执行掉，否会打印未捕获的 promise 错误
      await p2;

      const p3 = new Promise<void>((r) => r());
      expect(isPromiseLike(p3)).toBe(true);
      await p3;
    } catch {
      //
    }
  });

  it('应正确判断 Promise 类似对象', () => {
    // biome-ignore lint/suspicious/noThenProperty: 单测
    // oxlint-disable-next-line unicorn/no-thenable
    expect(isPromiseLike({ then: () => {} })).toBe(true);
    // biome-ignore lint/suspicious/noThenProperty: 单测
    // oxlint-disable-next-line unicorn/no-thenable
    expect(isPromiseLike({ then: 'not a function' })).toBe(false);
    expect(isPromiseLike({})).toBe(false);
    expect(isPromiseLike(null)).toBe(false);
    expect(isPromiseLike(undefined)).toBe(false);
    expect(isPromiseLike('string')).toBe(false);
    expect(isPromiseLike(42)).toBe(false);
    expect(isPromiseLike(true)).toBe(false);
    expect(isPromiseLike(Symbol('sym'))).toBe(false);
    expect(isPromiseLike(BigInt(123))).toBe(false);
    expect(isPromiseLike(Number.NaN)).toBe(false);
    expect(isPromiseLike(new Error('error'))).toBe(false);
  });
});

describe('sharedPromise', () => {
  it('应共享原始 Promise 的成功状态', async () => {
    const value = Math.random();
    const { promise, resolve } = Promise.withResolvers();
    const shared1 = promiseShared(promise);

    setTimeout(() => {
      resolve(value);
    }, 10);

    vi.advanceTimersByTime(10);

    await expect(shared1).resolves.toBe(value);
    await expect(promise).resolves.toBe(value);
    await expect(promiseShared(promise)).resolves.toBe(value);
  });

  it('应共享原始 Promise 的拒绝状态', async () => {
    const value = Math.random();
    const { promise, reject } = Promise.withResolvers();
    const shared1 = promiseShared(promise);

    setTimeout(() => {
      reject(value);
    }, 10);

    vi.advanceTimersByTime(10);

    await expect(shared1).rejects.toBe(value);
    await expect(promise).rejects.toBe(value);
    await expect(promiseShared(promise)).rejects.toBe(value);
  });
});

describe('createMinDelayPromise', () => {
  it('当实际执行时间小于最小等待时间时，应等待剩余时间', async () => {
    const minWait = 100;
    const end = createMinDelayPromise(minWait);

    const delayPromise = promiseDelay(50);
    vi.advanceTimersByTime(50);
    await delayPromise;

    const endPromise = end();
    vi.advanceTimersByTime(50);
    await expect(endPromise).resolves.toBeUndefined();
  });

  it('当实际执行时间大于最小等待时间时，应立即返回', async () => {
    const minWait = 50;
    const end = createMinDelayPromise(minWait);

    const delayPromise = promiseDelay(100);
    vi.advanceTimersByTime(100);
    await delayPromise;

    await expect(end()).resolves.toBeUndefined();
  });

  it('当最小等待时间为 0 时，应立即返回', async () => {
    const minWait = 0;
    const end = createMinDelayPromise(minWait);

    await expect(end()).resolves.toBeUndefined();
  });
});
