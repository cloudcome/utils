import { promiseDelay } from '@cloudcome/utils-core/promise';
import { describe, expect, it, vi } from 'vitest';
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
    const { loading, data, error, runAsync } = useAsync(
      mockAsyncFn,
      mockOptions,
    );

    const promise = runAsync('test');
    expect(loading.value).toBe(true);
    expect(mockOptions.onBefore).toHaveBeenCalled();

    await promise;
    expect(loading.value).toBe(false);
    expect(data.value).toEqual(mockData);
    expect(error.value).toBeNull();
    expect(mockOptions.onSuccess).toHaveBeenCalledWith(mockData, 'test');
    expect(mockOptions.onAfter).toHaveBeenCalled();
  });

  it('应该处理异步操作失败', async () => {
    const mockError = new Error('test error');
    mockAsyncFn.mockRejectedValue(mockError);
    const { loading, error, runAsync } = useAsync(mockAsyncFn, mockOptions);

    await expect(runAsync('test1', 'test2')).rejects.toThrow(mockError);
    expect(loading.value).toBe(false);
    expect(error.value).toEqual(mockError);
    expect(mockOptions.onError).toHaveBeenCalledWith(
      mockError,
      'test1',
      'test2',
    );
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
    mockAsyncFn
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);
    const { data, runAsync } = useAsync(mockAsyncFn);

    await runAsync('first');
    expect(data.value).toEqual(mockData1);

    await runAsync('second');
    expect(data.value).toEqual(mockData2);
  });

  it('占位数据', () => {
    const { data: data1, state: state1 } = useAsync(async () => ({ id: 1 }), {
      placeholder: () => ({ id: -1 }),
    });
    expect(data1.value.id).toBe(-1);
    expect(state1.value.data.id).toBe(-1);

    const { data: data2, state: state2 } = useAsync(async () => ({ id: 1 }));
    expect(data2.value).toBeNull();
    expect(data2.value?.id).toBeUndefined();
    expect(state2.value.data).toBeNull();
    expect(state2.value.data?.id).toBeUndefined();
  });

  // 新增测试：异步钩子支持
  it('应该支持异步onBefore钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnBefore = vi.fn().mockImplementation(() => promiseDelay(10));
    mockAsyncFn.mockResolvedValue(mockData);

    const { runAsync } = useAsync(mockAsyncFn, {
      onBefore: asyncOnBefore,
    });

    await runAsync('test');
    expect(asyncOnBefore).toHaveBeenCalledWith('test');
    expect(mockAsyncFn).toHaveBeenCalledWith('test');
  });

  it('应该支持异步onSuccess钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnSuccess = vi.fn().mockImplementation(() => promiseDelay(10));
    mockAsyncFn.mockResolvedValue(mockData);

    const { runAsync } = useAsync(mockAsyncFn, {
      onSuccess: asyncOnSuccess,
    });

    await runAsync('test');
    expect(asyncOnSuccess).toHaveBeenCalledWith(mockData, 'test');
  });

  it('应该支持异步onError钩子', async () => {
    const mockError = new Error('test error');
    const asyncOnError = vi.fn().mockImplementation(() => promiseDelay(10));
    mockAsyncFn.mockRejectedValue(mockError);

    const { runAsync } = useAsync(mockAsyncFn, {
      onError: asyncOnError,
    });

    await expect(runAsync('test')).rejects.toThrow(mockError);
    expect(asyncOnError).toHaveBeenCalledWith(mockError, 'test');
  });

  it('应该支持异步onAfter钩子', async () => {
    const mockData = { id: 1 };
    const asyncOnAfter = vi.fn().mockImplementation(() => promiseDelay(10));
    mockAsyncFn.mockResolvedValue(mockData);

    const { runAsync } = useAsync(mockAsyncFn, {
      onAfter: asyncOnAfter,
    });

    await runAsync('test');
    expect(asyncOnAfter).toHaveBeenCalledWith('test');
  });

  it('应该按正确顺序执行异步钩子', async () => {
    const executionOrder: string[] = [];
    const mockData = { id: 1 };
    mockAsyncFn.mockResolvedValue(mockData);

    const options = {
      onBefore: vi.fn().mockImplementation(async () => {
        executionOrder.push('onBefore');
        await promiseDelay(5);
      }),
      onSuccess: vi.fn().mockImplementation(async () => {
        executionOrder.push('onSuccess');
        await promiseDelay(5);
      }),
      onAfter: vi.fn().mockImplementation(async () => {
        executionOrder.push('onAfter');
        await promiseDelay(5);
      }),
    };

    const { runAsync } = useAsync(mockAsyncFn, options);

    await runAsync('test');

    expect(executionOrder).toEqual(['onBefore', 'onSuccess', 'onAfter']);
    expect(options.onBefore).toHaveBeenCalledWith('test');
    expect(options.onSuccess).toHaveBeenCalledWith(mockData, 'test');
    expect(options.onAfter).toHaveBeenCalledWith('test');
  });

  it('应该在异步onBefore钩子抛出错误时中断操作', async () => {
    const beforeError = new Error('before error');
    const asyncOnBefore = vi.fn().mockRejectedValue(beforeError);
    const mockAsyncFn = vi.fn();

    const { runAsync, error } = useAsync(mockAsyncFn, {
      onBefore: asyncOnBefore,
    });

    await expect(runAsync('test')).rejects.toThrow(beforeError);
    expect(error.value).toBe(beforeError);
    expect(mockAsyncFn).not.toHaveBeenCalled();
  });
});
