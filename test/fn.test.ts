import { fnDebounce } from '@/fn';
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
