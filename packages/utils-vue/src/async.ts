import type { AnyArray } from '@cloudcome/utils-core/types';
import { computed, type ComputedRef, ref, shallowRef } from 'vue';

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 * @template P 异步操作的参数类型
 */
export type UseAsyncOptions<I extends AnyArray, O> = {
  /**
   * 异步操作开始前的回调函数，可用于执行初始化逻辑或显示加载状态，抛出错误则中断操作
   */
  onBefore?: NoInfer<(...inputs: I) => unknown>;

  /**
   * 异步操作成功后的回调函数，可用于处理成功后的数据更新或通知。
   * @param data 异步操作返回的数据。
   */
  onSuccess?: NoInfer<(data: O, ...inputs: I) => unknown>;

  /**
   * 异步操作失败后的回调函数，可用于记录错误日志或显示错误提示。
   * @param err 异步操作抛出的错误。
   */
  onError?: NoInfer<(err: unknown, ...inputs: I) => unknown>;

  /**
   * 异步操作结束后的回调函数（无论成功或失败），可用于清理操作或触发后续逻辑。
   */
  onAfter?: NoInfer<(...inputs: I) => unknown>;
};

export type UseAsyncState = {
  times: number;
  loading: boolean;
  error: unknown;
};

export type UseAsyncOutput<I extends AnyArray, O> = {
  state: ComputedRef<UseAsyncState>;
  loading: ComputedRef<boolean>;
  data: ComputedRef<O | null>;
  error: ComputedRef<unknown>;
  run: (...inputs: I) => void;
  runAsync: (...inputs: I) => Promise<O>;
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
  fn: (...inputs: I) => Promise<O>,
  options?: UseAsyncOptions<I, O>,
): UseAsyncOutput<I, O> {
  const _times = ref(0);
  const _loading = ref(false);
  const _data = shallowRef<O | null>(null);
  const _error = ref<unknown>(null);
  const times = computed(() => _times.value);
  const loading = computed(() => _loading.value);
  const data = computed(() => _data.value);
  const error = computed(() => _error.value);
  const state = computed(() => ({
    times: times.value,
    loading: loading.value,
    error: error.value,
  }));

  const runAsync = async (...inputs: I): Promise<O> => {
    _loading.value = true;
    _error.value = null;

    try {
      await options?.onBefore?.(...inputs);
      _times.value++;
      _data.value = await fn(...inputs);
      await options?.onSuccess?.(_data.value, ...inputs);
      return _data.value;
    } catch (err) {
      _error.value = err;
      try {
        options?.onError?.(err, ...inputs);
      } catch {
        //
      }
      throw err;
    } finally {
      _loading.value = false;
      await options?.onAfter?.(...inputs);
    }
  };

  const run = (...inputs: I) => {
    runAsync(...inputs).then();
  };

  return {
    state,

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
