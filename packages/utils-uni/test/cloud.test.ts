import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  buildCloudMethodCreator,
  type CloudModuleOutput,
  parseCloudModuleOutput,
  respondCloudMethod,
} from '../src/cloud';
import type { AnyFunction } from '@cloudcome/utils-core/types';

// 模拟上下文对象
const createMockContext = () => ({
  getClientInfo: vi.fn<AnyFunction>().mockReturnValue({
    appId: 'test-app',
    deviceId: 'test-device',
    osName: 'ios',
    // 添加其他必要的ClientInfo字段
    scene: 0,
    appLanguage: 'zh',
    appName: 'test-app',
    appVersion: '1.0.0',
    appVersionCode: '1',
    browserName: 'test-browser',
    browserVersion: '1.0',
    deviceModel: 'test-model',
    deviceType: 'phone',
    hostName: 'test-host',
    hostVersion: '1.0',
    osVersion: '1.0',
    ua: 'test-ua',
    uniCompilerVersion: '1.0',
    uniPlatform: 'test-platform',
    uniRuntimeVersion: '1.0',
    locale: 'zh-CN',
    secretType: 'test',
    RUNTIME_ENV: 'local',
    os: 'ios',
    clientIP: '127.0.0.1',
    userAgent: 'test-ua',
    platform: 'test',
    source: 'client',
    requestId: 'request-id-123',
  }),
  getCloudInfo: vi.fn<AnyFunction>().mockReturnValue({
    runtimeEnv: 'local',
  }),
  getUniIdToken: vi.fn<AnyFunction>().mockReturnValue('test-token'),
  getMethodName: vi.fn<AnyFunction>().mockReturnValue('test-method'),
  getUniCloudRequestId: vi.fn<AnyFunction>().mockReturnValue('request-id-123'),
  getHttpInfo: vi.fn<AnyFunction>(),
});

describe('respondCloudObject', () => {
  it('应该正确处理成功响应', async () => {
    const testData = { message: 'success' };

    const result = await respondCloudMethod(async () => testData, {
      append: { requestId: 'request-id-123' },
    });

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: testData,
      errCode: 0,
      errMsg: '',
    });
  });

  it('应该正确处理错误响应', async () => {
    const error = new Error('测试错误');

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '测试错误',
    });
  });

  it('应该正确处理带errCode和errMsg的错误', async () => {
    const error = new Error('普通错误');
    Object.assign(error, { errCode: 1001, errMsg: '自定义错误' });

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 1001,
      errMsg: '自定义错误',
    });
  });

  it('应该正确处理带字符串errCode的错误', async () => {
    const error = new Error('普通错误');
    Object.assign(error, { errCode: 'error-code', errMsg: '自定义错误' });

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 'error-code',
      errMsg: '自定义错误',
    });
  });

  it('应该正确处理没有errMsg的错误', async () => {
    const error = new Error('测试错误');
    Object.assign(error, { errCode: 1001 });

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 1001,
      errMsg: '测试错误',
    });
  });

  it('应该正确处理没有errCode和errMsg的错误', async () => {
    const error = new Error('测试错误');

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '测试错误',
    });
  });

  it('应该正确处理没有message的错误', async () => {
    // 创建一个没有message属性的Error对象
    const error = Object.assign(new Error(), {
      errCode: 1002,
      errMsg: '自定义错误',
    });

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 1002,
      errMsg: '自定义错误',
    });
  });

  it('应该正确处理空错误对象', async () => {
    const error = {};

    const result = await respondCloudMethod(
      async () => {
        throw error;
      },
      { append: { requestId: 'request-id-123' } },
    );

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '[object Object]', // 实际行为是toString()的结果
    });
  });
});

describe('buildCloudMethodCreator', () => {
  const createCloudMethod = buildCloudMethodCreator();

  it('应该创建无参数的云函数对象', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const cloudObject = createCloudMethod(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: 'result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该创建带参数验证的云函数对象', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('validated result');
    const cloudObject = createCloudMethod(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三', age: 25 };
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      data: 'validated result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(context, input);
  });

  it('应该处理参数验证失败的情况', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('validated result');
    const cloudObject = createCloudMethod(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三', age: 'not-a-number' }; // 错误的类型
    // @ts-expect-error
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      data: null,
      errCode: -1,
      errMsg: '请求数据不正确',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理自定义验证错误消息', async () => {
    const schema = z.object({
      name: z.string().refine(() => false, { message: '自定义验证错误' }),
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('validated result');
    const cloudObject = createCloudMethod(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三' };
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      data: null,
      errCode: -1,
      errMsg: '自定义验证错误',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理异步函数', async () => {
    const mockFn = vi.fn<AnyFunction>().mockImplementation(async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'async result';
    });
    const cloudObject = createCloudMethod(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: 'async result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该处理函数抛出异常的情况', async () => {
    const mockFn = vi.fn<AnyFunction>().mockImplementation(() => {
      throw new Error('函数执行错误');
    });
    const cloudObject = createCloudMethod(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: null,
      errCode: -1,
      errMsg: '函数执行错误',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该处理带requiredUser但有用户的情况', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn<AnyFunction>().mockResolvedValue({
        uid: 'user-123',
        role: ['user'],
        permission: ['read'],
        errCode: 0,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn<AnyFunction>().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithUser = buildCloudMethodCreator({
      uniIdCommonModule: mockUniIdCloudObject,
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result with user');
    const cloudObject = createCloudExposeWithUser(mockFn, {
      requiredUser: true,
    });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: 'result with user',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          id: 'user-123',
          role: ['user'],
          permission: ['read'],
          isAdmin: false,
        },
      }),
    );
  });

  it('应该处理带requiredUser但没有用户的情况', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn<AnyFunction>().mockResolvedValue({
        errCode: -1,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn<AnyFunction>().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithoutUser = buildCloudMethodCreator({
      uniIdCommonModule: mockUniIdCloudObject,
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result with user');
    const cloudObject = createCloudExposeWithoutUser(mockFn, {
      requiredUser: true,
    });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: null,
      errCode: 'uni-id-check-token-failed',
      errMsg: '需要登录后才能进行此操作',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('自定义没有登录的错误编码、消息', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn<AnyFunction>().mockResolvedValue({
        errCode: -1,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn<AnyFunction>().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithoutUser = buildCloudMethodCreator({
      uniIdCommonModule: mockUniIdCloudObject,
      requiredUserErrCode: '123',
      requiredUserErrMsg: 'required user',
    });

    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result with user');
    const cloudObject = createCloudExposeWithoutUser(mockFn, {
      requiredUser: true,
    });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: null,
      errCode: '123',
      errMsg: 'required user',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理onlyLocalEnv选项在本地环境的情况', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const cloudObject = createCloudMethod(mockFn, { onlyLocalEnv: true });

    const context = createMockContext();
    // 确保 getCloudInfo 返回本地环境
    context.getCloudInfo.mockReturnValue({ runtimeEnv: 'local' });

    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: 'result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该处理onlyLocalEnv选项在非本地环境的情况', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const cloudObject = createCloudMethod(mockFn, { onlyLocalEnv: true });

    const context = createMockContext();
    // 模拟非本地环境
    context.getCloudInfo.mockReturnValue({ runtimeEnv: 'tcb' });

    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: null,
      errCode: -1,
      errMsg: '运行环境不匹配',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理respondAppend选项', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');

    const createCloudObjectExposeWithAppend = buildCloudMethodCreator({
      respondAppend: () => ({ extra: 'data' }),
    });

    const cloudObject = createCloudObjectExposeWithAppend(mockFn);
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      data: 'result',
      errCode: 0,
      errMsg: '',
      extra: 'data',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  // 新增测试用例：测试 respondAppend 配置
  it('应该正确处理 buildCloudMethodCreator 的 respondAppend 配置', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue({ message: 'success' });
    const respondAppend = vi.fn<AnyFunction>().mockReturnValue({ timestamp: Date.now() });

    const createCloudMethodWithAppend = buildCloudMethodCreator({
      respondAppend,
    });

    const cloudObject = createCloudMethodWithAppend(mockFn);
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(respondAppend).toHaveBeenCalledWith(context);
    expect(result).toMatchObject({
      data: { message: 'success' },
      errCode: 0,
      errMsg: '',
      timestamp: expect.any(Number),
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  // 新增测试用例：测试 onBefore 配置
  it('应该正确处理 buildCloudMethodCreator 的 onBefore 配置', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const onBefore = vi.fn<AnyFunction>().mockResolvedValue(undefined);

    const createCloudMethodWithBefore = buildCloudMethodCreator({
      onBefore,
    });

    const cloudObject = createCloudMethodWithBefore(mockFn);
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(onBefore).toHaveBeenCalledWith(expect.objectContaining(context), expect.any(Object));
    expect(result).toEqual({
      data: 'result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(context));
  });

  // 新增测试用例：测试 onBefore 配置抛出错误
  it('应该正确处理 buildCloudMethodCreator 的 onBefore 配置抛出错误', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const onBefore = vi.fn<AnyFunction>().mockImplementation(() => {
      throw new Error('onBefore error');
    });

    const createCloudMethodWithBefore = buildCloudMethodCreator({
      onBefore,
    });

    const cloudObject = createCloudMethodWithBefore(mockFn);
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(onBefore).toHaveBeenCalledWith(expect.objectContaining(context), expect.any(Object));
    expect(result).toEqual({
      data: null,
      errCode: -1,
      errMsg: 'onBefore error',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  // 新增测试用例：测试 onBefore 配置异步执行
  it('应该正确处理 buildCloudMethodCreator 的 onBefore 异步配置', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('result');
    const onBefore = vi.fn<AnyFunction>().mockImplementation(async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const createCloudMethodWithBefore = buildCloudMethodCreator({
      onBefore,
    });

    const cloudObject = createCloudMethodWithBefore(mockFn);
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(onBefore).toHaveBeenCalledWith(expect.objectContaining(context), expect.any(Object));
    expect(result).toEqual({
      data: 'result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(context));
  });
});

describe('createCloudMethod', () => {
  // 新增测试用例：测试 noRespond 配置
  it('应该正确处理 createCloudMethod 的 noRespond 配置', async () => {
    const mockFn = vi.fn<AnyFunction>().mockResolvedValue('direct result');

    const createCloudMethod = buildCloudMethodCreator();
    const cloudObject = createCloudMethod(mockFn, { noRespond: true });
    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toBe('direct result');
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  // 新增测试用例：测试 noRespond 配置与错误处理
  it('应该正确处理 createCloudMethod 的 noRespond 配置与错误', async () => {
    const mockFn = vi.fn<AnyFunction>().mockImplementation(() => {
      throw new Error('direct error');
    });

    const createCloudMethod = buildCloudMethodCreator();
    const cloudObject = createCloudMethod(mockFn, { noRespond: true });
    const context = createMockContext();
    await expect(cloudObject.call(context)).rejects.toThrow('direct error');
    expect(mockFn).toHaveBeenCalledWith(context);
  });
});

describe('parseCloudModuleOutput', () => {
  it('应该正确处理成功响应', () => {
    const output = {
      value: 'success',
      errCode: 0,
      errMsg: '',
    };

    const result = parseCloudModuleOutput(output);

    expect(result).toEqual({
      value: 'success',
    });
  });

  it('应该正确处理错误响应', () => {
    const output = {
      errCode: 404,
      errMsg: 'Not Found',
    };

    expect(() => parseCloudModuleOutput(output)).toThrow('Not Found');
  });

  it('应该正确处理带默认错误消息的错误响应', () => {
    const output = {
      errCode: 500,
      data: 'some data',
    };

    expect(() => parseCloudModuleOutput(output, '默认错误')).toThrow('默认错误');
  });

  it('应该正确处理带空错误消息的错误响应', () => {
    const output = {
      errCode: 403,
      errMsg: '',
    };

    expect(() => parseCloudModuleOutput(output)).toThrow('');
  });

  it('应该正确分配错误属性', () => {
    const output: CloudModuleOutput<{ data: number }> = {
      data: 123,
      errCode: 400,
      errMsg: 'Bad Request',
    };

    let caughtError: unknown;
    try {
      parseCloudModuleOutput(output);
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errMsg: string };
    expect(err2.errCode).toBe(400);
    expect(err2.errMsg).toBe('Bad Request');
    expect(err2.message).toBe('Bad Request');
  });
});
