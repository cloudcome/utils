import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeInterval, timerInterval, type TimerState } from '../src/timer';

describe('timerInterval 定时器', () => {
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

describe('makeInterval 核心定时器', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('调用 start 后应开始定时器并立即执行', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();

    expect(runner).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);

    const state = runner.mock.calls[0][0] as TimerState;
    expect(state.times).toBe(1);
    expect(state.startAt).toBeGreaterThan(0);
    expect(state.stopAt).toBe(0);
    expect(state.intervalTime).toBe(0);

    timer.stop();
  });

  it('runner 带 next 参数时应由 runner 控制下一次调度', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState, next?: () => void) => void>();
    const timer = makeInterval(dispatch, runner);

    // runner.length === 2 时，runner 手动调用 next 才调度下一次
    timer.start();
    expect(dispatch).toHaveBeenCalledTimes(1);

    // 模拟 runner 不调用 next
    runner.mockReset();
    dispatch.mockReset();

    timer.stop();
  });

  it('多次执行应正确累加 times 和 intervalTime', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(runner).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(100);
    expect(runner).toHaveBeenCalledTimes(3);

    const secondCall = runner.mock.calls[1][0] as TimerState;
    expect(secondCall.times).toBe(2);
    expect(secondCall.intervalTime).toBe(100);

    const thirdCall = runner.mock.calls[2][0] as TimerState;
    expect(thirdCall.times).toBe(3);
    expect(thirdCall.intervalTime).toBe(100);

    timer.stop();
  });

  it('canStart 在 READY 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    expect(timer.canStart()).toBe(true);

    timer.start();
    expect(timer.canStart()).toBe(false);

    timer.stop();
  });

  it('canStop 在 START 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    expect(timer.canStop()).toBe(false);

    timer.start();
    expect(timer.canStop()).toBe(true);

    timer.stop();
    expect(timer.canStop()).toBe(false);
  });

  it('canPause 在 START 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    expect(timer.canPause()).toBe(false);

    timer.start();
    expect(timer.canPause()).toBe(true);

    timer.pause();
    expect(timer.canPause()).toBe(false);

    timer.stop();
  });

  it('canResume 在 PAUSE 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    expect(timer.canResume()).toBe(false);

    timer.start();
    timer.pause();
    expect(timer.canResume()).toBe(true);

    timer.resume();
    expect(timer.canResume()).toBe(false);

    timer.stop();
  });

  it('stop 后不应再执行', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    const firstCount = runner.mock.calls.length;

    timer.stop();

    // 再次调用 execute 应被忽略
    timer.execute();
    expect(runner).toHaveBeenCalledTimes(firstCount);
  });

  it('pause 后 execute 应被忽略', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    const countAfterStart = runner.mock.calls.length;

    timer.pause();
    timer.execute();

    expect(runner).toHaveBeenCalledTimes(countAfterStart);

    timer.stop();
  });

  it('resume 后应恢复执行并重置 lastAt', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    timer.pause();
    const pauseCallCount = runner.mock.calls.length;

    await vi.advanceTimersByTimeAsync(500);
    timer.resume();
    expect(runner).toHaveBeenCalledTimes(pauseCallCount + 1);

    const resumeState = runner.mock.calls[runner.mock.calls.length - 1][0] as TimerState;
    expect(resumeState.resumeAt).toBeGreaterThan(0);

    timer.stop();
  });

  it('elapsedTime 和 runningTime 应正确计算', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 200);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    const firstState = runner.mock.calls[0][0] as TimerState;
    expect(firstState.elapsedTime).toBe(0);
    expect(firstState.runningTime).toBe(0);

    await vi.advanceTimersByTimeAsync(200);
    const secondState = runner.mock.calls[1][0] as TimerState;
    expect(secondState.elapsedTime).toBe(200);
    expect(secondState.runningTime).toBe(200);

    timer.stop();
  });

  it('pause 后再 resume，runningTime 不应计算暂停期间的耗时', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    await vi.advanceTimersByTimeAsync(100);
    const beforePause = runner.mock.calls[runner.mock.calls.length - 1][0] as TimerState;
    const runningTimeBeforePause = beforePause.runningTime;

    timer.pause();
    await vi.advanceTimersByTimeAsync(500); // 暂停 500ms
    timer.resume();

    await vi.advanceTimersByTimeAsync(100);
    const afterResume = runner.mock.calls[runner.mock.calls.length - 1][0] as TimerState;
    // runningTime 只增加 resume 后的 100ms，不包括暂停的 500ms
    expect(afterResume.runningTime).toBeCloseTo(runningTimeBeforePause + 100, -1);

    timer.stop();
  });

  it('重复调用 start/pause/resume/stop 应被忽略', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    const count1 = runner.mock.calls.length;
    timer.start(); // 重复 start，应被忽略
    expect(runner).toHaveBeenCalledTimes(count1);

    timer.pause();
    timer.pause(); // 重复 pause，应被忽略
    expect(timer.canPause()).toBe(false);

    timer.resume();
    timer.resume(); // 重复 resume，应被忽略
    expect(timer.canResume()).toBe(false);

    timer.stop();
    timer.stop(); // 重复 stop，应被忽略
    expect(timer.canStop()).toBe(false);
  });

  it('execute 应清除上一次定时器并立即执行', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval(dispatch, runner);

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    // 在下次调度前调用 execute
    timer.execute();
    expect(runner).toHaveBeenCalledTimes(2);

    const executeState = runner.mock.calls[1][0] as TimerState;
    expect(executeState.times).toBe(2);

    timer.stop();
  });
});
