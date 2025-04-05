import { createHash } from 'node:crypto';

function generateHash(data: string, algorithm: string) {
  return createHash(algorithm).update(data).digest('hex');
}

/**
 * 计算字符串的 MD5 哈希值
 * @param input - 需要计算哈希值的字符串
 * @returns 返回 32 个字符的十六进制 MD5 哈希值
 * @example
 * ```typescript
 * const hash = md5String('hello world');
 * console.log(hash); // '5eb63bbbe01eeed093cb22bb8f5acdc3'
 * ```
 */
export function md5String(input: string): string {
  return generateHash(input, 'md5');
}

/**
 * 计算字符串的 SHA1 哈希值
 * @param input - 需要计算哈希值的字符串
 * @returns 返回 40 个字符的十六进制 SHA1 哈希值
 * @example
 * ```typescript
 * const hash = sha1String('hello world');
 * console.log(hash); // '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed'
 * ```
 */
export function sha1String(input: string): string {
  return generateHash(input, 'sha1');
}

/**
 * 计算字符串的 SHA256 哈希值
 * @param input - 需要计算哈希值的字符串
 * @returns 返回 64 个字符的十六进制 SHA256 哈希值
 * @example
 * ```typescript
 * const hash = sha256String('hello world');
 * console.log(hash); // 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
 * ```
 */
export function sha256String(input: string): string {
  return generateHash(input, 'sha256');
}

/**
 * 计算字符串的 SHA512 哈希值
 * @param input - 需要计算哈希值的字符串
 * @returns 返回 128 个字符的十六进制 SHA512 哈希值
 * @example
 * ```typescript
 * const hash = sha512String('hello world');
 * console.log(hash); // '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
 * ```
 */
export function sha512String(input: string): string {
  return generateHash(input, 'sha512');
}
