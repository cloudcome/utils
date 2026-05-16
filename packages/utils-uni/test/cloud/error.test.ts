import { describe, expect, it } from 'vitest';
import { createCloudObjectError } from '@/cloud';

describe('createCloudObjectError', () => {
  it('应该创建包含 message 和 errMsg 的错误对象', () => {
    const error = createCloudObjectError('操作失败');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('操作失败');
    expect(error.errMsg).toBe('操作失败');
  });

  it('应该创建包含 errCode 的错误对象', () => {
    const error = createCloudObjectError('操作失败', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('操作失败');
    expect(error.errMsg).toBe('操作失败');
    expect(error.errCode).toBe(404);
  });

  it('应该支持字符串类型的 errCode', () => {
    const error = createCloudObjectError('需要登录', 'uni-id-check-token-failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.errCode).toBe('uni-id-check-token-failed');
    expect(error.errMsg).toBe('需要登录');
  });

  it('应该在没有 errCode 时不设置 errCode 属性', () => {
    const error = createCloudObjectError('未知错误');

    expect(error.errCode).toBeUndefined();
  });

  it('应该可以被 try-catch 捕获', () => {
    let caughtError: unknown;
    try {
      throw createCloudObjectError('测试错误', 500);
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as ReturnType<typeof createCloudObjectError>;
    expect(err2.message).toBe('测试错误');
    expect(err2.errCode).toBe(500);
    expect(err2.errMsg).toBe('测试错误');
  });
});
