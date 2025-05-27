import { isFunction, isNullish } from '@cloudcome/utils-core/type';
import type { AnyArray, MaybeCallable } from '@cloudcome/utils-core/types';
import { type Ref, nextTick } from 'vue';
import { onMounted, ref } from 'vue';

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 * @template P 异步操作的参数类型
 */
export type TUseAsyncOptions<I extends AnyArray, O> = {
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
  onSuccess?: (data: O) => unknown;

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
};

export type TUseAsyncReturns<I extends AnyArray, O> = {
  loading: Ref<boolean>;
  data: Ref<O | null>;
  error: Ref<unknown>;
  run: (...args: I) => void;
  runAsync: (...args: I) => Promise<O>;
};

/**
 * 用于处理异步操作的组合式函数。
 * 提供加载状态、数据、错误信息以及执行方法。
 * @template O 异步函数返回的数据类型
 * @template I 异步函数的入参类型
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
export function useAsync<I extends AnyArray, O>(
  fn: (...args: I) => Promise<O>,
  options?: TUseAsyncOptions<I, O>,
): TUseAsyncReturns<I, O> {
  const loading = ref(false);
  const data = ref<O | null>(null) as Ref<O | null>;
  const error = ref<unknown>(null);

  const runAsync = async (...args: I): Promise<O> => {
    loading.value = true;
    error.value = null;

    try {
      options?.onBefore?.();
      data.value = await fn(...args);
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

  const run = (...args: I) => {
    runAsync(...args).then();
  };

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
     * @param inputs 异步函数的参数。
     * @returns 异步操作的结果。
     */
    runAsync,

    /**
     * 执行异步操作但不返回 Promise。
     * @param inputs 异步函数的参数。
     */
    run,
  };
}

// const { run: run1 } = useAsync(() => Promise.resolve(1));
// run1();

// const { run: run2 } = useAsync((a: number) => Promise.resolve(1));
// run2(2);

// const { run: run3 } = useAsync((a: number, b: string) => Promise.resolve(1));
// run3(2, '2');
