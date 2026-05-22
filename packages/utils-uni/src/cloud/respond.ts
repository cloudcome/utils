import { errorNormalize } from '@cloudcome/utils-core/error';
import type { MaybePromise, AnyObject } from '@cloudcome/utils-core/types';
import type { UniError } from '@/_types';
import type { CloudMethodOutput } from './types';

export type RespondCloudMethodOptions = {
  /** 要附加到响应中的额外数据 */
  append?: AnyObject;
  /**
   * 自定义错误处理函数
   * @param err {unknown} 错误
   * @returns 处理后的错误对象，其 errCode/errMsg 将被用于响应
   */
  parseError?: (err: unknown) => UniError;
};

/**
 * 执行云对象方法并标准化响应格式
 *
 * @template O - 函数返回值的类型
 * @param fn - 要执行的异步函数
 * @param options - 可选配置
 * @param options.append - 要附加到响应中的额外数据
 * @param options.parseError - 自定义错误处理函数
 * @returns 标准化的云对象响应对象
 *
 * @example
 * ```typescript
 * const result = await respondCloudMethod(async () => {
 *   return await getData();
 * }, { append: { extra: 'data' } });
 * ```
 */
export async function respondCloudMethod<O>(
  fn: () => MaybePromise<O>,
  options?: RespondCloudMethodOptions,
): Promise<CloudMethodOutput<O>> {
  try {
    const data = await fn();

    return {
      errCode: 0,
      errMsg: '',
      data,
      ...options?.append,
    };
  } catch (err) {
    const err3 = options?.parseError?.(err) || (errorNormalize(err) as UniError);

    return {
      errCode: err3.errCode ?? -1,
      errMsg: err3.errMsg || err3.message || '',
      // @ts-expect-error
      data: null,
      ...options?.append,
    };
  }
}
