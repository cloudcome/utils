import { AsyncQueue, asyncLimit } from '@/async';
import { createAfn } from './helpers';

beforeEach(() => {
  vi.useFakeTimers();
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
