/**
 * 下载 URL
 * @param {string} url
 * @param {string} filename
 */
export function downloadURL(url: string, filename?: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.click();
}

/**
 * 下载 Blob 对象
 * @param blob Blob 对象
 * @param filename 文件名
 */
export function downloadBlob(blob: Blob, filename?: string) {
  const url = URL.createObjectURL(blob);
  try {
    downloadURL(url, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
