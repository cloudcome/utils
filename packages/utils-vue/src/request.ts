import { type Cache, type CacheOptions, type Cached, MemoryCache } from '@cloudcome/utils-core/cache';
import type { DateValue } from '@cloudcome/utils-core/date';
import { isFunction, isObject } from '@cloudcome/utils-core/type';
import type { AnyArray, MaybeCallable } from '@cloudcome/utils-core/types';
import type { ComputedRef, Ref } from 'vue';
import { computed, ref } from 'vue';
import { type UseAsyncOptions, type UseAsyncOutputs, type UseAsyncState, useAsync } from './async';

/**
 * 请求缓存配置选项。
 * @template T 缓存数据的类型。
 */
export type RequestCacheOptions<T> = CacheOptions & {
  /**
   * 是否禁用缓存，默认为 false。
   * 如果设置为 true，则不会使用缓存。
   */
  disabled?: boolean;

  /**
   * 自定义缓存存储实现。
   * 可以传入自定义的缓存类来替代默认的内存缓存。
   */
  storage?: Cache<T>;
};

export type RequestShareOptions = {
  /**
   * 是否禁用共享请求，默认为 false。
   * 如果设置为 true，则不会共享请求结果。
   */
  disabled?: boolean;

  /**
   * 共享的最大时长（毫秒），为 0 时表示永久共享。
   * 超过该时长后，共享的请求结果将被清除。
   */
  maxAge?: number;

  /**
   * 共享的过期时间（时间戳、日期字符串、日期对象等）。
   * 优先级比 maxAge 更高，指定具体的过期时间。
   */
  expiredAt?: DateValue;
};

export type RetryOptions = {
  /**
   * 是否禁用共享请求，默认为 false。
   * 如果设置为 true，则不会重试。
   */
  disabled?: boolean;
};

/**
 * 请求选项，扩展了异步操作的选项。
 * @template T 请求返回的数据类型。
 * @template I 请求参数的类型。
 */
export type UseRequestOptions<I extends AnyArray, O> = UseAsyncOptions<I, O> & {
  /**
   * 请求的唯一标识符，可以是字符串或函数返回的字符串。
   * 用于缓存和共享的键值。
   */
  id?: MaybeCallable<string>;

  /**
   * 缓存配置，可以是布尔值或完整的缓存选项。
   * 如果为 true，则启用默认缓存；如果为对象，则可以自定义缓存行为。
   */
  cache?: boolean | RequestCacheOptions<O>;

  /**
   * 共享配置，可以是布尔值或完整的共享选项。
   * 共享时，相同的请求 ID 会复用第一次发出且没有响应完成的请求。
   *
   * 例如，10 组件同时或先后发起 10 次请求用于获取用户信息，
   * 那么这 10 个组件会共同等待第一次发起的请求，直到完成。
   *
   * 共享与缓存是不同的概念，共享是进行时，缓存是过去时，即：
   * - 共享是共享**正在发送**的请求
   * - 缓存是缓存**已经发送**的请求
   *
   * 如果为 true，则启用默认共享；如果为对象，则可以自定义共享行为。
   */
  share?: boolean | RequestShareOptions;

  /**
   * 当命中缓存时的回调函数。
   * 在缓存命中时触发，接收缓存的数据作为参数。
   */
  onCacheHit?: (cached: Cached<O>) => unknown;
};

export type UseRequestState<O> = UseAsyncState<O> & {
  /**
   * 是否命中共享数据
   */
  hitShare: boolean;

  /**
   * 是否命中缓存
   */
  hitCache: boolean;
};
export type UseRequestOutputs<I extends AnyArray, O> = Omit<UseAsyncOutputs<I, O>, 'run' | 'runAsync' | 'state'> & {
  state: ComputedRef<UseRequestState<O>>;
  send: (...inputs: I) => void;
  sendAsync: (...inputs: I) => Promise<O>;
  hitShare: Ref<boolean>;
  hitCache: Ref<boolean>;
};

const defaultCacheStorage = new MemoryCache();
const defaultShareStorage = new MemoryCache();

/**
 * 使用请求功能的组合式函数。
 * 支持缓存和异步操作的封装。
 *
 * @template O 请求返回的数据类型。
 * @template I 请求参数的类型。
 * @param {() => Promise<O>} fn 实际的请求函数，返回一个 Promise。
 * @param {UseRequestOptions<I, O>} [options] 请求选项，包括缓存和回调配置。
 * @returns 返回一个对象，包含以下内容：
 * - 异步操作的状态（如 loading、error 等）。
 * - 是否命中缓存（hitCache）。
 * - 是否命中共享请求（hitShare）。
 */
export function useRequest<I extends AnyArray, O>(
  fn: (...inputs: I) => Promise<O>,
  options?: UseRequestOptions<I, O>,
): UseRequestOutputs<I, O> {
  const { id, cache, share, onCacheHit, onSuccess } = options || {};

  const shareStorage = defaultShareStorage as MemoryCache<Promise<O>>;
  const shareAble = isObject(share) ? !share.disabled : share;
  const shareOptions = isObject(share) ? share : {};
  const hitShare = ref(false);

  const _cached = defaultCacheStorage as Cache<O>;
  const cacheStorage = isObject(cache) ? cache.storage || _cached : _cached;
  const cacheAble = isObject(cache) ? !cache.disabled : cache;
  const cacheOptions = isObject(cache) ? cache : {};
  const hitCache = ref(false);

  const cacheableFn = async (...inputs: I) => {
    const requestId = isFunction(id) ? id() : id;

    if (requestId && shareAble) {
      const shared = shareStorage.get(requestId);
      if (shared) {
        hitShare.value = true;
        return await shared.data;
      }
    }

    if (requestId && cacheAble) {
      const cached = await cacheStorage.get(requestId);

      if (cached) {
        const data = cached.data;
        hitCache.value = true;
        onCacheHit?.(cached);
        onSuccess?.(data, ...inputs);
        return data;
      }
    }

    const promise = fn(...inputs);

    if (requestId && shareAble) {
      shareStorage.set(requestId, promise, shareOptions);
    }

    const data = await promise;

    if (requestId && cacheAble) {
      cacheStorage.set(requestId, data, cacheOptions);
    }

    return data;
  };
  const { state: asyncState, run: send, runAsync: sendAsync, ...async } = useAsync(cacheableFn, options);

  const state = computed(() => ({
    ...asyncState.value,
    hitShare: hitShare.value,
    hitCache: hitCache.value,
  }));

  return {
    ...async,
    state,
    send,
    sendAsync,
    hitShare,
    hitCache,
  };
}
