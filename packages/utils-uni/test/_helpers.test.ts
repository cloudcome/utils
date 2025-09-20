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

  it('当存在错误码时应该抛出错误', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 404,
      errMsg: 'Not Found',
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('Not Found');
  });

  it('当错误信息为空时应该使用备用错误消息', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 500,
      errMsg: undefined,
    };

    expect(() => parseCloudMethodOutput(output, 'Fallback error message')).toThrow('Fallback error message');
  });

  it('当错误信息和备用消息都为空时应该抛出空错误', () => {
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
    } catch (error) {
      // 验证错误对象是Error实例并且具有正确的属性
      const err = error as Error & { errCode?: number; errMsg?: string };
      expect(err).toBeInstanceOf(Error);
      expect(err.errCode).toBe(400);
      expect(err.errMsg).toBe('Bad Request');
      return; // 确保测试正常结束
    }

    // 如果没有抛出异常，则测试失败
    throw new Error('Expected parseCloudMethodOutput to throw an error');
  });
});
