import { decodeBase64, encodeBase64 } from '@/base64';

describe('encodeBase64', () => {
  it('应正确编码空字符串', () => {
    expect(encodeBase64('')).toBe('');
  });

  it('应正确编码普通字符串', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('应正确编码特殊字符', () => {
    expect(encodeBase64('!@#$%^&*()')).toBe('IUAjJCVeJiooKQ==');
  });

  it('应正确编码中文字符', () => {
    expect(encodeBase64('你好')).toBe('5L2g5aW9');
  });
});

describe('decodeBase64', () => {
  it('应正确解码空字符串', () => {
    expect(decodeBase64('')).toBe('');
  });

  it('应正确解码普通字符串', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello');
  });

  it('应正确解码特殊字符', () => {
    expect(decodeBase64('IUAjJCVeJiooKQ==')).toBe('!@#$%^&*()');
  });

  it('应正确解码中文字符', () => {
    expect(decodeBase64('5L2g5aW9')).toBe('你好');
  });
});

describe('encode/decode 互操作', () => {
  it('应能正确编码并解码回原始字符串', () => {
    const original = 'Hello, 世界!';
    const encoded = encodeBase64(original);
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe(original);
  });
});
