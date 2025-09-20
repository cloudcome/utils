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

    const { data: data1, state: state1 } = useCloudExpose('exposeName', async () => ({ data: { id: 1 } }), {
      placeholder: () => ({ id: -1 }),
    });
    expect(data1.value.id).toBe(-1);
    expect(state1.value.data.id).toBe(-1);

    const { data: data2, state: state2 } = useCloudExpose('exposeName', async () => ({ data: { id: 1 } }));
    expect(data2.value).toBeNull();
    expect(data2.value?.id).toBeUndefined();
    expect(state2.value.data).toBeNull();
    expect(state2.value.data?.id).toBeUndefined();
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
