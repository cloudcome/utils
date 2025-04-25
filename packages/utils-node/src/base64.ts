/**
 * 【NodeJS 环境】将字符串编码为 Base64 格式
 * @param input 要编码的字符串
 * @returns 编码后的 Base64 字符串
 */
export function encodeBase64(input: string) {
  return Buffer.from(input, 'utf8').toString('base64');
}

/**
 * 【NodeJS 环境】将 Base64 字符串解码为原始字符串
 * @param input 要解码的 Base64 字符串
 * @returns 解码后的原始字符串
 */
export function decodeBase64(input: string) {
  return Buffer.from(input, 'base64').toString('utf8');
}
