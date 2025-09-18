import { errorNormalize } from '@cloudcome/utils-core/error';
import type { MaybePromise } from '@cloudcome/utils-core/types';
import type { UniCloudObjectOutput } from './types';

/**
 * 处理云函数响应结果，统一返回格式
 * @param fn - 执行函数，可以返回任意类型的值或Promise
 * @param append - 需要附加到响应结果中的额外字段
 * @returns 统一格式的云函数响应结果
 *
 * @example
 * ```typescript
 * // 成功情况
 * const result = await respondCloudObject(async () => {
 *   return { name: 'test', value: 123 };
 * });
 * // 返回: { errCode: 0, errMsg: '', data: { name: 'test', value: 123 } }
 *
 * // 失败情况
 * const result = await respondCloudObject(() => {
 *   throw new Error('操作失败');
 * });
 * // 返回: { errCode: -1, errMsg: '操作失败', data: null }
 * ```
 */
export async function respondCloudObject<O>(
  fn: () => MaybePromise<O>,
  append?: AnyObject,
): Promise<UniCloudObjectOutput<O>> {
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

    const err2 = errorNormalize(err as Error & { errCode?: number | string; errMsg?: string });

    return {
      errCode: err2.errCode || -1,
      errMsg: err2.errMsg || err2.message || '',
      // @ts-ignore
      data: null,
      ...append,
    };
  }
}
