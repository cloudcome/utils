import { isLikePromise, promiseDelay, promiseShared, promiseTimeout, promiseWhen } from '@/promise';

describe('promiseDelay', () => {
  it('应在指定时间后解决 Promise', async () => {
    const startTime = Date.now();
    await promiseDelay(100);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('如果 ms 为 0，应立即解决 Promise', async () => {
    const startTime = Date.now();
    await promiseDelay(0);
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10);
  });

  it('应在调用 abort 后解决 Promise', async () => {
    const ctrl = new AbortController();
    const startTime = Date.now();
    const promise = promiseDelay(1000, ctrl);
    ctrl.abort();
    await promise;
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });
});

describe('promiseTimeout', () => {
  it('如果 Promise 在指定时间内解决，应返回其结果', async () => {
    const result = await promiseTimeout(Promise.resolve('success'), 100);
    expect(result).toBe('success');
  });

  it('如果 Promise 在指定时间内未解决，应抛出 "timeout" 错误', async () => {
    await expect(promiseTimeout(promiseDelay(100), 0)).rejects.toThrow('timeout');
  });

  it('如果 Promise 在指定时间内恰好解决，应返回其结果', async () => {
    const result = await promiseTimeout(Promise.resolve('success'), 10);
    expect(result).toBe('success');
  });
});

describe('promiseWhen', () => {
  it('如果条件初始为真，应立即解决 Promise', async () => {
    const startTime = Date.now();
    await promiseWhen(() => true, 100);
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10);
  });

  it('应在条件变为真后解决 Promise', async () => {
    let conditionMet = false;
    setTimeout(() => {
      conditionMet = true;
    }, 100);
    const startTime = Date.now();
    await promiseWhen(() => conditionMet, 10);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('应使用较小的时间间隔检查条件', async () => {
    let conditionMet = false;
    setTimeout(() => {
      conditionMet = true;
    }, 50);
    const startTime = Date.now();
    await promiseWhen(() => conditionMet, 10);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(50);
  });
});

describe('isPromiseLike', () => {
  it('应正确判断 Promise 类型', async () => {
    try {
      const p1 = Promise.resolve();
      expect(isLikePromise(p1)).toBe(true);
      await p1;

      const p2 = Promise.reject();
      expect(isLikePromise(p2)).toBe(true);
      // 这里需要执行掉，否会打印未捕获的 promise 错误
      await p2;

      const p3 = new Promise<void>((r) => r());
      expect(isLikePromise(p3)).toBe(true);
      await p3;
    } catch (cause) {
      //
    }
  });

  it('应正确判断 Promise 类似对象', () => {
    // biome-ignore lint/suspicious/noThenProperty: <explanation>
    expect(isLikePromise({ then: () => {} })).toBe(true);
    // biome-ignore lint/suspicious/noThenProperty: <explanation>
    expect(isLikePromise({ then: 'not a function' })).toBe(false);
    expect(isLikePromise({})).toBe(false);
    expect(isLikePromise(null)).toBe(false);
    expect(isLikePromise(undefined)).toBe(false);
    expect(isLikePromise('string')).toBe(false);
    expect(isLikePromise(42)).toBe(false);
    expect(isLikePromise(true)).toBe(false);
    expect(isLikePromise(Symbol('sym'))).toBe(false);
    expect(isLikePromise(BigInt(123))).toBe(false);
    expect(isLikePromise(Number.NaN)).toBe(false);
    expect(isLikePromise(new Error('error'))).toBe(false);
  });
});

describe('sharedPromise', () => {
  it('应共享原始 Promise 的成功状态', async () => {
    const value = Math.random();
    const { promise, resolve } = Promise.withResolvers();
    const { promise: status, resolve: done } = Promise.withResolvers<void>();
    const shared1 = promiseShared(promise);

    setTimeout(async () => {
      // 在完成之前共享
      resolve(value);

      // 在完成之后共享
      await expect(promiseShared(promise)).resolves.toBe(value);
      done();
    }, 10);

    await expect(shared1).resolves.toBe(value);
    await expect(promise).resolves.toBe(value);

    await expect(status).resolves.toBe(undefined);
  });

  it('应共享原始 Promise 的拒绝状态', async () => {
    const value = Math.random();
    const { promise, reject } = Promise.withResolvers();
    const { promise: status, resolve: done } = Promise.withResolvers<void>();
    const shared1 = promiseShared(promise);

    setTimeout(async () => {
      // 在完成之前共享
      reject(value);

      // 在完成之后共享
      await expect(promiseShared(promise)).rejects.toBe(value);
      done();
    }, 10);

    await expect(shared1).rejects.toBe(value);
    await expect(promise).rejects.toBe(value);

    await expect(status).resolves.toBe(undefined);
  });
});
