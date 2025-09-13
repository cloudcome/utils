import type { UniCloudObjectOutput } from './cloud';

/**
 * 解析云对象输出结果
 * @param output 云对象输出结果
 * @param fallbackErrorMessage 错误信息
 * @returns 返回云对象输出结果中的数据
 */
export function parseCloudObjectOutput<O>(output: UniCloudObjectOutput<O>, fallbackErrorMessage = ''): O {
  if (output.errCode) {
    throw new Error(output.errMsg || fallbackErrorMessage);
  }

  return output.data;
}
