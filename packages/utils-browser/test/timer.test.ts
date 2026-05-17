import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { frameInterval } from '@/timer';
import type { TimerState } from '@cloudcome/utils-core/timer';

describe('帧间隔计时器', () => {
  let mockRAF: number;
  let mockCAF: Mock;
  let callbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    mockRAF = 0;
    callbacks = [];
    mockCAF = vi.fn<() => void>();

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return ++mockRAF;
    });

    vi.stubGlobal('cancelAnimationFrame', mockCAF);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('启动时应在每一帧调用回调函数', () => {
    const callback = vi.fn<(state: TimerState) => void>();
    const timer = frameInterval({
      runner: callback,
    });

    timer.start();
    callbacks[0]?.(0);
    const arg = callback.mock.calls[0][0];
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
  });

  it('应该支持 leading 选项', () => {
    const callback = vi.fn<() => void>();
    const timer = frameInterval({
      runner: callback,
      leading: true,
    });

    timer.start();
    expect(callback).toHaveBeenCalled();
  });

  it('停止时应支持 trailing 选项', () => {
    const callback = vi.fn<() => void>();
    const timer = frameInterval({
      runner: callback,
      trailing: true,
    });

    timer.start();
    callbacks[0]?.(0);

    timer.stop();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(mockCAF).toHaveBeenCalledWith(mockRAF);
  });

  it('暂停时应支持 trailing 选项', () => {
    const callback = vi.fn<() => void>();
    const timer = frameInterval({
      runner: callback,
      trailing: true,
    });

    timer.start();
    callbacks[0]?.(0);

    timer.pause();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(mockCAF).toHaveBeenCalledWith(mockRAF);
  });

  it('使用 immediate 标志时应立即恢复', async () => {
    const callback = vi.fn<(state: TimerState) => void>();
    const timer = frameInterval({
      runner: callback,
    });

    timer.start();
    callbacks[0]?.(0);
    timer.pause();

    timer.resume(true);
    await Promise.resolve(); // wait for async execute
    callbacks[1]?.(16);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback.mock.calls[1][0].times).toBe(2);
  });

  it('不使用 immediate 标志时应下一帧恢复', async () => {
    const callback = vi.fn<(state: TimerState) => void>();
    const timer = frameInterval({
      runner: callback,
    });

    timer.start();
    callbacks[0]?.(0);
    timer.pause();

    timer.resume();
    // resume() 调度了新的 RAF，callbacks[1] 是第一次 execute 调度的
    // callbacks[2] 才是 resume 调度的
    callbacks[1]?.(16); // 第一次 execute 的 RAF（pause 前调度的）
    callbacks[2]?.(32); // resume 调度的 RAF
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[0][0].times).toBe(1);
  });

  it('execute 应取消待处理 RAF 并立即执行下一次', () => {
    const callback = vi.fn<(state: TimerState) => void>();
    const timer = frameInterval({
      runner: callback,
    });

    timer.start();
    expect(callback).not.toHaveBeenCalled();

    timer.execute();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].times).toBe(1);
    expect(mockCAF).toHaveBeenCalled();
  });

  it('execute 在 stop 后应被忽略', () => {
    const callback = vi.fn<(state: TimerState) => void>();
    const timer = frameInterval({
      runner: callback,
    });

    timer.start();
    callbacks[0]?.(0);
    const count = callback.mock.calls.length;

    timer.stop();
    timer.execute();

    expect(callback).toHaveBeenCalledTimes(count);
  });

  it('condition 返回 false 时 callback 应执行，state.data 为 false', async () => {
    const callback = vi.fn<(state: TimerState<boolean>) => void>();
    const timer = frameInterval({
      runner: callback,
      condition: async () => false,
    });

    timer.start();
    callbacks[0]?.(0);
    await new Promise((r) => setTimeout(r, 10));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].data).toBe(false);
  });

  it('condition + leading 组合：leading 时 condition 也应调用', async () => {
    const callback = vi.fn<(state: TimerState<boolean>) => void>();
    const timer = frameInterval({
      runner: callback,
      leading: true,
      condition: async () => false,
    });

    timer.start();
    await new Promise((r) => setTimeout(r, 10));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].data).toBe(false);
  });

  it('condition + trailing 组合：trailing 时 condition 也应调用', async () => {
    const callback = vi.fn<(state: TimerState<boolean>) => void>();
    let callCount = 0;
    const timer = frameInterval({
      runner: callback,
      trailing: true,
      condition: async () => {
        callCount++;
        return callCount <= 1;
      },
    });

    timer.start();
    callbacks[0]?.(0);
    await new Promise((r) => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledTimes(1);

    timer.stop();
    await new Promise((r) => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
