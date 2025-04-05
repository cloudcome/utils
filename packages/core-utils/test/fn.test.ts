import { fnDebounce, fnOnce, fnThrottle } from '@/fn';
import { describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fnDebounce', () => {
  it('应正确防抖函数', async () => {
    const mockFn = vi.fn();
    const debouncedFn = fnDebounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 150);

    await vi.runAllTimersAsync();
  });

  it('应支持 leading 选项', async () => {
    const mockFn = vi.fn();
    const debouncedFn = fnDebounce(mockFn, { wait: 100, leading: true });

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn();
    debouncedFn();

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 150);

    await vi.runAllTimersAsync();
  });

  it('应支持 cancel 方法', async () => {
    const mockFn = vi.fn();
    const debouncedFn = fnDebounce(mockFn, 100);

    debouncedFn();
    debouncedFn.cancel();

    setTimeout(() => {
      expect(mockFn).not.toHaveBeenCalled();
    }, 150);

    await vi.runAllTimersAsync();
  });

  it('应支持多次调用 cancel 方法', async () => {
    const mockFn = vi.fn();
    const debouncedFn = fnDebounce(mockFn, 100);

    debouncedFn();
    debouncedFn.cancel();
    debouncedFn.cancel();

    setTimeout(() => {
      expect(mockFn).not.toHaveBeenCalled();
    }, 150);

    await vi.runAllTimersAsync();
  });

  it('应支持多次调用 debounced 函数', async () => {
    const mockFn = vi.fn();
    const debouncedFn = fnDebounce(mockFn, 100);

    debouncedFn();
    setTimeout(() => {
      debouncedFn();
    }, 50);
    setTimeout(() => {
      debouncedFn();
    }, 100);
    setTimeout(() => {
      debouncedFn();
    }, 150);
    setTimeout(() => {
      // 等待最后一次计时结束
    }, 150);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('fnThrottle', () => {
  it('应正确节流函数调用', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    setTimeout(() => {
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(0);
    }, 50);

    setTimeout(() => {
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 100);

    setTimeout(() => {
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 150);

    setTimeout(() => {
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 200);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应支持 leading 选项', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, { wait: 100, leading: true });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();

    setTimeout(() => {
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 100);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应支持 trailing 选项', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, { wait: 100, trailing: true });

    throttledFn();
    throttledFn();
    throttledFn();

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(0);
    }, 50);

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 100);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持 trailing 选项', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, { wait: 100, trailing: true });

    throttledFn();
    throttledFn();
    throttledFn();

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(0);
    }, 50);

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 100);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持 leading + trailing 选项', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, { wait: 100, leading: true, trailing: true });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, 50);

    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 100);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应取消节流函数调用', async () => {
    const mockFn = vi.fn();
    const throttledFn = fnThrottle(mockFn, 100);

    throttledFn();
    throttledFn.cancel();

    setTimeout(() => {
      throttledFn();
    }, 100);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(0);
  });
});

describe('fnOnce', () => {
  it('应确保函数只被调用一次', () => {
    const mockFn = vi.fn();
    const onceFn = fnOnce(mockFn);

    onceFn();
    onceFn();
    onceFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持多次调用，但只执行一次', () => {
    const mockFn = vi.fn();
    const onceFn = fnOnce(mockFn);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持传递参数', () => {
    const mockFn = vi.fn();
    const onceFn = fnOnce(mockFn);

    onceFn('arg1', 'arg2');
    onceFn('arg3', 'arg4');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
