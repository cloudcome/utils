import type { UniError } from '@/_types';
import { errorNormalize } from '@cloudcome/utils-core/error';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import type { CloudMethodOutput } from './types';

/**
 * 执行云对象方法并标准化响应格式
 *
 * @template O - 函数返回值的类型
 * @param fn - 要执行的异步函数
 * @param append - 要附加到响应中的额外数据
 * @returns 标准化的云对象响应对象
 *
 * @example
 * ```typescript
 * const result = await respondCloudMethod(async () => {
 *   return await getData();
 * }, { extra: 'data' });
 * ```
 */
export async function respondCloudMethod<O>(
  fn: () => MaybePromise<O>,
  append?: AnyObject,
): Promise<CloudMethodOutput<O>> {
  try {
    const data = await fn();

    return {
      errCode: 0,
      errMsg: '',
      data,
      ...append,
    };
  } catch (err) {
    console.error('respondCloudObject error');
    console.error(err);

    const err2 = errorNormalize(err as UniError);

    return {
      errCode: err2.errCode || -1,
      errMsg: err2.errMsg || err2.message || '',
      // @ts-ignore
      data: null,
      ...append,
    };
  }
}
