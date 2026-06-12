import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fnDebounce, fnOnce, fnRetry, fnThrottle } from '@/function';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fnDebounce', () => {
  it('应正确防抖函数', async () => {
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
    const debouncedFn = fnDebounce(mockFn, 100);

    debouncedFn();
    debouncedFn.cancel();

    setTimeout(() => {
      expect(mockFn).not.toHaveBeenCalled();
    }, 150);

    await vi.runAllTimersAsync();
  });

  it('应支持多次调用 cancel 方法', async () => {
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
    const throttledFn = fnThrottle(mockFn, {
      wait: 100,
      leading: true,
      trailing: true,
    });

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

  it('leading + trailing 单次调用不应执行两次', async () => {
    const mockFn = vi.fn<() => void>();
    const throttledFn = fnThrottle(mockFn, {
      wait: 100,
      leading: true,
      trailing: true,
    });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应取消节流函数调用', async () => {
    const mockFn = vi.fn<() => void>();
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
    const mockFn = vi.fn<() => void>();
    const onceFn = fnOnce(mockFn);

    onceFn();
    onceFn();
    onceFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持多次调用，但只执行一次', () => {
    const mockFn = vi.fn<() => void>();
    const onceFn = fnOnce(mockFn);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    onceFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应支持传递参数', () => {
    const mockFn = vi.fn<(arg1: string, arg2: string) => void>();
    const onceFn = fnOnce(mockFn);

    onceFn('arg1', 'arg2');
    onceFn('arg3', 'arg4');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('fnRetry', () => {
  it('成功时应立即返回结果', async () => {
    const mockFn = vi.fn<() => Promise<string>>().mockResolvedValue('success');
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3 });

    const result = await retriedFn();

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('失败时应重试直到成功', async () => {
    vi.useRealTimers();
    const mockFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3, delay: 10 });

    const result = await retriedFn();

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
    vi.useFakeTimers();
  });

  it('耗尽次数后应抛出最后一次错误', async () => {
    vi.useRealTimers();
    const err = new Error('always fail');
    const mockFn = vi.fn<() => Promise<void>>().mockImplementation(() => Promise.reject(err));
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3, delay: 10 });

    await expect(retriedFn()).rejects.toThrow('always fail');
    expect(mockFn).toHaveBeenCalledTimes(3);
    vi.useFakeTimers();
  });

  it('应支持 delay 选项', async () => {
    vi.useRealTimers();
    const mockFn = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success');
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3, delay: 50 });

    const start = Date.now();
    await retriedFn();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(40);
    vi.useFakeTimers();
  });

  it('delay 为 0 时不应等待', async () => {
    const mockFn = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success');
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3, delay: 0 });

    const start = Date.now();
    await retriedFn();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it('应支持 skipRetry 自定义跳过重试条件', async () => {
    class NetworkError extends Error {
      constructor() {
        super('network');
      }
    }
    class AuthError extends Error {
      constructor() {
        super('auth');
      }
    }

    const mockFn = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new NetworkError())
      .mockRejectedValueOnce(new AuthError())
      .mockResolvedValue(undefined);
    const retriedFn = fnRetry(mockFn, {
      maxAttempts: 3,
      skipRetry: (e) => e instanceof AuthError,
    });

    await expect(retriedFn()).rejects.toThrow('auth');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('skipRetry 返回 false 时应继续重试', async () => {
    vi.useRealTimers();
    const mockFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('retryable'))
      .mockRejectedValueOnce(new Error('retryable'))
      .mockResolvedValue('success');
    const retriedFn = fnRetry(mockFn, {
      maxAttempts: 3,
      delay: 10,
      skipRetry: () => false,
    });

    const result = await retriedFn();
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
    vi.useFakeTimers();
  });

  it('应支持抛出错误的同步函数', async () => {
    const mockFn = vi
      .fn<() => number>()
      .mockImplementationOnce(() => {
        throw new Error('fail 1');
      })
      .mockImplementationOnce(() => {
        throw new Error('fail 2');
      })
      .mockImplementationOnce(() => 42);
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3 });

    const result = await retriedFn();
    expect(result).toBe(42);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('应正确传递参数', async () => {
    const mockFn = vi
      .fn<(a: number, b: string) => Promise<string>>()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const retriedFn = fnRetry(mockFn, { maxAttempts: 3 });

    await retriedFn(42, 'hello');

    expect(mockFn).toHaveBeenNthCalledWith(1, 42, 'hello');
    expect(mockFn).toHaveBeenNthCalledWith(2, 42, 'hello');
  });

  it('maxAttempts 为 1 时不应重试', async () => {
    const err = new Error('fail');
    const mockFn = vi.fn<() => Promise<void>>().mockImplementation(() => Promise.reject(err));
    const retriedFn = fnRetry(mockFn, { maxAttempts: 1 });

    await expect(retriedFn()).rejects.toThrow('fail');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
