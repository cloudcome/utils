import { useRequest } from '@/request';
import { MemoryCache } from '@cloudcome/utils-core/cache';
import { describe, expect, it, vi } from 'vitest';

describe('useRequest 组合式函数', () => {
  const mockRequestFn = vi.fn();
  const mockOptions = {
    onSuccess: vi.fn(),
    onCacheHit: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (new MemoryCache() as MemoryCache<unknown>).clear();
  });

  it('应该正确处理基本请求', async () => {
    const mockData = { id: 1 };
    mockRequestFn.mockResolvedValue(mockData);
    const { loading, data, error, sendAsync } = useRequest(mockRequestFn, mockOptions);

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
  });

  it('应该支持共享请求功能', async () => {
    const mockData = { id: 1 };
    const fn = vi.fn().mockImplementation(async () => mockData);

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
});
