import { promiseDelay } from '@cloudcome/utils-core/promise';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useAsync } from '../src/async';

describe('useAsync 组合式函数', () => {
  const mockAsyncFn = vi.fn();
  const mockOptions = {
    onBefore: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onAfter: vi.fn(),
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
    expect(mockOptions.onAfter).toHaveBeenCalled();
  });

  it('应该处理异步操作失败', async () => {
    const mockError = new Error('test error');
    mockAsyncFn.mockRejectedValue(mockError);
    const { loading, error, runAsync } = useAsync(mockAsyncFn, mockOptions);

    await expect(runAsync('test')).rejects.toThrow(mockError);
    expect(loading.value).toBe(false);
    expect(error.value).toEqual(mockError);
    expect(mockOptions.onError).toHaveBeenCalledWith(mockError);
    expect(mockOptions.onAfter).toHaveBeenCalled();
  });

  it('应该支持 run 方法', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { run } = useAsync(mockAsyncFn);

    run('test');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockAsyncFn).toHaveBeenCalledWith('test');
  });

  it('应该正确处理run方法的返回值', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { run } = useAsync(mockAsyncFn);

    const result = await new Promise((resolve) => {
      run('test');
      setTimeout(() => resolve(mockAsyncFn.mock.results[0].value), 0);
    });

    expect(result).toEqual(mockData);
  });

  it('应该正确处理空options的情况', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { loading, data, runAsync } = useAsync(mockAsyncFn);

    await runAsync('test');
    expect(loading.value).toBe(false);
    expect(data.value).toEqual(mockData);
  });

  it('应该正确处理参数传递', async () => {
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);
    const { runAsync } = useAsync(mockAsyncFn);

    const args = ['arg1', 2, { key: 'value' }];
    await runAsync(...args);
    expect(mockAsyncFn).toHaveBeenCalledWith(...args);
  });

  it('应该正确处理多次调用', async () => {
    const mockData1 = { id: 1 };
    const mockData2 = { id: 2 };
    mockAsyncFn.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);
    const { data, runAsync } = useAsync(mockAsyncFn);

    await runAsync('first');
    expect(data.value).toEqual(mockData1);

    await runAsync('second');
    expect(data.value).toEqual(mockData2);
  });
});
