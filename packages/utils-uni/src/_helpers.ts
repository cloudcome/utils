import { errorAssign } from '@cloudcome/utils-core/error';
import type { CloudMethodOutput } from './cloud';

/**
 * 解析云对象方法调用的输出结果
 *
 * @template O - 云对象方法返回数据的类型
 * @param output - 云对象方法调用的输出结果
 * @param fallbackErrorMessage - 当输出中没有错误信息时使用的默认错误消息
 * @returns 云对象方法返回成功时的数据部分
 * @throws 当云对象方法调用失败时，抛出包含错误信息的异常
 */
export function parseCloudMethodOutput<O>(output: CloudMethodOutput<O>, fallbackErrorMessage = ''): O {
  if (output.errCode) {
    throw errorAssign(new Error(output.errMsg || fallbackErrorMessage), output);
  }

  return output.data;
}
