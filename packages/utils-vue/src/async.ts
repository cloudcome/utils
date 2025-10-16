import type { AnyArray } from '@cloudcome/utils-core/types';
import { type ComputedRef, type Ref, computed, ref } from 'vue';

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 * @template P 异步操作的参数类型
 */
export type UseAsyncOptions<I extends AnyArray, O> = {
  placeholder?: () => O;

  /**
   * 异步操作开始前的回调函数，可用于执行初始化逻辑或显示加载状态，抛出错误则中断操作
   */
  onBefore?: (...inputs: I) => unknown;

  /**
   * 异步操作成功后的回调函数，可用于处理成功后的数据更新或通知。
   * @param data 异步操作返回的数据。
   */
  onSuccess?: (data: O, ...inputs: I) => unknown;

  /**
   * 异步操作失败后的回调函数，可用于记录错误日志或显示错误提示。
   * @param err 异步操作抛出的错误。
   */
  onError?: (err: unknown, ...inputs: I) => unknown;

  /**
   * 异步操作结束后的回调函数（无论成功或失败），可用于清理操作或触发后续逻辑。
   */
  onAfter?: (...inputs: I) => unknown;
};

export type UseAsyncState<O> = {
  times: number;
  loading: boolean;
  error: unknown;
  data: O | null;
};

export type UseAsyncStateFilled<O> = {
  times: number;
  loading: boolean;
  error: unknown;
  data: O;
};

export type UseAsyncOutput<I extends AnyArray, O> = {
  state: ComputedRef<UseAsyncState<O>>;
  loading: Ref<boolean>;
  data: Ref<O | null>;
  error: Ref<unknown>;
  run: (...inputs: I) => void;
  runAsync: (...inputs: I) => Promise<O>;
};

export type UseAsyncOutputFilled<I extends AnyArray, O> = {
  state: ComputedRef<UseAsyncStateFilled<O>>;
  loading: Ref<boolean>;
  data: Ref<O>;
  error: Ref<unknown>;
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
  options: Omit<UseAsyncOptions<I, O>, 'placeholder'> & { placeholder: () => O },
): UseAsyncOutputFilled<I, O>;
export function useAsync<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseAsyncOptions<I, O>,
): UseAsyncOutput<I, O>;
export function useAsync<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseAsyncOptions<I, O>,
): UseAsyncOutput<I, O> {
  const times = ref(0);
  const loading = ref(false);
  const placeholder = options?.placeholder;
  const data = ref(placeholder ? placeholder() : null) as Ref<O | null>;
  const error = ref<unknown>(null);
  const state = computed(() => ({
    times: times.value,
    loading: loading.value,
    data: data.value,
    error: error.value,
  }));

  const runAsync = async (...inputs: I): Promise<O> => {
    loading.value = true;
    error.value = null;

    try {
      times.value++;
      await options?.onBefore?.(...inputs);
      data.value = await fn(...inputs);
      await options?.onSuccess?.(data.value, ...inputs);
      return data.value;
    } catch (err) {
      error.value = err;
      await options?.onError?.(err, ...inputs);
      throw err;
    } finally {
      loading.value = false;
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
