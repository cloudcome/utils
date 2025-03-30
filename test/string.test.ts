import { describe, expect, it } from 'vitest';
import { randomString, randomUUID4, stringCamelCase, stringFormat, stringKebabCase } from '../src/string';

describe('stringCamelCase', () => {
  it('应将字符串转换为驼峰命名', () => {
    expect(stringCamelCase('hello world')).toBe('helloWorld');
    expect(stringCamelCase('hello_world')).toBe('helloWorld');
    expect(stringCamelCase('hello-world')).toBe('helloWorld');
  });

  it('如果 bigger 为 true，应将首字母大写', () => {
    expect(stringCamelCase('hello world', true)).toBe('HelloWorld');
    expect(stringCamelCase('hello_world', true)).toBe('HelloWorld');
    expect(stringCamelCase('hello-world', true)).toBe('HelloWorld');
  });
});

describe('stringKebabCase', () => {
  it('应将字符串转换为默认分隔符的短横线命名', () => {
    expect(stringKebabCase('helloWorld')).toBe('hello-world');
    expect(stringKebabCase('HelloWorld')).toBe('-hello-world');
  });

  it('应将字符串转换为自定义分隔符的短横线命名', () => {
    expect(stringKebabCase('helloWorld', '_')).toBe('hello_world');
    expect(stringKebabCase('HelloWorld', '_')).toBe('_hello_world');
  });
});

describe('randomString', () => {
  it('应生成指定长度的随机字符串', () => {
    const result = randomString(10);
    expect(result.length).toBe(10);
  });

  it('应使用自定义字符字典生成随机字符串', () => {
    const dict = 'ABCDEF';
    const result = randomString(8, dict);
    expect(result).toHaveLength(8);
    for (const char of result) {
      expect(dict).toContain(char);
    }
  });
});

describe('stringFormat', () => {
  it('应支持索引方式格式化字符串', () => {
    const result = stringFormat('你好 {0}！我的名字是 {1}。', '张三', '李四');
    expect(result).toBe('你好 张三！我的名字是 李四。');
  });

  it('应支持对象方式格式化字符串', () => {
    const result = stringFormat('{greet}！我的名字是 {name}。', { greet: '你好', name: '王五' });
    expect(result).toBe('你好！我的名字是 王五。');
  });

  it('应支持带回退值的对象方式格式化字符串', () => {
    const result = stringFormat('{greet}！我的名字是 {name}。', { greet: '你好' }, '未知');
    expect(result).toBe('你好！我的名字是 未知。');
  });

  it('应支持带回退函数的对象方式格式化字符串', () => {
    const result = stringFormat('{greet}！我的名字是 {name}。', { greet: '你好' }, (key) => `默认${key}`);
    expect(result).toBe('你好！我的名字是 默认name。');
  });

  it('应处理未找到的键值对', () => {
    const result = stringFormat('{greet}！我的名字是 {name}。', { greet: '你好' });
    expect(result).toBe('你好！我的名字是 name。');
  });

  it('应处理空字符串', () => {
    const result = stringFormat('', { greet: '你好' });
    expect(result).toBe('');
  });

  it('应处理未传递参数的情况', () => {
    const result = stringFormat('{greet}！我的名字是 {name}。');
    expect(result).toBe('greet！我的名字是 name。');
  });
});

describe('randomUUID4', () => {
  it('验证长度', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = randomUUID4();

      // 验证长度
      expect(uuid.length).toBe(36);
    }
  });

  it('验证分隔符位置', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = randomUUID4();

      // 验证分隔符位置
      expect(uuid[8]).toBe('-');
      expect(uuid[13]).toBe('-');
      expect(uuid[18]).toBe('-');
      expect(uuid[23]).toBe('-');
    }
  });

  it('验证版本号为 4', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = randomUUID4();

      // 验证版本号为 4
      expect(uuid[14]).toBe('4');

      // 验证变体符合 RFC 4122 (第19位为 '8', '9', 'a', 或 'b')
      const variantChar = uuid[19];
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    }
  });

  it('验证变体', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = randomUUID4();

      // 验证变体符合 RFC 4122 (第19位为 '8', '9', 'a', 或 'b')
      const variantChar = uuid[19];
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    }
  });
});
