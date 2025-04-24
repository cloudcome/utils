import { isFunction, isNullish } from '@cloudcome/core-utils/type';
import type { MaybeCallable } from '@cloudcome/core-utils/types';
import { onMounted, ref } from 'vue';

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 */
export interface IUseAsyncOptions<T, P = void> {
  /**
   * 默认参数，如果有值将自动执行
   */
  defaults?: MaybeCallable<P>;

  /**
   * 异步操作开始前的回调函数
   */
  onBefore?: () => unknown;
  /**
   * 异步操作成功后的回调函数
   * @param data 异步操作返回的数据
   */
  onSuccess?: (data: T) => unknown;
  /**
   * 异步操作失败后的回调函数
   * @param err 异步操作抛出的错误
   */
  onError?: (err: unknown) => unknown;
  /**
   * 异步操作结束后的回调函数（无论成功或失败）
   */
  onFinally?: () => unknown;
}

/**
 * 用于处理异步操作的组合式函数
 * @template Q 异步函数的参数类型数组
 * @template T 异步函数返回的数据类型
 * @param fn 异步函数
 * @param options 异步操作的配置选项
 * @returns 返回包含状态和操作方法的对象
 * @example
 * const { isLoading, data, error, runAsync, run } = useAsync(async (id: number) => {
 *   const response = await fetch(`/api/user/${id}`);
 *   return response.json();
 * }, {
 *   onBefore: () => console.log('Fetching user data...'),
 *   onSuccess: (data) => console.log('User data fetched:', data),
 *   onError: (err) => console.error('Failed to fetch user data:', err),
 *   onFinally: () => console.log('Fetch operation completed.'),
 * });
 */
export function useAsync<T, P = void>(fn: (params: P) => Promise<T>, options?: IUseAsyncOptions<T, P>) {
  const isLoading = ref(false);
  const data = ref<T | null>(null);
  const error = ref<unknown>(null);

  const runAsync = async (params: P): Promise<T> => {
    isLoading.value = true;
    error.value = null;

    try {
      options?.onBefore?.();
      data.value = await fn(params);
      options?.onSuccess?.(data.value);
      return data.value;
    } catch (err) {
      error.value = err;
      options?.onError?.(err);
      throw err;
    } finally {
      isLoading.value = false;
      options?.onFinally?.();
    }
  };
  const run = (params: P) => {
    runAsync(params).then();
  };

  onMounted(() => {
    const defaults = options?.defaults;
    const param = isFunction(defaults) ? defaults() : defaults;
    if (!isNullish(param)) run(param);
  });

  return {
    isLoading,
    data,
    error,
    runAsync,
    run,
  };
}

// const { run: run1 } = useAsync(() => Promise.resolve(1));
// run1();

// const { run: run2 } = useAsync((a: number) => Promise.resolve(1), {
//   defaults: () => 1,
// });
// run2(2);

// const { run: run3 } = useAsync((p: { a: number; b: string }) => Promise.resolve(1), {
//   defaults: { a: 1, b: '1' },
// });
// run3({ a: 1, b: '1' });
