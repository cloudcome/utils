/**
 * 将文本复制到剪贴板
 * 该方法使用传统的 execCommand 方法实现文本复制
 *
 * @param text - 要复制到剪贴板的文本内容
 * @returns void
 *
 * @example
 * // 基本用法
 * await copyText('Hello World');
 *
 * @example
 * // 处理复制结果
 * copyText('Hello World')
 *   .then(() => console.log('复制成功'))
 *   .catch(() => console.error('复制失败'));
 */
export function copyText(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
