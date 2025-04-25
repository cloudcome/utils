// @ref https://blog.csdn.net/m0_72642319/article/details/139743196

/**
 * 【浏览器环境】将字符串编码为 Base64 格式
 * @param input 要编码的字符串
 * @returns 编码后的 Base64 字符串
 * @remarks
 * 在 Node.js 环境中使用 Buffer 实现，在浏览器环境中使用 TextEncoder 和 btoa 实现
 */
export function encodeBase64(input: string) {
  const encoder = new TextEncoder();
  const unit8Array = encoder.encode(input);
  return btoa(String.fromCharCode(...unit8Array));
}

/**
 * 【浏览器环境】 将 Base64 字符串解码为原始字符串
 * @param input 要解码的 Base64 字符串
 * @returns 解码后的原始字符串
 */
export function decodeBase64(input: string) {
  const decoder = new TextDecoder();
  const unit8Array = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
  return decoder.decode(unit8Array);
}
