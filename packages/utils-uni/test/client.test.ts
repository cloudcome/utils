import { importCloudObject, useDatabase } from '@/client';
import { promiseDelay } from '@cloudcome/utils-core/promise';
import { describe, expect, it, vi } from 'vitest';

describe('importCloudObject', () => {
  const uni = {
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    showToast: vi.fn(),
  };

  beforeAll(() => {
    // @ts-ignore
    global.uni = uni;
  });

  beforeEach(() => {
    uni.showLoading.mockClear();
    uni.hideLoading.mockClear();
    uni.showToast.mockClear();
  });

  afterAll(() => {
    // @ts-ignore
    // biome-ignore lint/performance/noDelete: <explanation>
    delete global.uni;
  });

  it('1入参类型', () => {
    const mockServer = {};
    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });

    type Fn = (aa: string) => { bb: string };
    const { data } = useCloudMethod('fn', async (fn) => {
      const resp = await fn<Fn>('');
      return {
        ...resp,
        data: {
          ...resp.data,
          cc: 123,
        },
      };
    });
    assertType<{ bb: string; cc: number } | null>(data.value);
  });

  it('0入参类型', () => {
    const mockServer = {};
    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });

    type Fn = () => { bb: string };
    const { data } = useCloudMethod('fn', async (fn) => {
      const resp = await fn<Fn>();
      return {
        ...resp,
        data: {
          ...resp.data,
          cc: 123,
        },
      };
    });
    assertType<{ bb: string; cc: number } | null>(data.value);
  });

  it('占位数据', () => {
    const mockServer = {};
    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });

    const { data: data1, state: state1 } = useCloudMethod('methodName', async () => ({ data: { id: 1 } }), {
      placeholder: () => ({ id: -1 }),
    });
    expect(data1.value.id).toBe(-1);
    expect(state1.value.data.id).toBe(-1);

    const { data: data2, state: state2 } = useCloudMethod('methodName', async () => ({ data: { id: 1 } }));
    expect(data2.value).toBeNull();
    expect(data2.value?.id).toBeUndefined();
    expect(state2.value.data).toBeNull();
    expect(state2.value.data?.id).toBeUndefined();
  });

  it('应该正确处理成功响应', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    const result = await sendAsync();
    expect(result).toEqual({ result: 'success' });
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在返回错误时抛出异常', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        errCode: 404,
        errMsg: 'Not Found',
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await expect(sendAsync()).rejects.toThrow('Not Found');
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在没有错误信息时使用默认错误信息', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        errCode: 500,
      }),
    };

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      fallbackErrorMessage: '自定义错误信息',
    });

    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await expect(sendAsync()).rejects.toThrow('自定义错误信息');
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该使用默认的"请求失败"作为错误信息', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        errCode: 500,
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await expect(sendAsync()).rejects.toThrow('请求失败');
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该正确传递参数给云对象方法', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { received: true },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudMethod('testMethod', async (fn, param1: string, param2: number) => {
      // 模拟调用云对象方法并传递参数
      type TestFn = (a: string, b: number) => Promise<{ received: boolean }>;
      return await fn<TestFn>(param1, param2);
    });

    await sendAsync('test', 123);
    expect(mockServer.testMethod).toHaveBeenCalledWith('test', 123);
  });

  it('应该支持 useRequest 的缓存选项', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { id: 1 },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync, hitCache } = useCloudMethod('testMethod', async (fn) => await fn(), {
      id: 'cache-test',
      cache: true,
    });

    // 第一次调用
    await sendAsync();
    expect(hitCache.value).toBe(false);

    // 第二次调用应该命中缓存
    await sendAsync();
    expect(hitCache.value).toBe(true);
    expect(mockServer.testMethod).toHaveBeenCalledTimes(1);
  });

  it('应该支持 useRequest 的共享选项', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { id: 1 },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync, hitShare } = useCloudMethod('testMethod', async (fn) => await fn(), {
      id: 'share-test',
      share: true,
    });

    // 并行发起两个请求，应该共享
    const promise1 = sendAsync();
    const promise2 = sendAsync();

    await Promise.all([promise1, promise2]);

    // 其中一个应该命中共享
    expect(mockServer.testMethod).toHaveBeenCalledTimes(1);
  });

  it('应该支持 method 参数为函数类型', async () => {
    const mockServer = {
      dynamicMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', { _mockServer: mockServer });
    const methodCall = vi.fn();

    // 使用函数作为 method 参数
    const { sendAsync } = useCloudMethod(
      (param1: string, param2: number) => {
        methodCall(param1, param2);
        return 'dynamicMethod';
      },
      async (fn, param1: string, param2: number) => {
        type TestFn = (a: string, b: number) => Promise<{ result: string }>;
        return await fn<TestFn>(param1, param2);
      },
    );

    const result = await sendAsync('test', 123);
    expect(result).toEqual({ result: 'success' });
    // 验证函数被正确调用并生成了正确的方法名
    expect(methodCall).toHaveBeenCalledWith('test', 123);
    expect(mockServer.dynamicMethod).toHaveBeenCalledWith('test', 123);
  });

  it('应该在请求开始前调用 onBefore 回调', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const onBefore = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onBefore,
    });

    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await sendAsync();

    expect(onBefore).toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在请求成功后调用 onSuccess 回调', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const onSuccess = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onSuccess,
    });

    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await sendAsync();

    expect(onSuccess).toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在请求失败时调用 onError 回调', async () => {
    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as import('@/client').UniError;

    const mockServer = {
      testMethod: vi.fn().mockRejectedValue(mockError),
    };

    const onError = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onError,
    });

    const { sendAsync } = useCloudMethod('testMethod', async (fn) => {
      return await fn();
    });

    await expect(sendAsync()).rejects.toThrow('数据库错误');
    expect(onError).toHaveBeenCalledWith(mockError);
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在请求完成后调用 onAfter 回调（无论成功或失败）', async () => {
    // 测试成功情况
    const mockServer1 = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const onAfter1 = vi.fn();

    const useCloudMethod1 = importCloudObject('testObject', {
      _mockServer: mockServer1,
      onAfter: onAfter1,
    });

    const { sendAsync: sendAsync1 } = useCloudMethod1('testMethod', async (fn) => {
      return await fn();
    });

    await sendAsync1();

    expect(onAfter1).toHaveBeenCalled();
    expect(mockServer1.testMethod).toHaveBeenCalled();

    // 测试失败情况
    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as import('@/client').UniError;

    const mockServer2 = {
      testMethod: vi.fn().mockRejectedValue(mockError),
    };

    const onAfter2 = vi.fn();

    const useCloudMethod2 = importCloudObject('testObject', {
      _mockServer: mockServer2,
      onAfter: onAfter2,
    });

    const { sendAsync: sendAsync2 } = useCloudMethod2('testMethod', async (fn) => {
      return await fn();
    });

    await expect(sendAsync2()).rejects.toThrow('数据库错误');
    expect(onAfter2).toHaveBeenCalled();
    expect(mockServer2.testMethod).toHaveBeenCalled();
  });

  it('应该正确调用 useCloudMethodOptions 中的回调函数', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
    });

    const onBefore = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onAfter = vi.fn();

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        onBefore,
        onSuccess,
        onError,
        onAfter,
      },
    );

    await sendAsync();

    expect(onBefore).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onAfter).toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  it('应该在 useCloudMethodOptions.onError 中传递正确的参数', async () => {
    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
    }) as import('@/client').UniError;

    const mockServer = {
      testMethod: vi.fn().mockRejectedValue(mockError),
    };

    const onError1 = vi.fn();
    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onError: onError1,
    });

    const onError2 = vi.fn();

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn, param: string) => {
        return await fn(param);
      },
      {
        onError: onError2,
      },
    );

    const testParam = 'test-param';

    await expect(sendAsync(testParam)).rejects.toThrow('数据库错误');
    expect(onError1).toHaveBeenCalledWith(mockError);
    expect(onError2).toHaveBeenCalledWith(mockError, testParam);
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  // 新增的测试用例：支持 onShowLoading 钩子
  it('应该在 showLoading 为 true 时调用 onShowLoading 回调', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const onShowLoading = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onShowLoading,
    });

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        showLoading: true,
      },
    );

    await sendAsync();

    expect(onShowLoading).toHaveBeenCalled();
    expect(uni.hideLoading).toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  // 新增的测试用例：支持 onHideLoading 钩子
  it('应该在 showLoading 为 true 时调用 onHideLoading 回调', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const onHideLoading = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onHideLoading,
    });

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        showLoading: true,
      },
    );

    await sendAsync();

    expect(onHideLoading).toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  // 新增的测试用例：支持 onShowError 钩子
  it('应该在 showError 为 true 且请求失败时调用 onShowError 回调', async () => {
    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
      message: '数据库查询失败',
    }) as import('@/client').UniError;

    const mockServer = {
      testMethod: vi.fn().mockRejectedValue(mockError),
    };

    const onShowError = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onShowError,
    });

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        showError: true,
      },
    );

    await expect(sendAsync()).rejects.toThrow('数据库查询失败');
    // 等待 setTimeout 执行
    await promiseDelay(10);
    expect(onShowError).toHaveBeenCalledWith(mockError);
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  // 新增的测试用例：验证 onShowLoading 和 onHideLoading 的调用顺序
  it('应该按照正确的顺序调用 onShowLoading 和 onHideLoading', async () => {
    const mockServer = {
      testMethod: vi.fn().mockResolvedValue({
        data: { result: 'success' },
      }),
    };

    const callOrder: string[] = [];
    const onShowLoading = vi.fn().mockImplementation(() => callOrder.push('onShowLoading'));
    const onHideLoading = vi.fn().mockImplementation(() => callOrder.push('onHideLoading'));

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onShowLoading,
      onHideLoading,
    });

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        showLoading: true,
      },
    );

    await sendAsync();

    expect(onShowLoading).toHaveBeenCalled();
    expect(onHideLoading).toHaveBeenCalled();
    expect(callOrder).toEqual(['onShowLoading', 'onHideLoading']);
    expect(mockServer.testMethod).toHaveBeenCalled();
  });

  // 新增的测试用例：验证 onShowError 在 showError 为 false 时不被调用
  it('应该在 showError 为 false 时不调用 onShowError 回调', async () => {
    const mockError = Object.assign(new Error('数据库错误'), {
      errCode: 1001,
      errMsg: '数据库查询失败',
      message: '数据库查询失败',
    }) as import('@/client').UniError;

    const mockServer = {
      testMethod: vi.fn().mockRejectedValue(mockError),
    };

    const onShowError = vi.fn();

    const useCloudMethod = importCloudObject('testObject', {
      _mockServer: mockServer,
      onShowError,
    });

    const { sendAsync } = useCloudMethod(
      'testMethod',
      async (fn) => {
        return await fn();
      },
      {
        showError: false, // 显式设置为 false
      },
    );

    await expect(sendAsync()).rejects.toThrow('数据库查询失败');
    // 等待 setTimeout 执行
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onShowError).not.toHaveBeenCalled();
    expect(mockServer.testMethod).toHaveBeenCalled();
  });
});

describe('useCloudDatabase', () => {
  it('应该正确处理成功响应', async () => {
    const mockDb = {};
    const callerMock = vi.fn().mockResolvedValue({
      result: { data: 'success' },
    });

    const requestHook = useDatabase(callerMock, { _mockDatabase: mockDb });

    // 验证返回了 useRequest 的返回值
    expect(requestHook).toBeTypeOf('object');
    expect(requestHook).toHaveProperty('send');
    expect(requestHook).toHaveProperty('sendAsync');

    // 调用 sendAsync 测试功能
    const resultPromise = await requestHook.sendAsync('param1', 'param2');

    // 验证 caller 被正确调用
    expect(callerMock).toHaveBeenCalledWith(mockDb, 'param1', 'param2');

    // 等待结果
    const result = await resultPromise;

    // 验证返回了正确的数据
    expect(result).toEqual({ data: 'success' });
  });

  it('应该在错误时抛出异常', async () => {
    const mockDb = {};
    const callerMock = vi.fn().mockResolvedValue({
      result: {
        errCode: 404,
        errMsg: 'Not Found',
      },
    });

    const requestHook = useDatabase(callerMock, { _mockDatabase: mockDb });

    // 验证在错误时抛出异常
    await expect(requestHook.sendAsync('param1')).rejects.toThrow('Not Found');

    // 验证 caller 被正确调用
    expect(callerMock).toHaveBeenCalledWith(mockDb, 'param1');
  });

  it('应该在没有错误信息时抛出默认错误', async () => {
    const mockDb = {};
    const callerMock = vi.fn().mockResolvedValue({
      result: {
        errCode: 500,
      },
    });

    const requestHook = useDatabase(callerMock, { _mockDatabase: mockDb });

    // 验证在没有错误信息时抛出默认错误
    await expect(requestHook.sendAsync('param1')).rejects.toThrow('请求失败');

    // 验证 caller 被正确调用
    expect(callerMock).toHaveBeenCalledWith(mockDb, 'param1');
  });

  it('应该支持 send 方法', async () => {
    const mockDb = {};
    const callerMock = vi.fn().mockResolvedValue({
      result: { data: 'success' },
    });

    const requestHook = useDatabase(callerMock, { _mockDatabase: mockDb });

    // 调用 send 方法
    await requestHook.send('param1', 'param2');

    // 验证 caller 被正确调用
    expect(callerMock).toHaveBeenCalledWith(mockDb, 'param1', 'param2');
  });

  it('占位数据', () => {
    const mockDb = {};

    const { data: data1, state: state1 } = useDatabase(async () => ({ result: { id: 1 } }), {
      placeholder: () => ({ id: -1 }),
      _mockDatabase: mockDb,
    });
    expect(data1.value.id).toBe(-1);
    expect(state1.value.data.id).toBe(-1);

    const { data: data2, state: state2 } = useDatabase(async () => ({ result: { id: 1 } }), {
      _mockDatabase: mockDb,
    });
    expect(data2.value).toBeNull();
    expect(data2.value?.id).toBeUndefined();
    expect(state2.value.data).toBeNull();
    expect(state2.value.data?.id).toBeUndefined();
  });
});
