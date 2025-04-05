import { MemoryCache, type AbstractCache, type Cached } from "@cloudcome/core-utils/cache";
import { isString } from "@cloudcome/core-utils/type";
import { ref } from "vue";

export interface AsyncCacheOptions<T> {
	id: string | (() => string);
	disabled?: boolean;
	maxAge?: number;
	storage?: AbstractCache<T>;
}

/**
 * 异步操作的配置选项
 * @template T 异步操作返回的数据类型
 */
export interface UseAsyncOptions<T> {
	cache?: string | (() => string) | AsyncCacheOptions<T>;
	share?: string | (() => string);
	/**
	 * 异步操作开始前的回调函数
	 */
	onBefore?: () => unknown;
	onCacheHit?: (cached: Cached<T>) => unknown;
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

const defaultMemoryCacheStorage = new MemoryCache();

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
export function useAsync<Q extends unknown[], T>(
	fn: (...args: Q) => Promise<T>,
	options?: UseAsyncOptions<T>,
) {
	const cache = options?.cache;
	const getCacheId = isString(cache)
		? () => cache
		: typeof cache === "function"
			? cache
			: () => "";
	const isCacheHit = ref(false);

	const isLoading = ref(false);
	const data = ref<T | null>(null);
	const error = ref<unknown>(null);

	const runAsync = async (...args: Q): Promise<T> => {
		isLoading.value = true;
		error.value = null;

		try {
			options?.onBefore?.();

			const cacheId = getCacheId();

			if (cacheId) {
				const cached = defaultMemoryCacheStorage.get(cacheId);

				if (cached) {
					isCacheHit.value = true;
					data.value = cached.data;
					options?.onCacheHit?.(cached as Cached<T>);
					options?.onSuccess?.(cached.data as T);
					return cached.data as T;
				}
			}

			data.value = await fn(...args);

      if (cacheId) {
        defaultMemoryCacheStorage.set(cacheId, {
          id: cacheId,
          data: data.value,
          createdAt: Date.now(),
          maxAge: 0,
        })
      }

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
	const run = (...args: Q) => {
		runAsync(...args).then();
	};

	return {
		isLoading,
		data,
		error,
		runAsync,
		run,
	};
}
