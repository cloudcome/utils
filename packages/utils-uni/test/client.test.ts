import { importCloudObject, useDatabase } from '@/client';
import { describe, expect, it, vi } from 'vitest';

describe('importCloudObject', () => {
  it('1入参类型', () => {
    const mockServer = {};
    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });

    type Fn = (aa: string) => { bb: string };
    const { data } = useCloudExpose('fn', async (fn) => {
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
    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });

    type Fn = () => { bb: string };
    const { data } = useCloudExpose('fn', async (fn) => {
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
    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });

    const { data: data1, state: state1 } = useCloudExpose('methodName', async () => ({ data: { id: 1 } }), {
      placeholder: () => ({ id: -1 }),
    });
    expect(data1.value.id).toBe(-1);
    expect(state1.value.data.id).toBe(-1);

    const { data: data2, state: state2 } = useCloudExpose('methodName', async () => ({ data: { id: 1 } }));
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudExpose('testMethod', async (fn) => {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudExpose('testMethod', async (fn) => {
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

    const useCloudExpose = importCloudObject('testObject', {
      _mockServer: mockServer,
      fallbackErrorMessage: '自定义错误信息',
    });

    const { sendAsync } = useCloudExpose('testMethod', async (fn) => {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudExpose('testMethod', async (fn) => {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync } = useCloudExpose('testMethod', async (fn, param1: string, param2: number) => {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync, hitCache } = useCloudExpose('testMethod', async (fn) => await fn(), {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const { sendAsync, hitShare } = useCloudExpose('testMethod', async (fn) => await fn(), {
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

    const useCloudExpose = importCloudObject('testObject', { _mockServer: mockServer });
    const methodCall = vi.fn();

    // 使用函数作为 method 参数
    const { sendAsync } = useCloudExpose(
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
    const resultPromise = requestHook.sendAsync('param1', 'param2');

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

  it('应该支持 send 方法', () => {
    const mockDb = {};
    const callerMock = vi.fn().mockResolvedValue({
      result: { data: 'success' },
    });

    const requestHook = useDatabase(callerMock, { _mockDatabase: mockDb });

    // 调用 send 方法
    requestHook.send('param1', 'param2');

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
