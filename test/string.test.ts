import { describe, expect, it } from 'vitest';
import { stringCamelCase, stringKebabCase } from '../src/string';

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
