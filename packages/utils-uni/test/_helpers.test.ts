import { describe, expect, it } from 'vitest';
import { parseCloudMethodOutput } from '../src/_helpers';
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

    expect(() =>
      parseCloudMethodOutput(output, 'Fallback error message'),
    ).toThrow('Fallback error message');
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

    try {
      parseCloudMethodOutput(output);
    } catch (err) {
      const err2 = err as Error & { errCode: number; errMsg: string };
      expect(err2.errCode).toBe(400);
      expect(err2.errMsg).toBe('Bad Request');
      expect(err2.message).toBe('Bad Request');
      return;
    }

    throw new Error('不会执行到这里');
  });
});
