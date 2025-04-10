import { afterEach, describe, expect, it, vi } from 'vitest';
import { timeInterval } from '../src/timer';

describe('timeInterval 定时器', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该按照指定间隔时间执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const timer = timeInterval(mockFn, 1000);

    // 立即执行
    expect(mockFn).not.toHaveBeenCalled();

    // 第一次执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 第二次执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
  });

  it('immediate=true 时应立即执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const timer = timeInterval(mockFn, 1000, true);

    // 立即执行
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 第一次间隔执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
  });

  it('调用 stop 后应停止定时器', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const timer = timeInterval(mockFn, 1000);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    timer.stop();

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('可以暂停和恢复定时器', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const timer = timeInterval(mockFn, 1000);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    timer.pause();

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    timer.resume();

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
  });

  it('回调函数应接收正确的参数', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const timer = timeInterval(mockFn, 1000);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        times: 1,
        startAt: expect.any(Date),
        currentAt: expect.any(Date),
        elapsedTime: expect.any(Number),
        intervalTime: expect.any(Number),
        stopAt: undefined,
        pauseAt: undefined,
        resumeAt: undefined,
      }),
    );

    timer.stop();
  });
});
