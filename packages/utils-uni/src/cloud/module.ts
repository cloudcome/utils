import { objectOmit } from '@cloudcome/utils-core/object';
import { createCloudObjectError } from './error';
import type { CloudModuleOutput } from './types';

/**
 * 解析云模块输出结果
 *
 * 该函数用于处理云模块的输出，如果输出中包含错误码，则抛出相应的错误；
 * 否则返回去除错误码和错误信息后的数据部分。
 *
 * @template O - 输出数据的类型
 * @param output - 云模块的输出结果，包含errCode、errMsg和数据部分
 * @param fallbackErrorMessage - 当输出中没有错误信息时使用的默认错误消息
 * @returns 返回去除errCode和errMsg字段后的数据对象
 * @throws {CloudObjectError} 当output中存在errCode时抛出包含错误码和错误信息的异常
 *
 * @example
 * // 成功情况
 * const result = parseCloudModuleOutput({ value: 'success', errCode: 0, errMsg: '' });
 * // 返回: { value: 'success' }
 *
 * @example
 * // 错误情况
 * try {
 *   parseCloudModuleOutput({ errCode: 404, errMsg: 'Not Found' });
 * } catch (error) {
 *   // 抛出错误: CloudObjectError('Not Found', 404)
 * }
 */
export function parseCloudModuleOutput<O>(
  output: CloudModuleOutput<O>,
  fallbackErrorMessage = '',
): Omit<O, 'errCode' | 'errMsg'> {
  if (output.errCode) {
    throw createCloudObjectError(
      output.errMsg || fallbackErrorMessage,
      output.errCode,
    );
  }
  return objectOmit(output, ['errCode', 'errMsg']);
}
