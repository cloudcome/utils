import { createPromise, promiseTimeout, promiseWhen, wait } from '@/promise';

describe('wait', () => {
  it('应在指定时间后解决 Promise', async () => {
    const startTime = Date.now();
    await wait(100);
    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });

  it('如果 ms 为 0，应立即解决 Promise', async () => {
    const startTime = Date.now();
    await wait(0);
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10);
  });

  it('应在调用 abort 后解决 Promise', async () => {
    const ctrl = new AbortController();
    const startTime = Date.now();
    const promise = wait(1000, ctrl);
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
    await expect(promiseTimeout(wait(100), 0)).rejects.toThrow('timeout');
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

describe('createPromise', () => {
  it('应在调用 resolve 后解决 Promise', async () => {
    const { promise, resolve } = createPromise<string>();
    const result = promise.then((value) => value);
    resolve('resolved');
    expect(await result).toBe('resolved');
  });

  it('应在调用 reject 后拒绝 Promise', async () => {
    const { promise, reject } = createPromise<string>();
    const result = promise.catch((reason) => reason);
    reject('rejected');
    expect(await result).toBe('rejected');
  });
});
