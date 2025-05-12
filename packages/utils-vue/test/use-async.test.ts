import { promiseDelay } from '@cloudcome/utils-core/promise';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useAsync } from '../src/use-async';

describe('useAsync 组合式函数', () => {
  const mockAsyncFn = vi.fn();
  const mockOptions = {
    onBefore: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onFinally: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('应该正确处理异步操作', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { loading, data, error, runAsync } = useAsync(mockAsyncFn, mockOptions);

    const promise = runAsync('test');
    expect(loading.value).toBe(true);
    expect(mockOptions.onBefore).toHaveBeenCalled();

    await promise;
    expect(loading.value).toBe(false);
    expect(data.value).toEqual(mockData);
    expect(error.value).toBeNull();
    expect(mockOptions.onSuccess).toHaveBeenCalledWith(mockData);
    expect(mockOptions.onFinally).toHaveBeenCalled();
  });

  it('应该处理异步操作失败', async () => {
    const mockError = new Error('test error');
    mockAsyncFn.mockRejectedValue(mockError);
    const { loading, error, runAsync } = useAsync(mockAsyncFn, mockOptions);

    await expect(runAsync('test')).rejects.toThrow(mockError);
    expect(loading.value).toBe(false);
    expect(error.value).toEqual(mockError);
    expect(mockOptions.onError).toHaveBeenCalledWith(mockError);
    expect(mockOptions.onFinally).toHaveBeenCalled();
  });

  it('应该支持默认参数', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const defaults = { input: 'default' };
    useAsync(mockAsyncFn, { defaults });
    await promiseDelay(10);
    expect(mockAsyncFn).toBeCalledTimes(1);
    expect(mockAsyncFn).toHaveBeenNthCalledWith(1, defaults);
  });

  it('应该支持函数形式的默认参数', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const defaultData = { input: 'default' };
    const defaults = () => defaultData;
    const { run } = useAsync(mockAsyncFn, { defaults });

    await promiseDelay(10);
    expect(mockAsyncFn).toBeCalledTimes(1);
    expect(mockAsyncFn).toHaveBeenNthCalledWith(1, defaultData);
  });

  it('应该支持 run 方法', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { run } = useAsync(mockAsyncFn);

    run('test');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAsyncFn).toHaveBeenCalledWith('test');
  });
});
