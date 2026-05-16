import { describe, expect, it, vi } from 'vitest';
import { uniCallback, uniPromise } from '@/client';

describe('uniPromise', () => {
  it('应该在成功时返回结果', async () => {
    const result = await uniPromise(Promise.resolve('success'));
    expect(result).toBe('success');
  });

  it('应该在成功时返回对象结果', async () => {
    const data = { id: 1, name: 'test' };
    const result = await uniPromise(Promise.resolve(data));
    expect(result).toEqual(data);
  });

  it('应该在失败时抛出包含errCode和errNo的错误', async () => {
    const error = {
      errMsg: '网络错误',
      errCode: 1001,
      errno: 2001,
    };

    await expect(uniPromise(Promise.reject(error))).rejects.toThrow('网络错误');

    let caughtError: unknown;
    try {
      await uniPromise(Promise.reject(error));
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.message).toBe('网络错误');
    expect(err2.errCode).toBe(1001);
    expect(err2.errNo).toBe(2001);
  });

  it('应该在失败且无errMsg时使用默认错误消息', async () => {
    const error = {
      errCode: 1001,
      errno: 2001,
    };

    await expect(uniPromise(Promise.reject(error))).rejects.toThrow('未知错误');

    let caughtError: unknown;
    try {
      await uniPromise(Promise.reject(error));
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.message).toBe('未知错误');
    expect(err2.errCode).toBe(1001);
    expect(err2.errNo).toBe(2001);
  });

  it('应该在失败且无errCode和errno时使用默认值-1', async () => {
    const error = {
      errMsg: '自定义错误',
    };

    let caughtError: unknown;
    try {
      await uniPromise(Promise.reject(error));
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.errCode).toBe(-1);
    expect(err2.errNo).toBe(-1);
  });

  it('应该在失败时正确传递所有错误属性', async () => {
    const error = {
      errMsg: '权限不足',
      errCode: 403,
      errno: 5,
    };

    let caughtError: unknown;
    try {
      await uniPromise(Promise.reject(error));
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.message).toBe('权限不足');
    expect(err2.errCode).toBe(403);
    expect(err2.errNo).toBe(5);
  });
});

describe('uniCallback', () => {
  it('应该在成功时返回结果', async () => {
    const result = await uniCallback<{ data: string }>(({ success }) => {
      success({ data: 'success' });
    });

    expect(result).toEqual({ data: 'success' });
  });

  it('应该在失败时抛出包含errCode和errNo的错误', async () => {
    const error = {
      errMsg: '操作失败',
      errCode: 500,
      errno: 100,
    };

    await expect(
      uniCallback(({ fail }) => {
        fail(error);
      }),
    ).rejects.toThrow('操作失败');

    let caughtError: unknown;
    try {
      await uniCallback(({ fail }) => {
        fail(error);
      });
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.message).toBe('操作失败');
    expect(err2.errCode).toBe(500);
    expect(err2.errNo).toBe(100);
  });

  it('应该在失败且无errMsg时使用默认错误消息', async () => {
    const error = {
      errMsg: '',
      errCode: 500,
      errno: 100,
    };

    await expect(
      uniCallback(({ fail }) => {
        fail(error);
      }),
    ).rejects.toThrow('未知错误');
  });

  it('应该在失败且无errCode和errno时使用默认值-1', async () => {
    const error = {
      errMsg: '自定义错误',
    };

    let caughtError: unknown;
    try {
      await uniCallback(({ fail }) => {
        fail(error as any);
      });
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errNo: number };
    expect(err2.errCode).toBe(-1);
    expect(err2.errNo).toBe(-1);
  });

  it('应该正确传递runner参数给回调函数', async () => {
    const mockRunner = vi.fn<() => void>(({ success }) => {
      success({ value: 42 });
    });

    const result = await uniCallback(mockRunner);

    expect(mockRunner).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ value: 42 });
  });
});
