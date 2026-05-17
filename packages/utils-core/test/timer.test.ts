import { afterEach, describe, expect, it, vi } from 'vitest';
import { timerInterval, type TimerState } from '../src/timer';

describe('timeInterval 定时器', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该按照指定间隔时间执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval(mockFn, 1000);

    // 立即执行
    timer.start();
    expect(mockFn).not.toHaveBeenCalled();

    // 第一次执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 第二次执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('immediate=true 时应立即执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval(mockFn, 1000, { leading: true, trailing: true });

    // 立即执行
    timer.start();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 第一次间隔执行
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // 停止执行
    timer.stop();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('调用 stop 后应停止定时器', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval(mockFn, 1000);

    timer.start();
    expect(mockFn).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    timer.stop();

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('可以暂停和恢复定时器', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval(mockFn, 1000);

    timer.start();
    expect(mockFn).toHaveBeenCalledTimes(0);

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
    const mockFn = vi.fn<(state: TimerState) => void>();
    const timer = timerInterval(mockFn, 1000);

    timer.start();

    await vi.advanceTimersByTimeAsync(1000);
    const arg = mockFn.mock.calls[0][0];
    expect(Object.keys(arg)).toEqual(
      expect.arrayContaining([
        'times',
        'startAt',
        'stopAt',
        'pauseAt',
        'resumeAt',
        'currentAt',
        'elapsedTime',
        'runningTime',
        'intervalTime',
      ]),
    );

    timer.stop();
  });
});
