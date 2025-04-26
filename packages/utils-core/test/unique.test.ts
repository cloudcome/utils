import { uniqueBigInt, uniqueString } from '@/unique';

describe('uniqueBigInt', () => {
  test('默认参数返回 bigint 类型', () => {
    const result = uniqueBigInt();
    expect(typeof result).toBe('bigint');
  });

  test('指定 randomLength 为 0 时返回值正确', () => {
    const result = uniqueBigInt(0);
    expect(typeof result).toBe('bigint');
    expect(result.toString().length).toBeGreaterThanOrEqual(13); // 时间戳部分至少 13 位
  });

  test('指定 randomLength 为正整数时返回值正确', () => {
    const randomLength = 5;
    const result = uniqueBigInt(randomLength);
    expect(typeof result).toBe('bigint');
    expect(result.toString().length).toBeGreaterThanOrEqual(13 + randomLength); // 时间戳 + 随机部分
  });

  test('多次调用生成的值具有唯一性', () => {
    const results = new Set<bigint>();
    for (let i = 0; i < 1000; i++) {
      results.add(uniqueBigInt());
    }
    expect(results.size).toBe(1000); // 确保无重复值
  });
});

describe('uniqueString', () => {
  test('默认参数返回字符串且长度正确', () => {
    const result = uniqueString();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('指定 minLength 参数时返回字符串长度符合要求', () => {
    const minLength = 30;
    const result = uniqueString(minLength);
    expect(result.length).toBeGreaterThanOrEqual(minLength);
  });

  test('指定 dict 参数时使用指定字符集', () => {
    const customDict = 'ABC123';
    const result = uniqueString(0, customDict);
    expect(result).toEqual(expect.stringMatching(new RegExp(`^[${customDict}]+$`)));
  });

  test('同时指定 minLength 和 dict 参数时满足条件', () => {
    const minLength = 3;
    const customDict = 'XYZ';
    const result = uniqueString(minLength, customDict);
    expect(result.length).toBeGreaterThanOrEqual(minLength);
    expect(result).toEqual(expect.stringMatching(new RegExp(`^[${customDict}]+$`)));
  });

  test('多次调用生成唯一字符串', () => {
    const results = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      results.add(uniqueString());
    }
    expect(results.size).toBe(1000);
  });

  test('使用字符串类型 dict 参数时正确应用字符集', () => {
    const customDict = 'abcdef';
    const result = uniqueString(customDict);
    expect(result).toEqual(expect.stringMatching(new RegExp(`^[${customDict}]+$`)));
  });
});
