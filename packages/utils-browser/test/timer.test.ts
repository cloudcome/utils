import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { frameInterval } from '@/timer';

describe('帧间隔计时器', () => {
  let mockRAF: number;
  let mockCAF: Mock;
  let callbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    mockRAF = 0;
    callbacks = [];
    mockCAF = vi.fn();

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
    const callback = vi.fn();
    const timer = frameInterval(callback);

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
    const callback = vi.fn();
    const timer = frameInterval(callback, { leading: true });

    timer.start();
    expect(callback).toHaveBeenCalled();
  });

  it('停止时应支持 trailing 选项', () => {
    const callback = vi.fn();
    const timer = frameInterval(callback, { trailing: true });

    timer.start();
    callbacks[0]?.(0);

    timer.stop();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(mockCAF).toHaveBeenCalledWith(mockRAF);
  });

  it('暂停时应支持 trailing 选项', () => {
    const callback = vi.fn();
    const timer = frameInterval(callback, { trailing: true });

    timer.start();
    callbacks[0]?.(0);

    timer.pause();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(mockCAF).toHaveBeenCalledWith(mockRAF);
  });

  it('使用 immediate 标志时应立即恢复', () => {
    const callback = vi.fn();
    const timer = frameInterval(callback);

    timer.start();
    callbacks[0]?.(0);
    timer.pause();

    timer.resume(true);
    callbacks[1]?.(16);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback.mock.calls[1][0].times).toBe(2);
  });

  it('不使用 immediate 标志时应下一帧恢复', () => {
    const callback = vi.fn();
    const timer = frameInterval(callback);

    timer.start();
    callbacks[0]?.(0);
    timer.pause();

    timer.resume();
    callbacks[1]?.(16);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].times).toBe(1);
  });
});
