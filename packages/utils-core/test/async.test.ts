import { AsyncQueue, asyncLimit, asyncShared } from '@/async';
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
    const result2 = sharedFn(1);
    const result3 = sharedFn(2);

    await vi.runAllTimersAsync();
    await expect(result1).resolves.toBe(1);
    await expect(result2).resolves.toBe(1);
    await expect(result3).resolves.toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1); // 只应调用一次
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
  });

  it('应正确处理错误情况', async () => {
    const error = new Error('test error');
    const mockFn = vi
      .fn()
      .mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        throw error;
      })
      .mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'success';
      });

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

  it('应遵守并发限制', async () => {
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

  it('应正确处理任务添加', async () => {
    const queue = new AsyncQueue([]);
    const delay = 100;
    const promise = queue.add(() =>
      createAfn({
        delay: delay,
        result: delay,
      })(),
    );

    queue.start();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual(delay);
  });

  it('应处理任务失败', async () => {
    const error = new Error('test error');
    const queue = new AsyncQueue([() => Promise.reject(error)]);

    await expect(queue.start()).rejects.toThrow(error);
  });

  it('应正确停止任务执行', async () => {
    const delays = [100, 50, 200];
    const queue = new AsyncQueue(
      delays.map((delay) =>
        createAfn({
          delay: delay,
          result: delay,
        }),
      ),
    );

    const start1Promise = queue.start();
    const start2Promise = queue.start();
    const add1Promise = queue.add(createAfn({ delay: 300, result: 300 }));
    const add2Promise = queue.add(createAfn({ delay: 400, result: 400 }));
    const stop1Promise = queue.stop();
    const stop2Promise = queue.stop();
    await vi.runAllTimersAsync();
    await expect(start1Promise).resolves.toEqual([100, 50, 200]);
    await expect(start2Promise).resolves.toEqual([100, 50, 200]);
    await expect(add1Promise).resolves.toEqual(300);
    await expect(add2Promise).resolves.toEqual(400);
    await expect(stop1Promise).resolves.toEqual([100, 50, 200, 300, 400]);
    await expect(stop2Promise).resolves.toEqual([100, 50, 200, 300, 400]);
  });
});
