import { asyncLimit } from '@/async';
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
          timeout: delay,
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
          timeout: delay,
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
          timeout: delay,
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
