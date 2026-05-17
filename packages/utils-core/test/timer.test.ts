import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeInterval, timerInterval, type TimerState } from '../src/timer';

describe('timerInterval 定时器', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该按照指定间隔时间执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

    timer.start();
    expect(mockFn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('leading=true 时应立即执行回调', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
      leading: true,
      trailing: true,
    });

    timer.start();
    expect(mockFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    timer.stop();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('调用 stop 后应停止定时器', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<() => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

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
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

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
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

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

  it('execute 应清除待处理定时器并立即执行下一次', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<(state: TimerState) => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

    timer.start();
    expect(mockFn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(mockFn).not.toHaveBeenCalled();

    timer.execute();
    expect(mockFn).toHaveBeenCalledTimes(1);

    const state = mockFn.mock.calls[0][0] as TimerState;
    expect(state.times).toBe(1);

    timer.stop();
  });

  it('execute 在 stop 后应被忽略', async () => {
    vi.useFakeTimers();
    const mockFn = vi.fn<(state: TimerState) => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
    });

    timer.start();
    await vi.advanceTimersByTimeAsync(1000);
    const count = mockFn.mock.calls.length;

    timer.stop();
    timer.execute();

    expect(mockFn).toHaveBeenCalledTimes(count);
  });

  it('condition 返回 false 时 runner 应执行，state.data 为 false', async () => {
    vi.useRealTimers();
    const mockFn = vi.fn<(state: TimerState<boolean>) => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 100,
      condition: async () => false,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 200));

    expect(mockFn).toHaveBeenCalled();
    const state = mockFn.mock.calls[0][0] as TimerState<boolean>;
    expect(state.data).toBe(false);

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition + leading 组合：leading 时 condition 也应调用', async () => {
    vi.useRealTimers();
    const mockFn = vi.fn<(state: TimerState<boolean>) => void>();
    const timer = timerInterval({
      runner: mockFn,
      interval: 1000,
      leading: true,
      condition: async () => false,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(mockFn).toHaveBeenCalledTimes(1);
    const state = mockFn.mock.calls[0][0] as TimerState<boolean>;
    expect(state.data).toBe(false);

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition + trailing 组合：trailing 时 condition 也应调用', async () => {
    vi.useRealTimers();
    const mockFn = vi.fn<(state: TimerState<boolean>) => void>();
    let callCount = 0;
    const timer = timerInterval({
      runner: mockFn,
      interval: 100,
      trailing: true,
      condition: async () => {
        callCount++;
        return callCount <= 1;
      },
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 150));
    expect(mockFn).toHaveBeenCalledTimes(1);

    timer.stop();
    await new Promise((r) => setTimeout(r, 50));
    // trailing execute 也会调用 condition 和 runner
    expect(mockFn).toHaveBeenCalledTimes(2);

    vi.useFakeTimers();
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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    timer.start();

    expect(runner).toHaveBeenCalledTimes(1);

    const state = runner.mock.calls[0][0] as TimerState;
    expect(state.times).toBe(1);
    expect(state.startAt).toBeGreaterThan(0);
    expect(state.stopAt).toBe(0);
    expect(state.intervalTime).toBe(0);

    timer.stop();
  });

  it('多次执行应正确累加 times 和 intervalTime', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    expect(timer.canStart()).toBe(true);

    timer.start();
    expect(timer.canStart()).toBe(false);

    timer.stop();
  });

  it('canStop 在 START 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    expect(timer.canStop()).toBe(false);

    timer.start();
    expect(timer.canStop()).toBe(true);

    timer.stop();
    expect(timer.canStop()).toBe(false);
  });

  it('canPause 在 START 状态应返回 true', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    timer.start();
    const firstCount = runner.mock.calls.length;

    timer.stop();

    timer.execute();
    expect(runner).toHaveBeenCalledTimes(firstCount);
  });

  it('pause 后 execute 应被忽略', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

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
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    timer.start();
    await vi.advanceTimersByTimeAsync(100);
    const beforePause = runner.mock.calls[runner.mock.calls.length - 1][0] as TimerState;
    const runningTimeBeforePause = beforePause.runningTime;

    timer.pause();
    await vi.advanceTimersByTimeAsync(500);
    timer.resume();

    await vi.advanceTimersByTimeAsync(100);
    const afterResume = runner.mock.calls[runner.mock.calls.length - 1][0] as TimerState;
    expect(afterResume.runningTime).toBeCloseTo(runningTimeBeforePause + 100, -1);

    timer.stop();
  });

  it('重复调用 start/pause/resume/stop 应被忽略', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    timer.start();
    const count1 = runner.mock.calls.length;
    timer.start();
    expect(runner).toHaveBeenCalledTimes(count1);

    timer.pause();
    timer.pause();
    expect(timer.canPause()).toBe(false);

    timer.resume();
    timer.resume();
    expect(timer.canResume()).toBe(false);

    timer.stop();
    timer.stop();
    expect(timer.canStop()).toBe(false);
  });

  it('execute 应清除上一次定时器并立即执行', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
    });

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    timer.execute();
    expect(runner).toHaveBeenCalledTimes(2);

    const executeState = runner.mock.calls[1][0] as TimerState;
    expect(executeState.times).toBe(2);

    timer.stop();
  });

  it('condition 返回 true 时应执行 runner，state.data 为 true', async () => {
    vi.useRealTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState<boolean>) => void>();
    const condition = vi.fn<() => Promise<boolean>>().mockResolvedValue(true);
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      condition,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(condition).toHaveBeenCalled();
    expect(runner).toHaveBeenCalledTimes(1);
    const state = runner.mock.calls[0][0] as TimerState<boolean>;
    expect(state.data).toBe(true);

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition 返回 false 时应执行 runner，state.data 为 false', async () => {
    vi.useRealTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState<boolean>) => void>();
    const condition = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      condition,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(condition).toHaveBeenCalled();
    expect(runner).toHaveBeenCalledTimes(1);
    const state = runner.mock.calls[0][0] as TimerState<boolean>;
    expect(state.data).toBe(false);

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition 抛错时应跳过 runner', async () => {
    vi.useRealTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const condition = vi.fn<() => Promise<boolean>>().mockRejectedValue(new Error('fail'));
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      condition,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(condition).toHaveBeenCalled();
    expect(runner).not.toHaveBeenCalled();

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition 返回 0 时应执行 runner，state.data 为 0', async () => {
    vi.useRealTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState<number>) => void>();
    const condition = vi.fn<() => Promise<number>>().mockResolvedValue(0);
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      condition,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 50));

    expect(condition).toHaveBeenCalled();
    expect(runner).toHaveBeenCalledTimes(1);
    const state = runner.mock.calls[0][0] as TimerState<number>;
    expect(state.data).toBe(0);

    timer.stop();
    vi.useFakeTimers();
  });

  it('condition 返回值应存入 state.data', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState<{ ok: boolean }>) => void>();
    const condition = vi.fn<() => Promise<{ ok: boolean }>>().mockResolvedValue({ ok: true });
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      condition,
    });

    timer.start();
    await vi.advanceTimersByTimeAsync(100);

    const state = runner.mock.calls[0][0] as TimerState<{ ok: boolean }>;
    expect(state.data).toEqual({ ok: true });

    timer.stop();
  });

  it('leading: true 时应立即执行', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      leading: true,
    });

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    timer.stop();
  });

  it('leading: false 时应延迟执行', () => {
    const dispatch = vi.fn<(call: () => void) => void>();
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      leading: false,
    });

    timer.start();
    expect(runner).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);

    timer.stop();
  });

  it('trailing: true + stop 时应额外执行一次', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      trailing: true,
    });

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    timer.stop();
    expect(runner).toHaveBeenCalledTimes(2);
  });

  it('trailing: true + pause 时应额外执行一次', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn<(call: () => void) => void>();
    dispatch.mockImplementation((call: () => void) => {
      setTimeout(call, 100);
    });
    const runner = vi.fn<(timer: TimerState) => void>();
    const timer = makeInterval({
      dispatcher: dispatch,
      runner,
      trailing: true,
    });

    timer.start();
    expect(runner).toHaveBeenCalledTimes(1);

    timer.pause();
    expect(runner).toHaveBeenCalledTimes(2);

    timer.stop();
  });
});
