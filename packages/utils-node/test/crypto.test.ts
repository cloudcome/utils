import { md5String, sha1String, sha256String, sha512String } from '@/crypto';
import { describe, expect, it } from 'vitest';

describe('crypto', () => {
  it('md5String 应正确计算 MD5 哈希值', () => {
    expect(md5String('hello world')).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3');
    expect(md5String('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5String('123456')).toBe('e10adc3949ba59abbe56e057f20f883e');
  });

  it('sha1String 应正确计算 SHA1 哈希值', () => {
    expect(sha1String('hello world')).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
    expect(sha1String('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(sha1String('123456')).toBe('7c4a8d09ca3762af61e59520943dc26494f8941b');
  });

  it('sha256String 应正确计算 SHA256 哈希值', () => {
    expect(sha256String('hello world')).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    expect(sha256String('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256String('123456')).toBe('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
  });

  it('sha512String 应正确计算 SHA512 哈希值', () => {
    expect(sha512String('hello world')).toBe(
      '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f',
    );
    expect(sha512String('')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    );
    expect(sha512String('123456')).toBe(
      'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413',
    );
  });
});
