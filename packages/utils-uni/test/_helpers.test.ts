import { describe, expect, it } from 'vitest';
import { parseCloudMethodOutput, parseDatabaseOutput } from '../src/_helpers';
import type { CloudMethodOutput } from '../src/cloud';

describe('parseCloudMethodOutput', () => {
  it('当没有错误时应该返回数据', () => {
    const output: CloudMethodOutput<string> = {
      data: 'success data',
      errCode: undefined,
      errMsg: undefined,
    };

    const result = parseCloudMethodOutput(output);
    expect(result).toBe('success data');
  });

  it('当存在errCode时应该抛出错误', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 404,
      errMsg: 'Not Found',
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('Not Found');
  });

  it('当errMsg为空时应该使用备用消息抛出错误', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 500,
      errMsg: undefined,
    };

    expect(() => parseCloudMethodOutput(output, 'Fallback error message')).toThrow('Fallback error message');
  });

  it('当errMsg和备用消息都为空时应该抛出空消息错误', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 1,
      errMsg: undefined,
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('');
  });

  it('应该正确分配错误属性', () => {
    const output: CloudMethodOutput<number> = {
      data: 123,
      errCode: 400,
      errMsg: 'Bad Request',
    };

    let caughtError: unknown;
    try {
      parseCloudMethodOutput(output);
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errMsg: string };
    expect(err2.errCode).toBe(400);
    expect(err2.errMsg).toBe('Bad Request');
    expect(err2.message).toBe('Bad Request');
  });
});

describe('parseDatabaseOutput', () => {
  it('应该正确处理客户端成功响应', () => {
    const res = {
      result: {
        data: [{ id: '1', name: 'test' }],
        errCode: 0,
        errMsg: 'ok',
      },
    };

    const result = parseDatabaseOutput(res);
    expect(result).toEqual({
      data: [{ id: '1', name: 'test' }],
    });
  });

  it('应该正确处理客户端成功响应（无errCode）', () => {
    const res = {
      result: {
        id: '123',
        name: 'test',
        errCode: 0,
        errMsg: 'ok',
      },
    };

    const result = parseDatabaseOutput(res);
    expect(result).toEqual({
      id: '123',
      name: 'test',
    });
  });

  it('应该在客户端响应有错误时抛出异常', () => {
    const res = {
      result: {
        errCode: 404,
        errMsg: 'Not Found',
      },
    };

    expect(() => parseDatabaseOutput(res)).toThrow('Not Found');
  });

  it('应该在客户端响应有错误时正确分配错误属性', () => {
    const res = {
      result: {
        errCode: 500,
        errMsg: 'Server Error',
      },
    };

    let caughtError: unknown;
    try {
      parseDatabaseOutput(res);
    } catch (err) {
      caughtError = err;
    }

    const err2 = caughtError as Error & { errCode: number; errMsg: string };
    expect(err2.errCode).toBe(500);
    expect(err2.errMsg).toBe('Server Error');
  });

  it('应该正确处理云端响应（直接返回数据）', () => {
    const res = {
      total: 10,
      list: [{ id: '1' }],
    };

    const result = parseDatabaseOutput(res);
    expect(result).toEqual({
      total: 10,
      list: [{ id: '1' }],
    });
  });

  it('应该正确处理云端响应（仅包含 data 字段）', () => {
    const res = {
      data: [{ id: '1' }],
    };

    const result = parseDatabaseOutput(res);
    expect(result).toEqual({
      data: [{ id: '1' }],
    });
  });
});
