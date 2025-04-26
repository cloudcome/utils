import { uniqueBigInt } from '../src/unique';

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
