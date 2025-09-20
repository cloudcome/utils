import { describe, expect, it, vi } from 'vitest';
import { parseCloudMethodOutput } from '../src/_helpers';
import type { CloudMethodOutput } from '../src/cloud';

describe('parseCloudMethodOutput', () => {
  it('should return data when there is no error', () => {
    const output: CloudMethodOutput<string> = {
      data: 'success data',
      errCode: undefined,
      errMsg: undefined,
    };

    const result = parseCloudMethodOutput(output);
    expect(result).toBe('success data');
  });

  it('should throw error when errCode exists', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 404,
      errMsg: 'Not Found',
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('Not Found');
  });

  it('should throw error with fallback message when errMsg is empty', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 500,
      errMsg: undefined,
    };

    expect(() => parseCloudMethodOutput(output, 'Fallback error message')).toThrow('Fallback error message');
  });

  it('should throw error with empty message when both errMsg and fallback are empty', () => {
    const output: CloudMethodOutput<string> = {
      data: 'some data',
      errCode: 1,
      errMsg: undefined,
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('');
  });

  it('should correctly assign error properties', () => {
    const output: CloudMethodOutput<number> = {
      data: 123,
      errCode: 400,
      errMsg: 'Bad Request',
    };

    expect(() => parseCloudMethodOutput(output)).toThrow('Bad Request');
    // TODO 验证抛出的错误对象有 errCode errMsg 属性
  });
});
