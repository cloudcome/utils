import { MemoryCache } from '@cloudcome/utils-core/cache';
import { promiseDelay } from '@cloudcome/utils-core/promise';
import { describe, expect, it, vi } from 'vitest';
import { useRequest } from '@/request';
import type { AnyAsyncFunction, AnyFunction } from '@cloudcome/utils-core/types';

describe('useRequest 组合式函数', () => {
  const mockRequestFn = vi.fn<AnyAsyncFunction>();
  const mockOptions = {
    onSuccess: vi.fn<() => void>(),
    onCacheHit: vi.fn<() => void>(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (new MemoryCache() as MemoryCache<unknown>).clear();
  });

  it('应该正确处理基本请求', async () => {
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);
    const { loading, data, error, sendAsync } = useRequest((arg: string) => mockRequestFn(arg), mockOptions);

    const promise = sendAsync('test');
    expect(loading.value).toBe(true);

    await promise;
    expect(loading.value).toBe(false);
    expect(data.value).toEqual(mockData);
    expect(error.value).toBeNull();
    expect(mockOptions.onSuccess).toHaveBeenCalledWith(mockData, 'test');
  });

  it('应该处理请求失败', async () => {
    const mockError = new Error('test error');
    mockRequestFn.mockRejectedValue(mockError);
    const { loading, error, sendAsync } = useRequest(mockRequestFn);

    await expect(sendAsync('test')).rejects.toThrow(mockError);
    expect(loading.value).toBe(false);
    expect(error.value).toEqual(mockError);
  });

  it('应该支持缓存功能', async () => {
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);
    const { hitCache, sendAsync } = useRequest(mockRequestFn, {
      id: 'test-cache',
      cache: true,
      onCacheHit: mockOptions.onCacheHit,
    });

    await sendAsync('test');
    expect(hitCache.value).toBe(false);
    expect(mockOptions.onCacheHit).not.toHaveBeenCalled();

    await sendAsync('test');
    expect(hitCache.value).toBe(true);
    expect(mockOptions.onCacheHit).toHaveBeenCalled();
    expect(mockRequestFn).toHaveBeenCalledTimes(1);
  });

  it('应该支持共享请求功能', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => mockData);

    const id = 'test-share';
    const {
      hitShare: hs1,
      sendAsync: sendAsync1,
      data: data1,
    } = useRequest(fn, {
      id,
      share: true,
    });
    const {
      hitShare: hs2,
      sendAsync: sendAsync2,
      data: data2,
    } = useRequest(fn, {
      id,
      share: true,
    });

    await sendAsync1(1);
    await sendAsync2(1);

    expect(hs1.value).toBe(false);
    expect(hs2.value).toBe(true);

    expect(data1.value).toEqual(mockData);
    expect(data2.value).toEqual(mockData);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该支持禁用缓存', async () => {
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);
    const { hitCache, sendAsync } = useRequest(mockRequestFn, {
      id: 'test-cache',
      cache: { disabled: true },
    });

    await sendAsync('test');
    await sendAsync('test');
    expect(hitCache.value).toBe(false);
    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  it('应该支持禁用共享请求', async () => {
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);
    const { hitShare, sendAsync } = useRequest(mockRequestFn, {
      id: 'test-share',
      share: { disabled: true },
    });

    const promise1 = sendAsync('test');
    const promise2 = sendAsync('test');
    await Promise.all([promise1, promise2]);

    expect(hitShare.value).toBe(false);
    expect(mockRequestFn).toHaveBeenCalledTimes(2);
  });

  // 新增测试：异步钩子支持
  it('应该支持异步onSuccess钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnSuccess = vi.fn<AnyFunction>().mockImplementation(() => promiseDelay(10));
    mockRequestFn.mockResolvedValue(mockData);

    const { sendAsync } = useRequest(mockRequestFn, {
      onSuccess: asyncOnSuccess,
    });

    await sendAsync('test');
    expect(asyncOnSuccess).toHaveBeenCalledWith(mockData, 'test');
  });

  it('应该支持异步onError钩子', async () => {
    const mockError = new Error('test error');
    const asyncOnError = vi.fn<AnyFunction>().mockImplementation(() => promiseDelay(10));
    mockRequestFn.mockRejectedValue(mockError);

    const { sendAsync } = useRequest(mockRequestFn, {
      onError: asyncOnError,
    });

    await expect(sendAsync('test')).rejects.toThrow(mockError);
    expect(asyncOnError).toHaveBeenCalledWith(mockError, 'test');
  });

  it('应该支持异步onAfter钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnAfter = vi.fn<AnyFunction>().mockImplementation(() => promiseDelay(10));
    mockRequestFn.mockResolvedValue(mockData);

    const { sendAsync } = useRequest(mockRequestFn, {
      onAfter: asyncOnAfter,
    });

    await sendAsync('test');
    expect(asyncOnAfter).toHaveBeenCalledWith('test');
  });

  it('应该按正确顺序执行异步钩子', async () => {
    const executionOrder: string[] = [];
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);

    const options = {
      onSuccess: vi.fn<AnyFunction>().mockImplementation(async () => {
        executionOrder.push('onSuccess');
        await promiseDelay(5);
      }),
      onAfter: vi.fn<AnyFunction>().mockImplementation(async () => {
        executionOrder.push('onAfter');
        await promiseDelay(5);
      }),
    };

    const { sendAsync } = useRequest(mockRequestFn, options);

    await sendAsync('test');

    expect(executionOrder).toEqual(['onSuccess', 'onAfter']);
    expect(options.onSuccess).toHaveBeenCalledWith(mockData, 'test');
    expect(options.onAfter).toHaveBeenCalledWith('test');
  });

  it('应该支持异步onCacheHit钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnCacheHit = vi.fn<AnyFunction>().mockImplementation(() => promiseDelay(10));
    mockRequestFn.mockResolvedValue(mockData);

    // 第一次请求填充缓存
    const { sendAsync: firstSendAsync } = useRequest(mockRequestFn, {
      id: 'test-cache-async',
      cache: true,
    });

    await firstSendAsync('test');

    // 第二次请求应该命中缓存
    const { hitCache, sendAsync: secondSendAsync } = useRequest(mockRequestFn, {
      id: 'test-cache-async',
      cache: true,
      onCacheHit: asyncOnCacheHit,
    });

    await secondSendAsync('test');
    expect(hitCache.value).toBe(true);
    expect(asyncOnCacheHit).toHaveBeenCalled();
  });

  it('应该在异步钩子抛出错误时正确处理', async () => {
    const mockData = { id: 1 };
    const successError = new Error('success error');
    const asyncOnSuccess = vi.fn<AnyFunction>().mockRejectedValue(successError);
    mockRequestFn.mockResolvedValue(mockData);

    const { sendAsync, error } = useRequest(mockRequestFn, {
      onSuccess: asyncOnSuccess,
    });

    await expect(sendAsync('test')).rejects.toThrow(successError);
    expect(error.value).toBe(successError);
  });

  it('同步并发调用时应该命中共享', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const id = 'test-sync-share';
    const { hitShare: hs1, sendAsync: s1, data: d1 } = useRequest(fn, { id, share: true });
    const { hitShare: hs2, sendAsync: s2, data: d2 } = useRequest(fn, { id, share: true });

    const p1 = s1(1);
    const p2 = s2(1);
    await Promise.all([p1, p2]);

    expect(hs1.value).toBe(false);
    expect(hs2.value).toBe(true);
    expect(d1.value).toEqual(mockData);
    expect(d2.value).toEqual(mockData);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('同一实例同步连续调用时应该命中共享', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const { hitShare, sendAsync, data } = useRequest(fn, {
      id: 'test-same-instance-share',
      share: true,
    });

    const p1 = sendAsync(1);
    const p2 = sendAsync(1);
    await Promise.all([p1, p2]);

    expect(hitShare.value).toBe(true);
    expect(data.value).toEqual(mockData);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('同步并发调用时共享与缓存互不干扰', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const id = 'test-share-cache-together';
    const { hitShare: hs1, hitCache: hc1, sendAsync: s1 } = useRequest(fn, { id, share: true, cache: true });
    const { hitShare: hs2, hitCache: hc2, sendAsync: s2 } = useRequest(fn, { id, share: true, cache: true });

    const p1 = s1(1);
    const p2 = s2(1);
    await Promise.all([p1, p2]);

    expect(hs1.value).toBe(false);
    expect(hc1.value).toBe(false);
    expect(hs2.value).toBe(true);
    expect(hc2.value).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('共享请求完成后再次调用应命中共享（已 resolve 的 Promise）', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const id = 'test-share-resolved';
    const { hitShare: hs1, sendAsync: s1 } = useRequest(fn, {
      id,
      share: true,
    });
    const { hitShare: hs2, sendAsync: s2 } = useRequest(fn, {
      id,
      share: true,
    });

    await s1(1);
    await s2(1);

    expect(hs1.value).toBe(false);
    expect(hs2.value).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('不同 id 的请求不应共享', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const { hitShare: hs1, sendAsync: s1 } = useRequest(fn, {
      id: 'test-diff-id-1',
      share: true,
    });
    const { hitShare: hs2, sendAsync: s2 } = useRequest(fn, {
      id: 'test-diff-id-2',
      share: true,
    });

    const p1 = s1(1);
    const p2 = s2(1);
    await Promise.all([p1, p2]);

    expect(hs1.value).toBe(false);
    expect(hs2.value).toBe(false);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('不传 id 时共享不应生效', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn<AnyAsyncFunction>().mockImplementation(async () => {
      await promiseDelay(50);
      return mockData;
    });

    const { hitShare: hs1, sendAsync: s1 } = useRequest(fn, { share: true });
    const { hitShare: hs2, sendAsync: s2 } = useRequest(fn, { share: true });

    const p1 = s1(1);
    const p2 = s2(1);
    await Promise.all([p1, p2]);

    expect(hs1.value).toBe(false);
    expect(hs2.value).toBe(false);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
