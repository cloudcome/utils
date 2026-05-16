import { describe, expect, it } from 'vitest';
import { defineException } from '../src/exception';

describe('异常构建工具', () => {
  it('应该创建具有正确名称的自定义错误类', () => {
    const TestError = defineException('TestError');
    const error = new TestError('测试消息');

    expect(error.name).toBe('TestError');
    expect(error).toBeInstanceOf(Error);
  });

  it('应该使用默认格式格式化错误消息', () => {
    const TestError = defineException('TestError');
    const error = new TestError('测试消息');

    expect(error.message).toBe('[TestError] 测试消息');
  });

  it('应该支持自定义消息格式', () => {
    const customFormat = (name: string, message: string) => `${name}::${message}`;
    const TestError = defineException('TestError', { format: customFormat });
    const error = new TestError('测试消息');

    expect(error.message).toBe('TestError::测试消息');
  });

  it('应该合并额外属性到错误实例', () => {
    const TestError = defineException<{ code: number; details: string }>('TestError');
    const error = new TestError('测试消息', { code: 404, details: '未找到' });

    expect(error.code).toBe(404);
    expect(error.details).toBe('未找到');
  });

  it('应该保留完整的堆栈跟踪', () => {
    const TestError = defineException('TestError');
    const error = new TestError('测试消息');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('TestError: [TestError] 测试消息');
  });
});
