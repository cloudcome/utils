import { isFunction, isNullish } from '@cloudcome/core-utils/type';
import type { MaybeCallable } from '@cloudcome/core-utils/types';
import { onMounted, ref } from 'vue';

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 * @template P 异步操作的参数类型
 */
export interface IUseAsyncOptions<T, P = void> {
  /**
   * 默认参数，如果有值将自动执行。
   * 支持直接传入值或通过函数动态生成。
   */
  defaults?: MaybeCallable<P>;

  /**
   * 异步操作开始前的回调函数。
   * 可用于执行初始化逻辑或显示加载状态。
   */
  onBefore?: () => unknown;

  /**
   * 异步操作成功后的回调函数。
   * @param data 异步操作返回的数据。
   * 可用于处理成功后的数据更新或通知。
   */
  onSuccess?: (data: T) => unknown;

  /**
   * 异步操作失败后的回调函数。
   * @param err 异步操作抛出的错误。
   * 可用于记录错误日志或显示错误提示。
   */
  onError?: (err: unknown) => unknown;

  /**
   * 异步操作结束后的回调函数（无论成功或失败）。
   * 可用于清理操作或触发后续逻辑。
   */
  onFinally?: () => unknown;
}

/**
 * 用于处理异步操作的组合式函数。
 * 提供加载状态、数据、错误信息以及执行方法。
 * @template T 异步函数返回的数据类型
 * @template P 异步函数的参数类型
 * @param fn 异步函数，接收参数并返回 Promise。
 * @param options 异步操作的配置选项。
 * @returns 包含状态和操作方法的对象：
 * - loading: 是否正在加载。
 * - data: 异步操作返回的数据。
 * - error: 异步操作抛出的错误。
 * - runAsync: 执行异步操作并返回 Promise。
 * - run: 执行异步操作但不返回 Promise。
 * @example
 * const { loading, data, error, runAsync, run } = useAsync(async (id: number) => {
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
  const loading = ref(false);
  const data = ref<T | null>(null);
  const error = ref<unknown>(null);

  const runAsync = async (params: P): Promise<T> => {
    loading.value = true;
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
      loading.value = false;
      options?.onFinally?.();
    }
  };

  const run = (params: P) => {
    runAsync(params).then();
  };

  onMounted(() => {
    const defaults = options?.defaults;
    const params = isFunction(defaults) ? defaults() : defaults;
    if (!isNullish(params)) run(params);
  });

  return {
    /**
     * 是否正在加载。
     */
    loading,

    /**
     * 异步操作返回的数据。
     */
    data,

    /**
     * 异步操作抛出的错误。
     */
    error,

    /**
     * 执行异步操作并返回 Promise。
     * @param params 异步函数的参数。
     * @returns 异步操作的结果。
     */
    runAsync,

    /**
     * 执行异步操作但不返回 Promise。
     * @param params 异步函数的参数。
     */
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
