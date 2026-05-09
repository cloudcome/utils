import { errorAssign } from '@cloudcome/utils-core/error';
import { objectOmit } from '@cloudcome/utils-core/object';
import type { CloudMethodOutput } from './cloud';
import type { ClientDatabaseOutput, CloudDatabaseOutput } from './database';

/**
 * 解析云对象方法调用的输出结果
 *
 * @template O - 云对象方法返回数据的类型
 * @param output - 云对象方法调用的输出结果
 * @param fallbackErrorMessage - 当输出中没有错误信息时使用的默认错误消息
 * @returns 云对象方法返回成功时的数据部分
 * @throws 当云对象方法调用失败时，抛出包含错误信息的异常
 */
export function parseCloudMethodOutput<O>(
  output: CloudMethodOutput<O>,
  fallbackErrorMessage = '',
): O {
  if (output.errCode) {
    throw errorAssign(new Error(output.errMsg || fallbackErrorMessage), output);
  }

  return output.data;
}

/**
 * 解析数据库执行结果
 * @param res 客户端、云端响应结果
 * @returns 处理后的结果
 */
export function parseDatabaseOutput<T>(
  res: ClientDatabaseOutput<T> | CloudDatabaseOutput<T>,
) {
  const keys = Object.keys(res as AnyObject);
  // 客户端 { result: {errCode: 0, errMsg: 'ok'} & 数据 }
  const isClient = keys.length === 1 && keys[0] === 'result';

  if (isClient) {
    const { result } = res as ClientDatabaseOutput<T>;
    if (!result.errCode) return objectOmit(result, ['errCode', 'errMsg']);
    throw errorAssign(new Error(result.errMsg), result);
  }

  // 云端 数据
  return res as T;
}
