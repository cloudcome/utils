/**
 * base64 转换为 Blob 实例
 * @ref http://stackoverflow.com/q/18253378
 * @param base64 {String} base64 编码
 * @returns {Blob}
 */
export function base64toBlob(base64: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ua = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ua[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], {
    type: mimeString,
  });
}
