import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { type UniCloudObjectContext, buildCloudObjectExposeCreator, respondCloudObject } from '../src/cloud';

// 模拟上下文对象
const createMockContext = () =>
  ({
    getClientInfo: vi.fn(),
    getCloudInfo: vi.fn(),
    getUniIdToken: vi.fn(),
    getMethodName: vi.fn(),
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
  }) as UniCloudObjectContext;

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
});

describe('buildCloudObjectExposeCreator', () => {
  const createCloudExpose = buildCloudObjectExposeCreator();

  it('应该创建无参数的云函数对象', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const cloudObject = createCloudExpose(mockFn);

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
    const cloudObject = createCloudExpose(schema, mockFn);

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
    const cloudObject = createCloudExpose(schema, mockFn);

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
    const cloudObject = createCloudExpose(mockFn, { requiredUser: true });

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
});
