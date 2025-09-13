import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { buildCloudObjectExposeCreator, respondCloudObject } from '../src/cloud';

// 模拟上下文对象
const createMockContext = () => ({
  getClientInfo: vi.fn().mockReturnValue({
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
  getCloudInfo: vi.fn(),
  getUniIdToken: vi.fn().mockReturnValue('test-token'),
  getMethodName: vi.fn().mockReturnValue('test-method'),
  getUniCloudRequestId: vi.fn().mockReturnValue('request-id-123'),
  getHttpInfo: vi.fn(),
  options: {
    requiredUser: false,
  },
  user: {
    id: '',
    role: [],
    permission: [],
    isAdmin: false,
  },
});

describe('respondCloudObject', () => {
  it('应该正确处理成功响应', async () => {
    const testData = { message: 'success' };

    const result = await respondCloudObject(async () => testData, 'request-id-123');

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: testData,
      errCode: 0,
      errMsg: '',
    });
  });

  it('应该正确处理错误响应', async () => {
    const error = new Error('测试错误');

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

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

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

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

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

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

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 1001,
      errMsg: '测试错误',
    });
  });

  it('应该正确处理没有errCode和errMsg的错误', async () => {
    const error = new Error('测试错误');

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '测试错误',
    });
  });

  it('应该正确处理没有message的错误', async () => {
    // 创建一个没有message属性的Error对象
    const error = Object.assign(new Error(), { errCode: 1002, errMsg: '自定义错误' });

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: 1002,
      errMsg: '自定义错误',
    });
  });

  it('应该正确处理空错误对象', async () => {
    const error = {};

    const result = await respondCloudObject(async () => {
      throw error;
    }, 'request-id-123');

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '[object Object]', // 实际行为是toString()的结果
    });
  });
});

describe('buildCloudObjectExposeCreator', () => {
  const createCloudObjectExpose = buildCloudObjectExposeCreator();

  it('应该创建无参数的云函数对象', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const cloudObject = createCloudObjectExpose(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
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

    const mockFn = vi.fn().mockResolvedValue('validated result');
    const cloudObject = createCloudObjectExpose(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三', age: 25 };
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      requestId: 'request-id-123',
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

    const mockFn = vi.fn().mockResolvedValue('validated result');
    const cloudObject = createCloudObjectExpose(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三', age: 'not-a-number' }; // 错误的类型
    // @ts-ignore
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '请求数据不正确',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该正确处理选项配置', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const cloudObject = createCloudObjectExpose(mockFn, { requiredUser: true });

    const context = createMockContext();
    const result = await cloudObject.call(context, undefined);

    expect(result).toEqual({
      data: null,
      errCode: 'uni-id-check-token-failed',
      errMsg: '需要登录后才能进行此操作',
      requestId: 'request-id-123',
    });
    expect(context.options.requiredUser).toBe(true);
  });

  it('应该处理自定义验证错误消息', async () => {
    const schema = z.object({
      name: z.string().refine(() => false, { message: '自定义验证错误' }),
    });

    const mockFn = vi.fn().mockResolvedValue('validated result');
    const cloudObject = createCloudObjectExpose(schema, mockFn);

    const context = createMockContext();
    const input = { name: '张三' };
    // @ts-ignore
    const result = await cloudObject.call(context, input);

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '自定义验证错误',
    });
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理异步函数', async () => {
    const mockFn = vi.fn().mockImplementation(async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'async result';
    });
    const cloudObject = createCloudObjectExpose(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: 'async result',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该处理函数抛出异常的情况', async () => {
    const mockFn = vi.fn().mockImplementation(() => {
      throw new Error('函数执行错误');
    });
    const cloudObject = createCloudObjectExpose(mockFn);

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: null,
      errCode: -1,
      errMsg: '函数执行错误',
    });
    expect(mockFn).toHaveBeenCalledWith(context);
  });

  it('应该处理带requiredUser但有用户的情况', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn().mockResolvedValue({
        data: {
          uid: 'user-123',
          role: ['user'],
          permission: ['read'],
        },
        errCode: 0,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithUser = buildCloudObjectExposeCreator({
      uniIdCloudObject: mockUniIdCloudObject,
    });

    const mockFn = vi.fn().mockResolvedValue('result with user');
    const cloudObject = createCloudExposeWithUser(mockFn, { requiredUser: true });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
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

  it('应该处理管理员用户', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn().mockResolvedValue({
        data: {
          uid: 'admin-123',
          role: ['admin'],
          permission: [],
        },
        errCode: 0,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithUser = buildCloudObjectExposeCreator({
      uniIdCloudObject: mockUniIdCloudObject,
    });

    const mockFn = vi.fn().mockResolvedValue('result with admin');
    const cloudObject = createCloudExposeWithUser(mockFn, { requiredUser: true });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
      data: 'result with admin',
      errCode: 0,
      errMsg: '',
    });
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          id: 'admin-123',
          role: ['admin'],
          permission: [],
          isAdmin: true, // 管理员用户
        },
      }),
    );
  });

  it('应该处理非管理员用户', async () => {
    // 模拟带uniIdCloudObject的创建器
    const mockUniIdInstance = {
      checkToken: vi.fn().mockResolvedValue({
        data: {
          uid: 'user-123',
          role: ['user'],
          permission: ['read'],
        },
        errCode: 0,
        errMsg: '',
      }),
    };

    const mockUniIdCloudObject = {
      createInstance: vi.fn().mockReturnValue(mockUniIdInstance),
    };

    const createCloudExposeWithUser = buildCloudObjectExposeCreator({
      uniIdCloudObject: mockUniIdCloudObject,
    });

    const mockFn = vi.fn().mockResolvedValue('result with user');
    const cloudObject = createCloudExposeWithUser(mockFn, { requiredUser: true });

    const context = createMockContext();
    const result = await cloudObject.call(context);

    expect(result).toEqual({
      requestId: 'request-id-123',
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
          isAdmin: false, // 非管理员用户
        },
      }),
    );
  });
});
