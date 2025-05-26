import { AsyncQueue, asyncLimit, asyncShared } from '@/async';
import { fnNoop } from '@/fn';
import { promiseDelay } from '@/promise';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAfn } from './helpers';

beforeEach(() => {
  vi.useFakeTimers();
});

describe('asyncShared', () => {
  it('应共享同一个异步函数的结果', async () => {
    const mockFn = vi.fn().mockImplementation(async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return id;
    });

    const sharedFn = asyncShared(mockFn);
    const result1 = sharedFn(1);
    const result2 = sharedFn(2);
    const result3 = sharedFn(3);

    await vi.runAllTimersAsync();
    await expect(result1).resolves.toBe(1);
    await expect(result2).resolves.toBe(1);
    await expect(result3).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1); // 三次 calling，一次 execute
  });

  it('应遵守 maxAge 设置', async () => {
    const mockFn = vi.fn().mockImplementation(async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return id;
    });

    const sharedFn = asyncShared(mockFn, { maxAge: 100 });
    const result1 = sharedFn(1);
    await vi.runAllTimersAsync();
    await expect(result1).resolves.toBe(1);

    // 在 maxAge 时间内再次调用
    await vi.advanceTimersByTimeAsync(50);
    const result2 = sharedFn(1);
    await vi.runAllTimersAsync();
    await expect(result2).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1); // 应使用缓存

    // 超过 maxAge 后再次调用
    await vi.advanceTimersByTimeAsync(100);
    const result3 = sharedFn(1);
    await vi.runAllTimersAsync();
    await expect(result3).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(2); // 应重新执行
  });

  it('应正确处理 trailing 选项', async () => {
    const mockFn = vi.fn().mockImplementation(async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return id;
    });

    const sharedFn = asyncShared(mockFn, { trailing: true });
    const result1 = sharedFn(1);
    const result2 = sharedFn(1); // 执行中再次调用

    await vi.runAllTimersAsync();
    await expect(result1).resolves.toBe(1);
    await expect(result2).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(2); // 应执行两次

    // 测试 trailing 选项在非执行期间的行为
    await vi.advanceTimersByTimeAsync(100);
    const result3 = sharedFn(1);
    await vi.runAllTimersAsync();
    await expect(result3).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(3); // 应再次执行
  });

  it('应正确处理错误情况', async () => {
    const error = new Error('test error');
    let times = 0;
    const mockFn = async () => {
      await promiseDelay();
      return times++ === 0 ? Promise.reject(error) : Promise.resolve('success');
    };

    const sharedFn = asyncShared(mockFn);

    const result1 = sharedFn();
    const result2 = sharedFn(); // 共享错误

    await vi.runAllTimersAsync();
    await expect(result1).rejects.toThrow(error);
    await expect(result2).rejects.toThrow(error);

    // 错误后再次调用应重新执行
    const result3 = sharedFn();
    await vi.runAllTimersAsync();
    await expect(result3).resolves.toBe('success');
  });

  it('应正确处理 onTrigger 回调', async () => {
    const mockFn = vi.fn().mockResolvedValue(1);
    const onTrigger = vi.fn();

    const sharedFn = asyncShared(mockFn, { onTrigger });
    sharedFn(1);
    sharedFn(1);

    await vi.runAllTimersAsync();
    expect(onTrigger).toHaveBeenCalledTimes(2); // 应调用两次
  });

  it('应正确处理 onExecute 回调', async () => {
    const mockFn = vi.fn().mockResolvedValue(1);
    const onTrigger = vi.fn();
    const onExecute = vi.fn();

    const sharedFn = asyncShared(mockFn, { onTrigger, onExecute });
    sharedFn(1);
    sharedFn(1);

    await vi.runAllTimersAsync();
    expect(onTrigger).toHaveBeenCalledTimes(2); // 应只触发一次
    expect(onExecute).toHaveBeenCalledTimes(1); // 应只调用一次
  });

  it('应正确处理 onSuccess 回调', async () => {
    const mockFn = vi.fn().mockResolvedValue(1);
    const onSuccess = vi.fn();

    const sharedFn = asyncShared(mockFn, { onSuccess });
    sharedFn(1);
    sharedFn(1);

    await vi.runAllTimersAsync();
    expect(onSuccess).toHaveBeenCalledTimes(1); // 应只调用一次
    expect(onSuccess).toHaveBeenCalledWith(1);
  });

  it('应正确处理 onError 回调', async () => {
    const error = new Error('test error');
    const mockFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const sharedFn = asyncShared(mockFn, { onError });
    sharedFn(1);
    sharedFn(1);

    await vi.runAllTimersAsync();
    expect(onError).toHaveBeenCalledTimes(1); // 应只调用一次
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('应正确处理 onFinally 回调', async () => {
    const mockFn = vi.fn().mockResolvedValue(1);
    const onFinally = vi.fn();

    const sharedFn = asyncShared(mockFn, { onFinally });
    sharedFn(1);
    sharedFn(1);

    await vi.runAllTimersAsync();
    expect(onFinally).toHaveBeenCalledTimes(1); // 应只调用一次
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('asyncLimit', () => {
  it('应正确处理空 Promise 数组', async () => {
    const results = await asyncLimit([], 2);
    expect(results).toEqual([]);
  });

  it('应在限制数量内并发执行 Promise', async () => {
    const delays = [100, 50, 200, 150];
    const results = asyncLimit(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
      2,
    );

    await vi.runAllTimersAsync();
    await expect(results).resolves.toEqual(delays);
  });

  it('应正确处理小于限制数量的 Promise', async () => {
    const delays = [100, 50];
    const results = asyncLimit(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
      5,
    );

    await vi.runAllTimersAsync();
    await expect(results).resolves.toEqual(delays);
  });

  it('应正确处理超过限制数量的 Promise', async () => {
    const delays = [100, 50, 200, 150, 300];
    const startTime = Date.now();
    const fn = vi.fn();
    const results = asyncLimit(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
          onResolved() {
            fn(Date.now() - startTime);
          },
        }),
      ),
      2,
    );

    await vi.runAllTimersAsync();
    await expect(results).resolves.toEqual(delays);
    expect(fn).toHaveBeenCalledTimes(5);
  });
});

describe('AsyncQueue', () => {
  it('应按顺序执行任务', async () => {
    const delays = [100, 50, 200];
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
    );

    const startPromise = queue.start();
    await vi.runAllTimersAsync();
    await expect(startPromise).resolves.toEqual(delays);
  });

  it('应正确处理空任务队列', async () => {
    const queue = new AsyncQueue<number>([]);
    const result = await queue.start();
    expect(result).toEqual([]);
  });

  it('应正确处理单个任务', async () => {
    const queue = new AsyncQueue([createAfn({ delay: 100, result: 1 })]);
    const result = queue.start();
    await vi.runAllTimersAsync();
    await expect(result).resolves.toEqual([1]);
  });

  it('应正确处理多个任务', async () => {
    const delays = [100, 50, 200];
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
    );

    const result = queue.start();
    await vi.runAllTimersAsync();
    await expect(result).resolves.toEqual(delays);
  });

  it('应正确处理任务失败', async () => {
    const error = new Error('test error');
    const queue = new AsyncQueue([() => Promise.reject(error)]);

    await expect(queue.start()).rejects.toThrow(error);
  });

  it('应正确处理任务添加和启动顺序', async () => {
    const queue = new AsyncQueue([]);
    const delay = 100;
    const promise1 = queue.push(() =>
      createAfn({
        delay: delay,
        result: delay,
      })(),
    );

    const promise2 = queue.start();
    await vi.runAllTimersAsync();
    await expect(promise1).resolves.toEqual(delay);
    await expect(promise2).resolves.toEqual([delay]);
  });

  it('应正确处理并发限制', async () => {
    const delays = [100, 50, 200, 150];
    const fn = vi.fn();
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
          onResolved() {
            fn();
          },
        }),
      ),
      { limit: 2 },
    );

    queue.start();
    expect(fn).toHaveBeenCalledTimes(0);
    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledTimes(2);
    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('应正确处理任务停止', async () => {
    const delays = [100, 50, 200];
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
    );

    const startPromise = queue.start();
    const stopPromise = queue.stop();
    await vi.runAllTimersAsync();
    await expect(startPromise).resolves.toEqual([100, 50, 200]);
    await expect(stopPromise).resolves.toEqual([100, 50, 200]);
  });

  it('应正确处理多次停止', async () => {
    const delays = [100, 50, 200];
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
    );

    const startPromise = queue.start();
    const stopPromise1 = queue.stop();
    const stopPromise2 = queue.stop();
    await vi.runAllTimersAsync();
    await expect(startPromise).resolves.toEqual([100, 50, 200]);
    await expect(stopPromise1).resolves.toEqual([100, 50, 200]);
    await expect(stopPromise2).resolves.toEqual([100, 50, 200]);
  });

  it('应正确处理停止后添加任务', async () => {
    const queue = new AsyncQueue([]);
    const stopPromise = queue.stop();
    const pushPromise = queue.push(createAfn({ delay: 100, result: 1 }));
    pushPromise.catch(fnNoop);
    await vi.runAllTimersAsync();
    await expect(stopPromise).resolves.toEqual([]);
    await expect(pushPromise).rejects.toThrow('异步队列已被终止，无法添加新的任务');
  });
});
